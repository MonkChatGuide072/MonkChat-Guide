import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const facebookUrl = 'https://web.facebook.com/MonkChatAyutthaya/'
const meditationCenterUrl = 'https://ayothayameditation.com'

function ArrowIcon({ direction = 'right', className = 'h-5 w-5' }: {
  direction?: 'right' | 'down' | 'external'
  className?: string
}) {
  return (
    <svg className={`${className} ${direction === 'down' ? 'rotate-90' : ''} ${direction === 'external' ? '-rotate-45' : ''}`} aria-hidden="true" viewBox="0 0 24 24" fill="none">
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

function ImageDisclosure({ inverse = false }: { inverse?: boolean }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-start gap-2 text-xs font-semibold leading-5 ${inverse ? 'text-[#F5E8DF]' : 'text-[#694B40]'}`}>
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${inverse ? 'bg-[#E6B98F]' : 'bg-[#A95F47]'}`} />
      {t('projectLanding.visualNote')}
    </span>
  )
}

function ExperienceRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="grid gap-5 py-8 sm:grid-cols-[4rem_0.7fr_1.3fr] sm:items-start sm:gap-7 sm:py-10">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E7C4B2] text-[#6F3C2F]">{icon}</span>
      <h3 className="text-2xl font-black leading-tight tracking-[-0.025em] text-[#3F2E29]">{title}</h3>
      <p className="max-w-2xl text-base leading-8 text-[#60483F]">{text}</p>
    </article>
  )
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-[#6F4A3D]/20 py-6 last:border-b-0 sm:grid-cols-[0.52fr_1.48fr] sm:gap-8 sm:py-7">
      <dt className="text-sm font-black text-[#7A3E2E]">{label}</dt>
      <dd className="text-base font-bold leading-7 text-[#3F2E29]">{value}</dd>
    </div>
  )
}

function GuideRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="grid gap-4 border-b border-white/20 py-7 last:border-b-0 sm:grid-cols-[3rem_0.72fr_1.28fr] sm:items-start sm:gap-6">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E7BC8E] text-[#3D3029]">{icon}</span>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="text-sm leading-7 text-[#E8DED8]">{text}</p>
    </article>
  )
}

export function ProjectInfoPage() {
  const { t } = useTranslation()

  return (
    <div className="monkchat-home min-h-screen overflow-x-clip bg-[#FFFDF9] text-[#3F2E29]">
      <header className="sticky top-0 z-40 border-b border-[#744A3B]/15 bg-[#FFFDF9]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label="Monk Chat Ayutthaya">
            <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white ring-1 ring-[#744A3B]/15 transition-transform group-hover:-rotate-3" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-black tracking-tight text-[#3F2E29] sm:text-base">Monk Chat</span>
              <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[#8A4C39]">Ayutthaya</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label={t('projectLanding.navigation')}>
            <a href="#story" className="text-sm font-bold text-[#62493F] transition-colors hover:text-[#8A4C39]">{t('projectLanding.navStory')}</a>
            <a href="#moments" className="text-sm font-bold text-[#62493F] transition-colors hover:text-[#8A4C39]">{t('projectLanding.navMoments')}</a>
            <a href="#plan" className="text-sm font-bold text-[#62493F] transition-colors hover:text-[#8A4C39]">{t('projectLanding.navPlan')}</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher tone="clay" />
            <Link to="/visit" className="inline-flex min-h-10 items-center rounded-full bg-[#713D2F] px-4 text-xs font-bold text-white transition-colors hover:bg-[#5B3025]">
              {t('projectLanding.navGuide')}
            </Link>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-[#744A3B]/10 px-4 py-2 sm:px-8 lg:hidden" aria-label={t('projectLanding.mobileNavigation')}>
          <a href="#story" className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-[#F1E2D8] px-4 text-xs font-bold text-[#5A3A31]">{t('projectLanding.navStory')}</a>
          <a href="#moments" className="inline-flex min-h-9 shrink-0 items-center rounded-full px-4 text-xs font-bold text-[#5A3A31]">{t('projectLanding.navMoments')}</a>
          <a href="#plan" className="inline-flex min-h-9 shrink-0 items-center rounded-full px-4 text-xs font-bold text-[#5A3A31]">{t('projectLanding.navPlan')}</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[78svh] max-w-[90rem] gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[calc(100svh-65px)] lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-14 lg:px-12 lg:py-16">
          <div className="relative z-10 max-w-3xl lg:pr-4">
            <h1 className="whitespace-pre-line text-[clamp(3.15rem,6.5vw,6rem)] font-black leading-[0.96] tracking-[-0.04em] text-balance text-[#3C2B26]">
              {t('projectLanding.heroTitle')}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#60483F] sm:text-lg">{t('projectLanding.heroDescription')}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#story" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#713D2F] px-6 text-sm font-bold text-white shadow-[0_14px_34px_rgba(92,48,37,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#5B3025]">
                {t('projectLanding.primaryCta')}<ArrowIcon direction="down" className="h-4 w-4" />
              </a>
              <Link to="/visit" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-[#713D2F]/25 px-6 text-sm font-bold text-[#4B332C] transition-colors hover:border-[#713D2F]/55 hover:bg-[#F6ECE5]">
                {t('projectLanding.secondaryCta')}<ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <figure className="lg:-mr-12">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#E3CDBF] sm:aspect-[16/11] lg:aspect-[4/5] lg:max-h-[46rem]">
              <img src="/images/home/monkchat-meditation-field.webp" alt={t('projectLanding.heroVisualAlt')} decoding="async" fetchPriority="high" className="monkchat-hero-image h-full w-full object-cover object-center" />
            </div>
            <figcaption className="mt-4"><ImageDisclosure /></figcaption>
          </figure>
        </section>

        <section className="bg-[#5B372E] text-white" aria-labelledby="purpose-heading">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.62fr_1.38fr] lg:items-start lg:px-12 lg:py-28">
            <h2 id="purpose-heading" className="text-sm font-black uppercase tracking-[0.18em] text-[#E7BC8E]">{t('projectLanding.purposeLabel')}</h2>
            <div>
              <p className="max-w-5xl text-3xl font-black leading-[1.28] tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">{t('projectLanding.purposeStatement')}</p>
              <p className="mt-8 max-w-3xl text-base leading-8 text-[#F0E5DE] sm:text-lg">{t('projectLanding.purposeDescription')}</p>
            </div>
          </div>
        </section>

        <section id="story" className="scroll-mt-28 border-b border-[#744A3B]/15 bg-[#F4E7DD]" aria-labelledby="story-heading">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20 lg:px-12 lg:py-28">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 id="story-heading" className="max-w-lg text-4xl font-black leading-[1.08] tracking-[-0.035em] text-balance sm:text-6xl">{t('projectLanding.storyTitle')}</h2>
              <p className="mt-6 max-w-md text-base leading-8 text-[#60483F]">{t('projectLanding.storyDescription')}</p>
            </div>
            <div className="divide-y divide-[#744A3B]/20 border-y border-[#744A3B]/20">
              <ExperienceRow icon={<ConversationIcon />} title={t('projectLanding.conversationTitle')} text={t('projectLanding.conversationText')} />
              <ExperienceRow icon={<CultureIcon />} title={t('projectLanding.cultureTitle')} text={t('projectLanding.cultureText')} />
              <ExperienceRow icon={<MeditationIcon />} title={t('projectLanding.meditationTitle')} text={t('projectLanding.meditationText')} />
            </div>
          </div>
        </section>

        <section id="moments" className="scroll-mt-28 bg-[#FFFDF9]" aria-labelledby="moments-heading">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <h2 id="moments-heading" className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-balance sm:text-6xl">{t('projectLanding.momentsTitle')}</h2>
              <p className="max-w-2xl text-base leading-8 text-[#60483F] lg:justify-self-end">{t('projectLanding.momentsDescription')}</p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.38fr_0.62fr]">
              <figure>
                <img src="/images/home/monkchat-meditation-hero.webp" alt={t('projectLanding.momentPrimaryAlt')} loading="lazy" decoding="async" className="aspect-[16/10] w-full rounded-2xl object-cover" />
                <figcaption className="mt-4 space-y-2"><p className="text-sm font-black text-[#3F2E29]">{t('projectLanding.momentPrimaryCaption')}</p><ImageDisclosure /></figcaption>
              </figure>
              <figure>
                <img src="/images/home/monkchat-meditation-ruins.webp" alt={t('projectLanding.momentSecondaryAlt')} loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-2xl object-cover" />
                <figcaption className="mt-4 space-y-2"><p className="text-sm font-black text-[#3F2E29]">{t('projectLanding.momentSecondaryCaption')}</p><ImageDisclosure /></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="plan" className="scroll-mt-28 bg-[#EDD4C5]" aria-labelledby="plan-heading">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20 lg:px-12 lg:py-28">
            <div>
              <h2 id="plan-heading" className="max-w-lg text-4xl font-black leading-[1.08] tracking-[-0.035em] text-balance sm:text-6xl">{t('projectLanding.planTitle')}</h2>
              <p className="mt-6 max-w-md text-base leading-8 text-[#60483F]">{t('projectLanding.planDescription')}</p>
            </div>
            <div>
              <dl className="border-y border-[#6F4A3D]/20">
                <PlanRow label={t('projectLanding.scheduleLabel')} value={t('projectLanding.scheduleValue')} />
                <PlanRow label={t('projectLanding.locationLabel')} value={t('projectLanding.locationValue')} />
                <PlanRow label={t('projectLanding.prepareLabel')} value={t('projectLanding.prepareValue')} />
              </dl>
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-[#244239] px-6 text-sm font-bold text-white shadow-[0_14px_34px_rgba(36,66,57,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#19352E]">
                {t('projectLanding.planCta')}<ArrowIcon direction="external" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section id="guide" className="scroll-mt-28 bg-[#244239] text-white" aria-labelledby="guide-heading">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-12 lg:py-28">
            <div>
              <h2 id="guide-heading" className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-balance sm:text-6xl">{t('projectLanding.guideTitle')}</h2>
              <p className="mt-6 max-w-md text-base leading-8 text-[#E8DED8]">{t('projectLanding.guideDescription')}</p>
              <Link to="/visit" className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-[#E7BC8E] px-6 text-sm font-bold text-[#2F302B] transition-colors hover:bg-[#F2CDA8]">
                {t('projectLanding.guideCta')}<ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="border-y border-white/20">
              <GuideRow icon={<HeadphonesIcon />} title={t('projectLanding.guideAudioTitle')} text={t('projectLanding.guideAudioText')} />
              <GuideRow icon={<QuestionIcon />} title={t('projectLanding.guideQaTitle')} text={t('projectLanding.guideQaText')} />
              <GuideRow icon={<CompassIcon />} title={t('projectLanding.guideCenterTitle')} text={t('projectLanding.guideCenterText')} />
            </div>
          </div>
        </section>

        <section className="bg-[#F6E9E0]" aria-labelledby="contact-heading">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
            <div>
              <h2 id="contact-heading" className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.03em] text-balance sm:text-5xl">{t('projectLanding.contactTitle')}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#60483F]">{t('projectLanding.contactDescription')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-between gap-6 rounded-2xl bg-white px-5 text-sm font-bold text-[#4B332C] shadow-[0_10px_28px_rgba(88,52,42,0.08)] transition-transform hover:-translate-y-0.5">
                {t('projectLanding.facebookLink')}<ArrowIcon direction="external" className="h-4 w-4 text-[#8A4C39]" />
              </a>
              <a href={meditationCenterUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-between gap-6 rounded-2xl border border-[#744A3B]/20 px-5 text-sm font-bold text-[#4B332C] transition-colors hover:bg-white">
                {t('projectLanding.centerLink')}<ArrowIcon direction="external" className="h-4 w-4 text-[#8A4C39]" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#34251F] text-white">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-10 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8 lg:px-12">
          <div className="flex max-w-xl items-start gap-4">
            <img src="/monkchat-placeholder.svg" alt="" className="h-11 w-11 shrink-0 rounded-xl bg-white ring-1 ring-white/15" />
            <div><p className="font-black">Monk Chat Ayutthaya</p><p className="mt-2 text-xs leading-5 text-[#DCCDC5]">{t('projectLanding.footerDescription')}</p></div>
          </div>
          <div className="flex flex-col gap-2 text-xs text-[#CDBCB3] sm:text-right">
            <p>{t('app.footer')}</p>
            <Link to="/admin/login" className="transition-colors hover:text-[#E7BC8E]">{t('projectLanding.teamLogin')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
