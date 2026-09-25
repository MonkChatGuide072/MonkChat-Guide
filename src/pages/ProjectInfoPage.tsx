import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const slides = [
  '/images/home/monkchat-slide-1.webp',
  '/images/home/monkchat-slide-2.webp',
  '/images/home/monkchat-slide-3.webp',
  '/images/home/monkchat-slide-4.webp',
]

function ArrowIcon({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" className={direction === 'left' ? 'h-4 w-4 rotate-180' : 'h-4 w-4'} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DetailIcon({ type }: { type: 'time' | 'place' | 'experience' }) {
  if (type === 'time') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
  }
  if (type === 'place') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 17.5 3 20v-5.1A7.8 7.8 0 1 1 10.8 20H7.5" /><path d="M8 10h8m-8 3.5h5" strokeLinecap="round" /></svg>
}

export function ProjectInfoPage() {
  const { t, i18n } = useTranslation()
  const [activeSlide, setActiveSlide] = useState(0)
  const isEnglish = (i18n.resolvedLanguage || i18n.language).startsWith('en')
  const labels = isEnglish
    ? ['Inner peace', 'Guided closely', 'Open conversation', 'An Ayutthaya memory']
    : ['ความสงบภายใน', 'สมาธิใกล้ชิด', 'สนทนาอย่างเป็นกันเอง', 'ความทรงจำจากอยุธยา']

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [])

  const showSlide = (next: number) => {
    setActiveSlide((next + slides.length) % slides.length)
  }

  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden bg-[#20231c] text-white">
      <div className="absolute inset-0 -z-30" aria-live="polite">
        {slides.map((slide, index) => (
          <img
            key={slide}
            src={slide}
            alt=""
            aria-hidden={index !== activeSlide}
            decoding={index === 0 ? 'sync' : 'async'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-1000 motion-reduce:transition-none ${index === activeSlide ? 'scale-100 opacity-100' : 'scale-[1.025] opacity-0'}`}
          />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(15,16,13,.56)_0%,rgba(15,16,13,.16)_30%,rgba(15,16,13,.25)_58%,rgba(15,16,13,.92)_100%),linear-gradient(90deg,rgba(15,16,13,.45)_0%,transparent_60%,rgba(15,16,13,.24)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.75)_.45px,transparent_.45px)] [background-size:4px_4px]" />

      <header className="relative z-20 mx-auto flex w-[min(1180px,calc(100%_-_2rem))] items-center justify-between py-4 sm:w-[min(1180px,calc(100%_-_3rem))]">
        <Link to="/" className="flex items-center gap-3" aria-label="Monk Chat Ayutthaya">
          <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 rounded-xl bg-white/95 ring-1 ring-white/25" />
          <span className="leading-tight">
            <span className="block text-sm font-black">Monk Chat</span>
            <span className="mt-1 block text-[.58rem] font-bold uppercase tracking-[.22em] text-white/65">Ayutthaya</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher tone="overlay" />
          <Link to="/visit" className="hidden min-h-11 items-center gap-2 rounded-full bg-white/92 px-5 text-xs font-bold text-[#3d3029] shadow-lg transition-transform hover:-translate-y-0.5 sm:inline-flex">
            {t('projectLanding.navGuide')}<ArrowIcon />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh_-_5rem)] w-[min(1180px,calc(100%_-_2rem))] content-end gap-8 pb-5 pt-12 sm:w-[min(1180px,calc(100%_-_3rem))] sm:pb-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end lg:gap-14">
        <section className="pb-2">
          <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.12em] text-[#ffe1c8] before:h-0.5 before:w-7 before:bg-[#d87350] before:content-['']">
            {t('projectLanding.openingEyebrow')}
          </p>
          <h1 className="whitespace-pre-line font-serif text-[clamp(3.5rem,8vw,7.1rem)] font-bold leading-[.84] tracking-[-.055em] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,.28)]">
            {t('projectLanding.openingTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-[.96rem] leading-7 text-white/85 sm:text-lg sm:leading-8">
            {t('projectLanding.openingIntro')}
          </p>
        </section>

        <aside className="rounded-[1.4rem] border border-white/25 bg-[#1a1e17]/45 p-5 shadow-[0_24px_60px_rgba(0,0,0,.24)] backdrop-blur-xl sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-[.12em] text-[#ffd7bd]">{t('projectLanding.openingInfoTitle')}</h2>
          <dl className="mt-3 divide-y divide-white/13 text-sm">
            <div className="grid grid-cols-[1.7rem_1fr] items-start gap-2 py-3"><DetailIcon type="time" /><dd>{t('projectLanding.openingSchedule')}</dd></div>
            <div className="grid grid-cols-[1.7rem_1fr] items-start gap-2 py-3"><DetailIcon type="place" /><dd>{t('projectLanding.openingLocation')}</dd></div>
            <div className="grid grid-cols-[1.7rem_1fr] items-start gap-2 py-3"><DetailIcon type="experience" /><dd>{t('projectLanding.openingExperience')}</dd></div>
          </dl>
          <Link to="/visit" className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d87350] px-5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(176,78,45,.38)] transition-all hover:-translate-y-0.5 hover:bg-[#bd5d3f]">
            {t('projectLanding.openingCta')}<ArrowIcon />
          </Link>
        </aside>

        <div className="col-span-full grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-white/25 pt-3 sm:gap-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => showSlide(activeSlide - 1)} aria-label={isEnglish ? 'Previous image' : 'ภาพก่อนหน้า'} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/20 transition-colors hover:bg-black/35"><ArrowIcon direction="left" /></button>
            <button type="button" onClick={() => showSlide(activeSlide + 1)} aria-label={isEnglish ? 'Next image' : 'ภาพถัดไป'} className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/20 transition-colors hover:bg-black/35"><ArrowIcon /></button>
          </div>
          <div className="grid min-w-0 grid-cols-4 gap-2" role="tablist" aria-label={isEnglish ? 'Monk Chat atmosphere' : 'บรรยากาศ Monk Chat'}>
            {labels.map((label, index) => (
              <button key={label} type="button" role="tab" aria-selected={index === activeSlide} onClick={() => showSlide(index)} className={`min-w-0 border-t-2 px-1 py-2 text-left transition-colors ${index === activeSlide ? 'border-[#d87350] text-white' : 'border-white/25 text-white/55 hover:text-white/80'}`}>
                <span className="block text-[.55rem] font-bold tracking-[.12em]">0{index + 1}</span>
                <strong className="mt-0.5 block truncate text-[.65rem] sm:text-xs">{label}</strong>
              </button>
            ))}
          </div>
          <span className="text-xs tabular-nums text-white/65">0{activeSlide + 1} / 04</span>
        </div>
      </div>
    </main>
  )
}
