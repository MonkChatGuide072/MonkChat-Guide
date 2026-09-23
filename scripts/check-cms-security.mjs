// Isolated PostgreSQL checks; no network, credentials, or production writes.
// Install PGlite in a temporary directory and supply its absolute module path.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite')
const db = new PGlite()
const owner = '11111111-1111-4111-8111-111111111111'
const member = '22222222-2222-4222-8222-222222222222'
const inactive = '33333333-3333-4333-8333-333333333333'
const newMember = '44444444-4444-4444-8444-444444444444'
let checks = 0
async function check(label, run) { await run(); checks++; console.log(`PASS ${label}`) }
async function asUser(role, id = '') {
  assert.ok(['anon', 'authenticated'].includes(role))
  await db.exec('RESET ROLE')
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id])
  await db.exec(`SET ROLE ${role}`)
}
try {
  // Minimal Supabase Auth shim. Actual application schemas/policies are loaded below.
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
  for (const id of [owner, member, inactive, newMember]) await db.query('INSERT INTO auth.users VALUES ($1)', [id])
  for (const [id, role, active] of [[owner, 'owner', true], [member, 'team_member', true], [inactive, 'team_member', false]]) {
    await db.query('INSERT INTO public.profiles(id,display_name,role,is_active) VALUES ($1,$2,$3,$4)', [id, role, role, active])
  }
  await db.exec(await readFile(new URL('../supabase/migrations/20260923020015_cms_account_access.sql', import.meta.url), 'utf8'))
  await asUser('anon')
  await check('public can read languages', async () => assert.equal((await db.query('SELECT * FROM public.languages')).rows.length, 2))
  await check('public cannot write languages', async () => assert.rejects(db.exec("INSERT INTO public.languages VALUES ('ja','日本語',true)")))
  await check('public cannot probe security version', async () => assert.rejects(db.exec('SELECT public.cms_security_version()')))
  await asUser('authenticated', member)
  await check('active member role is preserved', async () => assert.equal((await db.query('SELECT private.get_user_role() AS role')).rows[0].role, 'team_member'))
  await check('member cannot create language', async () => assert.rejects(db.exec("INSERT INTO public.languages VALUES ('ja','日本語',true)")))
  await check('member cannot escalate own role', async () => assert.equal((await db.query("UPDATE public.profiles SET role='owner' WHERE id=$1 RETURNING id", [member])).rows.length, 0))
  await check('member cannot list other profiles', async () => assert.equal((await db.query('SELECT id FROM public.profiles')).rows.length, 1))
  await asUser('authenticated', inactive)
  await check('inactive member has no management role', async () => assert.equal((await db.query('SELECT private.get_user_role() AS role')).rows[0].role, null))
  await check('inactive member cannot write content', async () => assert.rejects(db.query("INSERT INTO public.meditation_tracks(source_language_code,duration_seconds,content_status,created_by,updated_by) VALUES ('th',60,'draft',$1,$1)", [inactive])))
  await asUser('authenticated', owner)
  await check('owner sees installed security version', async () => assert.equal((await db.query('SELECT public.cms_security_version() AS version')).rows[0].version, 1))
  await check('owner can add content language', async () => { await db.exec("INSERT INTO public.languages VALUES ('ja','日本語',true)") })
  await check('core languages cannot be deactivated', async () => assert.rejects(db.exec("UPDATE public.languages SET is_active=false WHERE code='th'")))
  await check('core languages cannot be deleted', async () => assert.rejects(db.exec("DELETE FROM public.languages WHERE code='en'")))
  await check('language identifiers cannot be renamed', async () => assert.rejects(db.exec("UPDATE public.languages SET code='jp' WHERE code='ja'")))
  await check('owner cannot promote a member', async () => assert.rejects(db.query("UPDATE public.profiles SET role='owner' WHERE id=$1", [member])))
  await check('owner cannot suspend own account', async () => assert.rejects(db.query('UPDATE public.profiles SET is_active=false WHERE id=$1', [owner])))
  await check('owner cannot hard-delete profiles', async () => assert.rejects(db.query('DELETE FROM public.profiles WHERE id=$1', [member])))
  await check('owner cannot create another owner through CMS', async () => assert.rejects(db.query("INSERT INTO public.profiles VALUES ($1,'new owner','owner',true,now())", [newMember])))
  await check('owner can create member with audit attribution', async () => {
    await db.query("INSERT INTO public.profiles(id,display_name,role,is_active) VALUES ($1,'New member','team_member',true)", [newMember])
    assert.ok((await db.query('SELECT actor_user_id FROM public.admin_audit_logs WHERE actor_user_id=$1', [owner])).rows.length > 0)
  })
  await check('owner can suspend member and remove management role immediately', async () => {
    await db.query('UPDATE public.profiles SET is_active=false WHERE id=$1', [member])
    await asUser('authenticated', member)
    assert.equal((await db.query('SELECT private.get_user_role() AS role')).rows[0].role, null)
  })
  console.log(`${checks} isolated database checks passed`)
} finally { await db.close() }
