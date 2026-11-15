import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import { LanguageGate } from '../components/LanguageGate'
import { GuideIcon } from '../components/GuideIcon'
import { OfficialContactBanner } from '../components/OfficialContactBanner'
import {
  normalizeLanguage,
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
  type AppLanguage,
} from '../lib/language'

export function VisitPage() {
  const { i18n } = useTranslation()
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY) != null,
  )
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
  const { i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')

  const whatToExpect = [
    {
      title: isEnglish ? 'Meet the monks' : 'พบและสนทนากับพระสงฆ์',
      desc: isEnglish
        ? 'Have an open, friendly conversation. Ask anything about monastic life, Thai culture, and finding calm.'
        : 'พูดคุยอย่างเปิดใจ เหมือนมีเพื่อนรับฟัง ถามได้ทุกเรื่องที่สงสัยเกี่ยวกับชีวิตพระ วัฒนธรรม หรือการปล่อยวางความเครียด',
      img: '/images/home/monkchat-meet-monks.jpg',
      width: 452,
      height: 678,
      imageClassName: 'object-[center_62%]',
    },
    {
      title: isEnglish ? 'Short meditation' : 'ฝึกสมาธิเบื้องต้น',
      desc: isEnglish
        ? 'A gentle 5–10 minute breathing pause. Seated comfortably on chairs under shade trees—no experience needed.'
        : 'สมาธิสั้น 5–10 นาที นั่งเก้าอี้สบายๆ ใต้ร่มไม้ใหญ่ หลับตาเบาๆ ผ่อนคลายร่างกาย และสร้างสติรู้ตัว',
      img: '/images/home/monkchat-real-meditation.jpg',
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_28%]',
    },
    {
      title: isEnglish ? 'Q&A' : 'ถาม-ตอบข้อสงสัย',
      desc: isEnglish
        ? 'Every question is welcome. Ask freely about monk rules, temple etiquette, or everyday peace of mind.'
        : 'ถามได้ทุกข้อสงสัยอย่างสบายใจ ทั้งเรื่องธรรมเนียม ข้อห้ามในวัด หรือหลักคิดในการใช้ชีวิต',
      img: '/images/home/monkchat-qa-dialogue.jpg',
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_32%]',
    },
    {
      title: isEnglish ? 'Photo souvenir' : 'ภาพความทรงจำ',
      desc: isEnglish
        ? 'Capture a memorable moment of cross-cultural friendship and kindness in ancient Ayutthaya.'
        : 'เก็บภาพความประทับใจและมิตรภาพอันอบอุ่นร่วมกับพระสงฆ์ ณ เมืองประวัติศาสตร์อยุธยา',
      img: '/images/home/monkchat-souvenir.jpg',
      width: 828,
      height: 370,
      imageClassName: 'object-[center_35%]',
    },
  ]

  const atmosphereMoments = [
    {
      title: isEnglish
        ? 'Warm cultural exchange under the trees'
        : 'ล้อมวงคุยสบายๆ ใต้ร่มไม้ใหญ่ วัดมหาธาตุ',
      caption: isEnglish
        ? 'Real open-air conversations with MCU student monks where you can sit comfortably and ask about Thai monastic life, mindfulness, and everyday happiness.'
        : 'บรรยากาศสนทนาจริงใต้ร่มเงาไม้ร่มรื่น พูดคุยซักถามวิถีชีวิตพระ วัฒนธรรมไทย และการดูแลใจอย่างเป็นมิตร ไร้พิธีรีตอง',
      img: '/images/home/monkchat-real-atmosphere.jpg',
      width: 1024,
      height: 569,
      imageClassName: 'object-[center_45%]',
    },
    {
      title: isEnglish
        ? 'Rest & gentle stillness for everyone'
        : 'พักกาย พักใจ เริ่มต้นได้ทุกคน',
      caption: isEnglish
        ? 'Escape the midday heat and enjoy five to ten minutes of calm breathing—welcoming all backgrounds, seated comfortably on chairs.'
        : 'หลบไอร้อนมาสัมผัสความสงบเบื้องต้น 5–10 นาที นั่งเก้าอี้สบายๆ ผ่อนคลายทั้งร่างกายและจิตใจ เหมาะสำหรับทุกคน',
      img: '/images/home/monkchat-real-stillness.jpg',
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_32%]',
    },
  ]

  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=14.3570,100.5675'
  const mapEmbedUrl = 'https://maps.google.com/maps?q=14.3570,100.5675&z=17&output=embed'

  return (
    <div className="bg-brand-cream text-brand-text break-words [overflow-wrap:anywhere]">
      <HomeHeroIntro language={currentLang} activePath="/" />

      <div className="mx-auto w-full max-w-[76rem] space-y-12 px-4 pb-12 pt-6 sm:space-y-16 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        {/* Schedule & Location Summary */}
        <section
          aria-label="Activity schedule and location summary"
          className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-6"
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
            {([
              {
                icon: 'calendar',
                value: isEnglish ? 'Mon & Fri' : 'จันทร์ และ ศุกร์',
                label: isEnglish ? 'Meditation sessions' : 'กิจกรรมนำสมาธิ',
              },
              {
                icon: 'clock',
                value: isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป',
                label: isEnglish ? 'Starting time' : 'เวลาเริ่มกิจกรรม',
              },
              {
                icon: 'hourglass',
                value: isEnglish ? '5–10 min' : '5–10 นาที',
                label: isEnglish ? 'Guided session' : 'ระยะเวลานำสมาธิ',
              },
              {
                icon: 'pin',
                value: isEnglish ? 'Ayutthaya' : 'พระนครศรีอยุธยา',
                label: isEnglish ? 'Wat Mahathat' : 'วัดมหาธาตุ',
              },
            ] as const).map((item) => (
              <div key={item.icon} className="flex min-w-0 items-start gap-2 sm:gap-3">
                <GuideIcon name={item.icon} className="mt-1 h-[18px] w-[18px] text-brand-muted" />
                <div className="min-w-0">
                  <dt className="text-xs leading-5 text-brand-muted">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium leading-6 text-brand-text tabular-nums">
                    {item.icon === 'clock' ? (
                      <>
                        <span className="whitespace-nowrap">{isEnglish ? '13:15' : '13:15 น.'}</span>{' '}
                        <span className="whitespace-nowrap">{isEnglish ? 'onwards' : 'เป็นต้นไป'}</span>
                      </>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Location & Map */}
        <section id="location-details" className="scroll-mt-8 space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {isEnglish ? 'Location & map' : 'สถานที่และแผนที่'}
            </h2>
            <p className="text-sm leading-6 text-brand-muted [text-wrap:pretty]">
              {isEnglish
                ? 'How to find our shaded outdoor meeting spot inside Wat Mahathat, Ayutthaya.'
                : 'จุดนัดพบกิจกรรม Monk Chat ใต้ร่มไม้ใหญ่ ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:grid sm:grid-cols-2">
            <div className="relative h-56 w-full sm:h-full">
              <img
                src="/images/home/monkchat-spot-wat-mahathat.jpg"
                alt={
                  isEnglish
                    ? 'Real Monk Chat outdoor meeting spot under the shade trees at Wat Mahathat, Ayutthaya'
                    : 'ภาพจุดจัดกิจกรรม Monk Chat จริงใต้ร่มไม้ใหญ่ วัดมหาธาตุ พระนครศรีอยุธยา'
                }
                width={1024}
                height={576}
                loading="lazy"
                className="h-full w-full object-cover object-[center_45%]"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-brand-maroon shadow-xs">
                {isEnglish ? 'Real meeting spot · Under shade trees' : 'ภาพจุดกิจกรรมจริง · ใต้ร่มไม้ใหญ่ วัดมหาธาตุ'}
              </span>
            </div>

            <div className="flex flex-col justify-between space-y-4 p-5 sm:p-6">
              <div>
                <span className="text-xs font-medium text-brand-terracotta">
                  {isEnglish ? 'Meeting point' : 'จุดนัดพบ'}
                </span>
                <h3 className="mt-1 font-sans text-xl font-medium text-brand-maroon">
                  {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-sm">
                  {isEnglish
                    ? 'Shaded courtyard inside Wat Mahathat, near the central prang. Feel free to walk in and take a chair under the trees. Monks are warmly waiting to welcome you.'
                    : 'บริเวณลานร่มไม้ใหญ่ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน เดินเข้ามานั่งเก้าอี้ใต้ร่มไม้ได้เลย มีพระนิสิตคอยต้อนรับอย่างอบอุ่นและเป็นกันเอง'}
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-brand-border bg-brand-gold-soft/60 p-4">
                <div className="flex items-start gap-2 text-sm text-brand-maroon">
                  <GuideIcon name="pin" />
                  <span>
                    {isEnglish
                      ? 'Wat Mahathat (near central prang), Ayutthaya'
                      : 'จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm leading-6 text-brand-muted">
                  <GuideIcon name="clock" />
                  <span>
                    {isEnglish
                      ? 'Every Monday & Friday from 13:15 onwards'
                      : 'ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป'}
                  </span>
                </div>
                <p className="text-sm leading-6 text-brand-muted">
                  {isEnglish
                    ? 'Free walk-in, no booking required. Check the real spot photo above and map below to find your way.'
                    : 'เข้าร่วมฟรี ไม่มีค่าใช้จ่าย เดินเข้ามานั่งเก้าอี้พูดคุยได้ทันที ดูภาพสถานที่จริงด้านซ้ายและแผนที่ด้านล่างเพื่อนำทาง'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
                >
                  <GuideIcon name="pin" />
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

          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/70 px-5 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-maroon">
                <GuideIcon name="pin" className="h-4 w-4 shrink-0 text-brand-terracotta" />
                <span>
                  {isEnglish
                    ? 'Real Map · Wat Mahathat, Phra Nakhon Si Ayutthaya'
                    : 'แผนที่จริง · วัดมหาธาตุ พระนครศรีอยุธยา'}
                </span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-terracotta hover:underline"
              >
                <span>{isEnglish ? 'Open full Google Maps' : 'เปิดแผนที่เต็มบน Google Maps'}</span>
                <GuideIcon name="external" className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
            <div className="h-64 w-full bg-brand-gold-soft/40 sm:h-72">
              <iframe
                title={
                  isEnglish
                    ? 'Google Map of Wat Mahathat, Ayutthaya'
                    : 'แผนที่จริง วัดมหาธาตุ พระนครศรีอยุธยา'
                }
                src={mapEmbedUrl}
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {isEnglish ? 'What to expect' : 'สิ่งที่จะได้สัมผัสในกิจกรรม'}
            </h2>
            <p className="text-sm leading-6 text-brand-muted [text-wrap:pretty]">
              {isEnglish
                ? 'What you will experience when you take a seat under the trees with student monks.'
                : 'สิ่งที่คุณจะได้สัมผัสเมื่อมาร่วมวงสนทนากับพระสงฆ์ใต้ร่มไม้ใหญ่'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatToExpect.map((item) => (
              <div
                key={item.title}
                className="flex overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:flex-col"
              >
                <div className="relative w-24 shrink-0 overflow-hidden bg-brand-gold-soft sm:h-36 sm:w-full">
                  <img
                    src={item.img}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    className={`h-full w-full object-cover ${item.imageClassName}`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-sans text-base font-medium text-brand-maroon">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Atmosphere Showcase */}
        <section aria-labelledby="visit-atmosphere-heading" className="space-y-4">
          <div>
            <h2
              id="visit-atmosphere-heading"
              className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl"
            >
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
                  <img
                    src={moment.img}
                    alt={moment.title}
                    width={moment.width}
                    height={moment.height}
                    loading="lazy"
                    className={`h-full w-full object-cover ${moment.imageClassName}`}
                  />
                </div>
                <figcaption className="p-5">
                  <h3 className="font-sans text-base font-medium text-brand-maroon">
                    {moment.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-brand-muted">{moment.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Official Contact & Social Banner */}
        <OfficialContactBanner language={currentLang} />
      </div>
    </div>
  )
}
