import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'
import { pageFields, validPageCopy, PageCopyPreviewContext, type PageCopy, type PageCopyRow, type PageLanguage, type PageSection } from '../../lib/siteContent'
import { getActivitiesPageContent } from '../../content/activitiesContent'
import { SiteImageField } from '../../components/admin/SiteImageField'
import '../../components/admin/AccessCenter.css'
import '../../components/admin/SiteContentEditor.css'

const HomePreview=lazy(()=>import('../VisitPage').then(m=>({default:m.VisitorHome})))
const ActivitiesPreview=lazy(()=>import('../ActivitiesPage').then(m=>({default:m.ActivitiesPage})))

export function AdminSiteContentPage({fixedSection='home'}:{fixedSection?:PageSection} = {}){
 const {profile,isRefreshing}=useAuth();const {i18n}=useTranslation()
 const en=(i18n.resolvedLanguage||i18n.language||'th').startsWith('en')
 const x=useCallback((th:string,english:string)=>en?english:th,[en])
 const allowed=Boolean(profile?.is_active&&['owner','team_member'].includes(profile.role))
 const section=fixedSection
 const [language,setLanguage]=useState<PageLanguage>('th')
 const [content,setContent]=useState<PageCopy>({}),[draft,setDraft]=useState<PageCopyRow|null>(null),[published,setPublished]=useState<PageCopyRow|null>(null)
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[uploadBusy,setUploadBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[reload,setReload]=useState(0)
 const [confirm,setConfirm]=useState(false),[preview,setPreview]=useState(false),[dirty,setDirty]=useState(false)
 const [savingMode,setSavingMode]=useState<'draft'|'publish'|null>(null)
 const previewValue=useMemo(()=>({section,language,copy:content}),[section,language,content])
 const locked=busy||uploadBusy||Boolean(isRefreshing)
 useEffect(()=>{
  if(!allowed)return
  let current=true;setReady(false);setError('');setNotice('');setConfirm(false);setPreview(false);setContent({});setDraft(null);setPublished(null);setDirty(false)
  async function load(){
   if(!supabaseClient){if(current)setError(language==='en'?'Content service unavailable.':'ยังเชื่อมต่อระบบเนื้อหาไม่ได้');return}
   try{
    const {data,error}=await supabaseClient.from('site_page_content').select('section,language_code,stage,content,updated_at,revision').eq('section',section).eq('language_code',language)
    if(!current)return
    if(error||!Array.isArray(data))throw new Error('load')
    const rows=data as PageCopyRow[],d=rows.find(r=>r.stage==='draft')??null,p=rows.find(r=>r.stage==='published')??null
    if(!validPageCopy(section,d?.content??p?.content??{}))throw new Error('invalid')
    setDraft(d);setPublished(p);setContent(d?.content??p?.content??{});setReady(true)
   }catch{if(current)setError(language==='en'?'Could not load content. Retry before editing.':'โหลดเนื้อหาไม่สำเร็จ กรุณาลองใหม่ก่อนแก้ไข')}
  }
  void load();return()=>{current=false}
 },[allowed,section,language,reload])
 useEffect(()=>{
  const warn=(e:BeforeUnloadEvent)=>{if(dirty||uploadBusy||busy){e.preventDefault();e.returnValue=''}}
  window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)
 },[dirty,uploadBusy,busy])
 useEffect(()=>{
  const guard=(e:MouseEvent)=>{
   const target=e.target instanceof Element?e.target.closest('a[href]'):null
   if(!(target instanceof HTMLAnchorElement)||target.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return
   if(uploadBusy||busy){e.preventDefault();e.stopPropagation();return}
   if(dirty&&target.origin===window.location.origin&&!window.confirm(x('มีการแก้ไขที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่','Leave this page and discard unsaved changes?'))){e.preventDefault();e.stopPropagation()}
  }
  document.addEventListener('click',guard,true);return()=>document.removeEventListener('click',guard,true)
 },[dirty,uploadBusy,busy,x])
 useEffect(()=>{
  if(!preview)return
  const before=document.activeElement,previousOverflow=document.body.style.overflow
  document.body.style.overflow='hidden'
  const keys=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setPreview(false);return}
   if(event.key!=='Tab')return
   const nodes=Array.from(document.querySelectorAll<HTMLElement>('.site-preview button:not(:disabled),.site-preview a[href],.site-preview input:not(:disabled),.site-preview select:not(:disabled)')).filter(n=>n.offsetParent!==null)
   const first=nodes[0],last=nodes.at(-1)
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
  document.addEventListener('keydown',keys)
  return()=>{document.removeEventListener('keydown',keys);document.body.style.overflow=previousOverflow;if(before instanceof HTMLElement)before.focus()}
 },[preview])
 const setValue=(key:string,value:string)=>{setContent(old=>({...old,[key]:value}));setConfirm(false);setNotice('');setDirty(true)}
 const changeView=(next:()=>void)=>{if(!dirty||window.confirm(x('มีการแก้ไขที่ยังไม่บันทึก ต้องการเปลี่ยนส่วนและละทิ้งการแก้ไขนี้หรือไม่','Discard unsaved changes and switch?')))next()}
 const resetPage=()=>{
  if(!ready||locked)return
  if(!window.confirm(x('คืนข้อความ รูปภาพ และค่าทั้งหน้านี้ให้ตรงกับเว็บที่เผยแพร่อยู่หรือไม่? จะเปลี่ยนเฉพาะฉบับที่กำลังแก้ และยังต้องกดบันทึกฉบับร่าง','Restore all text, images and values on this page to the published version? This changes only your current edits; save the draft to keep it.')))return
  setContent({...published?.content});setDirty(true);setConfirm(false);setPreview(false);setError('')
  setNotice(x('คืนค่าทั้งหน้าตามเว็บที่เผยแพร่อยู่แล้ว หากยังไม่เคยเผยแพร่จะใช้ต้นฉบับของเว็บ ตรวจดูแล้วกดบันทึกฉบับร่าง','Restored this page from the published version, or the project defaults if unpublished. Review and save the draft.'))
 }
 const save=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(!allowed||!ready||locked||!supabaseClient)return
  const publish=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='publish'
  if(publish&&!confirm)return
  const cleaned=Object.fromEntries(Object.entries(content).map(([k,v])=>[k,v?.trim()??'']).filter(([,v])=>v)) as PageCopy
  if(!validPageCopy(section,cleaned)){setError(x('กรุณาตรวจตัวเลข ความยาวข้อความ และลิงก์ภาพให้ถูกต้อง','Check numbers, text limits and image links.'));return}
  setSavingMode(publish?'publish':'draft');setBusy(true);setError('');setNotice('')
  try{
   const {data,error}=await supabaseClient.rpc('save_site_page_content',{p_section:section,p_language:language,p_content:cleaned,p_publish:publish,p_expected_updated_at:draft?.updated_at??null})
   if(error||!data?.updated_at)throw new Error(error?.code==='40001'?'conflict':'save')
   const saved=data as PageCopyRow;setDraft(saved);setContent(saved.content);if(publish)setPublished({...saved,stage:'published'});setConfirm(false);setDirty(false)
   setNotice(publish?x('เผยแพร่แล้ว เปิดหน้าสาธารณะเพื่อตรวจข้อความได้ทันที','Published. Open the public page to check the result.'):x('บันทึกฉบับร่างแล้ว หน้าสาธารณะยังใช้ฉบับเผยแพร่เดิม','Draft saved. Public content is unchanged.'))
  }catch(cause){setError(cause instanceof Error&&cause.message==='conflict'?x('มีผู้แก้เนื้อหานี้ก่อนหน้า กรุณาโหลดล่าสุดและตรวจเทียบก่อนบันทึก','This content changed. Reload and review before saving.'):x('ยังบันทึกไม่สำเร็จ เนื้อหาบนหน้าเว็บยังไม่เปลี่ยน','Save was not confirmed. Public content has not changed.'))}
  finally{setBusy(false);setSavingMode(null)}
 }
 if(!allowed)return <p role="alert">{x('ไม่มีสิทธิ์จัดการเนื้อหา','Access denied')}</p>
 const publicPath=section==='activities'?'/activities':'/'
 const groups=[...new Set(pageFields[section].map(f=>f.group||x('ช่องทางติดต่อ','Contact')))]
 const activity=getActivitiesPageContent(language)
 const legacy:PageCopy=section==='activities'?{title:activity.hero.title,description:activity.hero.description}:section==='home'?{
  title:'MonkChat Guide',image_url:'/images/home/monkchat-banner-desktop.webp',
  tagline:language==='th'?'พักกายใต้ร่มไม้ใหญ่ · เปิดใจคุยกับพระสงฆ์':'Take a seat in the shade · Open conversation with monks',
  description:language==='th'?'นั่งเก้าอี้สบายๆ ใต้ร่มไม้วัดมหาธาตุ อยุธยา พูดคุยอย่างเป็นกันเอง ถามได้ทุกเรื่องที่สงสัย และพักใจให้สงบ 5 นาที เปิดกว้างทุกศาสนา ร่วมได้ทันทีโดยไม่มีค่าใช้จ่าย':'Sit comfortably under the shade trees at Wat Mahathat. Ask anything you wonder about monk life, and enjoy 5 minutes of quiet meditation. Friendly, welcoming, no formalities, and 100% free walk-in.'
 }:{}
 return <div className="access-center"><header className="access-hero"><div><span className="access-eyebrow">MONKCHAT · WEBSITE CONTENT</span><h1>{section==='home'?x('จัดการหน้าโฮม','Edit Home'):section==='activities'?x('จัดการหน้ากิจกรรม','Edit Activities'):x('จัดการช่องทางติดต่อ','Edit Contact')}</h1><p>{x('เปลี่ยนรูป ข้อความ ไฮไลต์ และสถิติ ดูตัวอย่างก่อนเผยแพร่ โดยไม่ต้องแก้โค้ด','Update images, copy, highlights and statistics. Preview before publishing.')}</p></div></header>
  <div className="access-filters">
  <label className="access-field">{x('ภาษาเนื้อหา','Content language')}<select disabled={locked} value={language} onChange={e=>{const value=e.target.value as PageLanguage;changeView(()=>setLanguage(value))}}><option value="th">ภาษาไทย</option><option value="en">English</option></select></label>
  <button type="button" className="access-btn" disabled={locked} onClick={()=>changeView(()=>setReload(r=>r+1))}>{x('โหลดล่าสุด','Reload')}</button><button type="button" className="access-btn" disabled={locked||!ready} onClick={resetPage}>{x('คืนค่าทั้งหน้า','Restore page')}</button><a className="access-btn" href={publicPath} target="_blank" rel="noopener noreferrer">{x('เปิดหน้าเว็บจริง','Open public page')} ↗</a></div>
  {error&&<p className="access-message error">{error}</p>}{notice&&<p className="access-message">{notice}</p>}{!ready&&!error&&<p role="status">{x('กำลังโหลด…','Loading…')}</p>}
  <form onSubmit={save} aria-busy={busy}><fieldset disabled={!ready||locked} className="site-editor-fields"><p className="access-note">{x('เลือกกลุ่มเนื้อหาเพื่อแก้ไข ช่องที่ยังไม่เคยเปลี่ยนจะแสดงข้อมูลเดิม เว้นว่างเพื่อกลับไปใช้ค่าเดิม ภาพใหม่จะไม่แสดงต่อผู้มาเยือนจนกดเผยแพร่ แก้เฉพาะภาษาที่เลือก','Open a content group to edit. Untouched fields show the original content. Leave blank to restore defaults. New images stay private until published. Changes apply to the selected language.')}</p>
   {groups.map((group,index)=><details key={`${section}:${language}:${group}`} className="site-editor-group" open={index===0}><summary>{group}<span>{pageFields[section].filter(f=>(f.group||x('ช่องทางติดต่อ','Contact'))===group).length} {x('รายการ','fields')}</span></summary><div className="site-editor-grid">
    {pageFields[section].filter(f=>(f.group||x('ช่องทางติดต่อ','Contact'))===group).map(f=>{
     const value=content[f.key]??f.defaults?.[language]??legacy[f.key]??'',label=en?f.en:f.th
     if(f.kind==='image')return <SiteImageField key={`${section}:${language}:${f.key}`} label={label} value={value} onChange={v=>setValue(f.key,v)} disabled={!ready||busy||uploadBusy} userId={profile?.id||''} english={en} onUploadState={setUploadBusy} canRestore={value!==(published?.content[f.key]??f.defaults?.[language]??legacy[f.key]??'')} onRestore={()=>setValue(f.key,published?.content[f.key]??f.defaults?.[language]??legacy[f.key]??'')}/>
     if(f.kind==='visible')return <label key={f.key} className="access-check"><input type="checkbox" checked={value!=='false'} onChange={e=>setValue(f.key,String(e.target.checked))}/>{label}</label>
     return <label key={f.key} className="access-field">{label}{f.kind==='number'?<input inputMode="decimal" value={value} maxLength={f.limit} onChange={e=>setValue(f.key,e.target.value)}/>:value.length>150||f.key==='description'?<textarea value={value} maxLength={f.limit} rows={4} onChange={e=>setValue(f.key,e.target.value)}/>:<input value={value} maxLength={f.limit} onChange={e=>setValue(f.key,e.target.value)}/>}<small>{value.length}/{f.limit}</small></label>
    })}</div></details>)}
   <div className="access-card site-editor-actions"><button type="button" className="access-btn" onClick={()=>setPreview(true)} disabled={section==='contact'||!validPageCopy(section,content)}>{x('ดูตัวอย่างฉบับที่กำลังแก้','Preview current draft')}</button><label className="access-check"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>{x('ตรวจข้อความ รูปภาพ และตัวเลขแล้ว ยืนยันให้แสดงบนเว็บไซต์','I reviewed the text, image and links and approve publishing them.')}</span></label><div className="access-actions"><button type="submit" value="draft" className="access-btn">{busy&&savingMode==='draft'?x('กำลังบันทึกร่าง…','Saving draft…'):x('บันทึกฉบับร่าง','Save draft')}</button><button type="submit" value="publish" disabled={!confirm||locked||!ready} className="access-btn primary">{busy&&savingMode==='publish'?x('กำลังเผยแพร่…','Publishing…'):x('บันทึกและเผยแพร่','Save & publish')}</button></div>{(busy||notice||error)&&<p className={`site-save-feedback${error?' error':''}`} role={error?'alert':'status'} aria-live="polite">{busy?x('กำลังบันทึกฉบับที่แก้ไข กรุณารอสักครู่…','Saving your changes. Please wait…'):error||(notice?'✓ '+notice:'')}</p>}<p>{published?x(`ฉบับเผยแพร่ล่าสุด: ${new Date(published.updated_at).toLocaleString('th-TH')}`,`Last published: ${new Date(published.updated_at).toLocaleString('en-GB')}`):x('ยังใช้เนื้อหาเดิมของโครงการ','Using the project default content')}{dirty?' · '+x('มีการแก้ไขที่ยังไม่บันทึก','Unsaved changes'):''}</p></div>
  </fieldset></form>
  {preview&&<div className="site-preview-backdrop"><section className="site-preview" role="dialog" aria-modal="true" aria-label={x('ตัวอย่างก่อนเผยแพร่','Draft preview')}><header><strong>{x('ตัวอย่างฉบับร่าง ยังไม่เผยแพร่','Draft preview · not published')}</strong><button className="access-btn" autoFocus onClick={()=>setPreview(false)}>{x('ปิดตัวอย่าง','Close preview')}</button></header><div className="site-preview-body"><PageCopyPreviewContext.Provider value={previewValue}><Suspense fallback={<p>{x('กำลังเตรียมตัวอย่าง…','Loading preview…')}</p>}>{section==='activities'?<ActivitiesPreview previewLanguage={language}/>:<HomePreview currentLang={language}/>}</Suspense></PageCopyPreviewContext.Provider></div></section></div>}
 </div>
}
