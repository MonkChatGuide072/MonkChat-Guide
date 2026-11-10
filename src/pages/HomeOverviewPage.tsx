import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { HomeHeroIntro } from '../components/HomeHeroIntro'
import { LanguageGate } from '../components/LanguageGate'
import { GuideIcon } from '../components/GuideIcon'
import {
  normalizeLanguage,
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
  type AppLanguage,
} from '../lib/language'

/** QR code and overview landing page (`/` and `/home`) routing clearly to `/visit` and `/nisit`. */
export function HomeOverviewPage() {
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

  const isEnglish = currentLang === 'en'

  const overviewHighlights = [
    {
      title: isEnglish ? 'Open Dharma dialogue' : 'สนทนาธรรมภาษาอังกฤษ',
      desc: isEnglish
        ? 'Friendly conversations with MCU student monks under the shade trees of Wat Mahathat.'
        : 'พูดคุยแลกเปลี่ยนมุมมองพระพุทธศาสนาและวิถีชีวิตกับพระนิสิต มจร อย่างเป็นกันเอง',
      img: '/images/home/monkchat-slide-1.webp',
      width: 560,
      height: 315,
    },
    {
      title: isEnglish ? 'Guided meditation (5–10 min)' : 'ฝึกสมาธิเบื้องต้น 5–10 นาที',
      desc: isEnglish
        ? 'Simple breathing and center-of-body practice suitable for complete beginners.'
        : 'เรียนรู้ท่านั่ง การผ่อนคลาย และการวางใจเบา ๆ เหมาะสำหรับผู้เริ่มต้นทุกพื้นฐาน',
      img: '/images/home/monkchat-meditation-hero.webp',
      width: 1672,
      height: 941,
    },
    {
      title: isEnglish ? 'Thoughtful Q&A' : 'คลังถาม–ตอบข้อสงสัย',
      desc: isEnglish
        ? 'Browse verified introductory answers about Buddhist ethics, meditation, and temple etiquette.'
        : 'สืบค้นคำตอบพื้นฐานที่ผ่านการตรวจรับรองเกี่ยวกับสมาธิและธรรมะในชีวิตประจำวัน',
      img: '/images/home/monkchat-slide-2.webp',
      width: 560,
      height: 315,
    },
    {
      title: isEnglish ? 'Heritage setting' : 'บรรยากาศเมืองประวัติศาสตร์',
      desc: isEnglish
        ? 'Take away quiet moments and reflection among Ayutthaya’s historic temple grounds.'
        : 'สัมผัสความสงบเรียบง่ายท่ามกลางลานโบราณสถานวัดมหาธาตุ พระนครศรีอยุธยา',
      img: '/images/home/monkchat-slide-4.webp',
      width: 560,
      height: 315,
    },
  ]

  return (
    <div className="bg-brand-cream text-brand-text break-words [overflow-wrap:anywhere]">
      <HomeHeroIntro language={currentLang} activePath="/home" />

      <div className="mx-auto w-full max-w-[76rem] space-y-12 px-4 pb-24 pt-6 sm:space-y-16 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
        {/* Schedule & Location Quick Strip */}
        <section
          aria-label={isEnglish ? 'Activity schedule summary' : 'สรุปตารางและสถานที่กิจกรรม'}
          className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-6"
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
            {([
              {
                icon: 'calendar',
                value: isEnglish ? 'Mon & Fri' : 'จันทร์ และ ศุกร์',
                label: isEnglish ? 'Weekly activity' : 'วันจัดกิจกรรม',
              },
              {
                icon: 'clock',
                value: isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป',
                label: isEnglish ? 'Starting time' : 'เวลาเริ่มกิจกรรม',
              },
              {
                icon: 'hourglass',
                value: isEnglish ? '5–10 min' : '5–10 นาที',
                label: isEnglish ? 'Short meditation' : 'ฝึกสมาธิเบื้องต้น',
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

        {/* Two Dedicated Gateways: Visitors (/visit) vs Student Monks (/nisit) */}
        <section aria-labelledby="home-gateways-heading" className="space-y-4">
          <div>
            <h2 id="home-gateways-heading" className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {isEnglish ? 'Choose your space' : 'เลือกเข้าสู่พื้นที่ใช้งาน'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Explore the visitor guide for Wat Mahathat, or open the student monk training hub.'
                : 'แยกพื้นที่สำหรับผู้มาเยือนชมบรรยากาศและฝึกสมาธิ กับมุมฝึกทักษะสำหรับพระนิสิต'}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            {/* Primary Card: Visitor Space (/visit) */}
            <article className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-terracotta">
                  <GuideIcon name="lotus" />
                  <span>{isEnglish ? 'For Visitors · /visit' : 'สำหรับนักท่องเที่ยวและผู้มาเยือน · /visit'}</span>
                </div>
                <h3 className="mt-2 font-serif text-xl font-semibold text-brand-maroon sm:text-2xl">
                  {isEnglish ? 'Experience Monk Chat & Meditation' : 'ชมบรรยากาศและเริ่มฝึกสมาธิอย่างง่าย'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {isEnglish
                    ? 'Step inside the calm atmosphere of Wat Mahathat, preview simple illustrated meditation cards, find meeting details, and explore meditation retreats.'
                    : 'สัมผัสบรรยากาศกิจกรรม ณ วัดมหาธาตุ เรียนรู้สมาธิเบื้องต้นผ่านการ์ดภาพเข้าใจง่าย ดูแผนที่นัดพบ และสำรวจสถานที่ปฏิบัติธรรมต่อเนื่อง'}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/visit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
                >
                  <span>{isEnglish ? 'Enter Visitor Guide' : 'เข้าหน้าหลักนักท่องเที่ยว'}</span>
                  <GuideIcon name="arrow" />
                </Link>
                <Link
                  to="/activities"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-cream px-4 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
                >
                  <span>{isEnglish ? 'Activity details' : 'รายละเอียดกิจกรรม'}</span>
                </Link>
              </div>
            </article>

            {/* Secondary Card: Student Monk Training Hub (/nisit) */}
            <article className="flex flex-col justify-between rounded-2xl border border-brand-border bg-[#FAF2E6]/70 p-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-maroon">
                  <GuideIcon name="book" />
                  <span>{isEnglish ? 'For Student Monks · /nisit' : 'สำหรับพระนิสิต · /nisit'}</span>
                </div>
                <h3 className="mt-2 font-serif text-xl font-semibold text-brand-maroon">
                  {isEnglish ? 'Student Monk Training Hub' : 'มุมฝึกทักษะและเตรียมนำสมาธิ'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {isEnglish
                    ? 'Practice English meditation terminology, follow live synchronized audio scripts, review Q&A flashcards, and create visitor Thank-You cards on-site.'
                    : 'ฝึกคำศัพท์นำนั่งสมาธิ ซ้อมอ่านตามคลิปเสียงและซับไตเติลแบบเรียลไทม์ ทบทวนคลัง Q&A และจดชื่อทำการ์ดขอบคุณผู้มาเยือนหน้างาน'}
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/nisit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-border-dark bg-brand-surface px-5 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
                >
                  <span>{isEnglish ? 'Open Student Training (/nisit)' : 'เข้าสู่มุมฝึกพระนิสิต (/nisit)'}</span>
                  <GuideIcon name="arrow" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Activity Overview Cards */}
        <section aria-labelledby="home-overview-cards" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="home-overview-cards" className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
                {isEnglish ? 'Project overview' : 'ภาพรวมกิจกรรม Ayutthaya Monk Chat'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-brand-muted">
                {isEnglish
                  ? 'Free, open sessions connecting Thai Buddhist wisdom with international guests.'
                  : 'กิจกรรมเปิดกว้างไม่เสียค่าใช้จ่าย เชื่อมโยงการเรียนรู้ธรรมะกับผู้มาเยือนจากนานาชาติ'}
              </p>
            </div>
            <Link
              to="/visit"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-terracotta hover:underline"
            >
              <span>{isEnglish ? 'Explore full visitor page' : 'ดูหน้าผู้มาเยือนฉบับเต็ม'}</span>
              <GuideIcon name="arrow" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewHighlights.map((item) => (
              <div
                key={item.title}
                className="flex overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:flex-col"
              >
                <div className="relative w-24 shrink-0 overflow-hidden bg-[#FAF2E6] sm:h-36 sm:w-full">
                  <img
                    src={item.img}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-sans text-base font-medium text-brand-maroon">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Project Note */}
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <h2 className="font-serif text-lg font-semibold text-brand-maroon">
            {isEnglish ? 'About Ayutthaya Monk Chat' : 'รู้จัก Ayutthaya Monk Chat'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'Meet student monks, ask questions about Buddhism, and try a short guided meditation at Wat Mahathat, Ayutthaya. Free walk-in sessions every Monday and Friday from 13:15 onwards.'
              : 'พบปะพระนิสิต สนทนาเรื่องพระพุทธศาสนา และลองนั่งสมาธิสั้น ๆ ณ วัดมหาธาตุ พระนครศรีอยุธยา ทุกวันจันทร์และศุกร์ เวลา 13:15 น. เป็นต้นไป เข้าร่วมได้ฟรีโดยไม่ต้องลงทะเบียนล่วงหน้า'}
          </p>
        </section>
      </div>
    </div>
  )
}

