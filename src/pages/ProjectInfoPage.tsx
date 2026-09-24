import { Link, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { lazy, Suspense, type ReactNode } from 'react'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import type { HomePrototypeVariant } from '../components/PrototypeSwitcher'

const ProjectInfoPrototype = lazy(() => import('./ProjectInfoPrototype').then((module) => ({ default: module.ProjectInfoPrototype })))

const facebookUrl = 'https://web.facebook.com/MonkChatAyutthaya/'
const meditationCenterUrl = 'https://ayothayameditation.com'

function ArrowIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ConversationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path d="M5.5 17.5 3 20v-5.25A7.75 7.75 0 1 1 10.75 20H7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h8m-8 3.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function CultureIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path d="M4 20h16M6 20v-8h12v8M5 12l7-8 7 8M9 20v-4h6v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MeditationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 10.5c1.5-1.3 5.5-1.3 7 0M12 9v6m0 0-4.5 4m4.5-4 4.5 4M4 19h5m6 0h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2M6.5 14H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1.5v-6Zm11 0H19a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1.5v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M9 9a3 3 0 1 1 5.35 1.85C13.3 12.2 12 12.25 12 14m0 3h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function ActivityCard({ icon, title, text, accent }: {
  icon: ReactNode
  title: string
  text: string
  accent: string
}) {
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-[#7A3E2E]/10 bg-[#FFFDFC] shadow-[0_15px_45px_rgba(91,58,49,0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(91,58,49,0.12)]">
      <div className={`h-2 ${accent}`} />
      <div className="p-6 sm:p-7">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F3DED4] text-[#7A3E2E] transition-colors group-hover:bg-[#7A3E2E] group-hover:text-white">
          {icon}
        </span>
        <h3 className="mt-6 text-xl font-bold text-[#4A3029]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#6B5149]/78">{text}</p>
      </div>
    </article>
  )
}

function GalleryVisual({ src, label, position = 'center' }: { src: string; label: string; position?: string }) {
  return (
    <figure className="relative h-full min-h-64 overflow-hidden bg-[#E8D3C8]">
      <img src={src} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]" style={{ objectPosition: position }} />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#35251F]/88 to-transparent px-5 pb-5 pt-16 text-sm font-bold text-white">
        {label}
      </figcaption>
    </figure>
  )
}

function GuideCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 backdrop-blur-sm">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D7AA73] text-[#4A3029]">{icon}</span>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
    </article>
  )
}

export function ProjectInfoPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const requestedVariant = searchParams.get('variant')?.toUpperCase()
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname
  const isCloudflarePreview = hostname.endsWith('.monkchat-guide.pages.dev') && hostname !== 'monkchat-guide.pages.dev'
  const canShowPrototype = import.meta.env.DEV || isCloudflarePreview

  if (canShowPrototype && (requestedVariant === 'A' || requestedVariant === 'B' || requestedVariant === 'C')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#F7F0E8]" />}>
        <ProjectInfoPrototype variant={requestedVariant as HomePrototypeVariant} />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBF6EF] text-[#4A342E]">
      <header className="sticky top-0 z-30 border-b border-[#7A3E2E]/10 bg-[#E8C8BA]/92 shadow-[0_8px_25px_rgba(91,58,49,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label="Monk Chat Ayutthaya">
            <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-[#7A3E2E]/10 transition-transform group-hover:-rotate-3" />
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold tracking-tight text-[#4A3029] sm:text-base">Monk Chat</span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.19em] text-[#7A3E2E]/65">Ayutthaya</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label={t('projectLanding.navigation')}>
            <a href="#about" className="text-sm font-bold text-[#5B3A31]/68 transition-colors hover:text-[#5B3A31]">{t('projectLanding.navAbout')}</a>
            <a href="#activities" className="text-sm font-bold text-[#5B3A31]/68 transition-colors hover:text-[#5B3A31]">{t('projectLanding.navActivities')}</a>
            <a href="#gallery" className="text-sm font-bold text-[#5B3A31]/68 transition-colors hover:text-[#5B3A31]">{t('projectLanding.navGallery')}</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher tone="clay" />
            <Link to="/visit" className="hidden min-h-10 items-center rounded-full bg-[#7A3E2E] px-4 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#603025] sm:inline-flex">
              {t('projectLanding.navGuide')}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#F1DDD3]">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_16%,rgba(255,253,249,0.9),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(122,62,46,0.12),transparent_25%),linear-gradient(135deg,rgba(239,205,191,0.45),transparent_55%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[calc(100vh-65px)] lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:px-12 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7A3E2E]/12 bg-[#FFFDFC]/72 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7A3E2E] shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9A5A45]" />
                {t('projectLanding.eyebrow')}
              </span>
              <h1 className="mt-7 text-[2.6rem] font-extrabold leading-[1.13] tracking-[-0.045em] text-balance text-[#4A3029] sm:text-6xl lg:text-[4.35rem]">
                {t('projectLanding.heroTitle')}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#6B5149]/84 sm:text-lg">
                {t('projectLanding.heroDescription')}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#about" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#7A3E2E] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(122,62,46,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#603025]">
                  {t('projectLanding.primaryCta')}
                  <ArrowIcon className="h-4 w-4 rotate-90" />
                </a>
                <Link to="/visit" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-[#7A3E2E]/15 bg-[#FFFDFC]/78 px-6 py-3.5 text-sm font-bold text-[#5B3A31] transition-all hover:-translate-y-0.5 hover:border-[#A86852]/55 hover:bg-white">
                  {t('projectLanding.secondaryCta')}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/60 bg-[#D9C2B5] shadow-[0_28px_80px_rgba(91,58,49,0.17)] sm:min-h-[30rem] lg:min-h-[36rem]">
              <img src="/images/home/monkchat-meditation-hero.webp" alt={t('projectLanding.heroVisualAlt')} decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#4A3029]/18 via-transparent to-[#FFF4E8]/6" />
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 bg-[#FFFDFC]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20 lg:px-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A503B]">{t('projectLanding.introEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-balance text-[#4A3029] sm:text-5xl">
                {t('projectLanding.introTitle')}
              </h2>
            </div>
            <div className="space-y-5 border-l-2 border-[#B86F57]/42 pl-6 sm:pl-8">
              <p className="text-base leading-8 text-[#6B5149]/86 sm:text-lg">{t('projectLanding.introDescription')}</p>
              <p className="text-sm leading-7 text-[#6B5149]/68 sm:text-base">{t('projectLanding.introSupporting')}</p>
            </div>
          </div>
        </section>

        <section className="bg-[#F3E6DE]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-12">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#6B4034] p-7 text-white shadow-[0_24px_70px_rgba(91,58,49,0.17)] sm:p-10">
              <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#D7AA73]/13" />
              <ConversationIcon />
              <blockquote className="relative mt-16 max-w-xl text-2xl font-bold leading-relaxed tracking-[-0.02em] sm:text-3xl">
                “{t('projectLanding.originQuote')}”
              </blockquote>
              <div className="relative mt-8 h-px w-24 bg-[#D7AA73]" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A503B]">{t('projectLanding.originEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#4A3029] sm:text-5xl">{t('projectLanding.originTitle')}</h2>
              <p className="mt-6 text-base leading-8 text-[#6B5149]/80">{t('projectLanding.originDescription')}</p>
            </div>
          </div>
        </section>

        <section id="activities" className="scroll-mt-24 bg-[#FBF6EF]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A503B]">{t('projectLanding.activitiesEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#4A3029] sm:text-5xl">{t('projectLanding.activitiesTitle')}</h2>
              <p className="mt-5 text-sm leading-7 text-[#6B5149]/72 sm:text-base">{t('projectLanding.activitiesDescription')}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <ActivityCard icon={<ConversationIcon />} title={t('projectLanding.conversationTitle')} text={t('projectLanding.conversationText')} accent="bg-[#B86F57]" />
              <ActivityCard icon={<CultureIcon />} title={t('projectLanding.cultureTitle')} text={t('projectLanding.cultureText')} accent="bg-[#D7AA73]" />
              <ActivityCard icon={<MeditationIcon />} title={t('projectLanding.meditationTitle')} text={t('projectLanding.meditationText')} accent="bg-[#7B8C78]" />
            </div>
          </div>
        </section>

        <section id="gallery" className="scroll-mt-24 bg-[#FFFDFC]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A503B]">{t('projectLanding.galleryEyebrow')}</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#4A3029] sm:text-5xl">{t('projectLanding.galleryTitle')}</h2>
              </div>
              <div className="max-w-2xl lg:ml-auto">
                <p className="text-sm leading-7 text-[#6B5149]/72 sm:text-base">{t('projectLanding.galleryDescription')}</p>
                <p className="mt-3 text-xs font-semibold text-[#7A3E2E]/62">{t('projectLanding.visualNote')}</p>
              </div>
            </div>
            <div className="mt-10 grid auto-rows-[17rem] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[20rem_13rem]">
              <div className="overflow-hidden rounded-[1.6rem] sm:col-span-2 lg:row-span-2">
                <GalleryVisual src="/images/home/monkchat-meditation-field.webp" label={t('projectLanding.galleryConversation')} position="center 48%" />
              </div>
              <div className="overflow-hidden rounded-[1.6rem]">
                <GalleryVisual src="/images/home/monkchat-meditation-hero.webp" label={t('projectLanding.galleryMeditation')} position="62% center" />
              </div>
              <div className="overflow-hidden rounded-[1.6rem]">
                <GalleryVisual src="/images/home/monkchat-meditation-ruins.webp" label={t('projectLanding.galleryWelcome')} position="60% center" />
              </div>
            </div>
          </div>
        </section>

        <section id="guide" className="scroll-mt-24 bg-[#53352D] text-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E4B88A]">{t('projectLanding.guideEyebrow')}</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-5xl">{t('projectLanding.guideTitle')}</h2>
                <p className="mt-5 text-sm leading-7 text-white/62 sm:text-base">{t('projectLanding.guideDescription')}</p>
                <Link to="/visit" className="mt-8 inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#D7AA73] px-6 py-3.5 text-sm font-bold text-[#4A3029] shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#E4BE91]">
                  {t('projectLanding.guideCta')}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <GuideCard icon={<HeadphonesIcon />} title={t('projectLanding.guideAudioTitle')} text={t('projectLanding.guideAudioText')} />
                <GuideCard icon={<QuestionIcon />} title={t('projectLanding.guideQaTitle')} text={t('projectLanding.guideQaText')} />
                <GuideCard icon={<CompassIcon />} title={t('projectLanding.guideCenterTitle')} text={t('projectLanding.guideCenterText')} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#EBCFC2]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8A4634]">{t('projectLanding.contactEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[#4A3029] sm:text-5xl">{t('projectLanding.contactTitle')}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6B5149]/74 sm:text-base">{t('projectLanding.contactDescription')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="group inline-flex min-h-12 items-center justify-between gap-5 rounded-xl bg-[#FFFDFC] px-5 py-3 text-sm font-bold text-[#5B3A31] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                {t('projectLanding.facebookLink')} <ArrowIcon className="h-4 w-4 -rotate-45 text-[#8A4634]" />
              </a>
              <a href={meditationCenterUrl} target="_blank" rel="noreferrer" className="group inline-flex min-h-12 items-center justify-between gap-5 rounded-xl border border-[#7A3E2E]/12 bg-[#FFFDFC]/58 px-5 py-3 text-sm font-bold text-[#5B3A31] transition-all hover:-translate-y-0.5 hover:bg-[#FFFDFC]">
                {t('projectLanding.centerLink')} <ArrowIcon className="h-4 w-4 -rotate-45 text-[#8A4634]" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#35251F] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8 lg:px-12">
          <div className="flex max-w-xl items-start gap-4">
            <img src="/monkchat-placeholder.svg" alt="" className="h-11 w-11 shrink-0 rounded-xl bg-white ring-1 ring-white/15" />
            <div>
              <p className="font-bold">Monk Chat Ayutthaya</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{t('projectLanding.footerDescription')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs text-white/45 sm:text-right">
            <p>{t('app.footer')}</p>
            <Link to="/admin/login" className="transition-colors hover:text-[#E4B88A]">{t('projectLanding.teamLogin')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
