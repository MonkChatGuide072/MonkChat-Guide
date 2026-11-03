import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import { GuideIcon } from '../components/GuideIcon'
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
    <main className="min-h-screen bg-brand-cream px-4 py-8 text-brand-text sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-3" aria-label="อยุธยา มังค์แชท / Ayutthaya Monk Chat">
          <img src="/images/logo/ayutthaya-monk-chat-logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          <span className="text-sm font-medium leading-6 text-brand-maroon">อยุธยา มังค์แชท<br /><span lang="en" className="text-brand-muted">Ayutthaya Monk Chat</span></span>
        </Link>
        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:mt-12 lg:grid lg:grid-cols-2">
          <div>
            <img src="/images/home/monkchat-meditation-ruins.webp" alt="พระสงฆ์และผู้มาเยือนนั่งสมาธิท่ามกลางโบราณสถานอยุธยา / A monk and visitors meditating in Ayutthaya" width={1672} height={941} className="h-48 w-full object-cover sm:h-64 lg:h-full" />
          </div>
          <section aria-labelledby="language-gate-title" className="p-6 sm:p-8">
            <GuideIcon name="globe" className="h-6 w-6 text-brand-muted" />
            <h1 id="language-gate-title" className="mt-4 text-2xl font-semibold leading-snug text-brand-maroon">เลือกภาษา / Choose language</h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">เลือกภาษาสำหรับการเข้าชมครั้งนี้<br /><span lang="en">Choose the language for this visit</span></p>
            <div className="mt-6 grid gap-3">
              <button type="button" onClick={() => onSelect('th')} aria-label="ภาษาไทย" className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg bg-brand-terracotta px-4 py-3 text-left text-white transition-colors duration-150 hover:bg-brand-terracotta-dark">
                <span className="font-medium">ภาษาไทย</span><span lang="en" className="text-sm">Thai</span><GuideIcon name="arrow" />
              </button>
              <button type="button" onClick={() => onSelect('en')} aria-label="English" className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-left text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft">
                <span lang="en" className="font-medium">English</span><span className="text-sm">ภาษาอังกฤษ</span><GuideIcon name="arrow" />
              </button>
            </div>
            <p className="mt-6 border-t border-brand-border pt-4 text-sm leading-6 text-brand-muted">ร่วมสนทนาธรรมและฝึกสมาธิ ณ วัดมหาธาตุ พระนครศรีอยุธยา<br /><span lang="en">Monk Chat and guided meditation at Wat Mahathat, Ayutthaya</span></p>
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
      title: isEnglish ? 'Meet the monks' : 'พบและสนทนากับพระสงฆ์',
      desc: isEnglish ? 'Have an open, respectful conversation about Buddhist life and mindfulness.' : 'สนทนาธรรมและแลกเปลี่ยนมุมมองชีวิตกับพระนิสิตอย่างเป็นกันเอง',
      img: '/images/home/monkchat-slide-1.webp',
    },
    {
      title: isEnglish ? 'Short meditation' : 'ฝึกสมาธิเบื้องต้น',
      desc: isEnglish ? 'A simple, guided meditation to help you relax and be present.' : 'สมาธิสั้น 5-10 นาที ช่วยผ่อนคลายและสร้างสติรู้ตัว',
      img: '/images/home/monkchat-meditation-hero.webp',
    },
    {
      title: isEnglish ? 'Q&A' : 'ถาม-ตอบข้อสงสัย',
      desc: isEnglish ? 'Ask questions about Buddhism, daily life, and practical wisdom.' : 'ซักถามข้อสงสัยเกี่ยวกับวิถีพุทธและหลักธรรมนำมาปรับใช้',
      img: '/images/home/monkchat-slide-2.webp',
    },
    {
      title: isEnglish ? 'Photo souvenir' : 'ภาพความทรงจำ',
      desc: isEnglish ? 'Capture a meaningful memory at the historic Ayutthaya site.' : 'เก็บภาพความประทับใจและความทรงจำอันทรงคุณค่า ณ เมืองประวัติศาสตร์',
      img: '/images/home/monkchat-slide-4.webp',
    },
  ]

  const mapUrl = 'https://maps.google.com/?q=Wat+Mahathat+Ayutthaya'

  return (
    <div className="bg-brand-cream text-brand-text break-words [overflow-wrap:anywhere]">
      <HomeHeroIntro language={currentLang} />
      <div className="mx-auto w-full max-w-[76rem] space-y-12 px-4 pb-24 pt-6 sm:space-y-16 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
      <section aria-label="Activity schedule and location summary" className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
          {([
            { icon: 'calendar', value: isEnglish ? 'Mon & Fri' : 'จันทร์ และ ศุกร์', label: isEnglish ? 'Meditation sessions' : 'กิจกรรมนำสมาธิ' },
            { icon: 'clock', value: isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป', label: isEnglish ? 'Starting time' : 'เวลาเริ่มกิจกรรม' },
            { icon: 'hourglass', value: isEnglish ? '5–10 min' : '5–10 นาที', label: isEnglish ? 'Guided session' : 'ระยะเวลานำสมาธิ' },
            { icon: 'pin', value: isEnglish ? 'Ayutthaya' : 'พระนครศรีอยุธยา', label: isEnglish ? 'Wat Mahathat' : 'วัดมหาธาตุ' },
          ] as const).map(item => <div key={item.icon} className="flex min-w-0 items-start gap-2 sm:gap-3">
            <GuideIcon name={item.icon} className="mt-1 h-[18px] w-[18px] text-brand-muted" />
            <div className="min-w-0">
              <dt className="text-xs leading-5 text-brand-muted">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium leading-6 text-brand-text tabular-nums">
                {item.icon === 'clock' ? <><span className="whitespace-nowrap">{isEnglish ? '13:15' : '13:15 น.'}</span>{' '}<span className="whitespace-nowrap">{isEnglish ? 'onwards' : 'เป็นต้นไป'}</span></> : item.value}
              </dd>
            </div>
          </div>)}
        </dl>
      </section>

      {/* 3. LOCATION & MAP SECTION */}
      <section id="location-details" className="scroll-mt-8 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'Location & map' : 'สถานที่และแผนที่'}
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            {isEnglish ? 'Monk Chat at Wat Mahathat, Ayutthaya.' : 'จุดนัดพบกิจกรรม Monk Chat ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] sm:grid sm:grid-cols-2">
          <div className="relative h-48 w-full sm:h-full">
            <img
              src="/images/home/monkchat-meditation-ruins.webp"
              alt={isEnglish ? 'A meditation scene among Ayutthaya ruins' : 'ภาพบรรยากาศนั่งสมาธิท่ามกลางโบราณสถานอยุธยา'} loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-xs font-medium text-[#A43D1D]">
                {isEnglish ? 'Meeting point' : 'จุดนัดพบ'}
              </span>
              <h3 className="mt-1 font-sans text-xl font-medium text-[#681B16]">
                {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-sm">
                {isEnglish
                  ? 'Inside the Wat Mahathat temple area, near the historic prang (central tower). Student monks are available to welcome visitors.'
                  : 'บริเวณลานร่มไม้ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน พระนิสิตพร้อมต้อนรับและสนทนาธรรม'}
              </p>
            </div>

            <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-[#681B16]">
                <GuideIcon name="pin" />
                <span>{isEnglish ? 'Wat Mahathat (near central prang), Ayutthaya' : 'จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา'}</span>
              </div>
              <div className="flex items-start gap-2 text-sm leading-6 text-brand-muted">
                <GuideIcon name="clock" />
                <span>{isEnglish ? 'Every Monday & Friday from 13:15 onwards' : 'ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป'}</span>
              </div>
              <p className="text-sm leading-6 text-brand-muted">
                {isEnglish
                  ? 'Open Google Maps for the meeting point and directions.'
                  : 'ข้อมูลสถานที่เบื้องต้น สำหรับการนำทางจริงกรุณากด "ดูแผนที่" หรือ "ขอเส้นทาง" เพื่อเปิด Google Maps'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8E3317]"
              >
                <LocationIcon />
                <span>{isEnglish ? 'View map' : 'ดูแผนที่'}</span>
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-5 text-sm font-medium text-[#A43D1D] transition-colors duration-150 hover:bg-[#FDF4E3]"
              >
                <GuideIcon name="directions" />
                <span>{isEnglish ? 'Get directions' : 'ขอเส้นทาง'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT TO EXPECT SECTION */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'What to expect' : 'สิ่งที่จะได้สัมผัสในกิจกรรม'}
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'A friendly and meaningful experience to learn, reflect, and connect.'
              : 'ประสบการณ์อันทรงคุณค่าเพื่อเรียนรู้ สงบใจ และแลกเปลี่ยนอย่างเป็นมิตร'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whatToExpect.map((item) => (
            <div
              key={item.title}
              className="flex overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] sm:flex-col"
            >
              <div className="relative w-24 shrink-0 overflow-hidden bg-[#FAF2E6] sm:h-36 sm:w-full">
                <img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-sans text-base font-medium text-[#681B16]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended meditation and resources */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="recommended-heading" className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 sm:p-6">
          <p className="text-xs font-medium text-[#A43D1D]">
            {isEnglish ? 'Recommended for you' : t('visitor.recommendedTag')}
          </p>
          <h2 id="recommended-heading" className="mt-1 font-serif text-xl font-semibold text-[#681B16] sm:text-2xl">
            {t('visitor.recommendedTitle')}
          </h2>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
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
                          className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer ${
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
                <h3 className="font-sans text-lg font-medium text-[#681B16]">{selectedTranslation.title}</h3>
                {selectedTranslation.description && (
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{selectedTranslation.description}</p>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-sm font-medium text-brand-muted tabular-nums">
                    {Math.max(1, Math.round(selectedTrack.duration_seconds / 60))} {t('meditation.minutes')} · {selectedTrack.source_language_code?.toUpperCase()}
                  </span>
                  <Link
                    to={`/meditation?trackId=${selectedTrack.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#A43D1D] px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8E3317]"
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
        <section aria-labelledby="bio-links-heading" className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 sm:p-6">
          <h2 id="bio-links-heading" className="font-serif text-base font-semibold text-[#681B16]">
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
            <div className="mt-4 grid gap-2 border-t border-[#EADCC6]/60 pt-4">
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
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#EADCC6] bg-brand-surface px-3 text-sm font-medium text-[#681B16] hover:bg-[#FDF4E3]"
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
        {/* Column 1: Before you come */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5">
          <div className="flex items-start gap-2 text-sm font-medium text-[#A43D1D]">
            <GuideIcon name="clipboard" />
            <span>{isEnglish ? 'Before you come' : 'ข้อควรทราบก่อนมา'}</span>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-[#681B16]">
            {isEnglish ? 'Visitor etiquette' : 'การปฏิบัติตนในวัด'}
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
            <li className="flex items-start gap-2">
              <GuideIcon name="check" className="mt-1 h-[18px] w-[18px] text-brand-muted" />
              <span>{isEnglish ? 'Check the schedule (Mon & Fri, 13:15)' : 'ตรวจสอบตารางเวลา (จันทร์และศุกร์ 13:15 น.)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <GuideIcon name="check" className="mt-1 h-[18px] w-[18px] text-brand-muted" />
              <span>{isEnglish ? 'Dress modestly (shoulders & knees covered)' : 'แต่งกายสุภาพ (คลุมไหล่และเข่า)'}</span>
            </li>
            <li className="flex items-start gap-2">
              <GuideIcon name="check" className="mt-1 h-[18px] w-[18px] text-brand-muted" />
              <span>{isEnglish ? 'Arrive a few minutes early' : 'มาถึงก่อนเวลากิจกรรมเล็กน้อย'}</span>
            </li>
            <li className="flex items-start gap-2">
              <GuideIcon name="check" className="mt-1 h-[18px] w-[18px] text-brand-muted" />
              <span>{isEnglish ? 'Be respectful and follow temple etiquette' : 'สำรวมกาย วาจา และให้เกียรติสถานที่'}</span>
            </li>
          </ul>
        </div>

        {/* Column 2: FAQ */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 text-sm font-medium text-[#A43D1D]">
              <GuideIcon name="question" />
              <span>FAQ</span>
            </div>
            <Link to="/qa" className="text-sm font-medium text-[#A43D1D] hover:underline">
              {isEnglish ? 'View all FAQ →' : 'ดูคำถามทั้งหมด →'}
            </Link>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-[#681B16]">
            {isEnglish ? 'Common questions' : 'คำถามที่พบบ่อย'}
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
            <div className="rounded-lg bg-[#FAF2E6]/60 p-3">
              <strong className="block font-medium text-[#681B16]">
                {isEnglish ? 'Do I need to register in advance?' : 'ต้องลงทะเบียนล่วงหน้าหรือไม่?'}
              </strong>
              <p className="mt-2 text-sm leading-6">
                {isEnglish ? 'No advance registration is needed for regular Monk Chat sessions at Wat Mahathat. For special workshops, please consult announcements or contact the team.' : 'กิจกรรม Monk Chat ประจำสัปดาห์ ณ วัดมหาธาตุ ไม่ต้องลงทะเบียนล่วงหน้า สามารถเข้าร่วมได้ทันที สำหรับกิจกรรมรอบพิเศษ กรุณาติดตามประกาศจากทีมงาน'}
              </p>
            </div>
            <div className="rounded-lg bg-[#FAF2E6]/60 p-3">
              <strong className="block font-medium text-[#681B16]">
                {isEnglish ? 'Is it free to join?' : 'มีค่าใช้จ่ายหรือไม่?'}
              </strong>
              <p className="mt-2 text-sm leading-6">
                {isEnglish ? 'Yes, weekly Monk Chat sessions at Wat Mahathat are completely free of charge.' : 'กิจกรรม Monk Chat ณ วัดมหาธาตุ เข้าร่วมได้ฟรีโดยไม่มีค่าใช้จ่าย'}
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & help */}
        <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5">
          <div className="flex items-start gap-2 text-sm font-medium text-[#A43D1D]">
            <GuideIcon name="chat" />
            <span>{isEnglish ? 'Contact & help' : 'ติดต่อสอบถาม'}</span>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-[#681B16]">
            {isEnglish ? 'Need assistance?' : 'ต้องการข้อมูลเพิ่มเติม?'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'Have a question about your visit? Student monks and the team are happy to guide you.'
              : 'มีคำถามเกี่ยวกับการเข้าร่วมกิจกรรม พระนิสิตและทีมงานยินดีให้คำแนะนำ'}
          </p>
          <div className="mt-4 pt-2 space-y-2">
            <Link
              to="/activities"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-4 text-sm font-medium text-[#A43D1D] transition-colors duration-150 hover:bg-[#FDF4E3]"
            >
              <span>{isEnglish ? 'View all activities →' : 'ดูกิจกรรมทั้งหมด →'}</span>
            </Link>
            <Link
              to="/qa"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-4 text-sm font-medium text-white hover:bg-[#8E3317]"
            >
              <span>{isEnglish ? 'Ask via Q&A' : 'ถามคำถามผ่านหน้า Q&A'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. COLLAPSIBLE ACADEMIC PROJECT INFORMATION & CREDITS */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5">
        <button
          type="button"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          aria-expanded={isAboutExpanded}
          aria-controls="home-project-details" className="flex min-h-11 w-full cursor-pointer items-start justify-between gap-4 text-left"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-brand-muted">
              <GuideIcon name="info" />
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold text-[#681B16] sm:text-lg">
                {isEnglish ? 'About MonkChat Guide and the research' : 'เกี่ยวกับโครงการวิจัย MonkChat Guide'}
              </h2>
              <p className="text-sm leading-6 text-brand-muted">
                {isEnglish
                  ? 'Academic background, research purpose, and university collaboration'
                  : 'ข้อมูลวิชาการ วัตถุประสงค์การบริการสังคม และความร่วมมือมหาวิทยาลัย มจร'}
              </p>
            </div>
          </div>
          <GuideIcon name="down" className={`mt-1 h-[18px] w-[18px] text-brand-muted transition-transform duration-150 ${isAboutExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isAboutExpanded && (
          <div id="home-project-details" className="mt-4 border-t border-[#EADCC6]/80 pt-4 text-sm leading-6 text-brand-muted space-y-3">
            <p>
              {isEnglish
                ? 'MonkChat Guide is a Progressive Web Application (PWA) developed to assist student monks and international visitors during Monk Chat sessions in Ayutthaya. The project provides meditation audio with transcripts and subtitles where available, published Dhamma answers, and meditation center information.'
                : 'MonkChat Guide คือเว็บแอปพลิเคชันแบบ Progressive Web Application (PWA) ที่พัฒนาขึ้นเพื่ออำนวยความสะดวกแก่พระนิสิตและผู้มาเยือนชาวต่างชาติ ในกิจกรรม Monk Chat ณ จังหวัดพระนครศรีอยุธยา โดยมุ่งเน้นการเปิดสื่อนำนั่งสมาธิ คำบรรยายประกอบ คำตอบธรรมะที่ผ่านการตรวจรับรอง และข้อมูลศูนย์ปฏิบัติธรรม'}
            </p>
            <div className="rounded-xl bg-[#FAF2E6]/60 p-4 border border-[#EADCC6]/60 space-y-1">
              <strong className="block text-[#681B16] font-medium">
                {isEnglish ? 'Project Principles:' : 'หลักการพัฒนาและจริยธรรม:'}
              </strong>
              <p>• {isEnglish ? 'Zero Budget Policy (0 THB) using free-tier cloud infrastructure.' : 'นโยบาย 0 บาท โดยใช้บริการคลาวด์ระดับฟรีทั้งหมด (Supabase Free & Cloudflare Pages Free)'}</p>
              <p>• {isEnglish ? 'Verified Content Only: Public Q&A is strictly based on approved answers, avoiding generative AI hallucinations.' : 'คลังข้อมูลที่ผ่านการรับรอง: ส่วนถาม-ตอบสาธารณะไม่ใช้ AI ที่แต่งคำตอบเอง เพื่อป้องกันความคลาดเคลื่อนทางพระธรรมวินัย'}</p>
              <p>• {isEnglish ? 'Under academic collaboration with Mahachulalongkornrajavidyalaya University (MCU).' : 'อยู่ภายใต้การสนับสนุนทางวิชาการและการบริการสังคมของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)'}</p>
            </div>
            <p className="text-sm leading-6 text-brand-muted">
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
    <Link to={to} className="group flex min-h-16 items-start gap-3 rounded-lg py-4 transition-colors duration-150 hover:text-[#A43D1D]">
      <span className="mt-1 text-brand-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-medium text-[#681B16] sm:text-sm group-hover:text-[#A43D1D]">{title}</strong>
        <small className="mt-1 block text-sm leading-6 text-brand-muted">{description}</small>
      </span>
      <span aria-hidden="true" className="text-brand-muted">→</span>
    </Link>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-sm text-brand-muted" role="status">
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
      <p className="text-sm font-semibold text-red-800">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-3 min-h-11 cursor-pointer rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
      >
        {retryLabel}
      </button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-[#EADCC6] bg-[#FFF8EE] p-5 text-center text-sm leading-6 text-brand-muted">
      {message}
    </div>
  )
}

function PlayIcon() { return <GuideIcon name="play" /> }
function QuestionIcon() { return <GuideIcon name="question" /> }
function LocationIcon() { return <GuideIcon name="pin" /> }
function LinkIcon() { return <GuideIcon name="link" /> }
function ExternalLinkIcon() { return <GuideIcon name="external" /> }
