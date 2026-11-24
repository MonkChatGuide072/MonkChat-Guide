import { useEffect, useState } from 'react'
import { supabaseClient } from './supabase'
import { safePublicUrl } from './publicUrl'

export type PageSection = 'home' | 'activities' | 'contact'
export type PageLanguage = 'th' | 'en'
export type PageCopy = Partial<Record<'title' | 'description' | 'tagline' | 'image_url' | 'link_url' | 'link_label', string>>
export interface PageCopyRow { section: PageSection; language_code: PageLanguage; stage: 'draft' | 'published'; content: PageCopy; updated_at: string; revision: number }
export const pageFields: Record<PageSection, { key: keyof PageCopy; th: string; en: string; limit: number }[]> = {
  home: [ { key:'title', th:'ชื่อส่วนหัว', en:'Heading', limit:200 }, { key:'tagline', th:'คำโปรย', en:'Tagline', limit:250 }, { key:'description', th:'คำอธิบายหน้าแรก', en:'Introduction', limit:2500 }, { key:'image_url', th:'รูปแบนเนอร์ (HTTPS หรือ /images/...)', en:'Banner image (HTTPS or /images/...)', limit:1000 } ],
  activities: [{ key:'title', th:'หัวข้อกิจกรรม', en:'Activity heading', limit:200 }, { key:'description', th:'คำอธิบายกิจกรรม', en:'Activity introduction', limit:2500 }],
  contact: [{ key:'title', th:'หัวข้อติดต่อ', en:'Contact heading', limit:200 }, { key:'description', th:'คำอธิบายการติดต่อ', en:'Contact description', limit:2500 }, { key:'link_url', th:'ลิงก์ช่องทางติดต่อ (HTTPS)', en:'Contact link (HTTPS)', limit:1000 }, { key:'link_label', th:'ชื่อปุ่มติดต่อ', en:'Contact button label', limit:150 }],
}
export function validPageCopy(section: PageSection, copy: PageCopy): boolean {
  return Object.entries(copy).every(([key, value]) => {
    const field=pageFields[section].find(f=>f.key===key)
    if (!field || typeof value!=='string' || value.length>field.limit) return false
    if (!value.trim()) return true
    if (key==='image_url') return /^\/images\/[a-zA-Z0-9/_ .%-]+$/.test(value) || (safePublicUrl(value)?.startsWith('https://') ?? false)
    if (key==='link_url') return safePublicUrl(value)?.startsWith('https://') ?? false
    return true
  })
}
/** Public views explicitly ask for published data even when an owner is signed in. */
export function usePublicPageCopy(section: PageSection, language: PageLanguage): PageCopy {
  const [row,setRow]=useState<{key:string;copy:PageCopy}>({key:'',copy:{}})
  useEffect(()=>{
    let current=true; let sequence=0
    const load=async()=>{
      if(!supabaseClient)return
      const request=++sequence
      try {
      const {data,error}=await supabaseClient.from('site_page_content').select('content')
        .eq('section',section).eq('language_code',language).eq('stage','published').maybeSingle()
      if(current && request===sequence && !error && data && validPageCopy(section,data.content))setRow({key:`${section}:${language}`,copy:data.content})
      } catch { /* Keep the last published copy or the approved project defaults. */ }
    }
    void load(); window.addEventListener('focus',load)
    return()=>{current=false;window.removeEventListener('focus',load)}
  },[section,language])
  return row.key===`${section}:${language}`?row.copy:{}
}
