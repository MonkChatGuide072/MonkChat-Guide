import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseClient } from './supabase'
import { safePublicUrl } from './publicUrl'
import { websiteFields, type WebsiteField } from '../content/websiteEditorFields'
import type { ActivitiesPageContent } from '../content/activitiesContent'

export type PageSection = 'home' | 'activities' | 'contact'
export type PageLanguage = 'th' | 'en'
export type PageCopy = Partial<Record<string, string>>
export interface PageCopyRow { section: PageSection; language_code: PageLanguage; stage: 'draft' | 'published'; content: PageCopy; updated_at: string; revision: number }
export interface PageField { key:string;th:string;en:string;limit:number;kind?:WebsiteField['kind'];group?:string;defaults?:{th:string;en:string} }
export const pageFields: Record<PageSection, PageField[]> = {
 home: [
  {key:'title',th:'ชื่อส่วนหัว',en:'Heading',limit:200,group:'ภาพเปิดและข้อความแนะนำ'},
  {key:'tagline',th:'คำโปรย',en:'Tagline',limit:250,group:'ภาพเปิดและข้อความแนะนำ'},
  {key:'description',th:'คำอธิบายหน้าแรก',en:'Introduction',limit:2500,group:'ภาพเปิดและข้อความแนะนำ'},
  {key:'image_url',th:'รูปแบนเนอร์',en:'Banner image',limit:1000,kind:'image',group:'ภาพเปิดและข้อความแนะนำ'},
  ...websiteFields.filter(f=>f.key.startsWith('home_')),
 ],
 activities:[
  {key:'title',th:'หัวข้อกิจกรรม',en:'Activity heading',limit:200,group:'หัวข้อและไฮไลต์กิจกรรม'},
  {key:'description',th:'คำอธิบายกิจกรรม',en:'Activity introduction',limit:2500,group:'หัวข้อและไฮไลต์กิจกรรม'},
  ...websiteFields.filter(f=>f.key.startsWith('activity_')),
 ],
 contact:[{key:'title',th:'หัวข้อติดต่อ',en:'Contact heading',limit:200},{key:'description',th:'คำอธิบายการติดต่อ',en:'Contact description',limit:2500},{key:'link_url',th:'ลิงก์ช่องทางติดต่อ',en:'Contact link',limit:1000,kind:'url'},{key:'link_label',th:'ชื่อปุ่มติดต่อ',en:'Contact button label',limit:150}],
}
export const SITE_IMAGE_PREFIX='/site-images/'
export function validImageReference(value:string):boolean {
 return /^\/images\/[a-zA-Z0-9/_ .%-]+$/.test(value) || /^\/site-images\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value) || (safePublicUrl(value)?.startsWith('https://')??false)
}
export function validPageCopy(section:PageSection,copy:unknown):copy is PageCopy {
 if (!copy||typeof copy!=='object'||Array.isArray(copy)||new TextEncoder().encode(JSON.stringify(copy)).length>64000)return false
 return Object.entries(copy).every(([key,value])=>{
  const f=pageFields[section].find(f=>f.key===key)
  if(!f||typeof value!=='string'||value.length>f.limit)return false
  if(!value.trim())return true
  if(f.kind==='image')return validImageReference(value)
  if(f.kind==='visible')return ['true','false'].includes(value)
  if(f.kind==='number')return /^\d{1,9}(\.\d{1,2})?$/.test(value)&&Number.isFinite(Number(value))
  if(f.kind==='map'){
   try{const u=new URL(value);return u.protocol==='https:'&&['maps.google.com','www.google.com'].includes(u.hostname)&&!u.username&&!u.password}catch{return false}
  }
  if(f.kind==='route'&&/^\/(?!\/)[a-zA-Z0-9/?#=&._%-]*$/.test(value))return true
  if(f.kind==='url'||f.kind==='route')return safePublicUrl(value)?.startsWith('https://')??false
  return true
 })
}
export function pageValue(copy:PageCopy,key:string,language:PageLanguage,fallback:string):string {
 return copy[key]?.trim() || websiteFields.find(f=>f.key===key)?.defaults[language] || fallback
}
export function applyActivityCopy(original:ActivitiesPageContent,copy:PageCopy,language:PageLanguage):ActivitiesPageContent {
 const result=structuredClone(original)
 for(const f of websiteFields.filter(f=>f.path)){
  const value=pageValue(copy,f.key,language,'');if(!f.path||!value)continue
  let target:Record<string,unknown>=result as unknown as Record<string,unknown>
  for(const key of f.path.slice(0,-1))target=target[key] as Record<string,unknown>
  target[f.path.at(-1)!]=value
 }
 result.hero.title=copy.title||original.hero.title;result.hero.description=copy.description||original.hero.description
 result.gallery.cards=result.gallery.cards.map((card,i)=>({card,index:i}))
  .filter(({index})=>copy['activity_card_visible_'+index]!=='false')
  .sort((a,b)=>Number(copy['activity_card_order_'+a.index]||a.index+1)-Number(copy['activity_card_order_'+b.index]||b.index+1))
  .map(({card})=>card)
 return result
}
export const PageCopyPreviewContext=createContext<{section:PageSection;language:PageLanguage;copy:PageCopy}|null>(null)

export async function resolveSiteImages(copy:PageCopy):Promise<PageCopy> {
 const entries=Object.entries(copy).filter((e):e is [string,string]=>typeof e[1]==='string'&&e[1].startsWith(SITE_IMAGE_PREFIX))
 if(!entries.length||!supabaseClient)return copy
 const paths=[...new Set(entries.map(([,v])=>v.slice(SITE_IMAGE_PREFIX.length)))]
 const {data,error}=await supabaseClient.storage.from('site-images').createSignedUrls(paths,3600)
 if(error||!data)throw new Error('imageLoad')
 const resolved={...copy}
 for(const [key,value]of entries){const image=data.find(x=>x.path===value.slice(SITE_IMAGE_PREFIX.length));if(!image?.signedUrl)throw new Error('imageLoad');resolved[key]=image.signedUrl}
 return resolved
}
/** Public views ask for published rows even when an editor is signed in. Draft preview is in-memory only. */
export function usePublicPageCopy(section:PageSection,language:PageLanguage):PageCopy {
 const preview=useContext(PageCopyPreviewContext)
 const [row,setRow]=useState<{key:string;copy:PageCopy}>({key:'',copy:{}})
 useEffect(()=>{
  let current=true,sequence=0
  const load=async()=>{
   const request=++sequence
   try{
    let copy:PageCopy
    if(preview?.section===section&&preview.language===language)copy=preview.copy
    else {
     if(!supabaseClient)return
     const {data,error}=await supabaseClient.from('site_page_content').select('content').eq('section',section).eq('language_code',language).eq('stage','published').maybeSingle()
     if(error)return
     copy=data?.content??{}
    }
    if(!validPageCopy(section,copy))return
    const resolved=await resolveSiteImages(copy)
    if(current&&request===sequence)setRow({key:`${section}:${language}`,copy:resolved})
   }catch{/* Keep the previous published content if the service cannot be reached. */}
  }
  void load();window.addEventListener('focus',load)
  const refresh=window.setInterval(()=>void load(),45*60*1000)
  return()=>{current=false;window.clearInterval(refresh);window.removeEventListener('focus',load)}
 },[section,language,preview])
 return row.key===`${section}:${language}`?row.copy:{}
}
