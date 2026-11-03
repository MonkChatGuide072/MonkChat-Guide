import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { GuideIcon } from '../components/GuideIcon'

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
    <div className="space-y-12 bg-brand-cream pb-24 text-brand-text sm:space-y-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm text-brand-muted">
            <GuideIcon name="lotus" />
            <span>{isEnglish ? 'Monk Chat Activities · Ayutthaya' : 'กิจกรรมธรรมะและ Monk Chat อยุธยา'}</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold leading-snug text-[#681B16] sm:text-4xl">
            {isEnglish ? 'Activities & Practice' : 'กิจกรรมและการปฏิบัติธรรม'}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-brand-muted sm:text-lg">
            {isEnglish
              ? 'Join student monks at Wat Mahathat, Ayutthaya for open Dhamma conversation and gentle mindful meditation. All sessions are free during active hours.'
              : 'ร่วมกิจกรรมสนทนาธรรมและฝึกสมาธิเจริญสติ ณ วัดมหาธาตุ พระนครศรีอยุธยา โดยพระนิสิต มจร เข้าร่วมได้ฟรีในช่วงวันและเวลาทำการ'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#official-schedule"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#A43D1D] px-4 py-2 text-sm font-medium text-white hover:bg-[#8E3317]"
            >
              <GuideIcon name="calendar" />
              <span>{isEnglish ? 'View schedule' : 'ดูตารางกิจกรรม'}</span>
            </a>
            <Link
              to="/meditation"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#D5BD94] bg-[#FFFDF7] px-4 py-2 text-sm font-medium text-[#681B16] hover:bg-[#FDF4E3]"
            >
              <GuideIcon name="lotus" />
              <span>{isEnglish ? 'Guided Meditation' : 'ฝึกสมาธิเบื้องต้น'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: CONFIRMED OFFICIAL ACTIVITIES */}
      <section aria-labelledby="confirmed-activities-title" className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A43D1D]">
              <GuideIcon name="calendar" />
              <span>{isEnglish ? 'Weekly sessions' : 'กิจกรรมประจำสัปดาห์'}</span>
            </span>
            <h2 id="confirmed-activities-title" className="font-serif text-2xl font-semibold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Regular Monk Chat & Meditation' : 'กิจกรรมประจำสัปดาห์ Monk Chat'}
            </h2>
          </div>
          <p className="text-sm text-brand-muted">
            {isEnglish ? 'Free walk-ins at Wat Mahathat' : 'เข้าร่วมได้ทันที ณ วัดมหาธาตุ อยุธยา'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {confirmedActivities.map((act, idx) => (
            <article
              key={idx}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7]"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                </div>

                <div className="p-6">
                  <p className="flex items-start gap-2 text-sm leading-6 text-brand-muted"><GuideIcon name="clock" className="mt-1 h-[18px] w-[18px]" /><span>{act.schedule}</span></p>
                  <h3 className="mt-3 font-sans text-xl font-medium text-brand-maroon">{act.title}</h3>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-brand-muted"><GuideIcon name="pin" className="mt-1 h-[18px] w-[18px]" /><span>{act.location}</span></p>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{act.desc}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={act.ctaLink}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#A43D1D] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8E3317]"
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
      <section id="official-schedule" aria-labelledby="schedule-table-title" className="scroll-mt-24 space-y-4">
        <div>
          <span className="text-sm font-medium text-[#A43D1D]">
            {isEnglish ? 'Time and place' : 'วัน เวลา และสถานที่'}
          </span>
          <h2 id="schedule-table-title" className="font-serif text-2xl font-semibold text-[#681B16] sm:text-3xl">
            {isEnglish ? 'Activity schedule' : 'ตารางกิจกรรม'}
          </h2>
        </div>

        <div className="space-y-4 md:hidden">
          {confirmedSchedule.map(row => <dl key={row.day} className="grid gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5">
            {[
              [isEnglish ? 'Day' : 'วัน', row.day],
              [isEnglish ? 'Time' : 'เวลา', row.time],
              [isEnglish ? 'Activity' : 'กิจกรรม', row.activity],
              [isEnglish ? 'Location' : 'สถานที่', row.location],
              [isEnglish ? 'Conditions and format' : 'เงื่อนไขและรูปแบบ', row.format],
            ].map(([label, value]) => <div key={label} className="grid grid-cols-[5rem_1fr] gap-3">
              <dt className="text-sm leading-6 text-brand-muted">{label}</dt>
              <dd className="min-w-0 text-sm leading-6 text-brand-text tabular-nums">{value}</dd>
            </div>)}
          </dl>)}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl md:block border border-[#EADCC6] bg-[#FFFDF7]">
          <table className="w-full text-left text-sm leading-6 text-brand-text">
            <thead className="border-b border-[#EADCC6] bg-[#FDF4E3]/70 font-sans text-[#681B16]">
              <tr>
                <th scope="col" className="px-4 py-4 sm:px-6">{isEnglish ? 'Day' : 'วัน'}</th>
                <th scope="col" className="px-4 py-4 sm:px-6">{isEnglish ? 'Time' : 'เวลา'}</th>
                <th scope="col" className="px-4 py-4 sm:px-6">{isEnglish ? 'Activity' : 'กิจกรรม'}</th>
                <th scope="col" className="px-4 py-4 sm:px-6">{isEnglish ? 'Location' : 'สถานที่'}</th>
                <th scope="col" className="px-4 py-4 sm:px-6">{isEnglish ? 'Conditions & Format' : 'เงื่อนไขและรูปแบบ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCC6]/60">
              {confirmedSchedule.map((row, idx) => (
                <tr key={idx} className="transition-colors duration-150 hover:bg-[#FFF8EE]">
                  <td className="px-4 py-4 font-medium text-[#681B16] sm:px-6 whitespace-nowrap">{row.day}</td>
                  <td className="px-4 py-4 font-semibold text-[#A43D1D] sm:px-6 whitespace-nowrap">{row.time}</td>
                  <td className="px-4 py-4 font-medium text-[#30251E] sm:px-6">{row.activity}</td>
                  <td className="px-4 py-4 text-brand-muted sm:px-6">{row.location}</td>
                  <td className="px-4 py-4 text-brand-muted sm:px-6">{row.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-4 text-sm text-brand-muted space-y-1">
          <strong className="block text-[#681B16] font-medium">
            {isEnglish ? 'Notice regarding schedules:' : 'ข้อแนะนำเกี่ยวกับตารางกิจกรรม:'}
          </strong>
          <p>
            {isEnglish
              ? 'Sessions may occasionally be adjusted due to academic examinations or monastic duties. Walk-ins are free of charge during session hours. For other events or special arrangements, please check official announcements or ask the team via Q&A.'
              : 'รอบกิจกรรมอาจมีการปรับเปลี่ยนตามตารางการศึกษาและศาสนกิจของพระนิสิต ผู้มาเยือนสามารถเข้าร่วมได้ฟรีในช่วงเวลาทำการโดยไม่ต้องลงทะเบียน สำหรับกิจกรรมพิเศษหรือการประสานงานเป็นกลุ่ม กรุณาติดต่อทีมงานล่วงหน้า'}
          </p>
        </div>
      </section>

      {/* SECTION 3: CALLOUT BANNER (SAFE & ACCURATE) */}
      <section className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-6 text-brand-text sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-sm text-brand-muted">
            {isEnglish ? 'Welcome to Monk Chat' : 'ยินดีต้อนรับผู้มาเยือนทุกท่าน'}
          </span>
          <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
            {isEnglish ? 'Join Monk Chat at Wat Mahathat' : 'ร่วมกิจกรรม Monk Chat ณ วัดมหาธาตุ'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'Weekly Monk Chat sessions at Wat Mahathat are completely free of charge with no advance registration needed. For special activities or other inquiries, please consult official announcements or contact the project team.'
              : 'กิจกรรม Monk Chat ประจำสัปดาห์ ณ วัดมหาธาตุ เข้าร่วมได้ฟรีโดยไม่ต้องลงทะเบียนล่วงหน้าในช่วงเวลาทำการ สำหรับกิจกรรมรอบพิเศษหรือข้อมูลอื่น ๆ สามารถตรวจสอบประกาศทางการหรือสอบถามทีมงานโครงการ'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
            >
              <span>{isEnglish ? 'Plan Your Visit' : 'วางแผนการมาเยือน'}</span>
              <span>→</span>
            </Link>
            <Link
              to="/qa"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
            >
              <span>{isEnglish ? 'Ask via Q&A' : 'ถาม-ตอบข้อสงสัย'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: VISITOR GUIDELINES */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-[#A43D1D]">
            {isEnglish ? 'Visitor Etiquette' : 'ข้อควรปฏิบัติสำหรับผู้ร่วมกิจกรรม'}
          </span>
          <h2 className="mt-1 font-sans text-xl font-semibold text-[#681B16]">
            {isEnglish ? 'Simple Guidelines for Temple Activities' : 'ข้อแนะนำเบื้องต้นในการร่วมกิจกรรมในวัด'}
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">

            <h3 className="mt-2 text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Dress Modestly' : 'การแต่งกายสุภาพ'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Please wear clothing that covers your shoulders and knees out of respect for the monastic setting.'
                : 'สวมใส่เสื้อผ้าสุภาพ ปกปิดหัวไหล่และหัวเข่า เพื่อแสดงความเคารพต่อสถานที่ศักดิ์สิทธิ์'}
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">

            <h3 className="mt-2 text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Remove Footwear' : 'ถอดรองเท้า'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Remove shoes and hats before entering meditation halls, pavilions, and sacred mat areas.'
                : 'ถอดรองเท้าและหมวกก่อนเข้าสู่ศาลาปฏิบัติธรรมหรือบริเวณปูเสื่อสำหรับสนทนา'}
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-4">

            <h3 className="mt-2 text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Respectful Presence' : 'กิริยาที่สงบสำรวม'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Turn mobile phones to silent mode. Speak softly and show kindness towards monks and fellow visitors.'
                : 'ตั้งเสียงโทรศัพท์เป็นระบบเงียบ สำรวมกาย วาจา และพูดคุยด้วยความเคารพเป็นมิตร'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: MCU PROJECT BACKGROUND */}
      <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5">
        <button
          type="button"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          aria-expanded={isAboutExpanded}
          aria-controls="activities-project-details" className="flex min-h-11 w-full cursor-pointer items-start justify-between gap-4 text-left"
        >
          <div>
            <h2 className="font-serif text-sm font-semibold text-[#681B16]">
              {isEnglish ? 'About MonkChat Guide & MCU Collaboration' : 'ข้อมูลโครงการและคณะผู้จัดทำ มจร'}
            </h2>
            <p className="mt-0.5 text-sm text-brand-muted">
              {isEnglish
                ? 'Academic partnership and student monk field support project'
                : 'โครงการบริการวิชาการและสนับสนุนการสื่อสารธรรมะสำหรับพระนิสิต'}
            </p>
          </div>
          <GuideIcon name="down" className={`mt-1 h-[18px] w-[18px] text-brand-muted transition-transform duration-150 ${isAboutExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isAboutExpanded && (
          <div id="activities-project-details" className="mt-4 space-y-3 border-t border-[#EADCC6] pt-4 text-sm leading-relaxed text-brand-muted">
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
