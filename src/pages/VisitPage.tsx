import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import { LanguageGate } from '../components/LanguageGate'
import { GuideIcon } from '../components/GuideIcon'
import { MeditationGuideVisual } from '../components/MeditationGuideVisual'
import { preparationCards } from '../content/meditationGuide'
import { practiceDestinations } from '../content/continuePractice'
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

function VisitorHome({ currentLang }: { currentLang: AppLanguage }) {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
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
      width: 560,
      height: 315,
    },
    {
      title: isEnglish ? 'Short meditation' : 'ฝึกสมาธิเบื้องต้น',
      desc: isEnglish ? 'A simple, guided meditation to help you relax and be present.' : 'สมาธิสั้น 5-10 นาที ช่วยผ่อนคลายและสร้างสติรู้ตัว',
      img: '/images/home/monkchat-meditation-hero.webp',
      width: 1672,
      height: 941,
    },
    {
      title: isEnglish ? 'Q&A' : 'ถาม-ตอบข้อสงสัย',
      desc: isEnglish ? 'Ask questions about Buddhism, daily life, and practical wisdom.' : 'ซักถามข้อสงสัยเกี่ยวกับวิถีพุทธและหลักธรรมนำมาปรับใช้',
      img: '/images/home/monkchat-slide-2.webp',
      width: 560,
      height: 315,
    },
    {
      title: isEnglish ? 'Photo souvenir' : 'ภาพความทรงจำ',
      desc: isEnglish ? 'Capture a meaningful memory at the historic Ayutthaya site.' : 'เก็บภาพความประทับใจและความทรงจำอันทรงคุณค่า ณ เมืองประวัติศาสตร์',
      img: '/images/home/monkchat-slide-4.webp',
      width: 560,
      height: 315,
    },
  ]

  const atmosphereMoments = [
    {
      title: isEnglish ? 'Warm cultural exchange under the trees' : 'แลกเปลี่ยนเรียนรู้ท่ามกลางธรรมชาติในวัดมหาธาตุ',
      caption: isEnglish
        ? 'Real open-air conversations with MCU student monks where visitors can ask about Thai monastic life, mindfulness, and practical Buddhism.'
        : 'บรรยากาศสนทนาธรรมจริงใต้ร่มไม้ภายในวัดมหาธาตุ พูดคุยซักถามวิถีพระสงฆ์ วัฒนธรรมไทย และแนวคิดความสุขอย่างเป็นกันเอง',
      img: '/images/home/monkchat-slide-3.webp',
      width: 560,
      height: 315,
    },
    {
      title: isEnglish ? 'Shaded ruins & accessible stillness' : 'ความสงบเรียบง่ายที่เริ่มต้นได้ทุกคน',
      caption: isEnglish
        ? 'Rest among Ayutthaya heritage grounds with five to ten minutes of gentle breathing and center-of-body stillness—no prior experience required.'
        : 'พักใจท่ามกลางโบราณสถานอยุธยาด้วยสมาธิเบื้องต้น 5–10 นาที เหมาะสำหรับผู้เริ่มต้นทุกเชื้อชาติและทุกความเชื่อ',
      img: '/images/home/monkchat-meditation-field.webp',
      width: 1672,
      height: 941,
    },
  ]

  const easyMeditationPreview = preparationCards[currentLang].slice(0, 3)

  const mapUrl = 'https://maps.google.com/?q=Wat+Mahathat+Ayutthaya'

  return (
    <div className="bg-brand-cream text-brand-text break-words [overflow-wrap:anywhere]">
      <HomeHeroIntro language={currentLang} activePath="/" />
      <div className="mx-auto w-full max-w-[76rem] space-y-12 px-4 pb-12 pt-6 sm:space-y-16 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
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

      <section
        aria-label={isEnglish ? 'Student monk training portal' : 'มุมฝึกพระนิสิต'}
        className="flex flex-col gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold-soft/75 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand-gold">
            {isEnglish ? 'For MCU student monks' : 'สำหรับพระนิสิต มจร'}
          </p>
          <p className="mt-0.5 text-sm font-medium leading-6 text-brand-maroon">
            {isEnglish
              ? 'Open Student Training for audio teleprompter, flashcards, and cohort practice check-in.'
              : 'เข้ามุมฝึกพระนิสิต เพื่อฝึกนำสมาธิพร้อมเสียง คำศัพท์ และลงชื่อรุ่นผู้ใช้งาน'}
          </p>
        </div>
        <Link
          to="/nisit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-brand-terracotta bg-brand-surface px-4 text-sm font-medium text-brand-terracotta transition-colors duration-150 hover:bg-brand-terracotta hover:text-white"
        >
          <span>{isEnglish ? 'Open Student Training' : 'เข้ามุมฝึกพระนิสิต'}</span>
          <GuideIcon name="arrow" />
        </Link>
      </section>

      {/* 3. LOCATION & MAP SECTION */}
      <section id="location-details" className="scroll-mt-8 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
            {isEnglish ? 'Location & map' : 'สถานที่และแผนที่'}
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            {isEnglish ? 'Monk Chat at Wat Mahathat, Ayutthaya.' : 'จุดนัดพบกิจกรรม Monk Chat ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:grid sm:grid-cols-2">
          <div className="relative h-48 w-full sm:h-full">
            <img
              src="/images/home/monkchat-meditation-ruins.webp"
              alt={isEnglish ? 'A meditation scene among Ayutthaya ruins' : 'ภาพบรรยากาศนั่งสมาธิท่ามกลางโบราณสถานอยุธยา'}
              width={1672}
              height={941}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-xs font-medium text-brand-terracotta">
                {isEnglish ? 'Meeting point' : 'จุดนัดพบ'}
              </span>
              <h3 className="mt-1 font-sans text-xl font-medium text-brand-maroon">
                {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-sm">
                {isEnglish
                  ? 'Inside the Wat Mahathat temple area, near the historic prang (central tower). Student monks are available to welcome visitors.'
                  : 'บริเวณลานร่มไม้ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน พระนิสิตพร้อมต้อนรับและสนทนาธรรม'}
              </p>
            </div>

            <div className="rounded-xl border border-brand-border bg-brand-gold-soft/60 p-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-brand-maroon">
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
              >
                <LocationIcon />
                <span>{isEnglish ? 'View map' : 'ดูแผนที่'}</span>
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-terracotta bg-brand-surface px-5 text-sm font-medium text-brand-terracotta transition-colors duration-150 hover:bg-brand-gold-soft"
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
          <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
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
              className="flex overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:flex-col"
            >
              <div className="relative w-24 shrink-0 overflow-hidden bg-brand-gold-soft sm:h-36 sm:w-full">
                <img src={item.img} alt={item.title} width={item.width} height={item.height} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-sans text-base font-medium text-brand-maroon">
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

      {/* Atmosphere showcase: authentic setting at Wat Mahathat */}
      <section aria-labelledby="visit-atmosphere-heading" className="space-y-4">
        <div>
          <h2 id="visit-atmosphere-heading" className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
            {isEnglish ? 'Atmosphere & surroundings' : 'บรรยากาศกิจกรรมและสถานที่'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'Calm open-air dialogue and beginner meditation surrounded by Ayutthaya heritage.'
              : 'สัมผัสความเรียบง่าย สงบเย็น และเป็นกันเองท่ามกลางเมืองประวัติศาสตร์พระนครศรีอยุธยา'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {atmosphereMoments.map((moment) => (
            <figure
              key={moment.title}
              className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
            >
              <div className="h-56 w-full overflow-hidden bg-brand-gold-soft">
                <img src={moment.img} alt={moment.title} width={moment.width} height={moment.height} loading="lazy" className="h-full w-full object-cover object-center" />
              </div>
              <figcaption className="p-5">
                <h3 className="font-sans text-base font-medium text-brand-maroon">{moment.title}</h3>
                <p className="mt-1 text-sm leading-6 text-brand-muted">{moment.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Easy illustrated meditation cards preview */}
      <section aria-labelledby="visit-meditation-cards-heading" className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-brand-terracotta">
              {isEnglish ? 'Simple meditation preview' : 'อธิบายสมาธิเข้าใจง่ายด้วยการ์ด'}
            </p>
            <h2 id="visit-meditation-cards-heading" className="mt-1 font-serif text-xl font-semibold text-brand-maroon sm:text-2xl">
              {isEnglish ? 'How to start in three gentle steps' : 'เริ่มต้นความสงบง่าย ๆ ใน 3 ขั้นตอน'}
            </h2>
          </div>
          <Link
            to="/meditation"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
          >
            <span>{isEnglish ? 'Open full cards & audio' : 'ดูการ์ดทั้งหมดและฟังเสียงนำ'}</span>
            <GuideIcon name="arrow" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {easyMeditationPreview.map((card, index) => (
            <article key={card.scene} className="overflow-hidden rounded-xl border border-brand-border bg-brand-cream/60 p-4">
              <div className="aspect-[16/11] w-full overflow-hidden rounded-lg">
                <MeditationGuideVisual
                  scene={card.scene}
                  still
                  label={card.title}
                  breathLabels={isEnglish ? ['Breathe in', 'Breathe out'] : ['หายใจเข้า', 'หายใจออก']}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-brand-terracotta tabular-nums">
                {isEnglish ? `Step ${index + 1}` : `ขั้นที่ ${index + 1}`}
              </p>
              <h3 className="mt-1 font-sans text-base font-medium text-brand-maroon">{card.title}</h3>
              <p className="mt-1 text-sm leading-6 text-brand-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Practice & Retreat Destinations (verified links from continuePractice.ts) */}
      <section aria-labelledby="visit-places-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="visit-places-heading" className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {isEnglish ? 'Meditation sanctuaries & places to stay' : 'สถานที่และศูนย์ปฏิบัติธรรมที่น่าสนใจ'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'If you wish to explore quiet retreat stays or multi-day programs, contact each official meditation center directly.'
                : 'หากสนใจเข้าพักปฏิบัติธรรมหรือเรียนรู้เพิ่มเติม สามารถดูข้อมูลทางการและสอบถามเวลา/เงื่อนไขจากสถานที่โดยตรง'}
            </p>
          </div>
          <Link to="/centers" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-terracotta hover:underline">
            <span>{isEnglish ? 'View all centers' : 'ดูรายชื่อศูนย์ทั้งหมด'}</span>
            <GuideIcon name="arrow" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {practiceDestinations.map((dest) => {
            const copy = dest[currentLang]
            return (
              <article key={dest.id} className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-terracotta">
                    <GuideIcon name={dest.icon} />
                    <span>{isEnglish ? 'Official center' : 'ศูนย์ทางการ'}</span>
                  </div>
                  <h3 className="mt-2 font-sans text-lg font-medium text-brand-maroon">{copy.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{copy.description}</p>
                </div>
                <a
                  href={dest.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-border-dark bg-brand-cream px-4 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
                >
                  <span>{copy.action}</span>
                  <ExternalLinkIcon />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      {/* Recommended meditation and resources */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="recommended-heading" className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
          <p className="text-xs font-medium text-brand-terracotta">
            {isEnglish ? 'Recommended for you' : t('visitor.recommendedTag')}
          </p>
          <h2 id="recommended-heading" className="mt-1 font-serif text-xl font-semibold text-brand-maroon sm:text-2xl">
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
              <div className="rounded-xl border border-brand-border bg-brand-gold-soft/60 p-5">
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
                              ? 'bg-brand-terracotta text-white'
                              : 'bg-white border border-brand-border text-brand-maroon hover:bg-brand-gold-soft'
                          }`}
                        >
                          {translation?.title}
                        </button>
                      )
                    })}
                  </div>
                )}
                <h3 className="font-sans text-lg font-medium text-brand-maroon">{selectedTranslation.title}</h3>
                {selectedTranslation.description && (
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{selectedTranslation.description}</p>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-sm font-medium text-brand-muted tabular-nums">
                    {Math.max(1, Math.round(selectedTrack.duration_seconds / 60))} {t('meditation.minutes')} · {selectedTrack.source_language_code?.toUpperCase()}
                  </span>
                  <Link
                    to={`/meditation?trackId=${selectedTrack.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
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
        <section aria-labelledby="bio-links-heading" className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
          <h2 id="bio-links-heading" className="font-serif text-base font-semibold text-brand-maroon">
            {t('visitor.chooseTitle')}
          </h2>
          <div className="mt-3 divide-y divide-brand-border/60">
            <GuideLinkRow to="/qa" title={t('visitor.qaTitle')} description={t('visitor.qaDesc')} icon={<QuestionIcon />} />
            <GuideLinkRow to="/centers" title={t('visitor.centersTitle')} description={t('visitor.centersDesc')} icon={<LocationIcon />} />
            <GuideLinkRow to="/meditation" title={t('visitor.meditationTitle')} description={t('visitor.meditationDesc')} icon={<PlayIcon />} />
          </div>

          {areLinksLoading ? (
            <LoadingState label={t('home.loadingLinks')} />
          ) : linksError ? (
            <ErrorState message={linksError} onRetry={fetchBioLinks} retryLabel={t('home.retry')} />
          ) : bioLinks.length > 0 ? (
            <div className="mt-4 grid gap-2 border-t border-brand-border/60 pt-4">
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
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                  >
                    {imageUrl ? <img src={imageUrl} alt="" width={16} height={16} className="h-4 w-4 rounded-full object-cover" /> : <LinkIcon />}
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
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="flex items-start gap-2 text-sm font-medium text-brand-terracotta">
            <GuideIcon name="clipboard" />
            <span>{isEnglish ? 'Before you come' : 'ข้อควรทราบก่อนมา'}</span>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-brand-maroon">
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
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 text-sm font-medium text-brand-terracotta">
              <GuideIcon name="question" />
              <span>FAQ</span>
            </div>
            <Link to="/qa" className="inline-flex min-h-11 items-center text-sm font-medium text-brand-terracotta hover:underline">
              {isEnglish ? 'View all FAQ →' : 'ดูคำถามทั้งหมด →'}
            </Link>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-brand-maroon">
            {isEnglish ? 'Common questions' : 'คำถามที่พบบ่อย'}
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
            <div className="rounded-lg bg-brand-gold-soft/60 p-3">
              <strong className="block font-medium text-brand-maroon">
                {isEnglish ? 'Do I need to register in advance?' : 'ต้องลงทะเบียนล่วงหน้าหรือไม่?'}
              </strong>
              <p className="mt-2 text-sm leading-6">
                {isEnglish ? 'No advance registration is needed for regular Monk Chat sessions at Wat Mahathat. For special workshops, please consult announcements or contact the team.' : 'กิจกรรม Monk Chat ประจำสัปดาห์ ณ วัดมหาธาตุ ไม่ต้องลงทะเบียนล่วงหน้า สามารถเข้าร่วมได้ทันที สำหรับกิจกรรมรอบพิเศษ กรุณาติดตามประกาศจากทีมงาน'}
              </p>
            </div>
            <div className="rounded-lg bg-brand-gold-soft/60 p-3">
              <strong className="block font-medium text-brand-maroon">
                {isEnglish ? 'Is it free to join?' : 'มีค่าใช้จ่ายหรือไม่?'}
              </strong>
              <p className="mt-2 text-sm leading-6">
                {isEnglish ? 'Yes, weekly Monk Chat sessions at Wat Mahathat are completely free of charge.' : 'กิจกรรม Monk Chat ณ วัดมหาธาตุ เข้าร่วมได้ฟรีโดยไม่มีค่าใช้จ่าย'}
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Contact & help */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="flex items-start gap-2 text-sm font-medium text-brand-terracotta">
            <GuideIcon name="chat" />
            <span>{isEnglish ? 'Contact & help' : 'ติดต่อสอบถาม'}</span>
          </div>
          <h3 className="mt-2 font-sans text-base font-medium text-brand-maroon">
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
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-terracotta bg-brand-surface px-4 text-sm font-medium text-brand-terracotta transition-colors duration-150 hover:bg-brand-gold-soft"
            >
              <span>{isEnglish ? 'View all activities →' : 'ดูกิจกรรมทั้งหมด →'}</span>
            </Link>
            <Link
              to="/qa"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white hover:bg-brand-terracotta-dark"
            >
              <span>{isEnglish ? 'Ask via Q&A' : 'ถามคำถามผ่านหน้า Q&A'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-border bg-brand-surface p-5">
        <h2 className="font-serif text-lg font-semibold text-brand-maroon">{isEnglish ? 'About Ayutthaya Monk Chat' : 'รู้จัก Ayutthaya Monk Chat'}</h2>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{isEnglish ? 'Meet student monks, ask questions about Buddhism, and try a short guided meditation at Wat Mahathat, Ayutthaya. MonkChat Guide helps you prepare and explore more after your visit.' : 'พบปะพระนิสิต สนทนาเรื่องพระพุทธศาสนา และลองนั่งสมาธิสั้น ๆ ณ วัดมหาธาตุ พระนครศรีอยุธยา ใช้ MonkChat Guide เตรียมตัวก่อนร่วมกิจกรรม และเรียนรู้ต่อหลังการเยี่ยมชม'}</p>
      </section>
      </div>
    </div>
  )
}

function GuideLinkRow({ to, title, description, icon }: { to: string; title: string; description: string; icon: ReactNode }) {
  return (
    <Link to={to} className="group flex min-h-16 items-start gap-3 rounded-lg py-4 transition-colors duration-150 hover:text-brand-terracotta">
      <span className="mt-1 text-brand-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-medium text-brand-maroon sm:text-sm group-hover:text-brand-terracotta">{title}</strong>
        <small className="mt-1 block text-sm leading-6 text-brand-muted">{description}</small>
      </span>
      <span aria-hidden="true" className="text-brand-muted">→</span>
    </Link>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-sm text-brand-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-terracotta/20 border-t-brand-terracotta" />
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
    <div className="mt-3 rounded-xl border border-dashed border-brand-border bg-brand-cream p-5 text-center text-sm leading-6 text-brand-muted">
      {message}
    </div>
  )
}

function PlayIcon() { return <GuideIcon name="play" /> }
function QuestionIcon() { return <GuideIcon name="question" /> }
function LocationIcon() { return <GuideIcon name="pin" /> }
function LinkIcon() { return <GuideIcon name="link" /> }
function ExternalLinkIcon() { return <GuideIcon name="external" /> }
