import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { trackUsageEvent } from '../lib/analytics'
import { getBioLinkImageUrl } from '../lib/bioLinkImages'
import { isSafeWebUrl } from '../lib/publicContent'
import { VisitorBackLink } from '../components/VisitorBackLink'

interface CenterTranslationRow {
  language_code: string
  name: string
  description: string
}

interface CenterRow {
  id: string
  country_code: string
  city: string
  address: string
  map_url: string | null
  website_url: string | null
  contact_url: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  dci_center_translations: CenterTranslationRow[]
}

interface BioLinkTranslationRow {
  language_code: string
  title: string
}

interface BioLinkRow {
  id: string
  url: string
  display_order: number
  image_storage_path: string | null
  bio_link_translations: BioLinkTranslationRow[]
}

export function CentersPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [allCenters, setCenters] = useState<CenterRow[]>([])
  const [allLinks, setBioLinks] = useState<BioLinkRow[]>([])
  const [linksError, setLinksError] = useState(false)
  const centers = allCenters.filter(center => center.dci_center_translations.some(translation => translation.language_code === currentLang))
  const bioLinks = allLinks.filter(link => isSafeWebUrl(link.url) && link.bio_link_translations.some(translation => translation.language_code === currentLang))

  const fetchData = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('centers.errorNoClient'))
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    setLinksError(false)
    try {
      const [centerResult, linkResult] = await Promise.allSettled([
        supabaseClient.from('dci_centers').select(`
          id, country_code, city, address, map_url, website_url, contact_url,
          content_status, is_published,
          dci_center_translations (language_code, name, description)
        `).eq('content_status', 'published').eq('is_published', true).order('created_at', { ascending: false }),
        supabaseClient.from('bio_links').select(`id, url, display_order, image_storage_path, bio_link_translations(language_code, title)`).eq('content_status', 'published').eq('is_published', true).order('display_order', { ascending: true }),
      ])
      if (centerResult.status === 'rejected') throw centerResult.reason
      const centersResponse = centerResult.value
      if (centersResponse.error) throw centersResponse.error
      const linksResponse = linkResult.status === 'fulfilled' ? linkResult.value : null
      setLinksError(!linksResponse || !!linksResponse.error)
      setCenters((centersResponse.data as CenterRow[]) ?? [])
      setBioLinks((linksResponse && !linksResponse.error ? linksResponse.data ?? [] : []) as BioLinkRow[])
    } catch {
      setError(t('centers.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const selectedCenter = centers.find(center => center.id === selectedId) ?? centers[0]
  const selectedTranslation = selectedCenter?.dci_center_translations.find(translation => translation.language_code === currentLang)

  return (
    <div className="space-y-6 break-words [overflow-wrap:anywhere]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-[#a34e39]">{t('centers.heroTag')}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#30342d] sm:text-5xl">{t('centers.title')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625b50]">{t('centers.subtitle')}</p>
        </div>
        <VisitorBackLink />
      </header>

      {isLoading && <div role="status" aria-label={t('centers.loading')} className="flex min-h-72 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[#a94732]/20 border-t-[#a94732]" /></div>}

      {!isLoading && error && (
        <div className="rounded-[1.5rem] border border-red-900/15 bg-[#f2d9cf]/80 p-7 text-center">
          <p role="alert" className="font-semibold text-[#812e24]">{error}</p>
          <button type="button" onClick={() => void fetchData()} className="mt-4 min-h-11 rounded-full bg-[#a94732] px-5 text-sm font-bold text-white">{t('centers.retry')}</button>
        </div>
      )}

      {!isLoading && !error && centers.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/45 bg-white/28 p-10 text-center text-[#625b50]">{t('centers.empty')}</div>
      )}

      {!isLoading && !error && selectedCenter && selectedTranslation && (
        <div className="grid gap-5 lg:grid-cols-[1.04fr_.72fr]">
          <article className="overflow-hidden rounded-[1.75rem] bg-[#9a3f2d] text-[#fff0d8] shadow-[0_24px_60px_rgba(113,49,37,.18)]">
            <figure className="relative h-56 overflow-hidden sm:h-72">
              <img src="/images/home/monkchat-slide-3.webp" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#9a3f2d] via-[#9a3f2d]/20 to-transparent" />
              <span className="absolute left-6 top-5 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[.65rem] font-bold uppercase tracking-[.14em] backdrop-blur-sm">Selected center</span>
            </figure>
            <div className="p-6 sm:p-8">
              <h2 className="font-serif text-3xl font-bold leading-[1.12] tracking-[-.025em] sm:text-4xl">{selectedTranslation.name}</h2>
              {selectedTranslation.description && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">{selectedTranslation.description}</p>}
              <dl className="mt-6 grid gap-3 rounded-[1.25rem] border border-white/18 bg-black/12 p-5 text-sm backdrop-blur-sm sm:grid-cols-2">
                <div><dt className="text-[.65rem] font-bold uppercase tracking-[.12em] text-[#f3d992]">{t('centers.fieldCity')}</dt><dd className="mt-1 font-semibold">{selectedCenter.city}</dd></div>
                <div><dt className="text-[.65rem] font-bold uppercase tracking-[.12em] text-[#f3d992]">{t('centers.fieldAddress')}</dt><dd className="mt-1 font-semibold">{selectedCenter.address}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                {isSafeWebUrl(selectedCenter.map_url) && <a href={selectedCenter.map_url} target="_blank" rel="noopener noreferrer" aria-label={t('centers.linkMap')} className="inline-flex min-h-11 items-center rounded-full bg-[#f3d992] px-5 text-sm font-bold text-[#633121]">{t('centers.linkMap')} ↗</a>}
                {isSafeWebUrl(selectedCenter.website_url) && <a href={selectedCenter.website_url} target="_blank" rel="noopener noreferrer" aria-label={t('centers.linkWebsite')} className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-bold">{t('centers.linkWebsite')} ↗</a>}
                {isSafeWebUrl(selectedCenter.contact_url) && <a href={selectedCenter.contact_url} target="_blank" rel="noopener noreferrer" aria-label={t('centers.linkContact')} className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-bold">{t('centers.linkContact')} ↗</a>}
                {![selectedCenter.map_url, selectedCenter.website_url, selectedCenter.contact_url].some(isSafeWebUrl) && <p className="text-sm text-white/65">{t('centers.linkPending')}</p>}
              </div>
            </div>
          </article>

          <section className="rounded-[1.5rem] border border-white/45 bg-[#eadbc1]/90 p-5 shadow-[0_16px_42px_rgba(73,61,45,.09)] backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#6b5c48]/15 pb-4">
              <h2 className="font-serif text-xl font-bold text-[#30342d]">{t('centers.listTitle')}</h2>
              <span className="text-[.65rem] text-[#6b6255]">{centers.length} {t('centers.itemCount', { count: centers.length })}</span>
            </div>
            <div className="divide-y divide-[#6b5c48]/14">
              {centers.map(center => {
                const translation = center.dci_center_translations.find(item => item.language_code === currentLang)
                const isSelected = center.id === selectedCenter.id
                return (
                  <button key={center.id} type="button" aria-pressed={isSelected} onClick={() => setSelectedId(center.id)} className={`grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-3 py-5 text-left transition-colors ${isSelected ? 'text-[#8e3d2d]' : 'text-[#30342d] hover:text-[#8e3d2d]'}`}>
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.5" strokeWidth="1.7" /></svg>
                    <span><strong className="block text-sm leading-6">{translation?.name || t('centers.unnamedCenter')}</strong><small className="mt-1 block text-[.65rem] text-[#6b6255]">{center.city} · {center.country_code}</small></span>
                    <span aria-hidden="true">›</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {!isLoading && !error && linksError && (
        <div role="alert" className="rounded-[1.15rem] border border-[#b17a35]/25 bg-[#f0dfb8]/75 p-4 text-sm text-[#6b4a1b]">
          <p>{t('home.errorLoadLinks')}</p>
          <button type="button" onClick={() => void fetchData()} className="mt-2 min-h-11 rounded-full border border-[#b17a35]/35 px-4 font-semibold">{t('home.retry')}</button>
        </div>
      )}

      {!isLoading && !error && bioLinks.length > 0 && (
        <section className="rounded-[1.5rem] bg-[#354033] p-5 text-[#fff4df] sm:p-7">
          <h2 className="font-serif text-2xl font-bold">{t('home.bioLinksTitle')}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bioLinks.map(link => {
              const title = link.bio_link_translations.find(translation => translation.language_code === currentLang)?.title
              const imageUrl = getBioLinkImageUrl(link.image_storage_path)
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => { void trackUsageEvent({ eventType: 'bio_link_click', resourceType: 'bio_link', resourceId: link.id }).catch(() => {}) }} className="flex min-h-14 items-center gap-3 rounded-xl border border-white/12 bg-white/7 px-4 text-sm font-semibold transition-colors hover:bg-white/12">
                  {imageUrl ? <img src={imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f3d992] text-[#633121]">↗</span>}
                  <span className="min-w-0 flex-1 truncate">{title}</span>
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
