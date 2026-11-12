import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { isSafeWebUrl } from '../lib/publicContent'
import { GuideIcon, type GuideIconName } from '../components/GuideIcon'
import { practiceDestinations } from '../content/continuePractice'
import {
  GLOBAL_BRANCH_CONTINENTS,
  VERIFIED_THAILAND_CENTERS,
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
  badgeLabel: string
  topTag: string
}

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allCenters, setCenters] = useState<CenterRow[]>([])
  const [allLinks, setBioLinks] = useState<BioLinkRow[]>([])
  const [linksError, setLinksError] = useState(false)

  const centers = allCenters.filter((center) =>
    center.dci_center_translations.some((translation) => translation.language_code === currentLang),
  )
  const bioLinks = allLinks.filter((link) =>
    isSafeWebUrl(link.url) && link.bio_link_translations.some((translation) => translation.language_code === currentLang),
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
        supabaseClient
          .from('dci_centers')
          .select(`
            id, country_code, city, address, map_url, website_url, contact_url,
            content_status, is_published,
            dci_center_translations (language_code, name, description)
          `)
          .eq('content_status', 'published')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabaseClient
          .from('bio_links')
          .select('id, url, display_order, image_storage_path, bio_link_translations(language_code, title)')
          .eq('content_status', 'published')
          .eq('is_published', true)
          .order('display_order', { ascending: true }),
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
      }
    })
  }, [centers, currentLang, isEnglish, t])

  const thailandShowcaseCards = useMemo<RenderableCenterCard[]>(() => {
    const dbHosts = new Set(dbCards.map((c) => normalizeUrlHost(c.websiteUrl)).filter(Boolean))
    return VERIFIED_THAILAND_CENTERS.filter((item) => !dbHosts.has(normalizeUrlHost(item.websiteUrl))).map((item) => ({
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
      badgeLabel: item.badge[currentLang],
      topTag: item.city[currentLang],
    }))
  }, [currentLang, dbCards])

  const filteredDbCards = useMemo(() => {
    return dbCards.filter((card) => {
      if (selectedZone !== 'all' && card.zone !== selectedZone) return false
      if (selectedContinent !== 'All' && card.continent !== selectedContinent) return false
      if (selectedRegion !== 'All' && card.city !== selectedRegion) return false
      if (!normalizedSearch) return true
      return `${card.name} ${card.description} ${card.city} ${card.address} ${card.countryCode}`
        .toLocaleLowerCase(currentLang)
        .includes(normalizedSearch)
    })
  }, [currentLang, dbCards, normalizedSearch, selectedContinent, selectedRegion, selectedZone])

  const filteredThailandCards = useMemo(() => {
    if (selectedZone === 'international') return []
    if (selectedRegion !== 'All') return []
    if (selectedContinent !== 'All' && selectedContinent !== 'asia') return []
    return thailandShowcaseCards.filter((card) => {
      if (!normalizedSearch) return true
      return `${card.name} ${card.description} ${card.city} ${card.address} Thailand ไทย`
        .toLocaleLowerCase(currentLang)
        .includes(normalizedSearch)
    })
  }, [currentLang, normalizedSearch, selectedContinent, selectedRegion, selectedZone, thailandShowcaseCards])

  const visibleCards = useMemo(
    () => [...filteredThailandCards, ...filteredDbCards],
    [filteredDbCards, filteredThailandCards],
  )

  const regionCounts = [...new Set(centers.map((center) => center.city).filter(Boolean))]
    .map((city) => ({ city, count: centers.filter((center) => center.city === city).length }))

  const availableContinents = useMemo(() => {
    const keys = new Set(
      dbCards
        .filter((card) => selectedZone === 'all' || card.zone === selectedZone)
        .map((card) => card.continent)
        .filter((k): k is WorldContinentKey => Boolean(k)),
    )
    return GLOBAL_BRANCH_CONTINENTS.filter((item) => keys.has(item.key))
  }, [dbCards, selectedZone])

  const thailandTotalCount = thailandShowcaseCards.length + dbCards.filter((c) => c.zone === 'thailand').length
  const internationalTotalCount = dbCards.filter((c) => c.zone === 'international').length
  const allTotalCount = thailandShowcaseCards.length + dbCards.length

  function selectZone(zone: CenterZone) {
    setSelectedZone(zone)
    setSelectedContinent('All')
    setSelectedRegion('All')
  }

  function resetAllFilters() {
    setSearchQuery('')
    setSelectedZone('all')
    setSelectedContinent('All')
    setSelectedRegion('All')
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

      {/* 2. OFFICIAL PATHWAYS ANCHOR (Required before directory search per scope & accessibility order) */}
      <section aria-labelledby="continue-practice-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="continue-practice-heading" className="font-serif text-xl font-semibold text-brand-maroon sm:text-2xl">
              {isEnglish ? 'Places you can explore' : 'ช่องทางหลักสำหรับเรียนรู้เพิ่มเติม'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'MonkChat Guide connects you directly with these official websites.'
                : 'MonkChat Guide เชื่อมต่อคุณเข้ากับเว็บไซต์ทางการของแต่ละแห่งโดยตรง'}
            </p>
          </div>
          <p className="text-xs leading-5 text-brand-muted sm:max-w-xs sm:text-right">
            {isEnglish
              ? 'Check schedules, languages, and participation details directly with each destination.'
              : 'ตรวจสอบรอบกิจกรรม ภาษาที่ให้บริการ และเงื่อนไขการเข้าร่วมกับสถานที่นั้นโดยตรงก่อนเดินทาง'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {practiceDestinations.map((destination) => {
            const copy = destination[currentLang]
            return (
              <article
                key={destination.id}
                className="flex min-w-0 flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-5"
              >
                <div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-[#FDF4EE] text-[#A33D19]">
                    <GuideIcon name={destination.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-lg font-medium leading-7 text-brand-maroon">{copy.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-brand-muted">{copy.description}</p>
                </div>
                <a
                  href={destination.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-brand-border bg-[#F8F8F6] px-3.5 py-2 text-sm font-medium leading-5 text-brand-maroon transition-colors hover:border-[#A33D19]/40 hover:bg-[#FDF4EE]"
                >
                  <span>{copy.action}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            )
          })}
        </div>
      </section>

      {/* 3. UNIFIED SEARCH + GLOBAL ZONE & REGION FILTER PANEL */}
      <section aria-labelledby="centers-search-heading" className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="centers-search-heading" className="text-lg font-medium text-brand-maroon">
            {isEnglish ? 'Search centers & choose world zone' : 'ค้นหาศูนย์ปฏิบัติธรรมและเลือกโซนทั่วโลก'}
          </h2>
          <a
            href="https://en.dhammakaya.net/branches/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-[#8C3213] hover:underline sm:text-sm"
          >
            <GuideIcon name="globe" className="h-4 w-4 shrink-0" />
            <span>{isEnglish ? 'Browse all Dhammakaya Foundation branches ↗' : 'ดูรายชื่อสาขาทั่วโลกทั้งหมด (Dhammakaya Branches) ↗'}</span>
          </a>
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
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label={isEnglish ? 'Search centers' : 'ค้นหาศูนย์ปฏิบัติธรรม'}
              placeholder={isEnglish ? 'Search center name, city, country or address...' : 'ค้นหาชื่อศูนย์ เมือง ประเทศ หรือที่อยู่...'}
              className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-muted"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={isEnglish ? 'Clear search' : 'ล้างคำค้น'}
                onClick={() => setSearchQuery('')}
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

              {regionCounts.map((region) => {
                const isActive = selectedRegion === region.city
                return (
                  <button
                    key={region.city}
                    type="button"
                    onClick={() => {
                      setSelectedZone('all')
                      setSelectedContinent('All')
                      setSelectedRegion(isActive ? 'All' : region.city)
                    }}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-11 max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors sm:text-sm ${
                      isActive
                        ? 'bg-brand-terracotta text-white'
                        : 'border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                    }`}
                  >
                    <GuideIcon name="pin" className="h-3.5 w-3.5 shrink-0" />
                    <span>{region.city}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
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
                ? `${visibleCards.length} of ${allTotalCount} centers`
                : `แสดง ${visibleCards.length} จาก ${allTotalCount} แห่ง`}
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

        {!isLoading && !error && centers.length === 0 && filteredThailandCards.length === 0 && (
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

        {!isLoading && visibleCards.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => (
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
                        className="h-full w-full object-cover object-center"
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
        )}
      </section>

      {/* 5. DHAMMAKAYA WORLDWIDE CONTINENTS PORTAL + REGION COUNTS SUMMARY */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A33D19] sm:text-sm">
                <GuideIcon name="globe" className="h-4 w-4" />
                <span>{isEnglish ? 'Worldwide Network · en.dhammakaya.net' : 'เครือข่ายสาขาทั่วโลก · Dhammakaya Branches'}</span>
              </span>
              <h2 className="mt-1 font-serif text-xl font-semibold text-brand-maroon sm:text-2xl">
                {isEnglish ? 'Explore International Zones by Continent' : 'เลือกสำรวจศูนย์สาขาต่างประเทศตามทวีป'}
              </h2>
            </div>
            <a
              href="https://en.dhammakaya.net/branches/#w-map"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-border-dark px-3.5 text-xs font-medium text-brand-maroon hover:bg-brand-gold-soft sm:text-sm"
            >
              <span>{isEnglish ? 'World Branch Map ↗' : 'เปิดแผนที่สาขาทั่วโลก ↗'}</span>
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GLOBAL_BRANCH_CONTINENTS.map((continent) => (
              <a
                key={continent.key}
                href={continent.anchorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-16 flex-col justify-between rounded-xl border border-brand-border bg-[#F8F8F6] p-3.5 transition-colors hover:border-[#A33D19]/40 hover:bg-[#FDF4EE]"
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
        </section>

        <aside className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-[#A33D19]">
            <GuideIcon name="pin" />
            <span>{isEnglish ? 'Browse regions' : 'เลือกตามพื้นที่'}</span>
          </div>
          <h3 className="mt-1 font-sans text-lg font-medium text-brand-maroon">
            {isEnglish ? 'Regions' : 'พื้นที่ตั้งศูนย์'}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-brand-muted">
            {isEnglish ? 'Choose an area to filter listed centers.' : 'เลือกพื้นที่ในรายชื่อเพื่อกรองดูข้อมูลเฉพาะจุด'}
          </p>

          {regionCounts.length > 0 ? (
            <div className="mt-4 divide-y divide-brand-border/60 rounded-xl border border-brand-border bg-brand-gold-soft/60">
              {regionCounts.map((region) => (
                <button
                  key={region.city}
                  type="button"
                  onClick={() => {
                    setSelectedZone('all')
                    setSelectedContinent('All')
                    setSelectedRegion(region.city)
                  }}
                  aria-pressed={selectedRegion === region.city}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 p-3 text-left text-sm"
                >
                  <span className="font-medium text-brand-maroon">{region.city}</span>
                  <span className="text-brand-muted tabular-nums">
                    {region.count} {isEnglish ? (region.count === 1 ? 'center' : 'centers') : 'แห่ง'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-brand-border bg-[#F8F8F6] p-3 text-xs text-brand-muted">
              {isEnglish ? 'Use the zone buttons above to switch between Thailand and international branches.' : 'เลือกโซนในไทยหรือต่างประเทศจากแถบด้านบนได้เลย'}
            </p>
          )}
        </aside>
      </div>

      {/* Bio Links Error Alert */}
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

      {/* 6. BOTTOM SECTION: LEARN MORE & RESOURCES */}
      <section className="space-y-5 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-brand-maroon">
            {isEnglish ? 'Learn More & Resources' : 'แหล่งเรียนรู้และข้อมูลเพิ่มเติม'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
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
                {bioLinks.slice(0, 2).map((link) => {
                  const title = link.bio_link_translations.find((tr) => tr.language_code === currentLang)?.title
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
