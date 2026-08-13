-- Migration: Enforce Owner-only publication for meditation tracks
-- Enforces that Team Members cannot insert or update tracks to be published.

CREATE OR REPLACE FUNCTION public.enforce_meditation_track_publication_security()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role pg_catalog.text;
BEGIN
    -- Get current user role from private schema
    v_user_role := private.get_user_role();
    
    -- If the role is owner, allow any change.
    IF v_user_role = 'owner' THEN
        RETURN NEW;
    END IF;

    -- If the role is team_member, enforce restrictions.
    IF v_user_role = 'team_member' THEN
        IF TG_OP = 'INSERT' THEN
            -- Force team member inserts to draft and unpublished
            NEW.content_status := 'draft';
            NEW.is_published := false;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Preserve OLD.is_published unconditionally
            NEW.is_published := OLD.is_published;
            
            -- Reject attempts to change content_status to 'published'
            IF NEW.content_status = 'published' AND OLD.content_status != 'published' THEN
                RAISE EXCEPTION 'Team members cannot publish meditation tracks';
            END IF;
        END IF;
    END IF;

    -- Note: If private.get_user_role() returns NULL (e.g. system operations / service_role), we allow it.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

-- Attach the trigger to meditation_tracks
DROP TRIGGER IF EXISTS enforce_meditation_track_publication_security_trigger ON public.meditation_tracks;
CREATE TRIGGER enforce_meditation_track_publication_security_trigger
BEFORE INSERT OR UPDATE ON public.meditation_tracks
FOR EACH ROW EXECUTE PROCEDURE public.enforce_meditation_track_publication_security();
