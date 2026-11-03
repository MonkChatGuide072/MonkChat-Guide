import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function MeditationBeginnerGuide() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const [isExpanded, setIsExpanded] = useState(true)

  const preparationSteps = [
    {
      number: '01',
      title: t('meditation.guide.step1Title'),
      desc: t('meditation.guide.step1Desc'),
      icon: (
        <svg className="h-5 w-5 text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      number: '02',
      title: t('meditation.guide.step2Title'),
      desc: t('meditation.guide.step2Desc'),
      icon: (
        <svg className="h-5 w-5 text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: t('meditation.guide.step3Title'),
      desc: t('meditation.guide.step3Desc'),
      icon: (
        <svg className="h-5 w-5 text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ]

  const visualCards = [
    {
      num: '1',
      title: isEnglish ? 'Prepare' : 'เตรียมตัว',
      desc: isEnglish ? 'Find a quiet place, sit comfortably, and relax your body.' : 'หาที่สงบ นั่งในท่าที่สบาย และผ่อนคลายร่างกาย',
      img: '/images/home/monkchat-slide-1.webp',
    },
    {
      num: '2',
      title: isEnglish ? 'Breathe' : 'กำหนดลมหายใจ',
      desc: isEnglish ? 'Notice your breath naturally, in and out, without force.' : 'รับรู้ลมหายใจเข้า-ออกอย่างเป็นธรรมชาติ ไม่เกร็งหรือบังคับ',
      img: '/images/home/monkchat-meditation-hero.webp',
    },
    {
      num: '3',
      title: isEnglish ? 'Focus' : 'ตั้งมั่นในปัจจุบัน',
      desc: isEnglish ? 'Gently bring your attention to the present moment.' : 'ค่อยๆ น้อมใจให้อยู่กับขณะปัจจุบันอย่างอ่อนโยน',
      img: '/images/home/monkchat-slide-2.webp',
    },
    {
      num: '4',
      title: isEnglish ? 'Relax' : 'ผ่อนคลายจิตใจ',
      desc: isEnglish ? 'Let go of tension and allow your mind to become calm.' : 'ปล่อยวางความตึงเครียดและปล่อยให้จิตใจสงบนิ่ง',
      img: '/images/home/monkchat-meditation-field.webp',
    },
    {
      num: '5',
      title: isEnglish ? 'Reflect' : 'สังเกตและแผ่เมตตา',
      desc: isEnglish ? 'Notice how you feel with kindness and openness.' : 'สังเกตความรู้สึกในใจด้วยความเมตตาและเปิดกว้าง',
      img: '/images/home/monkchat-slide-4.webp',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Beginner Guide Card Banner */}
      <section
        id="meditation-guide"
        aria-labelledby="meditation-guide-heading"
        className="scroll-mt-8 rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-7"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#A43D1D]">
                  {t('meditation.guide.tag')}
                </span>
                <span
                  role="note"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[0.65rem] font-semibold text-amber-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  {t('meditation.guide.reviewDraftBadge')}
                </span>
              </div>
              <h2 id="meditation-guide-heading" className="mt-1 font-serif text-xl font-bold text-[#681B16] sm:text-2xl">
                {t('meditation.guide.title')}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-[#7D6B5D] sm:text-sm">
                {t('meditation.guide.subtitle')}
              </p>
            </div>
          </div>

          {/* Key Bullet Checklist */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-[#EADCC6]/60 bg-[#FAF2E6]/50 p-3 text-xs text-[#5A4B40] sm:flex-row sm:items-center sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-[#A43D1D] font-bold">✓</span>
              {isEnglish ? 'A short, beginner-friendly meditation' : 'สมาธิสั้นกระชับ เหมาะสำหรับผู้เริ่มต้น'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#A43D1D] font-bold">✓</span>
              {isEnglish ? 'Follow simple step-by-step guidance' : 'ปฏิบัติตามคำแนะนำทีละขั้นตอน'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#A43D1D] font-bold">✓</span>
              {isEnglish ? 'Suitable for all, no experience needed' : 'เหมาะสำหรับทุกคน ไม่ต้องมีพื้นฐาน'}
            </span>
          </div>
        </div>

        {/* Action strip with collapse toggle and audio jump */}
        <div className="mt-5 flex flex-col gap-3 border-t border-[#EADCC6]/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              aria-expanded={isExpanded}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#D5BD94] bg-[#FFFDF7] px-3.5 py-1 text-xs font-bold text-[#681B16] transition hover:bg-[#FDF4E3] cursor-pointer"
            >
              <span>{isExpanded ? t('meditation.guide.collapseSteps') : t('meditation.guide.expandSteps')}</span>
              <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
            </button>
            {!isExpanded && (
              <span className="text-xs text-[#7D6B5D]">
                {t('meditation.guide.quickSummary')}
              </span>
            )}
          </div>

          <a
            href="#meditation-audio"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-[#A43D1D] px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#8E3317]"
          >
            <span>{t('meditation.guide.jumpToAudio')}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        {/* Detailed 3-step text cards for verification */}
        {isExpanded && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {preparationSteps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF4E3] text-xs font-bold text-[#A43D1D]">
                      {step.number}
                    </span>
                    <div className="rounded-full bg-[#FFFDF7] p-1.5 border border-[#EADCC6]">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="mt-3 font-serif text-sm font-bold text-[#681B16]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#5A4B40]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Step-by-Step Practice (5 Visual Cards from Mockup) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#681B16] sm:text-2xl">
            {isEnglish ? 'Step-by-Step Practice' : 'ขั้นตอนการฝึกสมาธิทีละขั้น'}
          </h2>
          <p className="text-xs text-[#7D6B5D] sm:text-sm">
            {isEnglish
              ? 'A simple 5-step meditation you can follow with the audio or on your own.'
              : 'ขั้นตอนการฝึกสมาธิ 5 ข้อที่สามารถปฏิบัติตามเสียงหรือฝึกฝนด้วยตนเอง'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visualCards.map((card) => (
            <div
              key={card.num}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-2xs transition hover:-translate-y-1 hover:border-[#D5BD94] hover:shadow-xs"
            >
              <div className="relative h-32 w-full overflow-hidden bg-[#FAF2E6]">
                <img
                  src={card.img}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#A43D1D] text-[0.65rem] font-bold text-white">
                    {card.num}
                  </span>
                  <span className="font-serif text-sm font-bold text-[#681B16]">
                    {card.title}
                  </span>
                </div>
                <p className="mt-1.5 text-[0.75rem] leading-4 text-[#5A4B40]">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
