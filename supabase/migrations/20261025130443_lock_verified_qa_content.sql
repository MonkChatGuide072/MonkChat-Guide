-- Keep reviewed Q&A immutable until the owner returns the item to draft.
-- This protects direct Data API calls as well as the CMS edit route.

BEGIN;

CREATE FUNCTION private.guard_reviewed_qa_item()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF private.get_user_role() = 'team_member' AND (
      NEW.verification_status = 'verified'
      OR NEW.content_status = 'published'
      OR NEW.is_published
    ) THEN
      RAISE EXCEPTION 'Team members may only create draft unverified Q&A items'
        USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  -- Team members cannot change any status column of reviewed items,
  -- nor can they verify or publish draft items via direct Data API calls.
  IF private.get_user_role() = 'team_member' THEN
    IF (
      OLD.verification_status = 'verified'
      OR OLD.content_status = 'published'
      OR OLD.is_published
    ) AND (
      NEW.content_status IS DISTINCT FROM OLD.content_status
      OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
      OR NEW.is_published IS DISTINCT FROM OLD.is_published
    ) THEN
      RAISE EXCEPTION 'Only the owner may change the status of reviewed Q&A'
        USING ERRCODE = '23514';
    END IF;

    IF (
      (OLD.verification_status IS DISTINCT FROM 'verified' AND NEW.verification_status = 'verified')
      OR (OLD.content_status IS DISTINCT FROM 'published' AND NEW.content_status = 'published')
      OR (NOT OLD.is_published AND NEW.is_published)
    ) THEN
      RAISE EXCEPTION 'Only the owner may verify or publish Q&A'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  -- Once reviewed, core metadata (category and source_reference) cannot be edited
  -- by anyone until the owner explicitly returns the item to unverified draft.
  IF (
    OLD.verification_status = 'verified'
    OR OLD.content_status = 'published'
    OR OLD.is_published
  ) AND (
    NEW.id IS DISTINCT FROM OLD.id
    OR NEW.category IS DISTINCT FROM OLD.category
    OR NEW.source_reference IS DISTINCT FROM OLD.source_reference
  ) THEN
    RAISE EXCEPTION 'Return Q&A to draft before editing reviewed content'
      USING ERRCODE = '23514';
  END IF;

  -- Returning a verified item to draft must never leave it public or retain
  -- the old reviewer attribution, even through a direct Data API request.
  IF OLD.verification_status = 'verified' AND NEW.verification_status = 'unverified' THEN
    NEW.is_published := false;
    NEW.verified_by := NULL;
    NEW.verified_at := NULL;
    IF NEW.content_status = 'published' THEN NEW.content_status := 'draft'; END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_reviewed_qa_item() FROM PUBLIC, anon, authenticated;

-- Run before enforce_qa_verification_trigger so forbidden requests are rejected
-- before that older trigger normalizes verification/publication fields.
CREATE TRIGGER a_guard_reviewed_qa_item
BEFORE INSERT OR UPDATE ON public.qa_items
FOR EACH ROW EXECUTE FUNCTION private.guard_reviewed_qa_item();

CREATE FUNCTION private.guard_reviewed_qa_translation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_item_id uuid;
  v_content_status text;
  v_verification_status text;
  v_is_published boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND (
    NEW.qa_item_id IS DISTINCT FROM OLD.qa_item_id
    OR NEW.language_code IS DISTINCT FROM OLD.language_code
  ) THEN
    RAISE EXCEPTION 'Q&A translation identity cannot be changed'
      USING ERRCODE = '23514';
  END IF;

  v_item_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.qa_item_id ELSE NEW.qa_item_id END;

  -- Serialize translation edits with publication and verification changes.
  SELECT content_status, verification_status, is_published
    INTO v_content_status, v_verification_status, v_is_published
    FROM public.qa_items
    WHERE id = v_item_id
    FOR UPDATE;

  -- A missing parent is handled by the foreign key. During ON DELETE CASCADE,
  -- the parent is already gone and its translation can be removed.
  IF FOUND AND (
    v_content_status <> 'draft'
    OR v_verification_status <> 'unverified'
    OR v_is_published
  ) THEN
    RAISE EXCEPTION 'Return Q&A to draft before editing reviewed translations'
      USING ERRCODE = '23514';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_reviewed_qa_translation() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER guard_reviewed_qa_translation
BEFORE INSERT OR UPDATE OR DELETE ON public.qa_translations
FOR EACH ROW EXECUTE FUNCTION private.guard_reviewed_qa_translation();

COMMIT;
