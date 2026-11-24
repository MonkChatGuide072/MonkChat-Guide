import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite');
const db = new PGlite();
const migration = process.argv[2] ?? new URL('../supabase/migrations/20261117202702_student_admission_policy.sql', import.meta.url);
let checks = 0;
async function actor(role, id = '') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`SET ROLE ${role}`);
}
const owner = '00000000-0000-4000-8000-000000000001';
const member = '00000000-0000-4000-8000-000000000002';
const student = '00000000-0000-4000-8000-000000000003';
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA private;
    CREATE TABLE public.profiles (id uuid PRIMARY KEY, role text, is_active boolean);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION private.get_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
      SELECT role FROM public.profiles WHERE id=auth.uid() AND is_active=true $$;
    GRANT USAGE ON SCHEMA public, auth, private TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid(), private.get_user_role() TO authenticated;`);
  for (const [id, role] of [[owner,'owner'],[member,'team_member'],[student,'student']]) {
    await db.query('INSERT INTO public.profiles VALUES ($1,$2,true)', [id,role]);
  }
  await db.exec(await readFile(migration, 'utf8'));
  await actor('authenticated', owner);
  assert.equal((await db.query('SELECT mode FROM public.student_admission_policy')).rows[0].mode, 'auto_approve'); checks++;
  assert.equal((await db.query("UPDATE public.student_admission_policy SET mode='admin_approval' WHERE id=true RETURNING mode")).rows[0].mode, 'admin_approval'); checks++;
  for (const id of [member, student]) {
    await actor('authenticated', id);
    assert.equal((await db.query('SELECT * FROM public.student_admission_policy')).rows.length,0); checks++;
    assert.equal((await db.query("UPDATE public.student_admission_policy SET mode='auto_approve' RETURNING mode")).rows.length,0); checks++;
  }
  await actor('anon');
  await assert.rejects(db.query('SELECT * FROM public.student_admission_policy'), /permission denied/); checks++;
  await actor('service_role');
  assert.equal((await db.query('SELECT mode FROM public.student_admission_policy')).rows[0].mode, 'admin_approval'); checks++;
  await actor('authenticated',owner);
  await assert.rejects(db.query("UPDATE public.student_admission_policy SET mode='invalid'"), /check constraint/); checks++;
  await actor('postgres');
  await db.query('UPDATE public.profiles SET is_active=false WHERE id=$1',[owner]);
  await actor('authenticated',owner);
  assert.equal((await db.query('SELECT * FROM public.student_admission_policy')).rows.length,0); checks++;
  console.log(`PASS: ${checks} admission-policy checks (disposable PostgreSQL, no hosted database changes)`);
} finally { await db.close(); }
