-- Phase 2: Add isolated 'student' role, cohort invite registration, practice progress sync,
-- and authenticated read access to already-published meditation storage assets.
BEGIN;

-- 1. Extend public.profiles for 'student' role and 7-digit MCU student codes (4011001-6911060).
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('owner', 'team_member', 'student'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_code TEXT,
  ADD COLUMN IF NOT EXISTS cohort_year SMALLINT,
  ADD COLUMN IF NOT EXISTS dharma_name TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_student_code_format_check,
  DROP CONSTRAINT IF EXISTS profiles_student_code_key,
  DROP CONSTRAINT IF EXISTS profiles_cohort_year_check,
  DROP CONSTRAINT IF EXISTS profiles_dharma_name_len_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_student_code_key UNIQUE (student_code),
  ADD CONSTRAINT profiles_student_code_format_check
    CHECK (student_code IS NULL OR student_code ~ '^[4-6][0-9]110(0[1-9]|[1-5][0-9]|60)$'),
  ADD CONSTRAINT profiles_cohort_year_check
    CHECK (cohort_year IS NULL OR cohort_year BETWEEN 40 AND 69),
  ADD CONSTRAINT profiles_dharma_name_len_check
    CHECK (dharma_name IS NULL OR pg_catalog.char_length(dharma_name) <= 80);

-- Keep guard_managed_profile strict: CMS client routes can still only create team_member accounts,
-- identity columns are immutable from browser clients, and owner cannot be suspended.
CREATE OR REPLACE FUNCTION private.guard_managed_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND (
    NEW.id IS DISTINCT FROM OLD.id
    OR NEW.role IS DISTINCT FROM OLD.role
    OR NEW.student_code IS DISTINCT FROM OLD.student_code
    OR NEW.cohort_year IS DISTINCT FROM OLD.cohort_year
  ) THEN
    RAISE EXCEPTION 'Profile identity, student code, and role cannot be changed through the client API';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Owner accounts cannot be suspended through the CMS';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.role <> 'team_member' THEN
    RAISE EXCEPTION 'The CMS may create team member accounts only';
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Cohort Invite Codes table (Owner-only visibility; browser clients never read raw code hashes).
CREATE TABLE IF NOT EXISTS public.student_cohort_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_year SMALLINT NOT NULL CHECK (cohort_year BETWEEN 40 AND 69),
  label TEXT NOT NULL CHECK (pg_catalog.char_length(pg_catalog.btrim(label)) BETWEEN 1 AND 80),
  invite_code_hash TEXT NOT NULL UNIQUE,
  code_hint TEXT NOT NULL CHECK (pg_catalog.char_length(code_hint) BETWEEN 1 AND 24),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER NOT NULL DEFAULT 60 CHECK (max_uses BETWEEN 1 AND 200),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_cohort_invites_cohort_idx
  ON public.student_cohort_invites (cohort_year DESC, created_at DESC);

ALTER TABLE public.student_cohort_invites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.student_cohort_invites FROM anon, authenticated;
GRANT SELECT ON TABLE public.student_cohort_invites TO authenticated;

DROP POLICY IF EXISTS "Cohort invites owner view" ON public.student_cohort_invites;
CREATE POLICY "Cohort invites owner view"
  ON public.student_cohort_invites
  FOR SELECT
  TO authenticated
  USING (private.get_user_role() = 'owner');

DROP TRIGGER IF EXISTS audit_student_cohort_invites_changes ON public.student_cohort_invites;
CREATE TRIGGER audit_student_cohort_invites_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.student_cohort_invites
  FOR EACH ROW EXECUTE FUNCTION private.log_admin_change();

-- Atomic invite claim RPC callable strictly by Edge Function service_role.
CREATE OR REPLACE FUNCTION public.claim_student_cohort_invite(
  p_code_hash TEXT,
  p_cohort_year SMALLINT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invite_id UUID;
BEGIN
  UPDATE public.student_cohort_invites
  SET used_count = used_count + 1
  WHERE invite_code_hash = p_code_hash
    AND cohort_year = p_cohort_year
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > pg_catalog.now())
    AND used_count < max_uses
  RETURNING id INTO v_invite_id;

  RETURN v_invite_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_student_cohort_invite(TEXT, SMALLINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_student_cohort_invite(TEXT, SMALLINT) TO service_role;

-- 3. Synced practice progress for authenticated students (Owner can monitor cohort progress).
CREATE TABLE IF NOT EXISTS public.student_practice_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (module_type IN ('vocab_lesson', 'qa_flashcard', 'audio_track')),
  item_key TEXT NOT NULL CHECK (pg_catalog.char_length(pg_catalog.btrim(item_key)) BETWEEN 1 AND 120),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, module_type, item_key)
);

CREATE INDEX IF NOT EXISTS student_practice_progress_student_idx
  ON public.student_practice_progress (student_id, module_type);

ALTER TABLE public.student_practice_progress ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.student_practice_progress FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.student_practice_progress TO authenticated;

DROP POLICY IF EXISTS "Student progress self or owner view" ON public.student_practice_progress;
CREATE POLICY "Student progress self or owner view"
  ON public.student_practice_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR private.get_user_role() = 'owner');

DROP POLICY IF EXISTS "Student progress self insert" ON public.student_practice_progress;
CREATE POLICY "Student progress self insert"
  ON public.student_practice_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND private.get_user_role() = 'student'
  );

DROP POLICY IF EXISTS "Student progress self delete" ON public.student_practice_progress;
CREATE POLICY "Student progress self delete"
  ON public.student_practice_progress
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = student_id
    AND private.get_user_role() = 'student'
  );

-- 4. Authenticated active users (including 'student') must still read already-published storage media.
DROP POLICY IF EXISTS "Authenticated users can read published audio" ON storage.objects;
CREATE POLICY "Authenticated users can read published audio"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'meditation-audio'
    AND EXISTS (
      SELECT 1 FROM public.meditation_tracks
      WHERE audio_storage_path = storage.objects.name
        AND content_status = 'published'
        AND is_published = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can read published subtitles" ON storage.objects;
CREATE POLICY "Authenticated users can read published subtitles"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'meditation-subtitles'
    AND EXISTS (
      SELECT 1
      FROM public.meditation_track_translations mtt
      JOIN public.meditation_tracks mt ON mtt.track_id = mt.id
      WHERE mtt.subtitle_vtt_storage_path = storage.objects.name
        AND mt.content_status = 'published'
        AND mt.is_published = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can read BioPage images" ON storage.objects;
CREATE POLICY "Authenticated users can read BioPage images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'bio-link-images');

-- 5. Migration version check specifically for student-cohorts Edge Function (keeps cms_security_version() = 1).
CREATE OR REPLACE FUNCTION public.student_security_version()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT 2 WHERE private.get_user_role() = 'owner';
$$;

REVOKE ALL ON FUNCTION public.student_security_version() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_security_version() TO authenticated;

COMMIT;

