-- Anonymous visitor analytics and authenticated CMS audit history.
-- Privacy rules:
--   * Public visitors are identified only by random browser-generated UUIDs.
--   * No IP address, name, email, user-agent, or device fingerprint is stored.
--   * CMS actions use the existing authenticated profile identity.

-- Extend the existing anonymous event table without removing historical rows.
ALTER TABLE public.usage_events
    ADD COLUMN visitor_id UUID,
    ADD COLUMN session_id UUID,
    ADD COLUMN page_path TEXT,
    ALTER COLUMN resource_type DROP NOT NULL,
    ALTER COLUMN resource_id DROP NOT NULL;

ALTER TABLE public.usage_events
    DROP CONSTRAINT IF EXISTS usage_events_event_type_check,
    DROP CONSTRAINT IF EXISTS usage_events_resource_type_check;

ALTER TABLE public.usage_events
    ADD CONSTRAINT usage_events_event_type_check
        CHECK (event_type IN (
            'session_start',
            'page_view',
            'audio_play',
            'audio_complete',
            'bio_link_click'
        )),
    ADD CONSTRAINT usage_events_resource_type_check
        CHECK (resource_type IS NULL OR resource_type IN ('meditation_track', 'bio_link')),
    ADD CONSTRAINT usage_events_event_shape_check
        CHECK (
            (event_type IN ('session_start', 'page_view')
                AND resource_type IS NULL
                AND resource_id IS NULL
                AND page_path IS NOT NULL)
            OR
            (event_type IN ('audio_play', 'audio_complete')
                AND resource_type = 'meditation_track'
                AND resource_id IS NOT NULL)
            OR
            (event_type = 'bio_link_click'
                AND resource_type = 'bio_link'
                AND resource_id IS NOT NULL)
        ),
    ADD CONSTRAINT usage_events_page_path_check
        CHECK (
            page_path IS NULL
            OR (
                char_length(page_path) BETWEEN 1 AND 120
                AND left(page_path, 1) = '/'
                AND position('?' IN page_path) = 0
                AND position('#' IN page_path) = 0
            )
        );

CREATE INDEX usage_events_created_at_idx
    ON public.usage_events (created_at DESC);

CREATE INDEX usage_events_visitor_id_idx
    ON public.usage_events (visitor_id)
    WHERE visitor_id IS NOT NULL;

CREATE INDEX usage_events_event_type_idx
    ON public.usage_events (event_type, created_at DESC);

CREATE UNIQUE INDEX usage_events_one_session_start_idx
    ON public.usage_events (visitor_id, session_id, event_type)
    WHERE event_type = 'session_start'
      AND visitor_id IS NOT NULL
      AND session_id IS NOT NULL;

-- Public clients must use the narrow RPC below instead of inserting arbitrary rows.
DROP POLICY IF EXISTS "Usage events public insert" ON public.usage_events;
REVOKE ALL ON TABLE public.usage_events FROM anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.usage_events TO authenticated;

CREATE OR REPLACE FUNCTION public.record_usage_event(
    p_event_type TEXT,
    p_visitor_id UUID,
    p_session_id UUID,
    p_page_path TEXT DEFAULT NULL,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_page_path TEXT;
BEGIN
    IF p_event_type NOT IN (
        'session_start',
        'page_view',
        'audio_play',
        'audio_complete',
        'bio_link_click'
    ) THEN
        RAISE EXCEPTION 'Unsupported usage event type';
    END IF;

    IF p_visitor_id IS NULL OR p_session_id IS NULL THEN
        RAISE EXCEPTION 'Anonymous visitor and session identifiers are required';
    END IF;

    v_page_path := NULLIF(trim(p_page_path), '');

    IF p_event_type IN ('session_start', 'page_view') THEN
        IF v_page_path IS NULL
            OR char_length(v_page_path) > 120
            OR left(v_page_path, 1) <> '/'
            OR position('?' IN v_page_path) > 0
            OR position('#' IN v_page_path) > 0
        THEN
            RAISE EXCEPTION 'A safe page path is required';
        END IF;

        p_resource_type := NULL;
        p_resource_id := NULL;
    ELSIF p_event_type IN ('audio_play', 'audio_complete') THEN
        IF p_resource_type IS DISTINCT FROM 'meditation_track' OR p_resource_id IS NULL THEN
            RAISE EXCEPTION 'A meditation track resource is required';
        END IF;
        v_page_path := NULL;
    ELSIF p_event_type = 'bio_link_click' THEN
        IF p_resource_type IS DISTINCT FROM 'bio_link' OR p_resource_id IS NULL THEN
            RAISE EXCEPTION 'A BioPage link resource is required';
        END IF;
        v_page_path := NULL;
    END IF;

    INSERT INTO public.usage_events (
        event_type,
        visitor_id,
        session_id,
        page_path,
        resource_type,
        resource_id,
        created_at
    ) VALUES (
        p_event_type,
        p_visitor_id,
        p_session_id,
        v_page_path,
        p_resource_type,
        p_resource_id,
        pg_catalog.now()
    )
    ON CONFLICT DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.record_usage_event(TEXT, UUID, UUID, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_usage_event(TEXT, UUID, UUID, TEXT, TEXT, UUID) TO anon, authenticated;

-- Immutable, database-generated audit history for authenticated CMS changes.
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_display_name TEXT NOT NULL,
    actor_role TEXT NOT NULL CHECK (actor_role IN ('owner', 'team_member')),
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_logs_occurred_at_idx
    ON public.admin_audit_logs (occurred_at DESC);

CREATE INDEX admin_audit_logs_actor_idx
    ON public.admin_audit_logs (actor_user_id, occurred_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_audit_logs FROM anon, authenticated;
GRANT SELECT ON TABLE public.admin_audit_logs TO authenticated;

CREATE POLICY "Admin audit logs owner view"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (private.get_user_role() = 'owner');

CREATE OR REPLACE FUNCTION private.log_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_id UUID;
    v_actor_name TEXT;
    v_actor_role TEXT;
    v_action TEXT;
    v_row JSONB;
    v_entity_id TEXT;
    v_details JSONB;
BEGIN
    v_actor_id := auth.uid();

    -- Ignore migrations and other trusted server-side changes without a signed-in user.
    IF v_actor_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    SELECT display_name, role
    INTO v_actor_name, v_actor_role
    FROM public.profiles
    WHERE id = v_actor_id
      AND is_active = true;

    IF v_actor_name IS NULL OR v_actor_role NOT IN ('owner', 'team_member') THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    v_action := CASE TG_OP
        WHEN 'INSERT' THEN 'create'
        WHEN 'UPDATE' THEN 'update'
        WHEN 'DELETE' THEN 'delete'
    END;

    v_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
    v_entity_id := COALESCE(v_row ->> 'id', v_row ->> 'code');
    v_details := pg_catalog.jsonb_strip_nulls(
        pg_catalog.jsonb_build_object(
            'content_status', v_row ->> 'content_status',
            'is_published', v_row -> 'is_published',
            'verification_status', v_row ->> 'verification_status',
            'language_code', v_row ->> 'language_code'
        )
    );

    INSERT INTO public.admin_audit_logs (
        actor_user_id,
        actor_display_name,
        actor_role,
        action,
        entity_type,
        entity_id,
        details,
        occurred_at
    ) VALUES (
        v_actor_id,
        v_actor_name,
        v_actor_role,
        v_action,
        TG_TABLE_NAME,
        v_entity_id,
        v_details,
        pg_catalog.now()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.log_admin_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER audit_profiles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_languages_changes
AFTER INSERT OR UPDATE OR DELETE ON public.languages
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_meditation_tracks_changes
AFTER INSERT OR UPDATE OR DELETE ON public.meditation_tracks
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_meditation_track_translations_changes
AFTER INSERT OR UPDATE OR DELETE ON public.meditation_track_translations
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_qa_items_changes
AFTER INSERT OR UPDATE OR DELETE ON public.qa_items
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_qa_translations_changes
AFTER INSERT OR UPDATE OR DELETE ON public.qa_translations
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_dci_centers_changes
AFTER INSERT OR UPDATE OR DELETE ON public.dci_centers
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_dci_center_translations_changes
AFTER INSERT OR UPDATE OR DELETE ON public.dci_center_translations
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_bio_links_changes
AFTER INSERT OR UPDATE OR DELETE ON public.bio_links
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

CREATE TRIGGER audit_bio_link_translations_changes
AFTER INSERT OR UPDATE OR DELETE ON public.bio_link_translations
FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();
