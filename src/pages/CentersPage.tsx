import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { isSafeWebUrl } from '../lib/publicContent'
import { GuideIcon, type GuideIconName } from '../components/GuideIcon'
import {
  GLOBAL_BRANCH_CONTINENTS,
  VERIFIED_DIRECTORY_CENTERS,
  getContinentLabel,
  resolveCenterMedia,
  type CenterZone,
  type WorldContinentKey,
} from '../content/centersDirectory'

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

interface RenderableCenterCard {
  id: string
  source: 'verified-th' | 'database'
  countryCode: string
  zone: Exclude<CenterZone, 'all'>
  continent: WorldContinentKey | null
  city: string
  name: string
  description: string
  address: string
  mapUrl: string | null
  websiteUrl: string | null
  contactUrl: string | null
  image: string | null
  imageWidth: number
  imageHeight: number
  imageClassName?: string
  badgeLabel: string
  topTag: string
  phone?: string
  email?: string
  lineId?: string
}

const CENTERS_PER_PAGE = 6

function normalizeUrlHost(url: string | null | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

export function CentersPage() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const currentLang = isEnglish ? 'en' : 'th'
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState<CenterZone>('all')
  const [selectedContinent, setSelectedContinent] = useState<'All' | WorldContinentKey>('All')
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRegionBrowserOpen, setIsRegionBrowserOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allCenters, setCenters] = useState<CenterRow[]>([])

  const centers = allCenters.filter((center) =>
    center.dci_center_translations.some((translation) => translation.language_code === currentLang),
  )

  const fetchData = useCallback(async () => {
    if (!supabaseClient) {
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: centersError } = await supabaseClient
        .from('dci_centers')
        .select(`
          id, country_code, city, address, map_url, website_url, contact_url,
          content_status, is_published,
          dci_center_translations (language_code, name, description)
        `)
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (centersError) throw centersError
      setCenters((data as CenterRow[]) ?? [])
    } catch {
      setError(t('centers.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!isRegionBrowserOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRegionBrowserOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRegionBrowserOpen])

  const normalizedSearch = searchQuery.toLocaleLowerCase(currentLang).trim()

  const dbCards = useMemo<RenderableCenterCard[]>(() => {
    return centers.map((center) => {
      const translation = center.dci_center_translations.find((item) => item.language_code === currentLang)
      const media = resolveCenterMedia(center)
      const continentLabel = media.zone === 'thailand'
        ? (isEnglish ? 'Thailand' : 'ในประเทศไทย')
        : getContinentLabel(media.continent, currentLang)

      return {
        id: center.id,
        source: 'database',
        countryCode: center.country_code,
        zone: media.zone,
        continent: media.continent,
        city: center.city,
        name: translation?.name || t('centers.unnamedCenter'),
        description: translation?.description || '',
        address: center.address,
        mapUrl: isSafeWebUrl(center.map_url) ? center.map_url : null,
        websiteUrl: isSafeWebUrl(center.website_url) ? center.website_url : null,
        contactUrl: isSafeWebUrl(center.contact_url) ? center.contact_url : null,
        image: media.src,
        imageWidth: media.width,
        imageHeight: media.height,
        badgeLabel: continentLabel,
        topTag: center.city || center.country_code,
        phone: media.phone,
        email: media.email,
        lineId: media.lineId,
      }
    })
  }, [centers, currentLang, isEnglish, t])

  const verifiedDirectoryCards = useMemo<RenderableCenterCard[]>(() => {
    const dbHosts = new Set(dbCards.map((c) => normalizeUrlHost(c.websiteUrl)).filter(Boolean))
    return VERIFIED_DIRECTORY_CENTERS.filter((item) => !dbHosts.has(normalizeUrlHost(item.websiteUrl))).map((item) => ({
      id: item.id,
      source: 'verified-th',
      countryCode: item.countryCode,
      zone: item.zone,
      continent: item.continent,
      city: item.city[currentLang],
      name: item.name[currentLang],
      description: item.description[currentLang],
      address: item.address[currentLang],
      mapUrl: item.mapUrl,
      websiteUrl: item.websiteUrl,
      contactUrl: item.contactUrl ?? null,
      image: item.image,
      imageWidth: item.imageWidth,
      imageHeight: item.imageHeight,
      imageClassName: item.imageClassName,
      badgeLabel: item.badge[currentLang],
      topTag: item.city[currentLang],
      phone: item.phone,
      email: item.email,
      lineId: item.lineId,
    }))
  }, [currentLang, dbCards])

  const allCombinedCards = useMemo<RenderableCenterCard[]>(() => {
    const thailandVerified = verifiedDirectoryCards.filter((card) => card.zone === 'thailand')
    const thailandDb = dbCards.filter((card) => card.zone === 'thailand')
    const internationalDb = dbCards.filter((card) => card.zone === 'international')
    const internationalVerified = verifiedDirectoryCards.filter((card) => card.zone === 'international')
    return [...thailandVerified, ...thailandDb, ...internationalDb, ...internationalVerified]
  }, [dbCards, verifiedDirectoryCards])

  const visibleCards = useMemo(() => {
    return allCombinedCards.filter((card) => {
      if (selectedZone !== 'all' && card.zone !== selectedZone) return false
      if (selectedContinent !== 'All' && card.continent !== selectedContinent) return false
      if (selectedRegion !== 'All' && card.city !== selectedRegion) return false
      if (!normalizedSearch) return true
      return `${card.name} ${card.description} ${card.city} ${card.address} ${card.countryCode} ${card.phone ?? ''} ${card.email ?? ''} Thailand ไทย`
        .toLocaleLowerCase(currentLang)
        .includes(normalizedSearch)
    })
  }, [allCombinedCards, currentLang, normalizedSearch, selectedContinent, selectedRegion, selectedZone])

  const regionCounts = [...new Set(allCombinedCards.map((center) => center.city).filter(Boolean))]
    .map((city) => ({ city, count: allCombinedCards.filter((center) => center.city === city).length }))

  const availableContinents = useMemo(() => {
    const keys = new Set(
      allCombinedCards
        .filter((card) => selectedZone === 'all' || card.zone === selectedZone)
        .map((card) => card.continent)
        .filter((k): k is WorldContinentKey => Boolean(k)),
    )
    return GLOBAL_BRANCH_CONTINENTS.filter((item) => keys.has(item.key))
  }, [allCombinedCards, selectedZone])

  const thailandTotalCount = allCombinedCards.filter((c) => c.zone === 'thailand').length
  const internationalTotalCount = allCombinedCards.filter((c) => c.zone === 'international').length
  const allTotalCount = allCombinedCards.length

  const totalPages = Math.max(1, Math.ceil(visibleCards.length / CENTERS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (safePage - 1) * CENTERS_PER_PAGE
  const paginatedCards = visibleCards.slice(pageStartIndex, pageStartIndex + CENTERS_PER_PAGE)
  const visibleRangeStart = visibleCards.length === 0 ? 0 : pageStartIndex + 1
  const visibleRangeEnd = pageStartIndex + paginatedCards.length

  function goToPage(page: number) {
    const nextPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(nextPage)
    if (typeof resultsHeadingRef.current?.scrollIntoView === 'function') {
      resultsHeadingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function selectZone(zone: CenterZone) {
    setSelectedZone(zone)
    setSelectedContinent('All')
    setSelectedRegion('All')
    setCurrentPage(1)
  }

  function resetAllFilters() {
    setSearchQuery('')
    setSelectedZone('all')
    setSelectedContinent('All')
    setSelectedRegion('All')
    setCurrentPage(1)
  }

  const zoneOptions: ReadonlyArray<{
    key: CenterZone
    icon: GuideIconName
    label: string
    count: number
  }> = [
    { key: 'all', icon: 'globe', label: isEnglish ? 'All Worldwide' : 'ทั้งหมด (ทั่วโลก)', count: allTotalCount },
    { key: 'thailand', icon: 'building', label: isEnglish ? 'In Thailand' : 'ในประเทศไทย', count: thailandTotalCount },
    { key: 'international', icon: 'compass', label: isEnglish ? 'International Branches' : 'ต่างประเทศ (สาขาทั่วโลก)', count: internationalTotalCount },
  ]

  return (
    <div className="space-y-10 bg-brand-cream pb-16 text-brand-text break-words [overflow-wrap:anywhere] sm:space-y-12">
      {/* 1. HERO HEADER */}
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-center sm:p-8 lg:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#A33D19]/25 bg-[#FDF4EE] px-3.5 py-1 text-xs font-medium text-[#8C3213]">
          <GuideIcon name="lotus" className="h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
          <span>{t('centers.heroTag')}</span>
        </span>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-snug text-brand-maroon sm:text-4xl">
          {t('centers.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-brand-muted sm:text-base">
          {isEnglish
            ? 'Explore verified meditation sanctuaries in Thailand and Dhammakaya Foundation international branches worldwide, complete with authentic place photography, maps, and official contact portals.'
            : 'รวบรวมศูนย์ปฏิบัติธรรมที่มีบรรยากาศสงบร่มรื่น ทั้งในประเทศไทยและเครือข่ายสาขาในต่างประเทศ พร้อมภาพสถานที่จริง ลิงก์แผนที่ และช่องทางติดต่อโดยตรง'}
        </p>
      </section>

      {/* 2. UNIFIED SEARCH + GLOBAL ZONE FILTER + DROPDOWN CONTINENT/REGION POPOVER */}
      <section aria-labelledby="centers-search-heading" className="relative rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="centers-search-heading" className="text-lg font-medium text-brand-maroon">
            {isEnglish ? 'Search centers & choose world zone' : 'ค้นหาศูนย์ปฏิบัติธรรมและเลือกโซนทั่วโลก'}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRegionBrowserOpen((open) => !open)}
              aria-expanded={isRegionBrowserOpen}
              aria-controls="centers-world-directory-panel"
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors sm:text-sm ${
                isRegionBrowserOpen
                  ? 'border-[#A33D19] bg-[#A33D19] text-white'
                  : 'border-[#A33D19]/35 bg-[#FDF4EE] text-[#8C3213] hover:border-[#A33D19] hover:bg-[#FCECE2]'
              }`}
            >
              <GuideIcon name="compass" className="h-4 w-4 shrink-0" />
              <span>{isEnglish ? 'Browse continents & areas' : 'เลือกทวีปและพื้นที่ตั้งศูนย์'}</span>
              <span aria-hidden="true" className="text-xs leading-none">
                {isRegionBrowserOpen ? '▲' : '▼'}
              </span>
            </button>
            <a
              href="https://en.dhammakaya.net/branches/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-[#8C3213] hover:underline sm:text-sm"
            >
              <GuideIcon name="globe" className="h-4 w-4 shrink-0" />
              <span>{isEnglish ? 'All Dhammakaya branches ↗' : 'ดูรายชื่อสาขาทั่วโลกทั้งหมด ↗'}</span>
            </a>
          </div>
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            resultsHeadingRef.current?.focus()
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-brand-border bg-[#F8F8F6] px-3.5 focus-within:border-[#A33D19] focus-within:bg-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#A33D19]">
            <GuideIcon name="search" className="h-[18px] w-[18px] text-brand-muted" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              aria-label={isEnglish ? 'Search centers' : 'ค้นหาศูนย์ปฏิบัติธรรม'}
              placeholder={isEnglish ? 'Search center name, city, country or address...' : 'ค้นหาชื่อศูนย์ เมือง ประเทศ หรือที่อยู่...'}
              className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-muted"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={isEnglish ? 'Clear search' : 'ล้างคำค้น'}
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-brand-muted hover:bg-brand-gold-soft"
              >
                <GuideIcon name="close" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="min-h-12 cursor-pointer rounded-xl bg-[#A33D19] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#8C3213]"
          >
            {isEnglish ? 'Search →' : 'ค้นหา →'}
          </button>
        </form>

        {/* Global Zone Icons & Regional Pills */}
        <section aria-label="Region filters" className="space-y-3 border-t border-brand-border/70 pt-4">
          <div className="flex flex-wrap gap-2">
            {zoneOptions.map((zone) => {
              const isActive = selectedZone === zone.key
              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => selectZone(zone.key)}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-11 max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#A33D19] text-white shadow-xs'
                      : 'border border-brand-border bg-[#F8F8F6] text-brand-maroon hover:border-[#A33D19]/40 hover:bg-[#FDF4EE]'
                  }`}
                >
                  <GuideIcon name={zone.icon} className="h-4 w-4 shrink-0" />
                  <span>{zone.label}</span>
                  {!isLoading && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white text-brand-muted'
                      }`}
                    >
                      {zone.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* World Continents + Specific City Chips */}
          {(availableContinents.length > 0 || regionCounts.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {selectedZone === 'international' && availableContinents.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContinent('All')
                      setSelectedRegion('All')
                      setCurrentPage(1)
                    }}
                    aria-pressed={selectedContinent === 'All'}
                    className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                      selectedContinent === 'All'
                        ? 'bg-brand-maroon text-white'
                        : 'border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                    }`}
                  >
                    <GuideIcon name="globe" className="h-3.5 w-3.5" />
                    <span>{isEnglish ? 'All Continents' : 'ทุกทวีป'}</span>
                  </button>
                  {availableContinents.map((continent) => {
                    const active = selectedContinent === continent.key
                    return (
                      <button
                        key={continent.key}
                        type="button"
                        onClick={() => {
                          setSelectedContinent(continent.key)
                          setSelectedRegion('All')
                          setCurrentPage(1)
                        }}
                        aria-pressed={active}
                        className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-brand-maroon text-white'
                            : 'border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                        }`}
                      >
                        <GuideIcon name={continent.icon} className="h-3.5 w-3.5" />
                        <span>{isEnglish ? continent.en : continent.th}</span>
                      </button>
                    )
                  })}
                </>
              )}

              {allCombinedCards.some((card) => card.source === 'database') && dbCards.filter((c) => c.city).length > 0 && dbCards.map((c) => c.city).filter((city, index, self) => Boolean(city) && self.indexOf(city) === index).map((city) => {
                const isActive = selectedRegion === city
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedZone('all')
                      setSelectedContinent('All')
                      setSelectedRegion(isActive ? 'All' : city)
                      setCurrentPage(1)
                    }}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-11 max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors sm:text-sm ${
                      isActive
                        ? 'bg-brand-terracotta text-white'
                        : 'border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                    }`}
                  >
                    <GuideIcon name="pin" className="h-3.5 w-3.5 shrink-0" />
                    <span>{city}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {isRegionBrowserOpen && (
          <div
            id="centers-world-directory-panel"
            role="region"
            aria-label={isEnglish ? 'Continents and center regions' : 'เลือกตามทวีปและพื้นที่ตั้งศูนย์'}
            className="grid items-start gap-6 rounded-2xl border border-[#A33D19]/30 bg-brand-cream p-4 shadow-lg sm:p-5 lg:grid-cols-[1.35fr_0.65fr]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A33D19] sm:text-sm">
                    <GuideIcon name="globe" className="h-4 w-4" />
                    <span>{isEnglish ? 'Worldwide Network · en.dhammakaya.net' : 'เครือข่ายสาขาทั่วโลก · Dhammakaya Branches'}</span>
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-brand-maroon sm:text-xl">
                    {isEnglish ? 'Explore International Zones by Continent' : 'เลือกสำรวจศูนย์สาขาต่างประเทศตามทวีป'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://en.dhammakaya.net/branches/#w-map"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-border-dark bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-brand-gold-soft"
                  >
                    <span>{isEnglish ? 'World Branch Map ↗' : 'เปิดแผนที่สาขาทั่วโลก ↗'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsRegionBrowserOpen(false)}
                    aria-label={isEnglish ? 'Close continent browser' : 'ปิดหน้าต่างเลือกทวีปและพื้นที่'}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-brand-border-dark bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-brand-gold-soft"
                  >
                    <GuideIcon name="close" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {GLOBAL_BRANCH_CONTINENTS.map((continent) => (
                  <a
                    key={continent.key}
                    href={continent.anchorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-16 flex-col justify-between rounded-xl border border-brand-border bg-white p-3.5 transition-colors hover:border-[#A33D19]/40 hover:bg-[#FDF4EE]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-maroon">
                        <GuideIcon name={continent.icon} className="h-4 w-4 text-[#A33D19]" />
                        <span>{isEnglish ? continent.en : continent.th}</span>
                      </span>
                      <span aria-hidden="true" className="text-xs text-[#8C3213]">↗</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-brand-muted">
                      {isEnglish ? continent.noteEn : continent.noteTh}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <aside className="rounded-xl border border-brand-border bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#A33D19]">
                <GuideIcon name="pin" />
                <span>{isEnglish ? 'Browse regions' : 'เลือกตามพื้นที่'}</span>
              </div>
              <h4 className="mt-1 font-sans text-base font-medium text-brand-maroon">
                {isEnglish ? 'Regions' : 'พื้นที่ตั้งศูนย์'}
              </h4>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                {isEnglish ? 'Choose an area to filter listed centers.' : 'เลือกพื้นที่ในรายชื่อเพื่อกรองดูข้อมูลเฉพาะจุด'}
              </p>

              {regionCounts.length > 0 ? (
                <div className="mt-3 divide-y divide-brand-border/60 rounded-xl border border-brand-border bg-brand-gold-soft/60">
                  {regionCounts.map((region) => (
                    <button
                      key={region.city}
                      type="button"
                      onClick={() => {
                        setSelectedZone('all')
                        setSelectedContinent('All')
                        setSelectedRegion(region.city)
                        setCurrentPage(1)
                        setIsRegionBrowserOpen(false)
                      }}
                      aria-pressed={selectedRegion === region.city}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 p-3 text-left text-sm hover:bg-white/60"
                    >
                      <span className="font-medium text-brand-maroon">{region.city}</span>
                      <span className="text-brand-muted tabular-nums">
                        {region.count} {isEnglish ? (region.count === 1 ? 'center' : 'centers') : 'แห่ง'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-brand-border bg-[#F8F8F6] p-3 text-xs text-brand-muted">
                  {isEnglish ? 'Use the zone buttons above to switch between Thailand and international branches.' : 'เลือกโซนในไทยหรือต่างประเทศจากแถบด้านบนได้เลย'}
                </p>
              )}
            </aside>
          </div>
        )}
      </section>

      {/* 4. AUTHENTIC CENTERS DIRECTORY GRID */}
      <section aria-labelledby="centers-results-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="centers-results-heading"
              ref={resultsHeadingRef}
              tabIndex={-1}
              className="scroll-mt-24 font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl"
            >
              {isEnglish ? 'Meditation centers' : 'รายชื่อศูนย์ปฏิบัติธรรม'}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {isEnglish
                ? 'Verified locations in Thailand and international branches matching their official maps.'
                : 'ภาพถ่ายสถานที่จริงตรงตามตำแหน่งแผนที่ และช่องทางติดต่อทางการของแต่ละศูนย์'}
            </p>
          </div>

          {!isLoading && !error && (centers.length > 0 || visibleCards.length > 0) && (
            <p
              role="status"
              className="rounded-full border border-brand-border bg-brand-surface px-3.5 py-1 text-xs font-medium text-brand-maroon tabular-nums sm:text-sm"
            >
              {isEnglish
                ? `Page ${safePage}/${totalPages} · ${visibleRangeStart}–${visibleRangeEnd} of ${visibleCards.length} centers`
                : `หน้า ${safePage}/${totalPages} · แสดง ${visibleRangeStart}–${visibleRangeEnd} จาก ${visibleCards.length} แห่ง`}
            </p>
          )}
        </div>

        {isLoading && (
          <div
            role="status"
            aria-label={t('centers.loading')}
            className="flex min-h-60 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-terracotta/20 border-t-brand-terracotta" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-900/15 bg-red-50 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <p role="alert" className="text-sm font-semibold text-red-900">{error}</p>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="mt-3 min-h-11 shrink-0 cursor-pointer rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white sm:mt-0"
            >
              {t('centers.retry')}
            </button>
          </div>
        )}

        {!isLoading && !error && allCombinedCards.length === 0 && (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center text-sm text-brand-muted">
            {t('centers.empty')}
          </div>
        )}

        {!isLoading && (centers.length > 0 || allTotalCount > 0) && visibleCards.length === 0 && (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <h3 className="text-base font-medium text-brand-maroon">
              {isEnglish ? 'No centers match your search' : 'ไม่พบศูนย์ที่ตรงกับการค้นหา'}
            </h3>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 min-h-11 cursor-pointer rounded-lg bg-[#A33D19] px-4 text-sm font-medium text-white hover:bg-[#8C3213]"
            >
              {isEnglish ? 'Show all centers' : 'แสดงศูนย์ทั้งหมด'}
            </button>
          </div>
        )}

        {!isLoading && paginatedCards.length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCards.map((card) => (
              <article
                key={card.id}
                aria-labelledby={`center-title-${card.id}`}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-colors duration-150 hover:border-brand-border-dark"
              >
                <div>
                  {card.image ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-[#EFEFE9]">
                      <img
                        src={card.image}
                        alt={card.name}
                        width={card.imageWidth}
                        height={card.imageHeight}
                        loading="lazy"
                        className={`h-full w-full object-cover ${card.imageClassName ?? 'object-center'}`}
                      />
                      <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-brand-maroon shadow-xs">
                        <GuideIcon name="pin" className="h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
                        <span className="truncate">{card.topTag}</span>
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-[#11223C]/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
                        {card.badgeLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 border-b border-brand-border bg-[#F4F2EC] px-5 py-4 text-sm text-brand-maroon">
                      <p className="flex min-w-0 items-start gap-2 font-medium">
                        <GuideIcon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[#A33D19]" />
                        <span>{card.city}</span>
                      </p>
                      <span className="shrink-0 rounded-full border border-brand-border bg-white px-2.5 py-0.5 text-xs font-medium text-brand-muted">
                        {card.badgeLabel}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-brand-muted">
                      <span className="truncate font-medium text-[#8C3213]">{card.city}</span>
                      {card.countryCode && (
                        <span lang="en" className="shrink-0 rounded-md border border-brand-border bg-[#F8F8F6] px-2 py-0.5 font-semibold text-brand-maroon">
                          {card.countryCode}
                        </span>
                      )}
                    </div>

                    <h3 id={`center-title-${card.id}`} className="mt-2 font-sans text-lg font-semibold leading-snug text-brand-maroon">
                      {card.name}
                    </h3>

                    {card.description && (
                      <p className="mt-2 text-sm leading-6 text-brand-muted">
                        {card.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-border bg-[#F8F8F6] px-3.5 py-2.5 text-xs leading-5 text-brand-muted">
                      <GuideIcon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[#A33D19]" />
                      <span>{card.address}</span>
                    </div>

                    {(card.phone || card.email || card.lineId) && (
                      <div className="mt-2.5 space-y-1 rounded-xl border border-brand-border/80 bg-brand-cream/60 px-3.5 py-2.5 text-xs leading-5 text-brand-maroon">
                        {card.phone && (
                          <p className="flex items-start gap-2">
                            <GuideIcon name="chat" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
                            <span className="tabular-nums">
                              <strong>{isEnglish ? 'Tel:' : 'โทร:'}</strong> {card.phone}
                            </span>
                          </p>
                        )}
                        {card.email && (
                          <p className="flex items-start gap-2 break-all">
                            <GuideIcon name="link" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
                            <span>
                              <strong>{isEnglish ? 'Email:' : 'อีเมล:'}</strong> {card.email}
                            </span>
                          </p>
                        )}
                        {card.lineId && (
                          <p className="flex items-start gap-2">
                            <GuideIcon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
                            <span>
                              <strong>LINE:</strong> {card.lineId}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-brand-border/70 px-5 py-3.5">
                  {card.mapUrl && (
                    <a
                      href={card.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={card.source === 'database' ? t('centers.linkMap') : `${t('centers.linkMap')}: ${card.name}`}
                      aria-describedby={`center-title-${card.id}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#A33D19] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8C3213]"
                    >
                      <span>{t('centers.linkMap')}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {card.websiteUrl && (
                    <a
                      href={card.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={card.source === 'database' ? t('centers.linkWebsite') : `${t('centers.linkWebsite')}: ${card.name}`}
                      aria-describedby={`center-title-${card.id}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-brand-border-dark bg-brand-surface px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                    >
                      <span>{t('centers.linkWebsite')}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {card.contactUrl && (
                    <a
                      href={card.contactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={card.source === 'database' ? t('centers.linkContact') : `${t('centers.linkContact')}: ${card.name}`}
                      aria-describedby={`center-title-${card.id}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-brand-border-dark bg-brand-surface px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                    >
                      <span>{t('centers.linkContact')}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label={isEnglish ? 'Centers pagination' : 'เปลี่ยนหน้าศูนย์ปฏิบัติธรรม'}
                className="flex flex-wrap items-center justify-center gap-2 pt-2"
              >
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm font-medium text-brand-maroon transition-colors hover:border-[#A33D19]/40 hover:bg-[#FDF4EE] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span aria-hidden="true">←</span>
                  <span>{isEnglish ? 'Previous' : 'ก่อนหน้า'}</span>
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                  const isActivePage = page === safePage
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={isActivePage ? 'page' : undefined}
                      aria-label={isEnglish ? `Page ${page}` : `หน้าที่ ${page}`}
                      className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-semibold tabular-nums transition-colors ${
                        isActivePage
                          ? 'bg-[#A33D19] text-white shadow-xs'
                          : 'border border-brand-border bg-brand-surface text-brand-maroon hover:border-[#A33D19]/40 hover:bg-[#FDF4EE]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm font-medium text-brand-maroon transition-colors hover:border-[#A33D19]/40 hover:bg-[#FDF4EE] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>{isEnglish ? 'Next' : 'ถัดไป'}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </nav>
            )}
          </div>
        )}
      </section>

      <div className="flex items-start gap-2.5 rounded-xl border border-brand-border bg-[#EFEFE9] px-4 py-3 text-xs leading-5 text-brand-muted sm:text-sm">
        <GuideIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-brand-maroon" />
        <p>
          {isEnglish
            ? 'Before travelling, please confirm session times, languages, and participation requirements directly with each center.'
            : 'ก่อนเดินทาง กรุณาตรวจสอบรอบกิจกรรม ตารางเวลาที่ให้บริการ และเงื่อนไขการเข้าร่วมกับศูนย์แต่ละแห่งโดยตรง'}
        </p>
      </div>
    </div>
  )
}
