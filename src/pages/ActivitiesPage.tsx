import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function ActivitiesPage() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)

  // 1. Confirmed Official Activities (Monk Chat Ayutthaya)
  const confirmedActivities = [
    {
      title: isEnglish ? 'Monk Chat at Wat Mahathat' : 'สนทนาธรรม Monk Chat ณ วัดมหาธาตุ',
      schedule: isEnglish ? 'Every Monday & Friday · 13:15 onwards' : 'ทุกวันจันทร์และวันศุกร์ · 13:15 น. เป็นต้นไป',
      location: isEnglish ? 'Wat Mahathat, Phra Nakhon Si Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา (ลานร่มไม้ใกล้พระปรางค์)',
      desc: isEnglish
        ? 'Open, welcoming conversation between student monks from Mahachulalongkornrajavidyalaya University (MCU) and foreign visitors. Discuss Buddhism, monastic life, meditation, and Thai culture in a relaxed, friendly setting.'
        : 'กิจกรรมสนทนาธรรมภาษาอังกฤษแบบเปิดกว้าง เป็นกันเอง ระหว่างพระนิสิต มจร และผู้มาเยือนชาวต่างชาติ แลกเปลี่ยนมุมมองเรื่องพระพุทธศาสนา วิถีชีวิตพระสงฆ์ และวัฒนธรรมไทย',
      image: '/images/home/monkchat-slide-1.webp',
      badge: isEnglish ? 'Official Activity' : 'กิจกรรมหลักที่ยืนยันแล้ว',
      ctaText: isEnglish ? 'Plan Your Visit' : 'วางแผนการมาเยือน',
      ctaLink: '/',
    },
    {
      title: isEnglish ? 'Guided Mindful Breathing (5–10 min)' : 'ฝึกสมาธิเบื้องต้นเจริญสติ (5–10 นาที)',
      schedule: isEnglish ? 'During Monk Chat Sessions & Online 24/7' : 'ระหว่างรอบ Monk Chat และฝึกผ่านเว็บได้ตลอดเวลา',
      location: isEnglish ? 'Wat Mahathat Grounds & Web Audio' : 'บริเวณกิจกรรมวัดมหาธาตุ และผ่านสมาร์ตโฟน',
      desc: isEnglish
        ? 'A gentle introduction to breath meditation guided by student monks at the historic ruins or practiced anywhere through the web audio player. Free and suitable for beginners of all backgrounds.'
        : 'การนำนั่งสมาธิกำหนดลมหายใจเบื้องต้นโดยพระสงฆ์ในพื้นที่ หรือฝึกฝนด้วยตนเองผ่านเสียงนำสมาธิในเว็บแอปพลิเคชัน เหมาะสำหรับผู้เริ่มต้นทุกเชื้อชาติและศาสนา',
      image: '/images/home/monkchat-meditation-hero.webp',
      badge: isEnglish ? 'Meditation Practice' : 'การฝึกสมาธิที่ยืนยันแล้ว',
      ctaText: isEnglish ? 'Try Guided Audio' : 'ฟังเสียงนำสมาธิ 5 นาที',
      ctaLink: '/meditation',
    },
  ]

  // 2. Confirmed Weekly Schedule
  const confirmedSchedule = [
    {
      day: isEnglish ? 'Monday & Friday' : 'วันจันทร์ และ วันศุกร์',
      time: isEnglish ? '13:15 onwards' : '13:15 น. เป็นต้นไป',
      activity: isEnglish ? 'Monk Chat & Short Guided Meditation' : 'สนทนาธรรม Monk Chat และนำสมาธิสั้น 5–10 นาที',
      location: isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา',
      format: isEnglish ? 'English & Thai · Free walk-ins during session hours' : 'ภาษาอังกฤษและไทย · เข้าร่วมฟรี ไม่ต้องลงทะเบียนล่วงหน้า',
    },
  ]

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[#EADCC6] bg-[#FFFDF7] p-6 shadow-xs sm:p-10 lg:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#B77A24]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A43D1D]/20 bg-[#FDF4E3] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#A43D1D]">
            <span>🪷</span>
            <span>{isEnglish ? 'Monk Chat Activities · Ayutthaya' : 'กิจกรรมธรรมะและ Monk Chat อยุธยา'}</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-[#681B16] sm:text-5xl">
            {isEnglish ? 'Activities & Practice' : 'กิจกรรมและการปฏิบัติธรรม'}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-[#7D6B5D] sm:text-lg">
            {isEnglish
              ? 'Join student monks at Wat Mahathat, Ayutthaya for open Dhamma conversation and gentle mindful meditation. All sessions are free during active hours.'
              : 'ร่วมกิจกรรมสนทนาธรรมและฝึกสมาธิเจริญสติ ณ วัดมหาธาตุ พระนครศรีอยุธยา โดยพระนิสิต มจร เข้าร่วมได้ฟรีในช่วงวันและเวลาทำการ'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#official-schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-[#A43D1D] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#8E3317]"
            >
              <span>📅</span>
              <span>{isEnglish ? 'View Official Schedule' : 'ดูตารางกิจกรรมที่ยืนยันแล้ว'}</span>
            </a>
            <Link
              to="/meditation"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D5BD94] bg-[#FFFDF7] px-4 py-2 text-xs font-bold text-[#681B16] shadow-2xs hover:bg-[#FDF4E3]"
            >
              <span>🪷</span>
              <span>{isEnglish ? 'Guided Meditation' : 'ฝึกสมาธิเบื้องต้น'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: CONFIRMED OFFICIAL ACTIVITIES */}
      <section aria-labelledby="confirmed-activities-title" className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#A43D1D]">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>{isEnglish ? 'Confirmed Schedule' : 'กิจกรรมทางการที่ยืนยันแล้ว'}</span>
            </span>
            <h2 id="confirmed-activities-title" className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Regular Monk Chat & Meditation' : 'กิจกรรมประจำสัปดาห์ Monk Chat'}
            </h2>
          </div>
          <p className="text-xs text-[#7D6B5D]">
            {isEnglish ? 'Free walk-ins at Wat Mahathat' : 'เข้าร่วมได้ทันที ณ วัดมหาธาตุ อยุธยา'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {confirmedActivities.map((act, idx) => (
            <article
              key={idx}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-xs transition hover:shadow-md hover:border-[#A43D1D]/40"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#681B16]/90 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                    {act.badge}
                  </span>
                  <span className="absolute bottom-3 left-3 text-xs font-semibold text-white/95">
                    📍 {act.location}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold text-[#A43D1D]">🕒 {act.schedule}</p>
                  <h3 className="mt-1 font-serif text-xl font-bold text-[#681B16]">{act.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7D6B5D]">{act.desc}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={act.ctaLink}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A43D1D] px-4 py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#8E3317]"
                >
                  <span>{act.ctaText}</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: OFFICIAL WEEKLY SCHEDULE TABLE */}
      <section id="official-schedule" aria-labelledby="schedule-table-title" className="scroll-mt-8 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#A43D1D]">
            {isEnglish ? 'Verified Time & Location' : 'วัน เวลา และสถานที่ทางการ'}
          </span>
          <h2 id="schedule-table-title" className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'Official Activity Schedule' : 'ตารางกิจกรรมที่เปิดให้บริการจริง'}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-xs">
          <table className="w-full text-left text-xs text-[#4A3B32]">
            <thead className="border-b border-[#EADCC6] bg-[#FDF4E3]/70 font-serif text-[#681B16]">
              <tr>
                <th className="px-4 py-3.5 sm:px-6">{isEnglish ? 'Day' : 'วัน'}</th>
                <th className="px-4 py-3.5 sm:px-6">{isEnglish ? 'Time' : 'เวลา'}</th>
                <th className="px-4 py-3.5 sm:px-6">{isEnglish ? 'Activity' : 'กิจกรรม'}</th>
                <th className="px-4 py-3.5 sm:px-6">{isEnglish ? 'Location' : 'สถานที่'}</th>
                <th className="px-4 py-3.5 sm:px-6">{isEnglish ? 'Conditions & Format' : 'เงื่อนไขและรูปแบบ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCC6]/60">
              {confirmedSchedule.map((row, idx) => (
                <tr key={idx} className="transition hover:bg-[#FFF8EE]">
                  <td className="px-4 py-4 font-bold text-[#681B16] sm:px-6 whitespace-nowrap">{row.day}</td>
                  <td className="px-4 py-4 font-semibold text-[#A43D1D] sm:px-6 whitespace-nowrap">{row.time}</td>
                  <td className="px-4 py-4 font-bold text-[#30251E] sm:px-6">{row.activity}</td>
                  <td className="px-4 py-4 text-[#7D6B5D] sm:px-6">{row.location}</td>
                  <td className="px-4 py-4 text-[#7D6B5D] sm:px-6">{row.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-4 text-xs text-[#5A4B40] space-y-1">
          <strong className="block text-[#681B16] font-bold">
            ℹ️ {isEnglish ? 'Notice regarding schedules:' : 'ข้อแนะนำเกี่ยวกับตารางกิจกรรม:'}
          </strong>
          <p>
            {isEnglish
              ? 'Sessions may occasionally be adjusted due to academic examinations or monastic duties. Walk-ins are free of charge during session hours. For other events or special arrangements, please check official announcements or ask the team via Q&A.'
              : 'รอบกิจกรรมอาจมีการปรับเปลี่ยนตามตารางการศึกษาและศาสนกิจของพระนิสิต ผู้มาเยือนสามารถเข้าร่วมได้ฟรีในช่วงเวลาทำการโดยไม่ต้องลงทะเบียน สำหรับกิจกรรมพิเศษหรือการประสานงานเป็นกลุ่ม กรุณาติดต่อทีมงานล่วงหน้า'}
          </p>
        </div>
      </section>

      {/* SECTION 3: CALLOUT BANNER (SAFE & ACCURATE) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#B77A24]/40 bg-gradient-to-r from-[#681B16] via-[#8E3317] to-[#A43D1D] p-8 text-white shadow-md sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {isEnglish ? 'Welcome to Monk Chat' : 'ยินดีต้อนรับผู้มาเยือนทุกท่าน'}
          </span>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {isEnglish ? 'Join Monk Chat at Wat Mahathat' : 'ร่วมกิจกรรม Monk Chat ณ วัดมหาธาตุ'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/90">
            {isEnglish
              ? 'Weekly Monk Chat sessions at Wat Mahathat are completely free of charge with no advance registration needed. For special activities or other inquiries, please consult official announcements or contact the project team.'
              : 'กิจกรรม Monk Chat ประจำสัปดาห์ ณ วัดมหาธาตุ เข้าร่วมได้ฟรีโดยไม่ต้องลงทะเบียนล่วงหน้าในช่วงเวลาทำการ สำหรับกิจกรรมรอบพิเศษหรือข้อมูลอื่น ๆ สามารถตรวจสอบประกาศทางการหรือสอบถามทีมงานโครงการ'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#681B16] shadow-sm transition hover:bg-[#FFFDF7]"
            >
              <span>{isEnglish ? 'Plan Your Visit' : 'วางแผนการมาเยือน'}</span>
              <span>→</span>
            </Link>
            <Link
              to="/qa"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>{isEnglish ? 'Ask via Q&A' : 'ถาม-ตอบข้อสงสัย'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: VISITOR GUIDELINES */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A43D1D]">
            {isEnglish ? 'Visitor Etiquette' : 'ข้อควรปฏิบัติสำหรับผู้ร่วมกิจกรรม'}
          </span>
          <h2 className="mt-1 font-serif text-xl font-bold text-[#681B16]">
            {isEnglish ? 'Simple Guidelines for Temple Activities' : 'ข้อแนะนำเบื้องต้นในการร่วมกิจกรรมในวัด'}
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">
            <span className="text-xl">👕</span>
            <h3 className="mt-2 text-xs font-bold text-[#681B16]">
              {isEnglish ? 'Dress Modestly' : 'การแต่งกายสุภาพ'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Please wear clothing that covers your shoulders and knees out of respect for the monastic setting.'
                : 'สวมใส่เสื้อผ้าสุภาพ ปกปิดหัวไหล่และหัวเข่า เพื่อแสดงความเคารพต่อสถานที่ศักดิ์สิทธิ์'}
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">
            <span className="text-xl">👟</span>
            <h3 className="mt-2 text-xs font-bold text-[#681B16]">
              {isEnglish ? 'Remove Footwear' : 'ถอดรองเท้า'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Remove shoes and hats before entering meditation halls, pavilions, and sacred mat areas.'
                : 'ถอดรองเท้าและหมวกก่อนเข้าสู่ศาลาปฏิบัติธรรมหรือบริเวณปูเสื่อสำหรับสนทนา'}
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">
            <span className="text-xl">🙏</span>
            <h3 className="mt-2 text-xs font-bold text-[#681B16]">
              {isEnglish ? 'Respectful Presence' : 'กิริยาที่สงบสำรวม'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Turn mobile phones to silent mode. Speak softly and show kindness towards monks and fellow visitors.'
                : 'ตั้งเสียงโทรศัพท์เป็นระบบเงียบ สำรวมกาย วาจา และพูดคุยด้วยความเคารพเป็นมิตร'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: MCU PROJECT BACKGROUND */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
        <button
          type="button"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          aria-expanded={isAboutExpanded}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <div>
            <h2 className="font-serif text-sm font-bold text-[#681B16]">
              {isEnglish ? 'About MonkChat Guide & MCU Collaboration' : 'ข้อมูลโครงการและคณะผู้จัดทำ มจร'}
            </h2>
            <p className="mt-0.5 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Academic partnership and student monk field support project'
                : 'โครงการบริการวิชาการและสนับสนุนการสื่อสารธรรมะสำหรับพระนิสิต'}
            </p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF4E3] text-xs font-bold text-[#A43D1D]">
            {isAboutExpanded ? '−' : '+'}
          </span>
        </button>

        {isAboutExpanded && (
          <div className="mt-4 space-y-3 border-t border-[#EADCC6] pt-4 text-xs leading-relaxed text-[#7D6B5D]">
            <p>
              {isEnglish
                ? 'MonkChat Guide is developed as a mobile-first Progressive Web Application (PWA) under Mahachulalongkornrajavidyalaya University (MCU) to support student monks in guiding meditation and offering respectful intercultural dialogue with foreign visitors in Ayutthaya.'
                : 'MonkChat Guide พัฒนาขึ้นในรูปแบบ Progressive Web Application (PWA) ภายใต้มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร) เพื่อสนับสนุนพระนิสิตในการนำนั่งสมาธิและสนทนาธรรมภาษาอังกฤษกับชาวต่างชาติ ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
            </p>
            <p className="font-semibold text-[#681B16]">
              {t('app.footer')} · Ayutthaya, Thailand
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
