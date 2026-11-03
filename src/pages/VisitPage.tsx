import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import {
  normalizeLanguage,
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
  type AppLanguage,
} from '../lib/language'
import { trackUsageEvent } from '../lib/analytics'
import { getBioLinkImageUrl } from '../lib/bioLinkImages'
import { supabaseClient } from '../lib/supabase'

interface TrackTranslationRow {
  language_code: string
  title: string
  description: string
}

interface MedTrackRow {
  id: string
  source_language_code: string
  duration_seconds: number
  meditation_track_translations: TrackTranslationRow[]
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

function hasSafeExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export function VisitPage() {
  const { i18n } = useTranslation()
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY) != null)
  const [currentLang, setCurrentLang] = useState<AppLanguage>(() =>
    normalizeLanguage(i18n.resolvedLanguage || i18n.language),
  )

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setCurrentLang(normalizeLanguage(language))
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [i18n])

  const handleLanguageChange = (language: AppLanguage) => {
    sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, language)
    setHasSelectedLanguage(true)
    setCurrentLang(language)
    void i18n.changeLanguage(language)
    window.dispatchEvent(new Event(VISITOR_LANGUAGE_SELECTED_EVENT))
  }

  if (!hasSelectedLanguage) {
    return <LanguageGate onSelect={handleLanguageChange} />
  }

  return <VisitorHome currentLang={currentLang} />
}

function LanguageGate({ onSelect }: { onSelect: (language: AppLanguage) => void }) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center bg-[#FFF8EE] px-4 py-8 text-[#30251E] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_10%,rgba(255,243,224,0.7),transparent_35%),linear-gradient(180deg,#FFF8EE_0%,#FFF6E9_100%)]" />

      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3" aria-label="MonkChat Guide">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8E3317] to-[#681B16] text-white shadow-xs">
              <img src="/monkchat-placeholder.svg" alt="" className="h-6 w-6 brightness-200 invert" />
            </div>
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold text-[#681B16]">MonkChat Guide</span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-wider text-[#A43D1D]/80">Ayutthaya</span>
            </span>
          </Link>
          <Link to="/" className="inline-flex min-h-9 items-center rounded-full border border-[#D5BD94] bg-[#FFFDF7] px-4 text-xs font-bold text-[#681B16] shadow-2xs hover:bg-[#FDF4E3]">
            โครงการ / About
          </Link>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A43D1D]/20 bg-[#FDF4E3] px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-[#A43D1D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A43D1D]" />
              Welcome to MonkChat
            </span>
            <h1 className="mt-4 font-serif text-3xl font-extrabold leading-tight text-[#681B16] sm:text-5xl">
              ฟัง เรียนรู้ และเดินทางต่ออย่างสงบ
            </h1>
            <p className="mt-3 max-w-md text-sm text-[#7D6B5D] sm:text-base">
              Meditation audio, trusted answers, and DCI centers—all in one calm space for your visit.
            </p>
          </div>

          <section aria-labelledby="language-gate-title" className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 shadow-md sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
              <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.3 3.3-5.3 3.3-9S14.2 5.3 12 3m0 18c-2.2-2.3-3.3-5.3-3.3-9S9.8 5.3 12 3M3.5 9h17m-17 6h17" />
              </svg>
            </div>
            <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-widest text-[#A43D1D]">Your language</p>
            <h2 id="language-gate-title" className="mt-1 font-serif text-2xl font-bold text-[#681B16]">
              เลือกภาษา / Choose language
            </h2>
            <p className="mt-2 text-xs text-[#7D6B5D]">
              ระบบจะจดจำภาษาสำหรับการเข้าชมครั้งนี้<br />Choose the language for this visit.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelect('th')}
                aria-label="ภาษาไทย"
                className="group flex min-h-16 items-center gap-3.5 rounded-xl bg-[#A43D1D] px-4 py-3 text-left text-white shadow-xs transition hover:bg-[#8E3317] cursor-pointer"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-extrabold">TH</span>
                <span>
                  <strong className="block text-sm font-bold">ภาษาไทย</strong>
                  <small className="block text-[0.7rem] text-white/75">ดำเนินการต่อ</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSelect('en')}
                aria-label="English"
                className="group flex min-h-16 items-center gap-3.5 rounded-xl border border-[#D5BD94] bg-[#FFFDF7] px-4 py-3 text-left text-[#681B16] shadow-xs transition hover:bg-[#FDF4E3] cursor-pointer"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FDF4E3] text-xs font-extrabold text-[#A43D1D]">EN</span>
                <span>
                  <strong className="block text-sm font-bold">English</strong>
                  <small className="block text-[0.7rem] text-[#7D6B5D]">Continue</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function VisitorHome({ currentLang }: { currentLang: AppLanguage }) {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const [isTrackLoading, setIsTrackLoading] = useState(true)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [recommendedTracks, setRecommendedTracks] = useState<MedTrackRow[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [areLinksLoading, setAreLinksLoading] = useState(true)
  const [linksError, setLinksError] = useState<string | null>(null)
  const [bioLinks, setBioLinks] = useState<BioLinkRow[]>([])

  const fetchRecommendedTracks = useCallback(async () => {
    if (!supabaseClient) {
      setTrackError(t('meditation.errorNoClient'))
      setIsTrackLoading(false)
      return
    }

    setIsTrackLoading(true)
    setTrackError(null)

    try {
      const { data, error } = await supabaseClient
        .from('meditation_tracks')
        .select('id, source_language_code, duration_seconds, meditation_track_translations(language_code, title, description)')
        .eq('content_status', 'published')
        .eq('is_published', true)
        .eq('is_recommended', true)

      if (error) throw error

      const translatedTracks = ((data ?? []) as MedTrackRow[]).filter((track) =>
        track.meditation_track_translations.some(
          (translation) => translation.language_code === currentLang,
        ),
      )

      setRecommendedTracks(translatedTracks)
      setSelectedTrackId(translatedTracks[0]?.id ?? null)
    } catch {
      setRecommendedTracks([])
      setSelectedTrackId(null)
      setTrackError(t('visitor.errorRecommended'))
    } finally {
      setIsTrackLoading(false)
    }
  }, [currentLang, t])

  const fetchBioLinks = useCallback(async () => {
    if (!supabaseClient) {
      setLinksError(t('home.errorLoadLinks'))
      setAreLinksLoading(false)
      return
    }

    setAreLinksLoading(true)
    setLinksError(null)

    try {
      const { data, error } = await supabaseClient
        .from('bio_links')
        .select('id, url, display_order, image_storage_path, bio_link_translations(language_code, title)')
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      const translatedLinks = ((data ?? []) as BioLinkRow[]).filter((link) =>
        hasSafeExternalUrl(link.url)
        && link.bio_link_translations.some(
          (translation) => translation.language_code === currentLang,
        ),
      )

      setBioLinks(translatedLinks)
    } catch {
      setBioLinks([])
      setLinksError(t('home.errorLoadLinks'))
    } finally {
      setAreLinksLoading(false)
    }
  }, [currentLang, t])

  useEffect(() => {
    void fetchRecommendedTracks()
  }, [fetchRecommendedTracks])

  useEffect(() => {
    void fetchBioLinks()
  }, [fetchBioLinks])

  const selectedTrack = recommendedTracks.find((track) => track.id === selectedTrackId)
    ?? recommendedTracks[0]
  const selectedTranslation = selectedTrack?.meditation_track_translations.find(
    (translation) => translation.language_code === currentLang,
  )

  const whatToExpect = [
    {
      title: isEnglish ? 'Meet the Monks' : 'พบและสนทนากับพระสงฆ์',
      desc: isEnglish ? 'Have an open, respectful conversation about Buddhist life and mindfulness.' : 'สนทนาธรรมและแลกเปลี่ยนมุมมองชีวิตกับพระนิสิตอย่างเป็นกันเอง',
      img: '/images/home/monkchat-slide-1.webp',
    },
    {
      title: isEnglish ? 'Short Meditation' : 'ฝึกสมาธิเบื้องต้น',
      desc: isEnglish ? 'A simple, guided meditation to help you relax and be present.' : 'สมาธิสั้น 5-10 นาที ช่วยผ่อนคลายและสร้างสติรู้ตัว',
      img: '/images/home/monkchat-meditation-hero.webp',
    },
    {
      title: isEnglish ? 'Q&A' : 'ถาม-ตอบข้อสงสัย',
      desc: isEnglish ? 'Ask questions about Buddhism, daily life, and practical wisdom.' : 'ซักถามข้อสงสัยเกี่ยวกับวิถีพุทธและหลักธรรมนำมาปรับใช้',
      img: '/images/home/monkchat-slide-2.webp',
    },
    {
      title: isEnglish ? 'Photo Souvenir' : 'ภาพความทรงจำ',
      desc: isEnglish ? 'Capture a meaningful memory at the historic Ayutthaya site.' : 'เก็บภาพความประทับใจและความทรงจำอันทรงคุณค่า ณ เมืองประวัติศาสตร์',
      img: '/images/home/monkchat-slide-4.webp',
    },
  ]

  const mapUrl = 'https://maps.google.com/?q=Wat+Mahathat+Ayutthaya'

  return (
    <div className="break-words [overflow-wrap:anywhere]">
      <HomeHeroIntro language={currentLang} />
      <div className="mx-auto w-full max-w-[76rem] space-y-10 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      {/* 2. SUMMARY STRIP / ACTIVITY PILL */}
      <section
        aria-label="Activity schedule and location summary"
        className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-3 shadow-xs sm:p-5"
      >
        <div className="grid grid-cols-2 gap-2 divide-y-0 sm:grid-cols-4 sm:gap-4 sm:divide-x sm:divide-[#EADCC6]/80">
          <div className="flex items-center gap-2.5 p-1.5 sm:px-2 sm:py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D] sm:h-11 sm:w-11">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xs font-bold text-[#681B16] sm:text-sm">
                {isEnglish ? 'Mon & Fri' : 'จันทร์ และ ศุกร์'}
              </strong>
              <span className="block truncate text-[0.65rem] text-[#7D6B5D] sm:text-xs">
                {isEnglish ? 'Meditation sessions' : 'กิจกรรมนำสมาธิ'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5 sm:px-2 sm:py-1 sm:pl-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D] sm:h-11 sm:w-11">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xs font-bold text-[#681B16] sm:text-sm">
                {isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป'}
              </strong>
              <span className="block truncate text-[0.65rem] text-[#7D6B5D] sm:text-xs">
                {isEnglish ? 'Starting time' : 'เวลาเริ่มกิจกรรม'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5 sm:px-2 sm:py-1 sm:pl-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D] sm:h-11 sm:w-11">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <path d="M5 22h14M5 2h14m-4 10a5 5 0 0 1-5 5 5 5 0 0 1-5-5m10 0a5 5 0 0 0-5-5 5 5 0 0 0-5 5" />
              </svg>
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xs font-bold text-[#681B16] sm:text-sm">
                {isEnglish ? '5–10 min' : '5–10 นาที'}
              </strong>
              <span className="block truncate text-[0.65rem] text-[#7D6B5D] sm:text-xs">
                {isEnglish ? 'Guided session' : 'ระยะเวลานำสมาธิ'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1.5 sm:px-2 sm:py-1 sm:pl-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D] sm:h-11 sm:w-11">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xs font-bold text-[#681B16] sm:text-sm">
                {isEnglish ? 'Ayutthaya' : 'พระนครศรีอยุธยา'}
              </strong>
              <span className="block truncate text-[0.65rem] text-[#7D6B5D] sm:text-xs">
                {isEnglish ? 'Wat Mahathat' : 'วัดมหาธาตุ'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOCATION & MAP SECTION */}
      <section id="location-details" className="scroll-mt-8 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'Location & Map' : 'สถานที่และแผนที่'}
          </h2>
          <p className="text-xs text-[#7D6B5D] sm:text-sm">
            {isEnglish ? 'Monk Chat at Wat Mahathat, Ayutthaya.' : 'จุดนัดพบกิจกรรม Monk Chat ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-xs sm:grid sm:grid-cols-2">
          <div className="relative h-60 w-full sm:h-full">
            <img
              src="/images/home/monkchat-meditation-ruins.webp"
              alt="Wat Mahathat Temple"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-7 space-y-4">
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#A43D1D]">
                HISTORIC SITE
              </span>
              <h3 className="mt-1 font-serif text-xl font-bold text-[#681B16]">
                {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#5A4B40] sm:text-sm">
                {isEnglish
                  ? 'Inside the Wat Mahathat temple area, near the historic prang (central tower). Student monks are available to welcome visitors.'
                  : 'บริเวณลานร่มไม้ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน พระนิสิตพร้อมต้อนรับและสนทนาธรรม'}
              </p>
            </div>

            <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#681B16]">
                <span className="font-bold">📍</span>
                <span>{isEnglish ? 'Wat Mahathat (near central prang), Ayutthaya' : 'จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7D6B5D]">
                <span>⏰</span>
                <span>{isEnglish ? 'Every Monday & Friday from 13:15 onwards' : 'ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป'}</span>
              </div>
              <p className="text-[0.68rem] text-[#7D6B5D] italic">
                {isEnglish
                  ? 'Simulated location reference. For real GPS navigation, click View Map or Get Directions to open Google Maps.'
                  : 'ข้อมูลสถานที่เบื้องต้น สำหรับการนำทางจริงกรุณากด "ดูแผนที่" หรือ "ขอเส้นทาง" เพื่อเปิด Google Maps'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#8E3317]"
              >
                <LocationIcon />
                <span>{isEnglish ? 'View Map' : 'ดูแผนที่'}</span>
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-5 text-xs font-bold text-[#A43D1D] transition hover:bg-[#FDF4E3]"
              >
                <span>🧭</span>
                <span>{isEnglish ? 'Get Directions' : 'ขอเส้นทาง'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT TO EXPECT SECTION */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'What to Expect' : 'สิ่งที่จะได้สัมผัสในกิจกรรม'}
          </h2>
          <p className="text-xs text-[#7D6B5D] sm:text-sm">
            {isEnglish
              ? 'A friendly and meaningful experience to learn, reflect, and connect.'
              : 'ประสบการณ์อันทรงคุณค่าเพื่อเรียนรู้ สงบใจ และแลกเปลี่ยนอย่างเป็นมิตร'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whatToExpect.map((item) => (
            <div
              key={item.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-2xs"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#FAF2E6]">
                <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-base font-bold text-[#681B16]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-[#5A4B40]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECOMMENDED MEDITATION TRACK + BIO LINKS (PRESERVING TEST ASSERTIONS) */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-labelledby="recommended-heading" className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#A43D1D]">
            {t('visitor.recommendedTag')}
          </p>
          <h2 id="recommended-heading" className="mt-1 font-serif text-xl font-bold text-[#681B16] sm:text-2xl">
            {t('visitor.recommendedTitle')}
          </h2>
          <p className="mt-1 text-xs text-[#7D6B5D] sm:text-sm">
            {t('visitor.recommendedSubtitle')}
          </p>

          <div className="mt-5">
            {isTrackLoading ? (
              <LoadingState label={t('visitor.loadingRecommended')} />
            ) : trackError ? (
              <ErrorState message={trackError} onRetry={fetchRecommendedTracks} retryLabel={t('home.retry')} />
            ) : !selectedTrack || !selectedTranslation ? (
              <EmptyState message={t('visitor.noRecommended')} />
            ) : (
              <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-5">
                {recommendedTracks.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-2" aria-label={t('visitor.selectRecommended')}>
                    {recommendedTracks.map((track) => {
                      const translation = track.meditation_track_translations.find((item) => item.language_code === currentLang)
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setSelectedTrackId(track.id)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                            track.id === selectedTrack.id
                              ? 'bg-[#A43D1D] text-white'
                              : 'bg-white border border-[#EADCC6] text-[#681B16] hover:bg-[#FDF4E3]'
                          }`}
                        >
                          {translation?.title}
                        </button>
                      )
                    })}
                  </div>
                )}
                <h3 className="font-serif text-lg font-bold text-[#681B16]">{selectedTranslation.title}</h3>
                {selectedTranslation.description && (
                  <p className="mt-2 text-xs leading-5 text-[#5A4B40]">{selectedTranslation.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-[#7D6B5D]">
                    {Math.max(1, Math.round(selectedTrack.duration_seconds / 60))} {t('meditation.minutes')} · {selectedTrack.source_language_code?.toUpperCase()}
                  </span>
                  <Link
                    to={`/meditation?trackId=${selectedTrack.id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#8E3317]"
                  >
                    <PlayIcon />
                    <span>{t('visitor.playNow')}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bio Links / Quick Resources */}
        <section aria-labelledby="bio-links-heading" className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-6">
          <h2 id="bio-links-heading" className="font-serif text-base font-bold text-[#681B16]">
            {t('visitor.chooseTitle')}
          </h2>
          <div className="mt-3 divide-y divide-[#EADCC6]/60">
            <GuideLinkRow to="/qa" title={t('visitor.qaTitle')} description={t('visitor.qaDesc')} icon={<QuestionIcon />} />
            <GuideLinkRow to="/centers" title={t('visitor.centersTitle')} description={t('visitor.centersDesc')} icon={<LocationIcon />} />
            <GuideLinkRow to="/meditation" title={t('visitor.meditationTitle')} description={t('visitor.meditationDesc')} icon={<PlayIcon />} />
          </div>

          {areLinksLoading ? (
            <LoadingState label={t('home.loadingLinks')} />
          ) : linksError ? (
            <ErrorState message={linksError} onRetry={fetchBioLinks} retryLabel={t('home.retry')} />
          ) : bioLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-[#EADCC6]/60">
              {bioLinks.map((link) => {
                const title = link.bio_link_translations.find((translation) => translation.language_code === currentLang)?.title
                const imageUrl = getBioLinkImageUrl(link.image_storage_path)
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={title}
                    onClick={() => {
                      void trackUsageEvent({
                        eventType: 'bio_link_click',
                        resourceType: 'bio_link',
                        resourceId: link.id,
                      })
                    }}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#EADCC6] bg-[#FAF2E6] px-3 text-xs font-bold text-[#681B16] hover:bg-[#FDF4E3]"
                  >
                    {imageUrl ? <img src={imageUrl} alt="" className="h-4 w-4 rounded-full object-cover" /> : <LinkIcon />}
                    <span>{title}</span>
                    <ExternalLinkIcon />
                  </a>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>

      {/* 6. LOWER 3-COLUMN SECTION: BEFORE YOU COME + FAQ + CONTACT */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Column 1: Before You Come */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A43D1D]">
            <span>📋</span>
            <span>{isEnglish ? 'Before You Come' : 'ข้อควรทราบก่อนมา'}</span>
          </div>
          <h3 className="mt-2 font-serif text-base font-bold text-[#681B16]">
            {isEnglish ? 'Visitor Etiquette' : 'การปฏิบัติตนในวัด'}
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-[#5A4B40]">
            <li className="flex items-start gap-2">
              <span className="text-[#A43D1D] font-bold">✓</span>
              <span>{isEnglish ? 'Check the schedule (Mon & Fri, 13:15)' : 'ตรวจสอบตารางเวลา (จันทร์และศุกร์ 13:15 น.)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A43D1D] font-bold">✓</span>
              <span>{isEnglish ? 'Dress modestly (shoulders & knees covered)' : 'แต่งกายสุภาพ (คลุมไหล่และเข่า)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A43D1D] font-bold">✓</span>
              <span>{isEnglish ? 'Arrive a few minutes early' : 'มาถึงก่อนเวลากิจกรรมเล็กน้อย'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A43D1D] font-bold">✓</span>
              <span>{isEnglish ? 'Be respectful and follow temple etiquette' : 'สำรวมกาย วาจา และให้เกียรติสถานที่'}</span>
            </li>
          </ul>
        </div>

        {/* Column 2: FAQ */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A43D1D]">
              <span>💬</span>
              <span>FAQ</span>
            </div>
            <Link to="/qa" className="text-xs font-bold text-[#A43D1D] hover:underline">
              {isEnglish ? 'View All FAQ →' : 'ดูคำถามทั้งหมด →'}
            </Link>
          </div>
          <h3 className="mt-2 font-serif text-base font-bold text-[#681B16]">
            {isEnglish ? 'Common Questions' : 'คำถามที่พบบ่อย'}
          </h3>
          <div className="mt-3 space-y-2 text-xs text-[#5A4B40]">
            <div className="rounded-lg bg-[#FAF2E6]/60 p-2.5">
              <strong className="block font-bold text-[#681B16]">
                {isEnglish ? 'Do I need to register in advance?' : 'ต้องลงทะเบียนล่วงหน้าหรือไม่?'}
              </strong>
              <p className="mt-0.5 text-[0.72rem]">
                {isEnglish ? 'No advance registration is needed for regular Monk Chat sessions at Wat Mahathat. For special workshops, please consult announcements or contact the team.' : 'กิจกรรม Monk Chat ประจำสัปดาห์ ณ วัดมหาธาตุ ไม่ต้องลงทะเบียนล่วงหน้า สามารถเข้าร่วมได้ทันที สำหรับกิจกรรมรอบพิเศษ กรุณาติดตามประกาศจากทีมงาน'}
              </p>
            </div>
            <div className="rounded-lg bg-[#FAF2E6]/60 p-2.5">
              <strong className="block font-bold text-[#681B16]">
                {isEnglish ? 'Is it free to join?' : 'มีค่าใช้จ่ายหรือไม่?'}
              </strong>
              <p className="mt-0.5 text-[0.72rem]">
                {isEnglish ? 'Yes, weekly Monk Chat sessions at Wat Mahathat are completely free of charge.' : 'กิจกรรม Monk Chat ณ วัดมหาธาตุ เข้าร่วมได้ฟรีโดยไม่มีค่าใช้จ่าย'}
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & Help */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A43D1D]">
            <span>📞</span>
            <span>{isEnglish ? 'Contact & Help' : 'ติดต่อสอบถาม'}</span>
          </div>
          <h3 className="mt-2 font-serif text-base font-bold text-[#681B16]">
            {isEnglish ? 'Need Assistance?' : 'ต้องการข้อมูลเพิ่มเติม?'}
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#5A4B40]">
            {isEnglish
              ? 'Have a question about your visit? Student monks and the team are happy to guide you.'
              : 'มีคำถามเกี่ยวกับการเข้าร่วมกิจกรรม พระนิสิตและทีมงานยินดีให้คำแนะนำ'}
          </p>
          <div className="mt-4 pt-2 space-y-2">
            <Link
              to="/activities"
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-4 text-xs font-bold text-[#A43D1D] transition hover:bg-[#FDF4E3]"
            >
              <span>{isEnglish ? 'View Full Activities →' : 'ดูกิจกรรมทั้งหมด →'}</span>
            </Link>
            <Link
              to="/qa"
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#8E3317]"
            >
              <span>{isEnglish ? 'Ask via Q&A' : 'ถามคำถามผ่านหน้า Q&A'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. COLLAPSIBLE ACADEMIC PROJECT INFORMATION & CREDITS */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
        <button
          type="button"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          aria-expanded={isAboutExpanded}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF4E3] text-[#A43D1D]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#681B16] sm:text-lg">
                {isEnglish ? 'About MonkChat Guide & Research Context' : 'เกี่ยวกับโครงการวิจัย MonkChat Guide'}
              </h2>
              <p className="text-xs text-[#7D6B5D]">
                {isEnglish
                  ? 'Academic background, research purpose, and university collaboration'
                  : 'ข้อมูลวิชาการ วัตถุประสงค์การบริการสังคม และความร่วมมือมหาวิทยาลัย มจร'}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-[#A43D1D]">
            {isAboutExpanded ? '▲' : '▼'}
          </span>
        </button>

        {isAboutExpanded && (
          <div className="mt-4 border-t border-[#EADCC6]/80 pt-4 text-xs leading-6 text-[#5A4B40] space-y-3">
            <p>
              {isEnglish
                ? 'MonkChat Guide is a Progressive Web Application (PWA) developed to assist student monks and international visitors during Monk Chat sessions in Ayutthaya. The project provides accessible meditation guidance, synchronized subtitles, verified Dhamma answers, and directories to meditation centers.'
                : 'MonkChat Guide คือเว็บแอปพลิเคชันแบบ Progressive Web Application (PWA) ที่พัฒนาขึ้นเพื่ออำนวยความสะดวกแก่พระนิสิตและผู้มาเยือนชาวต่างชาติ ในกิจกรรม Monk Chat ณ จังหวัดพระนครศรีอยุธยา โดยมุ่งเน้นการเปิดสื่อนำนั่งสมาธิ คำบรรยายประกอบ คำตอบธรรมะที่ผ่านการตรวจรับรอง และข้อมูลศูนย์ปฏิบัติธรรม'}
            </p>
            <div className="rounded-xl bg-[#FAF2E6]/60 p-3.5 border border-[#EADCC6]/60 space-y-1">
              <strong className="block text-[#681B16] font-bold">
                {isEnglish ? 'Project Principles:' : 'หลักการพัฒนาและจริยธรรม:'}
              </strong>
              <p>• {isEnglish ? 'Zero Budget Policy (0 THB) using free-tier cloud infrastructure.' : 'นโยบาย 0 บาท โดยใช้บริการคลาวด์ระดับฟรีทั้งหมด (Supabase Free & Cloudflare Pages Free)'}</p>
              <p>• {isEnglish ? 'Verified Content Only: Public Q&A is strictly based on approved answers, avoiding generative AI hallucinations.' : 'คลังข้อมูลที่ผ่านการรับรอง: ส่วนถาม-ตอบสาธารณะไม่ใช้ AI ที่แต่งคำตอบเอง เพื่อป้องกันความคลาดเคลื่อนทางพระธรรมวินัย'}</p>
              <p>• {isEnglish ? 'Under academic collaboration with Mahachulalongkornrajavidyalaya University (MCU).' : 'อยู่ภายใต้การสนับสนุนทางวิชาการและการบริการสังคมของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)'}</p>
            </div>
            <p className="text-[0.7rem] text-[#7D6B5D]">
              {t('app.footer')} · Ayutthaya, Thailand
            </p>
          </div>
        )}
      </section>
      </div>
    </div>
  )
}

function GuideLinkRow({ to, title, description, icon }: { to: string; title: string; description: string; icon: ReactNode }) {
  return (
    <Link to={to} className="group flex items-center gap-3 py-3 transition hover:text-[#A43D1D]">
      <span className="text-[#A43D1D]">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-xs font-bold text-[#681B16] sm:text-sm group-hover:text-[#A43D1D]">{title}</strong>
        <small className="block truncate text-[0.68rem] text-[#7D6B5D]">{description}</small>
      </span>
      <span className="text-sm font-bold text-[#D5BD94] transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-xs text-[#7D6B5D]" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#A43D1D]/20 border-t-[#A43D1D]" />
      {label}
    </div>
  )
}

function ErrorState({ message, retryLabel, onRetry }: {
  message: string
  retryLabel: string
  onRetry: () => Promise<void>
}) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-xs font-semibold text-red-800">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-2 rounded-lg bg-[#A43D1D] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#8E3317]"
      >
        {retryLabel}
      </button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-[#EADCC6] bg-[#FFF8EE] p-5 text-center text-xs text-[#7D6B5D]">
      {message}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9.5a4 4 0 117.2 2.4c-1.2 1.6-3.2 1.7-3.2 3.6m0 3h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1114 0z" />
      <circle cx="12" cy="10" r="2.5" strokeWidth={1.8} />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 13a5 5 0 007.54.54l2-2a5 5 0 00-7.07-7.07l-1.15 1.14m2.68 5.38a5 5 0 00-7.54-.54l-2 2a5 5 0 007.07 7.07l1.14-1.14" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#B77A24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 5h5m0 0v5m0-5l-8 8m-2-6H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" />
    </svg>
  )
}
