import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'
import { pageFields, validPageCopy, type PageCopy, type PageCopyRow, type PageLanguage, type PageSection } from '../../lib/siteContent'
import '../../components/admin/AccessCenter.css'

export function AdminSiteContentPage() {
  const {profile}=useAuth(); const {i18n}=useTranslation()
  const en=(i18n.resolvedLanguage||i18n.language||'th').startsWith('en')
  const x=(th:string,english:string)=>en?english:th
  const allowed=profile?.is_active && ['owner','team_member'].includes(profile.role)
  const [section,setSection]=useState<PageSection>('home');const [language,setLanguage]=useState<PageLanguage>('th')
  const [content,setContent]=useState<PageCopy>({});const [draft,setDraft]=useState<PageCopyRow|null>(null);const [published,setPublished]=useState<PageCopyRow|null>(null)
  const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [reload,setReload]=useState(0)
  const [confirm,setConfirm]=useState(false)
  useEffect(()=>{
    if(!allowed)return
    let current=true;setReady(false);setError('');setNotice('');setConfirm(false);setContent({});setDraft(null);setPublished(null)
    async function load(){
      if(!supabaseClient){if(current)setError(en?'Content service unavailable.':'ยังเชื่อมต่อระบบเนื้อหาไม่ได้');return}
      const {data,error}=await supabaseClient.from('site_page_content').select('section,language_code,stage,content,updated_at,revision').eq('section',section).eq('language_code',language)
      if(!current)return
      if(error||!Array.isArray(data)){setError(en?'Could not load content. Retry before editing.':'โหลดเนื้อหาไม่สำเร็จ กรุณาลองใหม่ก่อนแก้ไข');return}
      const rows=data as PageCopyRow[];const d=rows.find(r=>r.stage==='draft')??null;const p=rows.find(r=>r.stage==='published')??null
      setDraft(d);setPublished(p);setContent(d?.content??p?.content??{});setReady(true)
    }
    void load();return()=>{current=false}
  },[allowed,section,language,reload,en])
  const save=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!allowed||!ready||busy||!supabaseClient)return
    const publish=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='publish'
    if(publish&&!confirm)return
    const cleaned=Object.fromEntries(Object.entries(content).map(([k,v])=>[k,v?.trim()??'']).filter(([,v])=>v)) as PageCopy
    if(!validPageCopy(section,cleaned)){setError(x('กรุณาตรวจความยาวข้อความและลิงก์ HTTPS ให้ถูกต้อง','Check text limits and HTTPS links.'));return}
    setBusy(true);setError('');setNotice('')
    try{
      const {data,error}=await supabaseClient.rpc('save_site_page_content',{p_section:section,p_language:language,p_content:cleaned,p_publish:publish,p_expected_updated_at:draft?.updated_at??null})
      if(error||!data?.updated_at)throw new Error(error?.code==='40001'?'conflict':'save')
      const saved=data as PageCopyRow;setDraft(saved);setContent(saved.content);if(publish)setPublished({...saved,stage:'published'});setConfirm(false)
      setNotice(publish?x('เผยแพร่แล้ว เปิดหน้าสาธารณะเพื่อตรวจข้อความได้ทันที','Published. Open the public page to check the result.'):x('บันทึกฉบับร่างแล้ว หน้าสาธารณะยังใช้ฉบับเผยแพร่เดิม','Draft saved. Public content is unchanged.'))
    }catch(cause){setError(cause instanceof Error&&cause.message==='conflict'?x('มีผู้แก้เนื้อหานี้ก่อนหน้า กรุณาโหลดล่าสุดและตรวจเทียบก่อนบันทึก','This content changed. Reload and review before saving.'):x('ยังบันทึกไม่สำเร็จ เนื้อหาบนหน้าเว็บยังไม่เปลี่ยน','Save was not confirmed. Public content has not changed.'))}
    finally{setBusy(false)}
  }
  if(!allowed)return <p role="alert">{x('ไม่มีสิทธิ์จัดการเนื้อหา','Access denied')}</p>
  const publicPath=section==='activities'?'/activities':'/visit'
  return <div className="access-center"><header className="access-hero"><div><span className="access-eyebrow">MONKCHAT · WEBSITE CONTENT</span><h1>{x('หน้าแรก กิจกรรม และช่องทางติดต่อ','Home, activities & contact')}</h1><p>{x('แก้ข้อความสองภาษา บันทึกเป็นร่าง แล้วตรวจยืนยันก่อนเผยแพร่ให้นักท่องเที่ยวเห็น','Edit both languages, save a draft, then review before publishing to visitors.')}</p></div></header>
    <div className="access-filters"><label className="access-field">{x('ส่วนที่ต้องการแก้','Section')}<select disabled={busy} value={section} onChange={e=>setSection(e.target.value as PageSection)}><option value="home">{x('หน้าแรกและแบนเนอร์','Home & banner')}</option><option value="activities">{x('แนะนำกิจกรรม','Activities')}</option><option value="contact">{x('ติดต่อโครงการ','Contact')}</option></select></label><label className="access-field">{x('ภาษาเนื้อหา','Content language')}<select disabled={busy} value={language} onChange={e=>setLanguage(e.target.value as PageLanguage)}><option value="th">ภาษาไทย</option><option value="en">English</option></select></label><button type="button" className="access-btn" disabled={busy} onClick={()=>setReload(r=>r+1)}>{x('โหลดล่าสุด','Reload')}</button><a className="access-btn" href={publicPath} target="_blank" rel="noopener noreferrer">{x('เปิดหน้าเว็บจริง','Open public page')} ↗</a></div>
    {error&&<p role="alert" className="access-message error">{error}</p>}{notice&&<p role="status" className="access-message">{notice}</p>}
    {!ready&&!error&&<p role="status">{x('กำลังโหลด…','Loading…')}</p>}
    <form onSubmit={save} className="access-card"><fieldset disabled={!ready||busy} className="space-y-5"><p className="access-note">{x('เว้นว่างเพื่อใช้ข้อความหรือรูปเดิมของโครงการ เปลี่ยนเฉพาะภาษาที่เลือก ช่องทางติดต่อและข้อมูลกิจกรรมต้องตรวจสอบก่อนเผยแพร่','Leave a field blank to use the project default. Changes apply to the selected language. Verify contact and activity information before publishing.')}</p>
      {pageFields[section].map(field=><label key={`${section}:${language}:${field.key}`} className="access-field">{en?field.en:field.th}{field.key==='description'?<textarea value={content[field.key]??''} maxLength={field.limit} onChange={e=>{setContent({...content,[field.key]:e.target.value});setConfirm(false)}}/>:<input value={content[field.key]??''} maxLength={field.limit} onChange={e=>{setContent({...content,[field.key]:e.target.value});setConfirm(false)}}/>}<small>{(content[field.key]??'').length}/{field.limit}</small></label>)}
      {content.image_url&&validPageCopy(section,{image_url:content.image_url})&&<img src={content.image_url} alt={x('ภาพตัวอย่างแบนเนอร์','Banner preview')} className="max-h-60 w-full rounded-xl object-cover"/>}
      <div className="access-confirm"><label className="access-check"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>{x('ตรวจข้อความ รูปภาพ และลิงก์แล้ว ยืนยันให้แสดงบนเว็บไซต์','I reviewed the text, image and links and approve publishing them.')}</span></label><div className="access-actions"><button type="submit" value="draft" className="access-btn">{x('บันทึกฉบับร่าง','Save draft')}</button><button type="submit" value="publish" disabled={!confirm||busy||!ready} className="access-btn primary">{x('บันทึกและเผยแพร่','Save & publish')}</button></div></div>
      <p className="access-small">{published?x(`ฉบับเผยแพร่ล่าสุด: ${new Date(published.updated_at).toLocaleString('th-TH')}`,`Last published: ${new Date(published.updated_at).toLocaleString('en-GB')}`):x('ยังใช้เนื้อหาเดิมของโครงการ','Using the project default content')}</p>
    </fieldset></form>
  </div>
}
