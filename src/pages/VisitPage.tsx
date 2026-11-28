import { usePublicPageCopy, pageValue } from '../lib/siteContent'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import { LanguageGate } from '../components/LanguageGate'
import { GuideIcon } from '../components/GuideIcon'
import { PublishedLinks } from '../components/PublishedLinks'
import { OfficialContactBanner } from '../components/OfficialContactBanner'
import { AnimatedCounter } from '../components/AnimatedCounter'
import '../components/VisitStatsRibbon.css'
import {
  normalizeLanguage,
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
  type AppLanguage,
} from '../lib/language'

export function VisitPage() {
  const { i18n } = useTranslation()
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('lang')
      if (param === 'en' || param === 'th') {
        sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, param)
        return true
      }
    } catch {
      // Ignore
    }
    return sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY) != null
  })
  const [currentLang, setCurrentLang] = useState<AppLanguage>(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('lang')
      if (param === 'en' || param === 'th') {
        return param
      }
    } catch {
      // Ignore
    }
    return normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  })

  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('lang')
      if (param === 'en' || param === 'th') {
        void i18n.changeLanguage(param)
      }
    } catch {
      // Ignore
    }
  }, [i18n])

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

export function VisitorHome({ currentLang }: { currentLang: AppLanguage }) {
  const isEnglish = currentLang === 'en'
  const copy = usePublicPageCopy('home', currentLang)
  const text = (key: string, fallback: string) => pageValue(copy, key, currentLang, fallback)

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)

  const whatToExpect = [
    {
      title: text('home_text_005', isEnglish ? 'Meet the monks' : 'พบและสนทนากับพระสงฆ์'),
      desc: text('home_text_006', isEnglish
        ? 'Have an open, friendly conversation. Ask anything about monastic life, Thai culture, and finding calm.'
        : 'พูดคุยอย่างเปิดใจ เหมือนมีเพื่อนรับฟัง ถามได้ทุกเรื่องที่สงสัยเกี่ยวกับชีวิตพระ วัฒนธรรม หรือการปล่อยวางความเครียด'),
      img: text('home_image_007', '/images/home/monkchat-meet-monks.jpg'),
      width: 452,
      height: 678,
      imageClassName: 'object-[center_62%]',
    },
    {
      title: text('home_text_008', isEnglish ? 'Short meditation' : 'ฝึกสมาธิเบื้องต้น'),
      desc: text('home_text_009', isEnglish
        ? 'A gentle 5–10 minute breathing pause. Seated comfortably on chairs under shade trees—no experience needed.'
        : 'สมาธิสั้น 5–10 นาที นั่งเก้าอี้สบายๆ ใต้ร่มไม้ใหญ่ หลับตาเบาๆ ผ่อนคลายร่างกาย และสร้างสติรู้ตัว'),
      img: text('home_image_010', '/images/home/monkchat-real-meditation.jpg'),
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_28%]',
    },
    {
      title: text('home_text_011', isEnglish ? 'Q&A' : 'ถาม-ตอบข้อสงสัย'),
      desc: text('home_text_012', isEnglish
        ? 'Every question is welcome. Ask freely about monk rules, temple etiquette, or everyday peace of mind.'
        : 'ถามได้ทุกข้อสงสัยอย่างสบายใจ ทั้งเรื่องธรรมเนียม ข้อห้ามในวัด หรือหลักคิดในการใช้ชีวิต'),
      img: text('home_image_013', '/images/home/monkchat-qa-dialogue.jpg'),
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_32%]',
    },
    {
      title: text('home_text_014', isEnglish ? 'Photo souvenir' : 'ภาพความทรงจำ'),
      desc: text('home_text_015', isEnglish
        ? 'Capture a memorable moment of cross-cultural friendship and kindness in ancient Ayutthaya.'
        : 'เก็บภาพความประทับใจและมิตรภาพอันอบอุ่นร่วมกับพระสงฆ์ ณ เมืองประวัติศาสตร์อยุธยา'),
      img: text('home_image_016', '/images/home/monkchat-souvenir.jpg'),
      width: 828,
      height: 370,
      imageClassName: 'object-[center_35%]',
    },
  ]

  const atmosphereMoments = [
    {
      title: text('home_text_017', isEnglish
        ? 'Warm cultural exchange under the trees'
        : 'ล้อมวงคุยสบายๆ ใต้ร่มไม้ใหญ่ วัดมหาธาตุ'),
      caption: text('home_text_018', isEnglish
        ? 'Real open-air conversations with MCU student monks where you can sit comfortably and ask about Thai monastic life, mindfulness, and everyday happiness.'
        : 'บรรยากาศสนทนาจริงใต้ร่มเงาไม้ร่มรื่น พูดคุยซักถามวิถีชีวิตพระ วัฒนธรรมไทย และการดูแลใจอย่างเป็นมิตร ไร้พิธีรีตอง'),
      img: text('home_image_019', '/images/home/monkchat-real-atmosphere.jpg'),
      width: 1024,
      height: 569,
      imageClassName: 'object-[center_45%]',
    },
    {
      title: text('home_text_020', isEnglish
        ? 'Rest & gentle stillness for everyone'
        : 'พักกาย พักใจ เริ่มต้นได้ทุกคน'),
      caption: text('home_text_021', isEnglish
        ? 'Escape the midday heat and enjoy five to ten minutes of calm breathing—welcoming all backgrounds, seated comfortably on chairs.'
        : 'หลบไอร้อนมาสัมผัสความสงบเบื้องต้น 5–10 นาที นั่งเก้าอี้สบายๆ ผ่อนคลายทั้งร่างกายและจิตใจ เหมาะสำหรับทุกคน'),
      img: text('home_image_022', '/images/home/monkchat-real-stillness.jpg'),
      width: 1024,
      height: 682,
      imageClassName: 'object-[center_32%]',
    },
  ]

  const topQuestions = [
    {
      q: text('home_text_023', isEnglish ? 'Why do Buddhist monks wear orange or saffron robes?' : 'ทำไมพระสงฆ์จึงครองจีวรสีส้มหรือสีกรัก?'),
      a: text('home_text_024', isEnglish
        ? 'Traditionally, robes were dyed using natural forest materials like roots, tree bark, and turmeric. The earth tone symbolizes simplicity, detachment from luxury, and a life dedicated to inner purification.'
        : 'ในอดีต จีวรของพระสงฆ์ย้อมด้วยสีธรรมชาติจากเปลือกไม้และขมิ้น สีส้มจึงสะท้อนถึงการสละความฟุ้งเฟ้อทางโลก และมุ่งสู่ชีวิตที่เรียบง่ายบริสุทธิ์'),
    },
    {
      q: text('home_text_025', isEnglish ? 'Why do monks keep physical distance from women?' : 'ทำไมพระสงฆ์จึงต้องรักษาระยะห่างกับสตรี?'),
      a: text('home_text_026', isEnglish
        ? 'As part of our ancient monastic vows (Vinaya), monks refrain from physical contact with women to maintain clear purity and mutual respect. Monks are always delighted to converse and answer questions with kindness!'
        : 'เป็นข้อปฏิบัติทางพระวินัยเพื่อรักษาความบริสุทธิ์และความเคารพซึ่งกันและกัน พระสงฆ์ยินดีอย่างยิ่งที่จะสนทนาและตอบคำถามด้วยเมตตาจิตเสมอครับ'),
    },
    {
      q: text('home_text_027', isEnglish ? 'Can I practice meditation if I belong to another religion?' : 'ถ้าไม่ได้นับถือศาสนาพุทธ สามารถฝึกสมาธิได้ไหม?'),
      a: text('home_text_028', isEnglish
        ? 'Yes, absolutely! Meditation is universal peace and mindful observation of breath. It belongs to all human beings regardless of belief, nationality, or cultural background.'
        : 'สามารถฝึกได้แน่นอน 100% ครับ สมาธิคือการพักผ่อนของจิตใจและการรู้ลมหายใจ ซึ่งเป็นธรรมชาติสากลของมนุษย์ทุกคนโดยไม่มีการแบ่งแยกความเชื่อ'),
    },
    {
      q: text('home_text_029', isEnglish ? 'How do I join Ayutthaya Monk Chat?' : 'ต้องการเข้าร่วมกิจกรรมต้องทำอย่างไร?'),
      a: text('home_text_030', isEnglish
        ? 'Just walk in! Sessions take place every Monday and Friday from 13:15 onwards under the shaded trees near the central prang at Wat Mahathat. 100% free with no booking required.'
        : 'เดินเข้ามาได้เลยครับ! จัดทุกวันจันทร์และศุกร์ ตั้งแต่เวลา 13:15 น. ใต้ร่มไม้ใหญ่ใกล้พระปรางค์ประธานวัดมหาธาตุ ฟรีโดยไม่ต้องจองล่วงหน้า'),
    },
  ]

  const mapUrl = text('home_map_url', 'https://www.google.com/maps/search/?api=1&query=14.3570,100.5675')
  const mapEmbedUrl = text('home_map_embed', 'https://maps.google.com/maps?q=14.3570,100.5675&z=17&output=embed')

  return (
    <div className="bg-[#FAF7F2] text-[#292524] break-words [overflow-wrap:anywhere] min-h-screen">
      <HomeHeroIntro language={currentLang} activePath="/" />

      <div className="mx-auto w-full max-w-[76rem] space-y-12 px-4 pb-16 pt-6 sm:space-y-16 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">

        {/* 1. OFFICIAL AYUTTHAYA MONK CHAT FIELD MILESTONE STRIP */}
        <section
          aria-label="Impact statistics and milestones"
          className="visit-stats-section"
        >
          <div className="visit-stats-heading">
            <div>
              <span className="visit-stats-kicker">
                <span>✦</span>
                <span>{`${text('home_text_031', '')} ${text('home_stat_sessions', '122')}`}</span>
              </span>
              <h2 className="visit-stats-title">
                {text('home_text_032', isEnglish
                  ? 'Official Historic Field Record at Wat Mahathat'
                  : 'สถิติประวัติศาสตร์กิจกรรมจริง ณ วัดมหาธาตุ พระนครศรีอยุธยา')}
              </h2>
            </div>
            <div className="visit-stats-date">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">
                {`${text('home_text_033', '')}: ${text('home_stat_sessions', '122')} (${text('home_stat_date', '')})`}
              </span>
            </div>
          </div>

          {/* 5 Real Counter Metrics */}
          <div className="visit-stats-ribbon"><div className="visit-stats-track" tabIndex={0} role="group" aria-label={isEnglish ? 'Activity statistics · swipe horizontally for more' : 'สถิติกิจกรรม · ปัดแนวนอนเพื่อดูเพิ่มเติม'}>
            {/* 1. 122 ครั้ง */}
            <div className="visit-stat-item">
              <div className="visit-stat-value">
                <AnimatedCounter end={Number(text('home_stat_sessions', '122'))} />
              </div>
              <div className="visit-stat-label">
                {text('home_text_034', isEnglish ? 'Historic Sessions' : 'ครั้งจัดกิจกรรม')}
              </div>
              <div className="visit-stat-detail">
                {text('home_text_035', isEnglish ? 'Ayutthaya heritage' : 'ประวัติศาสตร์อยุธยา')}
              </div>
            </div>

            {/* 2. 15,317 ท่าน */}
            <div className="visit-stat-item">
              <div className="visit-stat-value">
                <AnimatedCounter end={Number(text('home_stat_participants', '15317'))} />
              </div>
              <div className="visit-stat-label">
                {text('home_text_036', isEnglish ? 'Total Participants' : 'ผู้เข้าร่วมทั้งสิ้น (ท่าน)')}
              </div>
              <div className="visit-stat-detail">
                {text('home_text_037', isEnglish ? 'Welcomed warmly' : 'สนทนาธรรมและสมาธิ')}
              </div>
            </div>

            {/* 3. 94 ชนชาติ */}
            <div className="visit-stat-item">
              <div className="visit-stat-value">
                <AnimatedCounter end={Number(text('home_stat_nations', '94'))} />
              </div>
              <div className="visit-stat-label">
                {text('home_text_038', isEnglish ? 'Nations Reached' : 'ชนชาติ / ประเทศ')}
              </div>
              <div className="visit-stat-detail">
                {text('home_text_039', isEnglish ? 'Global friendship' : 'มิตรภาพไร้พรมแดน')}
              </div>
            </div>

            {/* 4. 1,276+ ชม. (76,585 นาที) */}
            <div className="visit-stat-item">
              <div className="visit-stat-value">
                <AnimatedCounter end={Number(text('home_stat_hours', '1276'))} suffix="+" />
              </div>
              <div className="visit-stat-label">
                {text('home_text_040', isEnglish ? 'Meditation Hours' : 'เวลานั่งสมาธิสะสม (ชม.)')}
              </div>
              <div className="visit-stat-detail">
                {`${Number(text('home_stat_minutes', '76585')).toLocaleString()} ${isEnglish ? 'total mins' : 'นาทีรวม'}`}
              </div>
            </div>

            {/* 5. 0 ฿ 100% ฟรี */}
            <div className="visit-stat-item visit-stat-free">
              <div className="visit-stat-value">
                0 ฿
              </div>
              <div className="visit-stat-label">
                {text('home_text_042', isEnglish ? '100% Free' : 'ฟรี 100% ทุกกิจกรรม')}
              </div>
              <div className="visit-stat-detail">
                {text('home_text_043', isEnglish ? 'Universal gift of calm' : 'บริการด้วยกุศลจิต')}
              </div>
            </div>
          </div></div>
          <p className="visit-stats-swipe" aria-hidden="true">{isEnglish ? 'Swipe to explore the numbers ↔' : 'ปัดซ้าย–ขวาเพื่อดูสถิติ ↔'}</p>
        </section>

        {/* 2. SCHEDULE & LOCATION PILL */}
        <section
          aria-label="Activity schedule and location summary"
          className="rounded-2xl border border-brand-border bg-[#FFFDF9] p-4 sm:p-6 shadow-xs"
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
            {([
              {
                icon: 'calendar',
                value: text('home_text_044', isEnglish ? 'Mon & Fri' : 'จันทร์ และ ศุกร์'),
                label: text('home_text_045', isEnglish ? 'Meditation sessions' : 'กิจกรรมนำสมาธิ'),
              },
              {
                icon: 'clock',
                value: text('home_text_046', isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป'),
                label: text('home_text_047', isEnglish ? 'Starting time' : 'เวลาเริ่มกิจกรรม'),
              },
              {
                icon: 'hourglass',
                value: text('home_text_048', isEnglish ? '5–10 min' : '5–10 นาที'),
                label: text('home_text_049', isEnglish ? 'Guided session' : 'ระยะเวลานำสมาธิ'),
              },
              {
                icon: 'pin',
                value: text('home_text_050', isEnglish ? 'Ayutthaya' : 'พระนครศรีอยุธยา'),
                label: text('home_text_051', isEnglish ? 'Wat Mahathat' : 'วัดมหาธาตุ'),
              },
            ] as const).map((item) => (
              <div key={item.icon} className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                <GuideIcon name={item.icon} className="mt-1 h-[20px] w-[20px] text-brand-terracotta" />
                <div className="min-w-0">
                  <dt className="text-xs leading-5 text-brand-muted">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-brand-text tabular-nums">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* 3. LOCATION & MAP SECTION WITH REAL SPOT PHOTO */}
        <section id="location-details" className="scroll-mt-8 space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-maroon sm:text-3xl">
              {text('home_text_063', isEnglish ? 'Location & map' : 'สถานที่และแผนที่')}
            </h2>
            <p className="text-sm leading-6 text-brand-muted [text-wrap:pretty]">
              {text('home_text_064', isEnglish
                ? 'How to find our shaded outdoor meeting spot inside Wat Mahathat, Ayutthaya.'
                : 'จุดนัดพบกิจกรรม Monk Chat ใต้ร่มไม้ใหญ่ ณ วัดมหาธาตุ พระนครศรีอยุธยา')}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#E7DFD3] bg-[#FFFDF9] shadow-xs sm:grid sm:grid-cols-2">
            <div className="relative h-64 w-full sm:h-full">
              <img
                src={text('home_image_065', '/images/home/monkchat-spot-wat-mahathat.jpg')}
                alt={
                  text('home_text_066', isEnglish
                    ? 'Real Monk Chat outdoor meeting spot under the shade trees at Wat Mahathat, Ayutthaya'
                    : 'ภาพจุดจัดกิจกรรม Monk Chat จริงใต้ร่มไม้ใหญ่ วัดมหาธาตุ พระนครศรีอยุธยา')
                }
                width={1024}
                height={576}
                loading="lazy"
                className="h-full w-full object-cover object-[center_45%]"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-maroon shadow-xs border border-[#E7DFD3]">
                {text('home_text_067', isEnglish ? 'Real meeting spot · Under shade trees' : 'ภาพจุดกิจกรรมจริง · ใต้ร่มไม้ใหญ่ วัดมหาธาตุ')}
              </span>
            </div>

            <div className="flex flex-col justify-between space-y-4 p-5 sm:p-7">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                  {text('home_text_068', isEnglish ? 'Historic Site' : 'จุดนัดพบโบราณสถาน')}
                </span>
                <h3 className="mt-1 font-serif text-xl font-bold text-brand-maroon">
                  {text('home_text_069', isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {text('home_text_070', isEnglish
                    ? 'Shaded courtyard inside Wat Mahathat, near the central prang. Feel free to walk in and take a chair under the trees. Monks are warmly waiting to welcome you.'
                    : 'บริเวณลานร่มไม้ใหญ่ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน เดินเข้ามานั่งเก้าอี้ใต้ร่มไม้ได้เลย มีพระนิสิตคอยต้อนรับอย่างอบอุ่นและเป็นกันเอง')}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-[#E7DFD3] bg-[#FFFDF9] p-4 shadow-2xs">
                <div className="flex items-start gap-2.5 text-sm font-semibold text-brand-maroon">
                  <GuideIcon name="pin" />
                  <span>
                    {text('home_text_071', isEnglish
                      ? 'Wat Mahathat (near central prang), Ayutthaya'
                      : 'จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา')}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-sm leading-6 text-brand-muted">
                  <GuideIcon name="clock" />
                  <span>
                    {text('home_text_072', isEnglish
                      ? 'Every Monday & Friday from 13:15 onwards'
                      : 'ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป')}
                  </span>
                </div>
                <p className="text-xs text-[#78716C] italic pt-1">
                  {text('home_text_073', isEnglish
                    ? 'Free walk-in, no booking required. Welcoming all cultures and backgrounds.'
                    : 'เข้าร่วมฟรี ไม่มีค่าใช้จ่าย เดินเข้ามานั่งเก้าอี้พูดคุยได้ทันที')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-bold text-white transition-all duration-150 hover:bg-brand-terracotta-dark active:scale-[0.96] shadow-xs"
                >
                  <GuideIcon name="pin" />
                  <span>{text('home_text_074', isEnglish ? 'View map' : 'ดูแผนที่')}</span>
                </a>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-terracotta bg-white px-5 text-sm font-bold text-brand-terracotta transition-all duration-150 hover:bg-[#FDF6ED] active:scale-[0.96]"
                >
                  <GuideIcon name="directions" />
                  <span>{text('home_text_075', isEnglish ? 'Get directions' : 'ขอเส้นทาง')}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#E7DFD3] bg-[#FFFDF9] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7DFD3] px-5 py-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-maroon">
                <GuideIcon name="pin" className="h-4 w-4 shrink-0 text-brand-terracotta" />
                <span>
                  {text('home_text_076', isEnglish
                    ? 'Real Map · Wat Mahathat, Phra Nakhon Si Ayutthaya'
                    : 'แผนที่จริง · วัดมหาธาตุ พระนครศรีอยุธยา')}
                </span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-terracotta hover:underline"
              >
                <span>{text('home_text_077', isEnglish ? 'Open full Google Maps' : 'เปิดแผนที่เต็มบน Google Maps')}</span>
                <GuideIcon name="external" className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
            <div className="h-64 w-full bg-[#FAF7F2] sm:h-72">
              <iframe
                title={
                  text('home_text_078', isEnglish
                    ? 'Google Map of Wat Mahathat, Ayutthaya'
                    : 'แผนที่จริง วัดมหาธาตุ พระนครศรีอยุธยา')
                }
                src={mapEmbedUrl}
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </section>

        {/* 4. WHAT TO EXPECT SECTION WITH AUTHENTIC PHOTOGRAPHY */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand-maroon sm:text-3xl">
                {text('home_text_058', isEnglish ? 'What to expect' : 'สิ่งที่จะได้สัมผัสในกิจกรรม')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted max-w-md">
              {text('home_text_059', isEnglish
                ? 'Sit under the historic trees with MCU student monks. Friendly, open, and peaceful.'
                : 'ล้อมวงคุยสบายๆ ใต้ร่มเงาไม้โบราณสถาน กับพระนิสิต มจร อย่างเป็นมิตรและเป็นกันเอง')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatToExpect.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7DFD3] bg-[#FFFDF9] shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden bg-brand-gold-soft">
                  <img
                    src={item.img}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.imageClassName}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
                <div className="flex flex-1 flex-col p-4 justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-brand-maroon">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#5A4B40]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. TOP CURATED DHAMMA QUESTIONS PREVIEW */}
        <section aria-labelledby="curated-qa-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                {text('home_text_060', isEnglish ? 'Top Curiosities' : 'คำถามยอดนิยม')}
              </span>
              <h2 id="curated-qa-heading" className="font-serif text-2xl font-bold text-brand-maroon sm:text-3xl mt-1">
                {text('home_text_061', isEnglish ? 'Questions Visitors Wonder Most' : 'ข้อสงสัยที่นักท่องเที่ยวมักถามบ่อย')}
              </h2>
            </div>
            <Link
              to="/qa"
              className="text-xs font-bold text-brand-terracotta hover:text-brand-terracotta-dark flex items-center gap-1 shrink-0"
            >
              <span>{text('home_text_062', isEnglish ? 'View all 200 Q&As' : 'ดูคลังคำถาม 200 ข้อ')}</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {topQuestions.map((item, idx) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[#E7DFD3] bg-[#FFFDF9] p-4 shadow-2xs space-y-2 hover:border-[#D5B77E] transition"
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                >
                  <h3 className="text-sm font-bold text-[#451A03] flex items-start gap-2">
                    <span className="text-[#8A5816] font-mono text-xs">#{String(idx + 1).padStart(2, '0')}</span>
                    <span>{item.q}</span>
                  </h3>
                  <span className="text-[#8A5816] text-xs font-bold shrink-0">
                    {expandedFaqIndex === idx ? '▲' : '▼'}
                  </span>
                </div>
                <p className={`text-xs text-[#57534E] leading-relaxed pt-1 border-t border-[#F5EFE6] ${expandedFaqIndex === idx ? 'block' : 'line-clamp-2'}`}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. ATMOSPHERE & SURROUNDINGS PHOTO ESSAY */}
        <section aria-labelledby="visit-atmosphere-heading" className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              {text('home_text_079', isEnglish ? 'Real Surroundings' : 'บรรยากาศสถานที่จริง')}
            </span>
            <h2
              id="visit-atmosphere-heading"
              className="font-serif text-2xl font-bold text-brand-maroon sm:text-3xl mt-1"
            >
              {text('home_text_080', isEnglish ? 'Atmosphere & surroundings' : 'บรรยากาศกิจกรรมและสถานที่')}
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              {text('home_text_081', isEnglish
                ? 'Calm open-air dialogue and beginner meditation surrounded by Ayutthaya heritage.'
                : 'สัมผัสความเรียบง่าย สงบเย็น และเป็นกันเองท่ามกลางเมืองประวัติศาสตร์พระนครศรีอยุธยา')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {atmosphereMoments.map((moment) => (
              <figure
                key={moment.title}
                className="overflow-hidden rounded-3xl border border-[#E7DFD3] bg-[#FFFDF9] shadow-2xs group"
              >
                <div className="h-60 w-full overflow-hidden bg-brand-gold-soft">
                  <img
                    src={moment.img}
                    alt={moment.title}
                    width={moment.width}
                    height={moment.height}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${moment.imageClassName}`}
                  />
                </div>
                <figcaption className="p-5">
                  <h3 className="font-serif text-base font-bold text-brand-maroon">
                    {moment.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-brand-muted">{moment.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 8. OFFICIAL CONTACT & SOCIAL BANNER */}
        <PublishedLinks language={currentLang} />
        <OfficialContactBanner language={currentLang} />
      </div>
    </div>
  )
}
