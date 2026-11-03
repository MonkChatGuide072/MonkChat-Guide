import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
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
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const currentLang = isEnglish ? 'en' : 'th'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  const selectedCenter = centers.find(center => center.id === selectedId) ?? centers[0]

  const normalizedSearch = searchQuery.toLocaleLowerCase(currentLang).trim()
  const filteredCenters = centers.filter(center => {
    const translation = center.dci_center_translations.find(item => item.language_code === currentLang)
    const matchesRegion = selectedRegion === 'All' || center.city.toLowerCase().includes(selectedRegion.toLowerCase())
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
    <div className="space-y-10 pb-6 break-words [overflow-wrap:anywhere]">
      {/* 1. HERO BANNER */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#EADCC6] bg-[#FFF8EE] shadow-[0_16px_40px_rgba(104,27,22,0.12)]">
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/home/monkchat-slide-3.webp"
            alt="Meditation centers and heritage"
            className="h-full w-full object-cover object-[center_35%] opacity-100"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,248,238,0.96)_0%,rgba(255,248,238,0.84)_50%,rgba(255,248,238,0.3)_100%)]"
        />

        <div className="relative z-10 px-4 py-10 text-center sm:px-12 sm:py-16">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B77A24]/20 text-[#A43D1D] ring-1 ring-[#EFD070]/30">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1114 0z" />
              <circle cx="12" cy="10" r="2.5" strokeWidth={1.8} />
            </svg>
          </div>

          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#A43D1D]">
            {t('centers.heroTag')}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#681B16] drop-shadow-sm sm:text-5xl">
            {t('centers.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-[#4A3B32] sm:text-lg sm:leading-7">
            {t('centers.subtitle')}
          </p>

          <div className="mt-6 flex justify-center">
            <VisitorBackLink />
          </div>

          {/* Search bar inside Hero */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex min-h-12 items-center rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-1.5 shadow-md">
              <span className="grid w-11 shrink-0 place-items-center text-[#A43D1D]" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
                  <path d="m16 16 4 4" strokeWidth={1.8} strokeLinecap="round" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder={isEnglish ? 'Search centers, programs, or resources...' : 'ค้นหาศูนย์ปฏิบัติธรรม หรือสถานที่...'}
                aria-label={isEnglish ? 'Search centers' : 'ค้นหาศูนย์ปฏิบัติธรรม'}
                className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#30251E] outline-none placeholder:text-[#7D6B5D] sm:text-sm"
              />
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#8E3317]"
              >
                {isEnglish ? 'Search' : 'ค้นหา'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REGION FILTER PILLS */}
      <section aria-label="Region filters" className="overflow-x-auto pb-1">
        <div className="flex gap-2">
          {regionFilters.map((filter) => {
            const isActive = selectedRegion === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setSelectedRegion(filter.key)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#A43D1D] text-white shadow-xs'
                    : 'border border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] hover:bg-[#FDF4E3]'
                }`}
              >
                <span>📍</span>
                <span>{filter.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. MAIN SECTION: CENTERS DIRECTORY + MAP & REGIONS SIDEBAR */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Center Cards */}
        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Published Meditation Centers' : 'ศูนย์ปฏิบัติธรรมที่เผยแพร่'}
            </h2>
            <p className="text-xs text-[#7D6B5D] sm:text-sm">
              {isEnglish
                ? 'Explore published center information and contact each center about its programs.'
                : 'รวบรวมศูนย์ปฏิบัติธรรมและวัดที่มีกิจกรรมภาวนาสำหรับผู้มาเยือน'}
            </p>
          </div>

          {isLoading && (
            <div role="status" aria-label={t('centers.loading')} className="flex min-h-60 items-center justify-center rounded-2xl border border-[#EADCC6] bg-[#FFFDF7]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#A43D1D]/20 border-t-[#A43D1D]" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-center">
              <p role="alert" className="font-semibold text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => void fetchData()}
                className="mt-3 min-h-10 rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white"
              >
                {t('centers.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && centers.length === 0 && (
            <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center text-xs text-[#7D6B5D]">
              {t('centers.empty')}
            </div>
          )}

          {/* Render Centers Cards */}
          {!isLoading && !error && filteredCenters.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCenters.map((center) => {
                const translation = center.dci_center_translations.find(item => item.language_code === currentLang)
                const isSelected = center.id === (selectedCenter?.id ?? '')
                return (
                  <div
                    key={center.id}
                    onClick={() => setSelectedId(center.id)}
                    className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#FFFDF7] shadow-xs transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                      isSelected ? 'border-[#A43D1D] ring-1 ring-[#A43D1D]/40' : 'border-[#EADCC6]'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-[#FAF2E6]">
                      <img
                        src="/images/home/monkchat-meditation-ruins.webp"
                        alt={translation?.name || ''}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF7]/90 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#681B16] backdrop-blur-xs">
                        📍 {center.city}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-serif text-base font-bold text-[#681B16]">
                        {translation?.name || t('centers.unnamedCenter')}
                      </h3>
                      {translation?.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#5A4B40]">
                          {translation.description}
                        </p>
                      )}

                      <p className="mt-2 text-[0.7rem] text-[#7D6B5D]">
                        {center.address}
                      </p>


                      {/* Links for this center (Map, Website, Contact) */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EADCC6]/80 pt-3">
                        {isSafeWebUrl(center.map_url) && (
                          <a
                            href={center.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('centers.linkMap')}
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-[#A43D1D] px-3 text-xs font-bold text-white hover:bg-[#8E3317]"
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
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#D5BD94] bg-[#FFFDF7] px-3 text-xs font-bold text-[#681B16] hover:bg-[#FDF4E3]"
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
                            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#D5BD94] bg-[#FFFDF7] px-3 text-xs font-bold text-[#681B16] hover:bg-[#FDF4E3]"
                          >
                            <span>{t('centers.linkContact')}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Map & Regions Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A43D1D]">
              <span>🗺️</span>
              <span>{isEnglish ? 'Map & Regions' : 'แผนที่และภูมิภาค'}</span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-[#681B16]">
              {isEnglish ? 'Explore by Area' : 'ค้นหาตามพื้นที่'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish ? 'Locations from the published center directory.' : 'พื้นที่ตามข้อมูลศูนย์ที่ทีมงานเผยแพร่'}
            </p>

            <div className="mt-4 divide-y divide-[#EADCC6]/60 rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60">
              {regionCounts.map(region => <button key={region.city} type="button" onClick={() => setSelectedRegion(region.city)} className="flex min-h-11 w-full items-center justify-between gap-3 p-3 text-left text-sm">
                <span className="font-bold text-[#681B16]">📍 {region.city}</span>
                <span className="text-[#5A4B40]">{region.count} {isEnglish ? (region.count === 1 ? 'center' : 'centers') : 'แห่ง'}</span>
              </button>)}
            </div>

          </div>
        </aside>
      </div>

      {/* Bio Links Error Alert for test assertions */}
      {!isLoading && !error && linksError && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <p>{t('home.errorLoadLinks')}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="mt-2 inline-flex min-h-8 items-center rounded-lg border border-amber-400 bg-white px-3 font-bold"
          >
            {t('home.retry')}
          </button>
        </div>
      )}

      {/* 4. BOTTOM SECTION: LEARN MORE & RESOURCES */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-7 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#681B16]">
            {isEnglish ? 'Learn More & Resources' : 'แหล่งเรียนรู้และข้อมูลเพิ่มเติม'}
          </h2>
          <p className="mt-1 text-xs text-[#7D6B5D] sm:text-sm">
            {isEnglish
              ? 'Deepen your practice with curated learning materials and related links.'
              : 'ต่อยอดการปฏิบัติสมาธิด้วยสื่อการเรียนรู้และช่องทางที่คัดสรรแล้ว'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/meditation"
            className="group flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4 transition hover:-translate-y-0.5 hover:border-[#D5BD94]"
          >
            <div>
              <span className="text-xl">▷</span>
              <h3 className="mt-2 font-serif text-sm font-bold text-[#681B16] group-hover:text-[#A43D1D]">
                {isEnglish ? 'Guided Meditations' : 'เสียงนำสมาธิ'}
              </h3>
              <p className="mt-1 text-[0.75rem] text-[#5A4B40]">
                {isEnglish ? 'Audio & video practices for calmness' : 'ไฟล์เสียงนำสมาธิสั้นกระชับ'}
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-[#A43D1D]">→</span>
          </Link>

          <Link
            to="/qa"
            className="group flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4 transition hover:-translate-y-0.5 hover:border-[#D5BD94]"
          >
            <div>
              <span className="text-xl">📖</span>
              <h3 className="mt-2 font-serif text-sm font-bold text-[#681B16] group-hover:text-[#A43D1D]">
                {isEnglish ? 'Dhamma Articles' : 'ถาม-ตอบธรรมะ'}
              </h3>
              <p className="mt-1 text-[0.75rem] text-[#5A4B40]">
                {isEnglish ? 'Teachings & practical insights' : 'คำตอบธรรมะสำหรับผู้มาเยือน'}
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-[#A43D1D]">→</span>
          </Link>

          <Link
            to="/visit"
            className="group flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4 transition hover:-translate-y-0.5 hover:border-[#D5BD94]"
          >
            <div>
              <span className="text-xl">🏛️</span>
              <h3 className="mt-2 font-serif text-sm font-bold text-[#681B16] group-hover:text-[#A43D1D]">
                {isEnglish ? 'Visit Monk Chat' : 'ร่วมกิจกรรมหน้างาน'}
              </h3>
              <p className="mt-1 text-[0.75rem] text-[#5A4B40]">
                {isEnglish ? 'On-site sessions at Wat Mahathat' : 'พบปะและสนทนาธรรมที่วัดมหาธาตุ'}
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-[#A43D1D]">→</span>
          </Link>

          <div className="flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4">
            <div>
              <span className="text-xl">🔗</span>
              <h3 className="mt-2 font-serif text-sm font-bold text-[#681B16]">
                {isEnglish ? 'Helpful Links' : 'ลิงก์สำคัญ (BioLinks)'}
              </h3>
              <p className="mt-1 text-[0.75rem] text-[#5A4B40]">
                {isEnglish ? 'Trusted resources & MCU channels' : 'ช่องทางติดต่อและเครือข่าย มจร'}
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
                      className="text-[0.7rem] font-bold text-[#A43D1D] hover:underline"
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
