// Runs only against a disposable embedded PostgreSQL database, never Supabase.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite')
const db = new PGlite()
const owner = '11111111-1111-4111-8111-111111111111'
const member = '22222222-2222-4222-8222-222222222222'
const inactive = '33333333-3333-4333-8333-333333333333'
const approved = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const draft = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const approvedTranslation = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const draftTranslation = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
let checks = 0
async function check(label, run) { await run(); checks++; console.log(`PASS ${label}`) }
async function asUser(role, id = '') {
  assert.ok(['anon', 'authenticated'].includes(role))
  await db.exec('RESET ROLE')
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.exec(`SET ROLE ${role}`)
}
const locked = query => assert.rejects(query, error => error.code === '23514')
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
  `)
  for (const file of [
    '20260812152413_initial_schema.sql',
    '20260812152735_row_level_security.sql',
    '20260812160457_security_advisor_hardening.sql',
    '20260812195634_seed_initial_languages.sql',
    '20260814022206_restrict_role_policies_to_authenticated.sql',
    '20260814190506_anonymous_analytics_and_admin_audit.sql',
  ]) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'))
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated')
  for (const [id, role, active] of [[owner, 'owner', true], [member, 'team_member', true], [inactive, 'team_member', false]]) {
    await db.query('INSERT INTO auth.users VALUES ($1)', [id])
    await db.query('INSERT INTO public.profiles(id,display_name,role,is_active) VALUES ($1,$2,$3,$4)', [id, role, role, active])
  }
  for (const file of ['20260923020015_cms_account_access.sql', '20261025130443_lock_verified_qa_content.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'))
  }
  await asUser('authenticated', owner)
  for (const id of [approved, draft]) {
    await db.query("INSERT INTO public.qa_items(id,category,source_reference,content_status,verification_status,created_by,updated_by) VALUES ($1,'test','fixture review','draft','unverified',$2,$2)", [id, owner])
  }
  for (const [id, parent] of [[approvedTranslation, approved], [draftTranslation, draft]]) {
    await db.query("INSERT INTO public.qa_translations(id,qa_item_id,language_code,question,short_answer) VALUES ($1,$2,'th','Fixture question','Reviewed fixture answer')", [id, parent])
  }
  await db.query("UPDATE public.qa_items SET verification_status='verified',content_status='published',is_published=true,verified_by=$2,verified_at=now() WHERE id=$1", [approved, owner])

  await asUser('anon')
  await check('public sees the approved translation only', async () => {
    const rows = (await db.query('SELECT id FROM public.qa_translations')).rows
    assert.deepEqual(rows.map(row => row.id), [approvedTranslation])
  })
  await check('public update affects zero rows', async () => assert.equal((await db.query("UPDATE public.qa_translations SET short_answer='tampered' WHERE id=$1 RETURNING id", [approvedTranslation])).rows.length, 0))
  await check('public cannot insert a translation', async () => assert.rejects(db.query("INSERT INTO public.qa_translations(qa_item_id,language_code,question,short_answer) VALUES ($1,'en','test','test')", [draft])))

  await asUser('authenticated', member)
  await check('member cannot modify approved wording', async () => locked(db.query("UPDATE public.qa_translations SET short_answer='tampered' WHERE id=$1", [approvedTranslation])))
  await check('member cannot modify approved references', async () => locked(db.query("UPDATE public.qa_items SET source_reference='tampered' WHERE id=$1", [approved])))
  await check('member cannot archive approved content', async () => locked(db.query("UPDATE public.qa_items SET content_status='archived',archived_at=now() WHERE id=$1", [approved])))
  await check('member cannot add a language to approved content', async () => locked(db.query("INSERT INTO public.qa_translations(qa_item_id,language_code,question,short_answer) VALUES ($1,'en','test','test')", [approved])))
  await check('moving a row away from approved content is blocked', async () => locked(db.query('UPDATE public.qa_translations SET qa_item_id=$1 WHERE id=$2', [draft, approvedTranslation])))
  await check('moving a draft row into approved content is blocked', async () => locked(db.query('UPDATE public.qa_translations SET qa_item_id=$1 WHERE id=$2', [approved, draftTranslation])))
  await check('member can edit an unverified draft', async () => assert.equal((await db.query("UPDATE public.qa_translations SET short_answer='Draft revision' WHERE id=$1 RETURNING short_answer", [draftTranslation])).rows[0].short_answer, 'Draft revision'))

  await asUser('authenticated', inactive)
  await check('inactive member cannot edit even a draft', async () => assert.equal((await db.query("UPDATE public.qa_translations SET short_answer='tampered' WHERE id=$1 RETURNING id", [draftTranslation])).rows.length, 0))

  await asUser('authenticated', owner)
  await check('Owner must return approved content to draft before editing it', async () => locked(db.query("UPDATE public.qa_translations SET short_answer='owner edit' WHERE id=$1", [approvedTranslation])))
  await check('Owner cannot delete an approved translation directly', async () => locked(db.query('DELETE FROM public.qa_translations WHERE id=$1', [approvedTranslation])))
  await check('unverify and edit in one request is blocked', async () => locked(db.query("UPDATE public.qa_items SET verification_status='unverified',source_reference='changed' WHERE id=$1", [approved])))
  await check('Owner return to draft clears publication and verification attribution', async () => {
    const row = (await db.query("UPDATE public.qa_items SET verification_status='unverified' WHERE id=$1 RETURNING *", [approved])).rows[0]
    assert.equal(row.is_published, false)
    assert.equal(row.content_status, 'draft')
    assert.equal(row.verified_by, null)
    assert.equal(row.verified_at, null)
  })
  await asUser('authenticated', member)
  await check('member can edit after Owner returns it to draft', async () => assert.equal((await db.query("UPDATE public.qa_translations SET short_answer='New draft answer' WHERE id=$1 RETURNING short_answer", [approvedTranslation])).rows[0].short_answer, 'New draft answer'))
  await check('member cannot self-verify or publish a changed answer', async () => {
    await locked(db.query("UPDATE public.qa_items SET verification_status='verified',is_published=true WHERE id=$1", [approved]))
    const row = (await db.query('SELECT * FROM public.qa_items WHERE id=$1', [approved])).rows[0]
    assert.equal(row.verification_status, 'unverified')
    assert.equal(row.is_published, false)
  })
  await asUser('anon')
  await check('public cannot see the revised draft', async () => assert.equal((await db.query('SELECT id FROM public.qa_translations')).rows.length, 0))
  await asUser('authenticated', owner)
  await check('Owner can review and publish the revision again', async () => {
    await db.query("UPDATE public.qa_items SET verification_status='verified',content_status='published',is_published=true,verified_by=$2,verified_at=now() WHERE id=$1", [approved, owner])
    await asUser('anon')
    assert.equal((await db.query('SELECT short_answer FROM public.qa_translations')).rows[0].short_answer, 'New draft answer')
  })
  await asUser('authenticated', owner)
  await check('republished wording is locked again', async () => locked(db.query("UPDATE public.qa_translations SET short_answer='changed again' WHERE id=$1", [approvedTranslation])))
  console.log(`${checks} isolated Q&A security checks passed`)
} finally { await db.close() }
