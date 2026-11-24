import { trackUsageEvent } from '../lib/analytics'
import { getBioLinkImageUrl } from '../lib/bioLinkImages'
import { safePublicUrl } from '../lib/publicUrl'
import { useEffect, useState } from 'react'
import { supabaseClient } from '../lib/supabase'
import { GuideIcon } from './GuideIcon'

interface PublishedLink { id: string; url: string; image_storage_path?: string | null; bio_link_translations: { language_code: string; title: string }[] }
/** Reads the same published rows managed in /admin/bio-links; drafts never appear here. */
export function PublishedLinks({ language }: { language: 'th' | 'en' }) {
  const [items, setItems] = useState<PublishedLink[]>([])
  const [failed, setFailed] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let current = true
    if (!supabaseClient) return
    setFailed(false)
    async function load() {
      try {
        const { data, error } = await supabaseClient!.from('bio_links').select('id,url,image_storage_path,bio_link_translations(language_code,title)')
          .eq('content_status','published').eq('is_published',true).is('archived_at',null).order('display_order', { ascending: true })
        if (!current) return
        if (error || !Array.isArray(data)) { setFailed(true); return }
        setItems((data as PublishedLink[]).filter(item => safePublicUrl(item.url)))
      } catch { if (current) setFailed(true) }
    }
    void load()
    return () => { current = false }
  }, [revision])
  if (failed) return <section className="rounded-2xl border border-brand-border bg-white p-5 text-sm"><p>{language === 'en' ? 'Useful links could not be loaded.' : 'ยังโหลดลิงก์เพิ่มเติมไม่ได้'}</p><button type="button" onClick={() => setRevision(r=>r+1)} className="mt-2 min-h-11 rounded-lg border border-brand-border px-4">{language === 'en' ? 'Retry' : 'ลองใหม่'}</button></section>
  if (!items.length) return null
  return <section className="space-y-4" aria-labelledby="visitor-useful-links"><h2 id="visitor-useful-links" className="font-serif text-2xl text-brand-maroon">{language === 'en' ? 'Useful links' : 'ช่องทางและข้อมูลเพิ่มเติม'}</h2><ul className="grid gap-3 sm:grid-cols-2">{items.map(item => <li key={item.id}><a href={safePublicUrl(item.url)!} target="_blank" rel="noopener noreferrer" onClick={() => { void trackUsageEvent({ eventType: 'bio_link_click', resourceType: 'bio_link', resourceId: item.id }).catch(() => {}) }} className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-brand-border bg-white p-5 text-sm font-semibold text-brand-maroon hover:bg-brand-gold-soft">{getBioLinkImageUrl(item.image_storage_path) && <img src={getBioLinkImageUrl(item.image_storage_path)!} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" onError={event=>{event.currentTarget.style.display='none'}}/>}<span>{item.bio_link_translations.find(t => t.language_code === language)?.title || item.bio_link_translations.find(t=>t.language_code==='th')?.title || item.bio_link_translations[0]?.title || new URL(item.url).hostname}</span><GuideIcon name="arrow" className="h-4 w-4 shrink-0" /></a></li>)}</ul></section>
}
