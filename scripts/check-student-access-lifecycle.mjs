import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite');
const db = new PGlite();
const ids = ['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000005'];
let checks = 0;
async function actor(role, id = '') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);
  await db.exec(`SET ROLE ${role}`);
}
async function status(id) { return (await db.query('SELECT student_access_status,is_active FROM public.profiles WHERE id=$1',[id])).rows[0]; }
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA private;
    CREATE TABLE public.profiles(id uuid PRIMARY KEY,display_name text NOT NULL,role text NOT NULL,is_active boolean NOT NULL,student_code text,cohort_year smallint,dharma_name text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    GRANT USAGE ON SCHEMA public,auth,private TO authenticated,service_role,anon;
    GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated,service_role;
    CREATE FUNCTION private.get_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$SELECT role FROM public.profiles WHERE id=auth.uid() AND is_active$$;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid() OR private.get_user_role()='owner');
    CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING(private.get_user_role()='owner') WITH CHECK(private.get_user_role()='owner');
    CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK(private.get_user_role()='owner');`);
  // Install the actual existing profile guard, not a simplified permission substitute.
  const phase2 = await readFile(new URL('../supabase/migrations/20261110170000_student_cohorts_and_practice.sql',import.meta.url),'utf8');
  const guard = phase2.slice(phase2.indexOf('CREATE OR REPLACE FUNCTION private.guard_managed_profile()'),phase2.indexOf('-- 2. Cohort Invite Codes'));
  await db.exec(guard);
  await db.exec('CREATE TRIGGER guard_managed_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.guard_managed_profile()');
  for (const [i,role,active] of [[0,'owner',true],[1,'team_member',true],[2,'student',true],[3,'student',false]]) {
    await db.query('INSERT INTO public.profiles(id,display_name,role,is_active) VALUES($1,$2,$3,$4)',[ids[i],`Fixture ${role}`,role,active]);
  }
  await db.exec(await readFile(new URL('../supabase/migrations/20261124013211_student_access_lifecycle.sql',import.meta.url),'utf8'));
  assert.deepEqual(await status(ids[2]),{student_access_status:'active',is_active:true});checks++;
  assert.deepEqual(await status(ids[3]),{student_access_status:'needs_review',is_active:false});checks++;
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.student_access_events')).rows[0].n,0);checks++;
  await actor('service_role');
  await db.query("INSERT INTO public.profiles(id,display_name,role,is_active) VALUES($1,'New fixture','student',false)",[ids[4]]);
  await actor('authenticated',ids[0]);
  assert.deepEqual(await status(ids[4]),{student_access_status:'pending',is_active:false});checks++;
  await db.query("UPDATE public.profiles SET student_access_status='active',student_access_note='Identity checked' WHERE id=$1 AND student_access_status='pending'",[ids[4]]);
  assert.deepEqual(await status(ids[4]),{student_access_status:'active',is_active:true});checks++;
  const stale=await db.query("UPDATE public.profiles SET student_access_status='suspended' WHERE id=$1 AND student_access_status='pending' RETURNING id",[ids[4]]);
  assert.equal(stale.rows.length,0);checks++;
  await db.query("UPDATE public.profiles SET student_access_status='suspended',student_access_note='Duplicate checked' WHERE id=$1",[ids[4]]);
  assert.deepEqual(await status(ids[4]),{student_access_status:'suspended',is_active:false});checks++;
  const events=(await db.query('SELECT from_status,to_status,actor_name,reason FROM public.student_access_events WHERE student_id=$1 ORDER BY created_at,id',[ids[4]])).rows;
  assert.equal(events.length,3);checks++;
  assert.ok(events.some(e=>e.to_status==='suspended' && e.actor_name==='Fixture owner' && e.reason==='Duplicate checked'));checks++;
  for(const sql of ['DELETE FROM public.student_access_events','UPDATE public.student_access_events SET reason=\'forged\'',"INSERT INTO public.student_access_events(student_id,to_status,actor_name) VALUES('"+ids[4]+"','active','forged')"]) {
    await assert.rejects(db.query(sql),/permission denied/);checks++;
  }
  await assert.rejects(db.query("UPDATE public.profiles SET is_active=false WHERE id=$1",[ids[0]]),/Owner accounts cannot be suspended/);checks++;
  await assert.rejects(db.query("UPDATE public.profiles SET role='owner' WHERE id=$1",[ids[4]]),/cannot be changed/);checks++;
  // Compatibility with the previous owner API, with truthful classification and recorded history.
  await db.query('UPDATE public.profiles SET is_active=false WHERE id=$1',[ids[2]]);
  assert.equal((await status(ids[2])).student_access_status,'suspended');checks++;
  for (const id of [ids[1],ids[2],ids[4]]) {
    await actor('authenticated',id);
    assert.equal((await db.query('SELECT * FROM public.student_access_events')).rows.length,0);checks++;
    assert.equal((await db.query('SELECT public.student_access_version() AS version')).rows[0].version,null);checks++;
    assert.equal((await db.query("UPDATE public.profiles SET student_access_status='active' WHERE id=$1 RETURNING id",[ids[4]])).rows.length,0);checks++;
  }
  await actor('anon');
  await assert.rejects(db.query('SELECT * FROM public.student_access_events'),/permission denied/);checks++;
  await assert.rejects(db.query('SELECT public.student_access_version()'),/permission denied/);checks++;
  await actor('postgres');await db.query('UPDATE public.profiles SET is_active=false WHERE id=$1',[ids[0]]);
  await actor('authenticated',ids[0]);
  assert.equal((await db.query('SELECT * FROM public.student_access_events')).rows.length,0);checks++;
  console.log(`PASS: ${checks} student lifecycle checks (disposable PostgreSQL; no hosted changes)`);
} finally { await db.close(); }
