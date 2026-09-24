import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { PrototypeSwitcher, type HomePrototypeVariant } from '../components/PrototypeSwitcher'

// Three variants of the public Home, switchable via ?variant=, on the existing / route.

const images = {
  hero: '/images/home/monkchat-meditation-hero.webp',
  field: '/images/home/monkchat-meditation-field.webp',
  ruins: '/images/home/monkchat-meditation-ruins.webp',
}

const prototypeCopy = {
  th: {
    project: 'Monk Chat Ayutthaya',
    guide: 'เข้าสู่คู่มือผู้มาเยือน',
    join: 'วางแผนมา Monk Chat',
    title: 'เมื่อคนต่างภาษา\nได้นั่งลงคุยกัน',
    summary: 'พื้นที่พบปะระหว่างพระนิสิตและผู้มาเยือน เพื่อสนทนา เรียนรู้วัฒนธรรม และเริ่มต้นฝึกสมาธิอย่างเป็นกันเอง',
    disclosure: 'ภาพจำลองบรรยากาศด้วย AI — ไม่ใช่ภาพกิจกรรมจริง',
    encounter: 'หัวใจของ Monk Chat ไม่ใช่การบรรยาย แต่คือการเปิดพื้นที่ให้ถาม พูดคุย และทำความเข้าใจกันจริง ๆ',
    talk: 'พบและสนทนา',
    talkText: 'พูดคุยกับพระนิสิตในภาษาที่เข้าถึงง่าย ถามสิ่งที่สงสัยได้โดยไม่ต้องมีพื้นฐานมาก่อน',
    culture: 'เรียนรู้วิถีวัด',
    cultureText: 'เข้าใจพระพุทธศาสนา มารยาท และวัฒนธรรมไทยผ่านสถานที่และการพบปะจริง',
    meditate: 'ลองฝึกสมาธิ',
    meditateText: 'เริ่มต้นอย่างเรียบง่าย แล้วนำเสียงและบทฝึกใน MonkChat Guide กลับไปฝึกต่อได้',
    storyTitle: 'หนึ่งการพบกัน สามประสบการณ์',
    storyText: 'เริ่มจากบทสนทนา เปิดมุมมองผ่านวัฒนธรรม และจบด้วยช่วงเวลาสงบที่นำกลับไปใช้ได้ในชีวิตประจำวัน',
    guideTitle: 'การพบกันไม่จำเป็นต้องจบเมื่อเดินทางกลับ',
    guideText: 'ใช้คู่มือเสียงสมาธิ คำถาม–คำตอบที่ผ่านการตรวจ และช่องทางฝึกต่อจากโทรศัพท์ของคุณ',
    planTitle: 'อยากมาร่วมกิจกรรม?',
    planText: 'ตรวจสอบรอบกิจกรรมและรายละเอียดล่าสุดจากช่องทางทางการก่อนเดินทาง',
    schedule: 'วันและเวลา',
    scheduleValue: 'ดูประกาศรอบล่าสุดทาง Facebook',
    place: 'สถานที่',
    placeValue: 'ยืนยันสถานที่กับทีมโครงการก่อนเดินทาง',
    prepare: 'เตรียมตัว',
    prepareValue: 'มาแบบสบาย ๆ พร้อมคำถามที่อยากพูดคุย',
    facebook: 'ตรวจสอบกิจกรรมล่าสุด',
    tools: 'ฝึกต่อด้วย MonkChat Guide',
  },
  en: {
    project: 'Monk Chat Ayutthaya',
    guide: 'Open visitor guide',
    join: 'Plan a Monk Chat visit',
    title: 'When people across languages\nsit down and talk',
    summary: 'A welcoming meeting between monk students and visitors—to exchange questions, encounter Thai culture, and begin meditation together.',
    disclosure: 'AI-generated atmospheric illustration — not an actual project activity',
    encounter: 'Monk Chat is not a lecture. It is an open space to ask, listen, and understand one another through a real conversation.',
    talk: 'Meet and talk',
    talkText: 'Speak with monk students in approachable language and ask questions without needing prior Buddhist knowledge.',
    culture: 'Explore temple life',
    cultureText: 'Understand Buddhism, etiquette, and Thai culture through place and genuine encounter.',
    meditate: 'Try meditation',
    meditateText: 'Begin simply, then take home audio and practice resources from MonkChat Guide.',
    storyTitle: 'One encounter, three experiences',
    storyText: 'Begin with conversation, widen perspective through culture, and end with a quiet practice that can continue at home.',
    guideTitle: 'The encounter does not have to end when you leave',
    guideText: 'Continue with guided audio, reviewed questions and answers, and trusted practice links on your phone.',
    planTitle: 'Interested in joining?',
    planText: 'Check the official channel for the latest session details before travelling.',
    schedule: 'Date and time',
    scheduleValue: 'See the latest announcement on Facebook',
    place: 'Location',
    placeValue: 'Confirm the meeting point with the project team',
    prepare: 'What to bring',
    prepareValue: 'Come comfortably with the questions you want to explore',
    facebook: 'Check latest sessions',
    tools: 'Continue with MonkChat Guide',
  },
} as const

function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${direction === 'down' ? 'rotate-90' : ''}`}>
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Brand({ dark = false }: { dark?: boolean }) {
  const { i18n } = useTranslation()
  const copy = prototypeCopy[i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'th']
  return (
    <Link to="/" className={`flex items-center gap-3 ${dark ? 'text-white' : 'text-[#432D27]'}`}>
      <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 rounded-xl bg-white ring-1 ring-current/10" />
      <span>
        <span className="block text-sm font-black leading-none">Monk Chat</span>
        <span className={`mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.22em] ${dark ? 'text-white/65' : 'text-[#8E503D]'}`}>Ayutthaya</span>
      </span>
      <span className="sr-only">{copy.project}</span>
    </Link>
  )
}

function PrototypeDisclosure({ inverse = false }: { inverse?: boolean }) {
  const { i18n } = useTranslation()
  const copy = prototypeCopy[i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'th']
  return (
    <span className={`inline-flex items-center gap-2 text-[0.68rem] font-semibold ${inverse ? 'text-white/80' : 'text-[#654B42]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${inverse ? 'bg-[#EBC39F]' : 'bg-[#A95F47]'}`} />
      {copy.disclosure}
    </span>
  )
}

function DocumentaryOpening() {
  const { i18n } = useTranslation()
  const c = prototypeCopy[i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'th']
  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F0E8] text-[#432D27]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Brand dark />
          <div className="flex items-center gap-3">
            <LanguageSwitcher tone="clay" />
            <Link to="/visit" className="hidden min-h-11 items-center gap-2 rounded-full bg-[#F8EFE6] px-5 text-sm font-bold text-[#56372E] sm:inline-flex">{c.guide}<Arrow /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[92svh] overflow-hidden bg-[#35251F] text-white">
          <img src={images.field} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,15,0.28)_0%,rgba(24,18,15,0.06)_35%,rgba(24,18,15,0.78)_100%)]" />
          <div className="relative mx-auto flex min-h-[92svh] max-w-[90rem] flex-col justify-end px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12">
            <div className="grid items-end gap-8 lg:grid-cols-[1.35fr_0.65fr]">
              <h1 className="max-w-5xl whitespace-pre-line text-[clamp(3.25rem,8vw,7.5rem)] font-black leading-[0.93] tracking-[-0.04em] text-balance">{c.title}</h1>
              <div className="max-w-xl lg:justify-self-end">
                <p className="text-base leading-8 text-white/90 sm:text-lg">{c.summary}</p>
                <Link to="#encounter" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#C86E4C] px-6 text-sm font-bold text-white transition-colors hover:bg-[#AF583B]">{c.join}<Arrow direction="down" /></Link>
              </div>
            </div>
            <div className="mt-10 border-t border-white/30 pt-4"><PrototypeDisclosure inverse /></div>
          </div>
        </section>

        <section id="encounter" className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
          <p className="max-w-5xl text-3xl font-bold leading-[1.35] tracking-[-0.025em] text-balance sm:text-5xl lg:text-6xl">{c.encounter}</p>
          <div className="mt-16 grid border-y border-[#9A705F]/28 md:grid-cols-3">
            {[[c.talk, c.talkText], [c.culture, c.cultureText], [c.meditate, c.meditateText]].map(([title, text], index) => (
              <article key={title} className={`py-8 md:px-8 md:py-12 ${index > 0 ? 'border-t border-[#9A705F]/28 md:border-l md:border-t-0' : ''}`}>
                <p className="text-xl font-black">{title}</p>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#654B42]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#663D31] text-white">
          <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[1.1fr_0.9fr]">
            <img src={images.ruins} alt="" loading="lazy" className="h-full min-h-[26rem] w-full object-cover" />
            <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
              <PrototypeDisclosure inverse />
              <h2 className="mt-8 text-4xl font-black leading-tight tracking-[-0.035em] text-balance sm:text-6xl">{c.guideTitle}</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/80">{c.guideText}</p>
              <Link to="/visit" className="mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#E8B881] px-6 text-sm font-bold text-[#432D27]">{c.guide}<Arrow /></Link>
            </div>
          </div>
        </section>

        <VisitStrip copy={c} />
      </main>
      <PrototypeSwitcher current="A" />
    </div>
  )
}

function ConversationJournal() {
  const { i18n } = useTranslation()
  const c = prototypeCopy[i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'th']
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FFFDF9] text-[#3E302B]">
      <header className="border-b border-[#8A5D4D]/18 bg-[#FFFDF9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Brand />
          <div className="flex items-center gap-3"><LanguageSwitcher tone="clay" /><Link to="/visit" className="hidden text-sm font-bold underline decoration-[#B5664B] decoration-2 underline-offset-8 sm:block">{c.guide}</Link></div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[78svh] max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-12">
          <div className="relative z-10 lg:pr-8">
            <h1 className="whitespace-pre-line text-[clamp(3rem,6vw,6rem)] font-black leading-[0.98] tracking-[-0.04em] text-balance">{c.title}</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#654B42] sm:text-lg">{c.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#story" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#723F30] px-6 text-sm font-bold text-white">{c.storyTitle}<Arrow direction="down" /></a>
              <Link to="/visit" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#723F30]/25 px-6 text-sm font-bold">{c.tools}</Link>
            </div>
          </div>
          <figure className="relative lg:-mr-10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#E9D6C8] sm:aspect-[16/11] lg:aspect-[4/5]">
              <img src={images.hero} alt="" className="h-full w-full object-cover" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#281D18]/60 to-transparent" />
            </div>
            <figcaption className="mt-4"><PrototypeDisclosure /></figcaption>
          </figure>
        </section>

        <section id="story" className="border-y border-[#8A5D4D]/18 bg-[#F3E6DB]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr]">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-4xl font-black tracking-[-0.035em] sm:text-5xl">{c.storyTitle}</h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#654B42]">{c.storyText}</p>
              </div>
              <div className="divide-y divide-[#8A5D4D]/22 border-y border-[#8A5D4D]/22">
                {[[c.talk, c.talkText], [c.culture, c.cultureText], [c.meditate, c.meditateText]].map(([title, text]) => (
                  <article key={title} className="grid gap-3 py-8 sm:grid-cols-[0.55fr_1.45fr] sm:gap-8 sm:py-11">
                    <h3 className="text-2xl font-black">{title}</h3>
                    <p className="max-w-xl text-base leading-8 text-[#654B42]">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-5 sm:grid-cols-[1.4fr_0.6fr]">
            <figure><img src={images.field} alt="" loading="lazy" className="aspect-[16/10] h-full w-full rounded-[1rem] object-cover" /><figcaption className="mt-3"><PrototypeDisclosure /></figcaption></figure>
            <div className="flex flex-col justify-between rounded-[1rem] bg-[#25423A] p-7 text-white sm:p-9">
              <div><h2 className="text-3xl font-black leading-tight tracking-[-0.03em]">{c.guideTitle}</h2><p className="mt-5 text-sm leading-7 text-white/80">{c.guideText}</p></div>
              <Link to="/visit" className="mt-10 inline-flex min-h-12 items-center justify-between border-t border-white/30 pt-5 text-sm font-bold text-[#F2C79F]">{c.guide}<Arrow /></Link>
            </div>
          </div>
        </section>

        <VisitStrip copy={c} />
      </main>
      <PrototypeSwitcher current="B" />
    </div>
  )
}

function VisitFirst() {
  const { i18n } = useTranslation()
  const c = prototypeCopy[i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'th']
  return (
    <div className="min-h-screen overflow-x-clip bg-[#F6EFE7] text-[#372A26]">
      <header className="bg-[#1E3C35] text-white">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Brand dark />
          <div className="flex items-center gap-3"><LanguageSwitcher tone="clay" /><Link to="/visit" className="hidden min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-bold sm:inline-flex">{c.tools}</Link></div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[90rem] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-12 lg:py-20">
          <div className="flex flex-col justify-center">
            <h1 className="whitespace-pre-line text-[clamp(3.2rem,6.4vw,6.4rem)] font-black leading-[0.94] tracking-[-0.04em] text-balance">{c.title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#634C43] sm:text-lg">{c.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#plan" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#B65F43] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(119,58,42,0.18)]">{c.join}<Arrow direction="down" /></a>
              <Link to="/visit" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#E9D7C7] px-6 text-sm font-bold text-[#4A342D]">{c.guide}<Arrow /></Link>
            </div>
          </div>
          <figure>
            <img src={images.ruins} alt="" className="aspect-[4/5] w-full rounded-[1rem] object-cover sm:aspect-[16/10] lg:aspect-[4/5]" />
            <figcaption className="mt-3"><PrototypeDisclosure /></figcaption>
          </figure>
        </section>

        <section id="plan" className="bg-[#FFFDF9]">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div>
                <h2 className="text-4xl font-black leading-tight tracking-[-0.035em] sm:text-6xl">{c.planTitle}</h2>
                <p className="mt-5 max-w-md text-base leading-8 text-[#634C43]">{c.planText}</p>
              </div>
              <div className="border-y border-[#855E50]/25">
                {[[c.schedule, c.scheduleValue], [c.place, c.placeValue], [c.prepare, c.prepareValue]].map(([label, value]) => (
                  <div key={label} className="grid gap-2 border-b border-[#855E50]/25 py-7 last:border-b-0 sm:grid-cols-[0.55fr_1.45fr] sm:gap-8">
                    <p className="text-sm font-black text-[#7A3E2E]">{label}</p>
                    <p className="text-base font-bold leading-7">{value}</p>
                  </div>
                ))}
                <a href="https://web.facebook.com/MonkChatAyutthaya/" target="_blank" rel="noreferrer" className="mb-7 mt-2 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1E3C35] px-6 text-sm font-bold text-white">{c.facebook}<Arrow /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#D9B19A]">
          <div className="mx-auto grid max-w-[90rem] lg:grid-cols-2">
            <img src={images.field} alt="" loading="lazy" className="min-h-[24rem] h-full w-full object-cover" />
            <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
              <PrototypeDisclosure />
              <h2 className="mt-8 text-4xl font-black leading-tight tracking-[-0.035em] text-balance sm:text-6xl">{c.storyTitle}</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#533C34]">{c.storyText}</p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-black text-[#54382E]">
                <span>{c.talk}</span><span aria-hidden="true">·</span><span>{c.culture}</span><span aria-hidden="true">·</span><span>{c.meditate}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1E3C35] text-white">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:py-20">
            <div><h2 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.035em] sm:text-6xl">{c.guideTitle}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-white/80">{c.guideText}</p></div>
            <Link to="/visit" className="inline-flex min-h-13 shrink-0 items-center gap-3 rounded-full bg-[#EBC39F] px-7 text-sm font-bold text-[#2E2926]">{c.guide}<Arrow /></Link>
          </div>
        </section>
      </main>
      <PrototypeSwitcher current="C" />
    </div>
  )
}

function VisitStrip({ copy }: { copy: (typeof prototypeCopy)['th'] | (typeof prototypeCopy)['en'] }) {
  return (
    <section className="bg-[#F0D8C7]">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-16">
        <div><h2 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">{copy.planTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#654B42]">{copy.planText}</p></div>
        <a href="https://web.facebook.com/MonkChatAyutthaya/" target="_blank" rel="noreferrer" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[#723F30] px-6 text-sm font-bold text-white">{copy.facebook}<Arrow /></a>
      </div>
    </section>
  )
}

export function ProjectInfoPrototype({ variant }: { variant: HomePrototypeVariant }) {
  if (variant === 'B') return <ConversationJournal />
  if (variant === 'C') return <VisitFirst />
  return <DocumentaryOpening />
}
