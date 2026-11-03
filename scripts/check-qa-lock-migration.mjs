import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pgliteModule = process.env.PGLITE_MODULE ?? '@electric-sql/pglite';
const { PGlite } = await import(pgliteModule);

const db = new PGlite();
let checks = 0;

async function check(label, run) {
  await run();
  checks++;
  console.log(`PASS ${label}`);
}

async function asUser(role, id = '') {
  assert.ok(['anon', 'authenticated'].includes(role));
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`SET ROLE ${role}`);
}

try {
  // 1. Setup Supabase Auth and schema shims
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, aud text, role text, email text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
  `);

  // 2. Load core migrations
  const migrations = [
    '20260812152413_initial_schema.sql',
    '20260812152735_row_level_security.sql',
    '20260812160457_security_advisor_hardening.sql',
    '20260812195634_seed_initial_languages.sql',
    '20260814022206_restrict_role_policies_to_authenticated.sql',
    '20260814190506_anonymous_analytics_and_admin_audit.sql',
    '20260923020015_cms_account_access.sql',
    '20261025130443_lock_verified_qa_content.sql',
  ];

  for (const m of migrations) {
    const sql = await readFile(new URL(`../supabase/migrations/${m}`, import.meta.url), 'utf8');
    await db.exec(sql);
  }

  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated');

  // 3. Setup test fixtures
  const ownerId = '00000000-0000-4000-8000-000000000101';
  const memberId = '00000000-0000-4000-8000-000000000102';
  const qaItemId = '00000000-0000-4000-8000-000000000103';

  await db.query('INSERT INTO auth.users (id, aud, role, email) VALUES ($1, $2, $3, $4)', [ownerId, 'authenticated', 'authenticated', 'owner@example.invalid']);
  await db.query('INSERT INTO auth.users (id, aud, role, email) VALUES ($1, $2, $3, $4)', [memberId, 'authenticated', 'authenticated', 'member@example.invalid']);
  await db.query('INSERT INTO public.profiles (id, display_name, role, is_active) VALUES ($1, $2, $3, $4)', [ownerId, 'Owner Test', 'owner', true]);
  await db.query('INSERT INTO public.profiles (id, display_name, role, is_active) VALUES ($1, $2, $3, $4)', [memberId, 'Member Test', 'team_member', true]);

  await db.query(`
    INSERT INTO public.qa_items (
      id, category, source_reference, content_status, verification_status, is_published, created_by, updated_by
    ) VALUES ($1, 'practice', 'original reviewed source', 'draft', 'unverified', false, $2, $2)
  `, [qaItemId, ownerId]);

  await db.query(`
    INSERT INTO public.qa_translations (qa_item_id, language_code, question, short_answer)
    VALUES ($1, 'th', 'สมาธิคืออะไร', 'คำตอบฉบับร่างดั้งเดิม')
  `, [qaItemId]);

  // 4. Owner verifies and publishes
  await asUser('authenticated', ownerId);
  await db.query(`
    UPDATE public.qa_items SET
      verification_status = 'verified',
      verified_by = $1,
      verified_at = now(),
      content_status = 'published',
      is_published = true
    WHERE id = $2
  `, [ownerId, qaItemId]);

  // Check 1: Owner cannot edit translation while verified & published
  await check('owner cannot edit reviewed translation while verified/published', async () => {
    await assert.rejects(
      db.query("UPDATE public.qa_translations SET short_answer = 'tampered' WHERE qa_item_id = $1", [qaItemId]),
      /Return Q&A to draft before editing reviewed translations/
    );
  });

  // Check 2: Owner cannot edit source_reference while verified & published
  await check('owner cannot edit source_reference while verified/published', async () => {
    await assert.rejects(
      db.query("UPDATE public.qa_items SET source_reference = 'tampered' WHERE id = $1", [qaItemId]),
      /Return Q&A to draft before editing reviewed content/
    );
  });

  // Check 3: Team member cannot edit reviewed translation
  await asUser('authenticated', memberId);
  await check('team member cannot edit reviewed translation', async () => {
    await assert.rejects(
      db.query("UPDATE public.qa_translations SET short_answer = 'tampered' WHERE qa_item_id = $1", [qaItemId]),
      /Return Q&A to draft before editing reviewed translations/
    );
  });

  // Check 4: Team member cannot demote reviewed item status to draft
  await check('team member cannot change status of reviewed Q&A item', async () => {
    await assert.rejects(
      db.query("UPDATE public.qa_items SET content_status = 'draft' WHERE id = $1", [qaItemId]),
      /Only the owner may change the status of reviewed Q&A/
    );
  });

  // Check 5: Owner can return item to draft & unverified
  await asUser('authenticated', ownerId);
  await check('owner can return reviewed Q&A to unverified draft', async () => {
    await db.query(`
      UPDATE public.qa_items SET
        content_status = 'draft',
        verification_status = 'unverified',
        verified_by = NULL,
        verified_at = NULL,
        is_published = false
      WHERE id = $1
    `, [qaItemId]);
    const res = await db.query('SELECT content_status, verification_status, is_published FROM public.qa_items WHERE id = $1', [qaItemId]);
    assert.equal(res.rows[0].content_status, 'draft');
    assert.equal(res.rows[0].verification_status, 'unverified');
    assert.equal(res.rows[0].is_published, false);
  });

  // Check 6: Team member can now edit translation in draft state
  await asUser('authenticated', memberId);
  await check('team member can edit translation once returned to draft', async () => {
    await db.query("UPDATE public.qa_translations SET short_answer = 'แก้ไขฉบับร่างโดยทีมงาน' WHERE qa_item_id = $1", [qaItemId]);
    const res = await db.query('SELECT short_answer FROM public.qa_translations WHERE qa_item_id = $1', [qaItemId]);
    assert.equal(res.rows[0].short_answer, 'แก้ไขฉบับร่างโดยทีมงาน');
  });

  // Check 7: Owner can re-verify and publish the updated draft
  await asUser('authenticated', ownerId);
  await check('owner can re-verify and publish updated draft', async () => {
    await db.query(`
      UPDATE public.qa_items SET
        verification_status = 'verified',
        verified_by = $1,
        verified_at = now(),
        content_status = 'published',
        is_published = true
      WHERE id = $2
    `, [ownerId, qaItemId]);
    const res = await db.query('SELECT content_status, verification_status, is_published FROM public.qa_items WHERE id = $1', [qaItemId]);
    assert.equal(res.rows[0].content_status, 'published');
    assert.equal(res.rows[0].verification_status, 'verified');
    assert.equal(res.rows[0].is_published, true);
  });

  // Check 8: Public anon can read approved translation
  await asUser('anon');
  await check('public anon can read approved translation', async () => {
    const res = await db.query('SELECT question, short_answer FROM public.qa_translations WHERE qa_item_id = $1', [qaItemId]);
    assert.equal(res.rows.length, 1);
    assert.equal(res.rows[0].short_answer, 'แก้ไขฉบับร่างโดยทีมงาน');
  });

  // Check 9: Public anon cannot update approved translation
  await check('public anon cannot update approved translation', async () => {
    // Under RLS, anon update returns 0 rows updated or is rejected
    const updateRes = await db.query("UPDATE public.qa_translations SET short_answer = 'tampered' WHERE qa_item_id = $1 RETURNING short_answer", [qaItemId]);
    assert.equal(updateRes.rows.length, 0);
  });

  console.log(`\nAll ${checks} migration and permission tests PASSED on disposable in-memory PostgreSQL!`);
} finally {
  await db.close();
}
