import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { isSafeWebUrl } from '../lib/publicContent'
import { GuideIcon } from '../components/GuideIcon'
import { practiceDestinations } from '../content/continuePractice'

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
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const currentLang = isEnglish ? 'en' : 'th'
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allCenters, setCenters] = useState<CenterRow[]>([])
  const [allLinks, setBioLinks] = useState<BioLinkRow[]>([])
  const [linksError, setLinksError] = useState(false)

  const centers = allCenters.filter(center =>
    center.dci_center_translations.some(translation => translation.language_code === currentLang)
  )
  const bioLinks = allLinks.filter(link =>
    isSafeWebUrl(link.url) && link.bio_link_translations.some(translation => translation.language_code === currentLang)
  )

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


  const normalizedSearch = searchQuery.toLocaleLowerCase(currentLang).trim()
  const filteredCenters = centers.filter(center => {
    const translation = center.dci_center_translations.find(item => item.language_code === currentLang)
    const matchesRegion = selectedRegion === 'All' || center.city === selectedRegion
    if (!matchesRegion) return false
    if (!normalizedSearch) return true
    return `${translation?.name ?? ''} ${translation?.description ?? ''} ${center.city} ${center.address}`
      .toLocaleLowerCase(currentLang)
      .includes(normalizedSearch)
  })

  const regionCounts = [...new Set(centers.map(center => center.city).filter(Boolean))]
    .map(city => ({ city, count: centers.filter(center => center.city === city).length }))
  const regionFilters = [
    { key: 'All', label: isEnglish ? 'All Regions' : 'ทุกภูมิภาค' },
    ...regionCounts.map(region => ({ key: region.city, label: region.city })),
  ]

  return (
    <div className="space-y-12 bg-brand-cream pb-16 text-brand-text break-words [overflow-wrap:anywhere]">
      <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
        <div className="grid md:grid-cols-[1.3fr_0.7fr]">
          <div className="order-2 p-5 sm:p-6 md:order-1 md:p-8">
            <p className="flex items-center gap-2 text-sm text-brand-muted"><GuideIcon name="pin" />{t('centers.heroTag')}</p>
            <h1 className="mt-3 font-serif text-[1.75rem] font-semibold leading-snug text-brand-maroon sm:text-4xl">{t('centers.title')}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-brand-muted sm:text-base">{t('centers.subtitle')}</p>
          </div>
          <img src="/images/home/monkchat-slide-3.webp" alt={isEnglish ? 'A monk speaking with visitors in Ayutthaya' : 'พระสงฆ์สนทนากับผู้มาเยือนในอยุธยา'} width={560} height={315} className="order-1 h-32 w-full object-cover object-[center_35%] md:order-2 md:h-full" />
        </div>

      </section>

      <section aria-labelledby="continue-practice-heading" className="space-y-4">
        <div>
          <h2 id="continue-practice-heading" className="font-serif text-2xl font-semibold text-brand-maroon">{isEnglish ? 'Places you can explore' : 'สถานที่สำหรับเรียนรู้เพิ่มเติม'}</h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">{isEnglish ? 'MonkChat Guide connects you with these destinations so you can explore and contact each one directly.' : 'MonkChat Guide รวบรวมช่องทางเหล่านี้ให้คุณเลือกดูข้อมูลและติดต่อแต่ละแห่งได้โดยตรง'}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {practiceDestinations.map(destination => {
            const copy = destination[currentLang]
            return <article key={destination.id} className="flex min-w-0 flex-col rounded-2xl border border-brand-border bg-brand-surface p-5">
              <GuideIcon name={destination.icon} className="h-6 w-6 text-brand-terracotta" />
              <h3 className="mt-3 text-lg font-medium leading-7 text-brand-maroon">{copy.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{copy.description}</p>
              <a href={destination.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm font-medium leading-5 text-brand-maroon hover:bg-brand-gold-soft">{copy.action}<span aria-hidden="true">↗</span></a>
            </article>
          })}
        </div>
        <p className="text-sm leading-6 text-brand-muted">{isEnglish ? 'Before travelling, ask the destination about session times, available languages and any participation requirements.' : 'ก่อนเดินทาง สอบถามรอบกิจกรรม ภาษาที่ให้บริการ และเงื่อนไขการเข้าร่วมกับสถานที่นั้นโดยตรง'}</p>
      </section>

      <section aria-labelledby="centers-search-heading" className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <h2 id="centers-search-heading" className="text-lg font-medium text-brand-maroon">{isEnglish ? 'Find more places' : 'ค้นหาสถานที่เพิ่มเติม'}</h2>
        <form role="search" onSubmit={event => { event.preventDefault(); resultsHeadingRef.current?.focus() }} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-brand-border px-3 focus-within:border-brand-terracotta focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-terracotta">
            <GuideIcon name="search" className="h-[18px] w-[18px] text-brand-muted" />
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} aria-label={isEnglish ? 'Search centers' : 'ค้นหาศูนย์ปฏิบัติธรรม'} placeholder={isEnglish ? 'Name, city or address' : 'ชื่อศูนย์ เมือง หรือที่อยู่'} className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-muted" />
            {searchQuery && <button type="button" aria-label={isEnglish ? 'Clear search' : 'ล้างคำค้น'} onClick={() => setSearchQuery('')} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-brand-muted hover:bg-brand-gold-soft"><GuideIcon name="close" /></button>}
          </div>
          <button type="submit" className="min-h-12 cursor-pointer rounded-lg bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark">{isEnglish ? 'Search' : 'ค้นหา'}</button>
        </form>
      </section>

      {/* 2. REGION FILTER PILLS */}
      <section aria-label="Region filters" className="pb-1">
        <div className="sm:hidden">
          <label htmlFor="centers-region" className="mb-2 block text-sm font-medium text-brand-text">{isEnglish ? 'Region' : 'พื้นที่'}</label>
          <select id="centers-region" value={selectedRegion} onChange={event => setSelectedRegion(event.target.value)} className="min-h-12 w-full rounded-lg border border-brand-border bg-brand-surface px-3 text-base text-brand-text">
            {regionFilters.map(filter => <option key={filter.key} value={filter.key}>{filter.label}</option>)}
          </select>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          {regionFilters.map((filter) => {
            const isActive = selectedRegion === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setSelectedRegion(filter.key)}
                aria-pressed={isActive}
                className={`inline-flex min-h-11 max-w-full shrink-0 items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-terracotta text-white '
                    : 'border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                }`}
              >
                <GuideIcon name="pin" />
                <span>{filter.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. MAIN SECTION: CENTERS DIRECTORY + MAP & REGIONS SIDEBAR */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">
        {/* Left Column: Center Cards */}
        <div className="space-y-4">
          <div>
            <h2 id="centers-results-heading" ref={resultsHeadingRef} tabIndex={-1} className="scroll-mt-24 font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {isEnglish ? 'Meditation centers' : 'ศูนย์ปฏิบัติธรรม'}
            </h2>
            <p className="text-sm text-brand-muted sm:text-sm">
              {isEnglish
                ? 'Explore center information and contact each center about its programs.'
                : 'รวบรวมศูนย์ปฏิบัติธรรมและวัดที่มีกิจกรรมภาวนาสำหรับผู้มาเยือน'}
            </p>
          </div>

          {isLoading && (
            <div role="status" aria-label={t('centers.loading')} className="flex min-h-60 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-terracotta/20 border-t-brand-terracotta" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-center">
              <p role="alert" className="font-semibold text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => void fetchData()}
                className="mt-3 min-h-11 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white"
              >
                {t('centers.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && centers.length === 0 && (
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center text-sm text-brand-muted">
              {t('centers.empty')}
            </div>
          )}

          {!isLoading && !error && centers.length > 0 && <p role="status" className="text-sm text-brand-muted tabular-nums">{isEnglish ? `${filteredCenters.length} of ${centers.length} centers` : `${filteredCenters.length} จาก ${centers.length} แห่ง`}</p>}
          {!isLoading && !error && centers.length > 0 && filteredCenters.length === 0 && <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <h3 className="text-base font-medium text-brand-maroon">{isEnglish ? 'No centers match your search' : 'ไม่พบศูนย์ที่ตรงกับการค้นหา'}</h3>
            <button type="button" onClick={() => { setSearchQuery(''); setSelectedRegion('All') }} className="mt-4 min-h-11 cursor-pointer rounded-lg bg-brand-terracotta px-4 text-sm font-medium text-white hover:bg-brand-terracotta-dark">{isEnglish ? 'Show all centers' : 'แสดงศูนย์ทั้งหมด'}</button>
          </div>}

          {/* Render Centers Cards */}
          {!isLoading && !error && filteredCenters.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCenters.map((center) => {
                const translation = center.dci_center_translations.find(item => item.language_code === currentLang)
                return (
                  <article key={center.id} aria-labelledby={`center-title-${center.id}`} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-border px-5 py-4 text-sm leading-6 text-brand-muted">
                      <p className="flex min-w-0 items-start gap-2"><GuideIcon name="pin" className="mt-1 h-[18px] w-[18px]" /><span>{center.city}</span></p>
                      {center.country_code && <span lang="en" className="text-sm leading-5">{center.country_code}</span>}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 id={`center-title-${center.id}`} className="font-sans text-lg font-medium text-brand-maroon">
                        {translation?.name || t('centers.unnamedCenter')}
                      </h3>
                      {translation?.description && (
                        <p className="mt-1 text-sm leading-6 text-brand-muted">
                          {translation.description}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-brand-muted">
                        {center.address}
                      </p>


                      {/* Links for this center (Map, Website, Contact) */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-border/80 pt-3">
                        {isSafeWebUrl(center.map_url) && (
                          <a
                            href={center.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('centers.linkMap')}
                            aria-describedby={`center-title-${center.id}`}
                            className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-brand-terracotta px-3 text-sm font-medium text-white hover:bg-brand-terracotta-dark"
                          >
                            <span>{t('centers.linkMap')}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {isSafeWebUrl(center.website_url) && (
                          <a
                            href={center.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('centers.linkWebsite')}
                            aria-describedby={`center-title-${center.id}`}
                            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-brand-border-dark bg-brand-surface px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                          >
                            <span>{t('centers.linkWebsite')}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {isSafeWebUrl(center.contact_url) && (
                          <a
                            href={center.contact_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('centers.linkContact')}
                            aria-describedby={`center-title-${center.id}`}
                            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-brand-border-dark bg-brand-surface px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                          >
                            <span>{t('centers.linkContact')}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Map & Regions Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-terracotta">
              <GuideIcon name="pin" />
              <span>{isEnglish ? 'Browse regions' : 'เลือกตามพื้นที่'}</span>
            </div>
            <h3 className="mt-1 font-sans text-lg font-medium text-brand-maroon">
              {isEnglish ? 'Regions' : 'พื้นที่ตั้งศูนย์'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish ? 'Choose an area to explore more places.' : 'เลือกพื้นที่เพื่อดูสถานที่เพิ่มเติม'}
            </p>

            <div className="mt-4 divide-y divide-brand-border/60 rounded-xl border border-brand-border bg-brand-gold-soft/60">
              {regionCounts.map(region => <button key={region.city} type="button" onClick={() => setSelectedRegion(region.city)} aria-pressed={selectedRegion === region.city} className="flex min-h-11 w-full items-center justify-between gap-3 p-3 text-left text-sm">
                <span className="font-medium text-brand-maroon">{region.city}</span>
                <span className="text-brand-muted">{region.count} {isEnglish ? (region.count === 1 ? 'center' : 'centers') : 'แห่ง'}</span>
              </button>)}
            </div>

          </div>
        </aside>
      </div>

      {/* Bio Links Error Alert for test assertions */}
      {!isLoading && !error && linksError && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{t('home.errorLoadLinks')}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-amber-400 bg-white px-3 font-medium"
          >
            {t('home.retry')}
          </button>
        </div>
      )}

      {/* 4. BOTTOM SECTION: LEARN MORE & RESOURCES */}
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-brand-maroon">
            {isEnglish ? 'Learn More & Resources' : 'แหล่งเรียนรู้และข้อมูลเพิ่มเติม'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted sm:text-sm">
            {isEnglish
              ? 'Deepen your practice with curated learning materials and related links.'
              : 'เลือกดูสื่อและช่องทางเพิ่มเติมได้ตามความสนใจ'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/meditation"
            className="group flex flex-col justify-between rounded-xl border border-brand-border bg-brand-cream/60 p-4 transition hover:border-brand-border-dark"
          >
            <div>
              <GuideIcon name="play" />
              <h3 className="mt-2 font-sans text-sm font-medium text-brand-maroon group-hover:text-brand-terracotta">
                {isEnglish ? 'Guided Meditations' : 'เสียงนำสมาธิ'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {isEnglish ? 'Guided meditation audio' : 'ไฟล์เสียงนำสมาธิสั้นกระชับ'}
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-brand-terracotta">→</span>
          </Link>

          <Link
            to="/qa"
            className="group flex flex-col justify-between rounded-xl border border-brand-border bg-brand-cream/60 p-4 transition hover:border-brand-border-dark"
          >
            <div>
              <GuideIcon name="book" />
              <h3 className="mt-2 font-sans text-sm font-medium text-brand-maroon group-hover:text-brand-terracotta">
                {isEnglish ? 'Dhamma Q&A' : 'ถาม-ตอบธรรมะ'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {isEnglish ? 'Teachings & practical insights' : 'คำตอบธรรมะสำหรับผู้มาเยือน'}
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-brand-terracotta">→</span>
          </Link>

          <Link
            to="/activities"
            className="group flex flex-col justify-between rounded-xl border border-brand-border bg-brand-cream/60 p-4 transition hover:border-brand-border-dark"
          >
            <div>
              <GuideIcon name="pin" />
              <h3 className="mt-2 font-sans text-sm font-medium text-brand-maroon group-hover:text-brand-terracotta">
                {isEnglish ? 'Visit Monk Chat' : 'ร่วมกิจกรรมหน้างาน'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {isEnglish ? 'On-site sessions at Wat Mahathat' : 'พบปะและสนทนาธรรมที่วัดมหาธาตุ'}
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-brand-terracotta">→</span>
          </Link>

          <div className="flex flex-col justify-between rounded-xl border border-brand-border bg-brand-cream/60 p-4">
            <div>
              <GuideIcon name="link" />
              <h3 className="mt-2 font-sans text-sm font-medium text-brand-maroon">
                {isEnglish ? 'Helpful Links' : 'ลิงก์เพิ่มเติม'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {isEnglish ? 'Related learning links' : 'เว็บไซต์และแหล่งเรียนรู้เพิ่มเติม'}
              </p>
            </div>
            {bioLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {bioLinks.slice(0, 2).map(link => {
                  const title = link.bio_link_translations.find(t => t.language_code === currentLang)?.title
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-terracotta hover:underline"
                    >
                      {title} ↗
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
