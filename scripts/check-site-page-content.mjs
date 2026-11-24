import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { PGlite }=await import(process.env.PGLITE_MODULE??'@electric-sql/pglite');
const db=new PGlite();let checks=0;
const owner='00000000-0000-4000-8000-000000000001',team='00000000-0000-4000-8000-000000000002',student='00000000-0000-4000-8000-000000000003';
async function actor(role,id=''){await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec(`SET ROLE ${role}`)}
async function save(copy,publish,expected=null){return(await db.query('SELECT * FROM public.save_site_page_content($1,$2,$3::jsonb,$4,$5::timestamptz)',['home','th',JSON.stringify(copy),publish,expected])).rows[0]}
try{
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE SCHEMA auth;CREATE SCHEMA private;
 CREATE TABLE public.profiles(id uuid PRIMARY KEY,role text,is_active boolean);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 CREATE FUNCTION private.get_user_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$SELECT role FROM public.profiles WHERE id=auth.uid() AND is_active$$;
 REVOKE ALL ON FUNCTION private.get_user_role() FROM PUBLIC,anon;GRANT USAGE ON SCHEMA public,auth,private TO authenticated;GRANT USAGE ON SCHEMA public TO anon;GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;`);
 for(const[id,role]of [[owner,'owner'],[team,'team_member'],[student,'student']])await db.query('INSERT INTO public.profiles VALUES($1,$2,true)',[id,role]);
 await db.exec(await readFile(new URL('../supabase/migrations/20261124013217_site_page_content.sql',import.meta.url),'utf8'));
 await actor('authenticated',team);
 let draft=await save({title:'Fixture draft'},false);assert.equal(draft.stage,'draft');checks++;
 await actor('anon');assert.equal((await db.query('SELECT * FROM public.site_page_content')).rows.length,0);checks++;
 await assert.rejects(save({title:'Forged'},true),/permission denied/);checks++;
 await actor('authenticated',student);await assert.rejects(save({title:'Forged'},true),/access required/);checks++;
 assert.equal((await db.query('SELECT * FROM public.site_page_content')).rows.length,0);checks++;
 await actor('authenticated',owner);draft=await save({title:'Reviewed fixture'},true,draft.updated_at);
 await actor('anon');let rows=(await db.query('SELECT * FROM public.site_page_content')).rows;assert.equal(rows.length,1);assert.equal(rows[0].content.title,'Reviewed fixture');checks+=2;
 await actor('authenticated',team);
 await assert.rejects(save({title:'Stale draft'},true,null),/changed/);checks++;
 let next=await save({title:'Unpublished next revision'},false,draft.updated_at);
 await actor('anon');assert.equal((await db.query('SELECT content FROM public.site_page_content')).rows[0].content.title,'Reviewed fixture');checks++;
 await actor('authenticated',owner);
 for(const copy of [{title:'x'.repeat(201)},{image_url:'javascript:alert(1)'},{image_url:'https://user:password@example.com/a.png'},{unknown:'field'},{title:{html:'bad'}}]){
   await assert.rejects(save(copy,true,next.updated_at));checks++;
 }
 // A failed publication must leave both published and draft rows intact.
 assert.equal((await db.query("SELECT content FROM public.site_page_content WHERE stage='draft'")).rows[0].content.title,'Unpublished next revision');checks++;
 await db.query('SELECT * FROM public.save_site_page_content($1,$2,$3::jsonb,true,null)',['contact','en',JSON.stringify({title:'Contact fixture',link_url:'https://example.com'})]);checks++;
 await actor('authenticated',student);
 assert.equal((await db.query("UPDATE public.site_page_content SET content='{}' RETURNING section")).rows.length,0);checks++;
 await actor('postgres');await db.query('UPDATE public.profiles SET is_active=false WHERE id=$1',[owner]);await actor('authenticated',owner);
 await assert.rejects(save({title:'Inactive owner'},true,next.updated_at),/access required/);checks++;
 console.log(`PASS: ${checks} page-content checks (disposable PostgreSQL; public sees published content only)`);
}finally{await db.close()}
