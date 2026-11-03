-- Run against a disposable local Supabase database after migrations.
-- All fixtures and mutations are rolled back. No live project should run this file.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path TO public, extensions;
SELECT plan(1);

-- 1. Setup Test Users and Profiles
INSERT INTO auth.users (id, aud, role, email) VALUES
  ('00000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'qa-lock-owner@example.invalid'),
  ('00000000-0000-4000-8000-000000000102', 'authenticated', 'authenticated', 'qa-lock-member@example.invalid');

INSERT INTO public.profiles (id, display_name, role, is_active) VALUES
  ('00000000-0000-4000-8000-000000000101', 'QA lock owner test', 'owner', true),
  ('00000000-0000-4000-8000-000000000102', 'QA lock member test', 'team_member', true);

-- 2. Team Member: Draft Creation & Restrictions
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000102', true);

-- Case A: Team member cannot create a pre-verified or published item via direct API insert
DO $$
BEGIN
  BEGIN
    INSERT INTO public.qa_items (
      id, category, source_reference, content_status, verification_status, is_published, created_by, updated_by
    ) VALUES (
      '00000000-0000-4000-8000-000000000199', 'practice', 'source', 'published', 'verified', true,
      '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000102'
    );
    RAISE EXCEPTION 'team member inserted pre-verified item';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- Case B: Team member creates a valid unverified draft item
INSERT INTO public.qa_items (
  id, category, source_reference, content_status, verification_status, is_published, created_by, updated_by
) VALUES (
  '00000000-0000-4000-8000-000000000103', 'practice', 'reviewed source', 'draft', 'unverified', false,
  '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000102'
);

-- Case C: Team member adds translations in draft state
INSERT INTO public.qa_translations (qa_item_id, language_code, question, short_answer)
VALUES ('00000000-0000-4000-8000-000000000103', 'th', 'สมาธิคืออะไร', 'คำตอบฉบับร่าง');

-- Case D: Team member cannot self-verify or self-publish via direct API update
DO $$
BEGIN
  BEGIN
    UPDATE public.qa_items SET verification_status = 'verified'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team member self-verified draft item';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE public.qa_items SET is_published = true
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team member self-published draft item';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- 3. Owner Review & Publication
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);

UPDATE public.qa_items SET
  verification_status = 'verified',
  verified_by = '00000000-0000-4000-8000-000000000101',
  verified_at = now(),
  content_status = 'published',
  is_published = true
WHERE id = '00000000-0000-4000-8000-000000000103';

-- 4. Immutability While Reviewed (Owner and Team Member Denied)

-- Case E: Owner cannot edit reviewed translation or metadata without returning to draft
DO $$
BEGIN
  BEGIN
    UPDATE public.qa_translations SET short_answer = 'tampered by owner'
    WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'owner edited reviewed translation';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE public.qa_items SET source_reference = 'tampered by owner'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'owner edited reviewed source';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE public.qa_items SET category = 'tampered by owner'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'owner edited reviewed category';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- Case F: Team member cannot edit content, translations, or status of reviewed Q&A
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000102', true);
DO $$
BEGIN
  -- Translation edit
  BEGIN
    UPDATE public.qa_translations SET short_answer = 'tampered by team'
    WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team edited reviewed translation';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Metadata edit
  BEGIN
    UPDATE public.qa_items SET source_reference = 'tampered by team'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team edited reviewed source';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Status demotion attempt: content_status
  BEGIN
    UPDATE public.qa_items SET content_status = 'draft'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team changed reviewed publication status';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Status demotion attempt: verification_status via direct API
  BEGIN
    UPDATE public.qa_items SET verification_status = 'unverified'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team changed reviewed verification status';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Status demotion attempt: is_published via direct API
  BEGIN
    UPDATE public.qa_items SET is_published = false
    WHERE id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team changed reviewed is_published flag';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Insert new translation on reviewed item
  BEGIN
    INSERT INTO public.qa_translations (qa_item_id, language_code, question, short_answer)
    VALUES ('00000000-0000-4000-8000-000000000103', 'en', 'What is meditation', 'draft answer');
    RAISE EXCEPTION 'team inserted translation into reviewed item';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Delete translation on reviewed item
  BEGIN
    DELETE FROM public.qa_translations WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'team deleted translation from reviewed item';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- 5. Demoting to Draft and Allowing Edits Again
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
UPDATE public.qa_items SET
  content_status = 'draft',
  verification_status = 'unverified',
  verified_by = NULL,
  verified_at = NULL,
  is_published = false
WHERE id = '00000000-0000-4000-8000-000000000103';

-- Team editing is permitted once returned to draft
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000102', true);
UPDATE public.qa_translations SET short_answer = 'แก้ไขฉบับร่างโดยทีมงาน'
WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';

UPDATE public.qa_items SET category = 'updated_practice', source_reference = 'updated source'
WHERE id = '00000000-0000-4000-8000-000000000103';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.qa_translations
    WHERE qa_item_id = '00000000-0000-4000-8000-000000000103'
      AND short_answer = 'แก้ไขฉบับร่างโดยทีมงาน'
  ) THEN
    RAISE EXCEPTION 'team draft edit did not persist';
  END IF;
END;
$$;

-- Owner re-reviews and re-publishes
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
UPDATE public.qa_items SET
  verification_status = 'verified',
  verified_by = '00000000-0000-4000-8000-000000000101',
  verified_at = now(),
  content_status = 'published',
  is_published = true
WHERE id = '00000000-0000-4000-8000-000000000103';

-- 6. Public (anon) Read & Mutation Checks
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);

-- Public can read approved items and translations
DO $$
DECLARE v_rows integer;
BEGIN
  SELECT count(*) INTO v_rows FROM public.qa_translations
  WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
  IF v_rows <> 1 THEN RAISE EXCEPTION 'public approved-answer read failed'; END IF;

  SELECT count(*) INTO v_rows FROM public.qa_items
  WHERE id = '00000000-0000-4000-8000-000000000103';
  IF v_rows <> 1 THEN RAISE EXCEPTION 'public approved-item read failed'; END IF;

  -- Public cannot mutate translations
  BEGIN
    UPDATE public.qa_translations SET short_answer = 'tampered by public'
    WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows <> 0 THEN RAISE EXCEPTION 'public updated approved answer'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- Public cannot mutate items
  BEGIN
    UPDATE public.qa_items SET category = 'tampered by public'
    WHERE id = '00000000-0000-4000-8000-000000000103';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows <> 0 THEN RAISE EXCEPTION 'public updated approved item'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

-- 7. Translation Identity Immutability Check
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);

-- Demote to draft to test translation identity update
UPDATE public.qa_items SET
  content_status = 'draft', verification_status = 'unverified', is_published = false
WHERE id = '00000000-0000-4000-8000-000000000103';

DO $$
BEGIN
  BEGIN
    UPDATE public.qa_translations SET language_code = 'en'
    WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
    RAISE EXCEPTION 'translation language_code was modified';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END;
$$;

-- 8. Archive & Cascade Delete Check
-- Owner archives and deletes item; translations cascade cleanly
UPDATE public.qa_items SET
  content_status = 'archived', is_published = false, archived_at = now()
WHERE id = '00000000-0000-4000-8000-000000000103';

DELETE FROM public.qa_items WHERE id = '00000000-0000-4000-8000-000000000103';

DO $$
DECLARE v_trans_count integer;
BEGIN
  SELECT count(*) INTO v_trans_count FROM public.qa_translations
  WHERE qa_item_id = '00000000-0000-4000-8000-000000000103';
  IF v_trans_count <> 0 THEN RAISE EXCEPTION 'translations failed to cascade on item deletion'; END IF;
END;
$$;

RESET ROLE;
SELECT pass('Comprehensive Q&A lock permissions (public, team, owner, status demotion, API tampering, cascade) verified');
SELECT * FROM finish();
ROLLBACK;
