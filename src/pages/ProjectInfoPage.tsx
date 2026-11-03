import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function ProjectInfoPage() {
  const { i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)

  const steps = [
    {
      num: '1',
      badge: isEnglish ? '1 Prepare' : '1 เตรียมตัว',
      title: isEnglish ? 'Prepare' : 'เตรียมตัว',
      desc: isEnglish
        ? 'Find a quiet place, sit comfortably, and relax your body.'
        : 'หาที่สงบ นั่งในท่าที่สบาย และผ่อนคลายร่างกาย',
      img: '/images/home/monkchat-slide-1.webp',
    },
    {
      num: '2',
      badge: isEnglish ? '2 Breathe' : '2 กำหนดลมหายใจ',
      title: isEnglish ? 'Breathe' : 'กำหนดลมหายใจ',
      desc: isEnglish
        ? 'Notice your breath naturally, in and out, without force.'
        : 'รับรู้ลมหายใจเข้า-ออกอย่างเป็นธรรมชาติ ไม่เกร็งหรือบังคับ',
      img: '/images/home/monkchat-meditation-hero.webp',
    },
    {
      num: '3',
      badge: isEnglish ? '3 Focus' : '3 ตั้งมั่นในปัจจุบัน',
      title: isEnglish ? 'Focus' : 'ตั้งมั่นในปัจจุบัน',
      desc: isEnglish
        ? 'Gently bring your attention to the present moment.'
        : 'ค่อยๆ น้อมใจให้อยู่กับขณะปัจจุบันอย่างอ่อนโยน',
      img: '/images/home/monkchat-slide-2.webp',
    },
    {
      num: '4',
      badge: isEnglish ? '4 Reflect' : '4 สะท้อนใจและเมตตา',
      title: isEnglish ? 'Reflect' : 'สะท้อนใจและเมตตา',
      desc: isEnglish
        ? 'Notice how you feel, with kindness and openness.'
        : 'สังเกตความรู้สึกในใจด้วยความเมตตาและเปิดกว้าง',
      img: '/images/home/monkchat-slide-4.webp',
    },
  ]

  const centersPreview = [
    {
      title: isEnglish ? 'Wat Mahathat Monk Chat' : 'Monk Chat วัดมหาธาตุ',
      location: isEnglish ? 'Phra Nakhon Si Ayutthaya' : 'พระนครศรีอยุธยา',
      desc: isEnglish ? 'Meditation sessions and Dhamma talks with monks at historic temple.' : 'กิจกรรมสนทนาธรรมและฝึกสมาธิเบื้องต้นกับพระนิสิต',
      img: '/images/home/monkchat-meditation-ruins.webp',
      tag: isEnglish ? 'Beginner-friendly' : 'เหมาะสำหรับผู้เริ่มต้น',
    },
    {
      title: isEnglish ? 'Ayutthaya Meditation Experience' : 'ศูนย์ปฏิบัติธรรมอยุธยา',
      location: isEnglish ? 'Ayutthaya' : 'อยุธยา',
      desc: isEnglish ? 'Hands-on mindfulness practice combining calm presence and heritage.' : 'ฝึกสมาธิเจริญสติท่ามกลางมรดกทางวัฒนธรรม',
      img: '/images/home/monkchat-slide-3.webp',
      tag: isEnglish ? 'Guided meditation' : 'มีผู้นำสมาธิ',
    },
    {
      title: isEnglish ? 'Dhamma Learning Center' : 'ศูนย์เรียนรู้พระธรรมวินัย',
      location: isEnglish ? 'Bang Pa-in' : 'บางปะอิน',
      desc: isEnglish ? 'Dedicated space for studying Buddhist teachings and meditation practice.' : 'พื้นที่เรียนรู้คำสอนทางพระพุทธศาสนาและฝึกภาวนา',
      img: '/images/home/monkchat-meditation-field.webp',
      tag: isEnglish ? 'English support' : 'รองรับภาษาอังกฤษ',
    },
  ]

  return (
    <div className="space-y-12 pb-10">
      {/* 1. HERO SECTION */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#EADCC6] bg-[#2E1A16] shadow-[0_16px_40px_rgba(104,27,22,0.12)]">
        {/* Background Image with warm gradient overlay */}
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/home/monkchat-meditation-hero.webp"
            alt="Monks in meditation at Ayutthaya"
            className="h-full w-full object-cover object-[center_35%] opacity-40 brightness-95 filter transition-transform duration-1000 ease-out"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#20100D] via-[#2A1612]/75 to-[#381B15]/50"
        />

        {/* Hero Content */}
        <div className="relative z-10 px-4 py-10 text-center sm:px-12 sm:py-20 lg:py-24">
          {/* Lotus / Temple Icon Motif */}
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#B77A24]/20 text-[#EFD070] ring-1 ring-[#EFD070]/30 sm:h-10 sm:w-10">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          <h1 className="font-serif text-2xl font-extrabold tracking-tight text-[#FFFDF7] drop-shadow-sm sm:text-5xl lg:text-6xl">
            {isEnglish ? 'Discover Inner Peace' : 'ค้นพบความสงบภายใน'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-[#F5EADB] sm:text-xl sm:leading-8">
            {isEnglish
              ? 'Guided meditation with monks in Ayutthaya'
              : 'นำสมาธิและสนทนาธรรมโดยพระสงฆ์ ณ พระนครศรีอยุธยา'}
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/meditation"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-6 text-xs font-bold text-white shadow-[0_8px_20px_rgba(164,61,29,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#8E3317] sm:w-auto sm:min-h-12 sm:px-7 sm:text-sm"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{isEnglish ? 'Start Meditation' : 'เริ่มนั่งสมาธิ'}</span>
            </Link>

            <Link
              to="/visit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D5BD94] bg-[#FFFDF7]/95 px-6 text-xs font-bold text-[#681B16] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#FFFDF7] sm:w-auto sm:min-h-12 sm:px-7 sm:text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{isEnglish ? 'Plan Your Visit' : 'วางแผนมาเยือน'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY STRIP / ACTIVITY PILL */}
      <section
        aria-label="Activity schedule and location summary"
        className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-3 shadow-[0_6px_24px_rgba(104,27,22,0.04)] sm:p-5"
      >
        <div className="grid grid-cols-2 gap-2 divide-y-0 sm:grid-cols-4 sm:gap-4 sm:divide-x sm:divide-[#EADCC6]/80">
          {/* Day */}
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

          {/* Time */}
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

          {/* Duration */}
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

          {/* Location */}
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

      {/* 3. GUIDED MEDITATION 4-STEP SECTION */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'Guided Meditation' : 'การฝึกสมาธิเบื้องต้น'}
          </h2>
          <p className="mt-1 text-sm text-[#7D6B5D] sm:text-base">
            {isEnglish
              ? 'A simple, mindful practice with the guidance of Buddhist monks.'
              : 'การฝึกเจริญสติอย่างง่าย ภายใต้คำแนะนำของพระสงฆ์'}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Link
              key={step.num}
              to="/meditation"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#D5BD94] hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#FAF2E6]">
                <img
                  src={step.img}
                  alt={step.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#A43D1D] text-xs font-bold text-white">
                    {step.num}
                  </span>
                  <span className="font-serif text-base font-bold text-[#681B16]">
                    {step.title}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#5A4B40]">
                  {step.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. LOWER 2-COLUMN SECTION: ASK MONKCHAT + VISIT MONK CHAT */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Left: Ask MonkChat (Non-generative verified QA) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 shadow-xs sm:p-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#681B16]">
                  {isEnglish ? 'Ask MonkChat' : 'ถาม MonkChat'}
                </h3>
                <p className="text-xs text-[#7D6B5D]">
                  {isEnglish
                    ? 'Verified guide for meditation, Buddhism, and visiting'
                    : 'คลังคำถาม-คำตอบธรรมะและสมาธิที่ผ่านการตรวจรับรองแล้ว'}
                </p>
              </div>
            </div>

            {/* Chat Bubble Previews */}
            <div className="mt-5 space-y-3 rounded-xl border border-[#EADCC6]/60 bg-[#FFF8EE]/60 p-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#FDF4E3] border border-[#EADCC6] px-4 py-2.5 text-xs font-medium text-[#681B16] shadow-2xs">
                  {isEnglish ? 'How do I start meditation?' : 'เริ่มต้นฝึกสมาธิอย่างไร?'}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A43D1D] text-[0.65rem] font-bold text-white">
                  MC
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-[#FFFDF7] border border-[#EADCC6] px-4 py-2.5 text-xs leading-5 text-[#4A3B32] shadow-2xs">
                  {isEnglish
                    ? 'A simple way to start is to focus on your breath. Find a quiet place, sit comfortably, and gently bring attention to each inhale and exhale...'
                    : 'วิธีเริ่มต้นง่ายๆ คือการตามรู้ลมหายใจ นั่งในท่าที่สบายในที่สงบ แล้วน้อมใจรับรู้ลมหายใจเข้าและออกอย่างเป็นธรรมชาติ...'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <Link
              to="/qa"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[#8E3317]"
            >
              <span>{isEnglish ? 'Chat with MonkChat' : 'ถามคำถามกับ MonkChat'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Right: Visit Monk Chat */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 shadow-xs sm:p-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#681B16]">
                  {isEnglish ? 'Visit Monk Chat' : 'มาเยือน Monk Chat อยุธยา'}
                </h3>
                <p className="text-xs text-[#7D6B5D]">
                  {isEnglish ? 'Join open conversations with monks at historic temples' : 'สนทนาแลกเปลี่ยนธรรมะและวัฒนธรรมกับพระนิสิต'}
                </p>
              </div>
            </div>

            {/* Temple Thumbnail & Location Overview */}
            <div className="mt-5 grid grid-cols-2 gap-3 overflow-hidden rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-3">
              <img
                src="/images/home/monkchat-slide-2.webp"
                alt="Ayutthaya Temple"
                className="h-28 w-full rounded-lg object-cover"
              />
              <div className="flex flex-col justify-center space-y-1.5 text-xs text-[#5A4B40]">
                <p className="font-bold text-[#681B16]">
                  {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
                </p>
                <p className="text-[0.75rem]">
                  📅 {isEnglish ? 'Mon & Fri, 13:15 onwards' : 'จันทร์ และ ศุกร์ เวลา 13:15 น.'}
                </p>
                <p className="text-[0.75rem]">
                  ⏱️ {isEnglish ? '5–10 min sessions' : 'ระยะเวลา 5–10 นาที'}
                </p>
                <p className="text-[0.75rem] text-[#A43D1D] font-semibold">
                  ✓ {isEnglish ? 'Free admission · All welcome' : 'ไม่มีค่าใช้จ่าย · ยินดีต้อนรับทุกคน'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <Link
              to="/visit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-5 text-sm font-bold text-[#A43D1D] transition hover:bg-[#FDF4E3]"
            >
              <span>{isEnglish ? 'View Map & Details' : 'ดูแผนที่และข้อมูลการมาเยือน'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CENTERS & LEARN MORE PREVIEW SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Centers & Learn More' : 'ศูนย์ปฏิบัติธรรมและแหล่งเรียนรู้'}
            </h2>
            <p className="text-sm text-[#7D6B5D]">
              {isEnglish
                ? 'Explore meditation centers, learning resources, and more ways to deepen your practice.'
                : 'ค้นหาศูนย์ปฏิบัติธรรมและแหล่งเรียนรู้เพื่อฝึกฝนและศึกษาต่อ'}
            </p>
          </div>
          <Link
            to="/centers"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A43D1D] hover:underline"
          >
            <span>{isEnglish ? 'View All Centers' : 'ดูศูนย์ทั้งหมด'}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centersPreview.map((center) => (
            <Link
              key={center.title}
              to="/centers"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-xs transition hover:-translate-y-1 hover:border-[#D5BD94] hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#FAF2E6]">
                <img
                  src={center.img}
                  alt={center.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF7]/90 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#681B16] backdrop-blur-xs">
                  {center.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#B77A24]">
                  {center.location}
                </p>
                <h3 className="mt-1 font-serif text-base font-bold text-[#681B16]">
                  {center.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-[#5A4B40]">
                  {center.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. COLLAPSIBLE ACADEMIC PROJECT INFORMATION & CREDITS */}
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
                {isEnglish ? 'About the MonkChat Guide Project' : 'เกี่ยวกับโครงการวิจัย MonkChat Guide'}
              </h2>
              <p className="text-xs text-[#7D6B5D]">
                {isEnglish
                  ? 'Academic background, research purpose, and university collaboration'
                  : 'ข้อมูลวิชาการ วัตถุประสงค์การบริการสังคม และความร่วมมือมหาวิทยาลัย'}
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
          </div>
        )}
      </section>
    </div>
  )
}
