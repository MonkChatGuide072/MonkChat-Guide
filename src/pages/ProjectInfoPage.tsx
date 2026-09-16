import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const facebookUrl = 'https://web.facebook.com/MonkChatAyutthaya/'
const meditationCenterUrl = 'https://ayothayameditation.com'

function ArrowIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function DialogueIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path d="M7 18.5 3.5 21v-5A8.5 8.5 0 1 1 12 20.5H7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

export function ProjectInfoPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen overflow-hidden bg-[#FFFEF9] text-[#11223C] font-['Noto_Sans_Thai']">
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[44rem] bg-[radial-gradient(circle_at_82%_18%,rgba(168,97,0,0.12),transparent_28%),radial-gradient(circle_at_12%_12%,rgba(17,34,60,0.08),transparent_30%)]" />

      <header className="relative z-20 border-b border-[#11223C]/8 bg-[#FFFEF9]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link to="/" className="group flex items-center gap-3" aria-label="MonkChat Guide">
            <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 rounded-xl shadow-sm ring-1 ring-[#11223C]/10 transition-transform group-hover:-rotate-3" />
            <div className="leading-tight">
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#A86100]">MonkChat</span>
              <span className="block text-base font-bold tracking-tight">Guide</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3" aria-label={t('projectLanding.navigation')}>
            <a href="#how-it-works" className="hidden text-sm font-semibold text-[#11223C]/65 transition-colors hover:text-[#A86100] sm:inline">
              {t('projectLanding.navHow')}
            </a>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#A86100]/20 bg-white/70 px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-[#A86100] shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A86100]" />
              {t('projectLanding.eyebrow')}
            </div>
            <h1 className="max-w-3xl text-[2.65rem] font-bold leading-[1.13] tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.65rem]">
              {t('projectLanding.heroTitle')}
              <span className="mt-2 block text-[#A86100]">{t('projectLanding.heroAccent')}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#11223C]/67 sm:text-lg">
              {t('projectLanding.heroDescription')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/visit" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#11223C] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(17,34,60,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#1a3256]">
                {t('projectLanding.primaryCta')}
                <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#11223C]/15 bg-white/65 px-6 py-3.5 text-sm font-bold text-[#11223C] transition-colors hover:border-[#A86100]/35 hover:bg-white">
                {t('projectLanding.secondaryCta')}
              </a>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-3 border-t border-[#11223C]/10 pt-6">
              <div>
                <dt className="text-xl font-bold sm:text-2xl">2</dt>
                <dd className="mt-1 text-xs leading-5 text-[#11223C]/55 sm:text-sm">{t('projectLanding.statLanguages')}</dd>
              </div>
              <div className="border-l border-[#11223C]/10 pl-5 sm:pl-7">
                <dt className="text-xl font-bold sm:text-2xl">3</dt>
                <dd className="mt-1 text-xs leading-5 text-[#11223C]/55 sm:text-sm">{t('projectLanding.statResources')}</dd>
              </div>
              <div className="border-l border-[#11223C]/10 pl-5 sm:pl-7">
                <dt className="text-xl font-bold sm:text-2xl">0 ฿</dt>
                <dd className="mt-1 text-xs leading-5 text-[#11223C]/55 sm:text-sm">{t('projectLanding.statAccess')}</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-[#A86100]/8 blur-3xl" />
            <div className="relative rounded-[2.25rem] border border-[#11223C]/10 bg-[#11223C] p-3 shadow-[0_32px_90px_rgba(17,34,60,0.22)] sm:p-4">
              <div className="overflow-hidden rounded-[1.7rem] bg-[#F8F4EA]">
                <div className="flex items-center justify-between border-b border-[#11223C]/8 bg-white/80 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#A86100]" />
                    <span className="text-xs font-bold tracking-wide">MonkChat Guide</span>
                  </div>
                  <span className="rounded-full bg-[#11223C]/6 px-2.5 py-1 text-[0.65rem] font-bold text-[#11223C]/60">TH / EN</span>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="rounded-2xl bg-white p-5 shadow-[0_12px_34px_rgba(17,34,60,0.08)] ring-1 ring-[#11223C]/5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#A86100]">{t('projectLanding.previewLabel')}</span>
                    <h2 className="mt-3 text-xl font-bold leading-snug">{t('projectLanding.previewTitle')}</h2>
                    <p className="mt-2 text-xs leading-5 text-[#11223C]/55">{t('projectLanding.previewDescription')}</p>
                    <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#11223C] px-4 py-3.5 text-white">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#A86100]">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current"><path d="M8.3 5.5v13l10-6.5-10-6.5Z" /></svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[36%] rounded-full bg-[#D69A42]" /></div>
                        <div className="mt-2 flex justify-between text-[0.62rem] text-white/55"><span>04:12</span><span>12:00</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#11223C]/5">
                      <DialogueIcon />
                      <p className="mt-3 text-xs font-bold">{t('projectLanding.previewQa')}</p>
                      <p className="mt-1 text-[0.66rem] leading-4 text-[#11223C]/50">{t('projectLanding.previewVerified')}</p>
                    </div>
                    <div className="rounded-2xl bg-[#DDA756] p-4 text-[#11223C]">
                      <CompassIcon />
                      <p className="mt-3 text-xs font-bold">{t('projectLanding.previewCenters')}</p>
                      <p className="mt-1 text-[0.66rem] leading-4 text-[#11223C]/60">{t('projectLanding.previewContinue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-[#11223C]/8 bg-white px-4 py-3 shadow-[0_15px_45px_rgba(17,34,60,0.14)] sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#A86100]/10 text-[#A86100]"><HeadphonesIcon /></span>
              <div><p className="text-xs font-bold">{t('projectLanding.floatingTitle')}</p><p className="mt-0.5 text-[0.65rem] text-[#11223C]/50">{t('projectLanding.floatingText')}</p></div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-[#11223C] text-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#DDA756]">{t('projectLanding.flowEyebrow')}</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t('projectLanding.flowTitle')}</h2>
                <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">{t('projectLanding.flowDescription')}</p>
              </div>

              <ol className="grid gap-4 sm:grid-cols-3">
                {(['scan', 'practice', 'continue'] as const).map((step, index) => (
                  <li key={step} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition-colors hover:bg-white/[0.075]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#DDA756]">0{index + 1}</span>
                      <span className="h-px w-10 bg-white/15 transition-all group-hover:w-14 group-hover:bg-[#DDA756]/60" />
                    </div>
                    <h3 className="mt-10 text-xl font-bold">{t(`projectLanding.${step}Title`)}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/55">{t(`projectLanding.${step}Description`)}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
              {[
                { Icon: HeadphonesIcon, title: 'featureAudioTitle', text: 'featureAudioText' },
                { Icon: DialogueIcon, title: 'featureQaTitle', text: 'featureQaText' },
                { Icon: CompassIcon, title: 'featureCenterTitle', text: 'featureCenterText' },
              ].map(({ Icon, title, text }) => (
                <article key={title} className="bg-[#11223C] p-6 sm:p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#DDA756]/12 text-[#DDA756]"><Icon /></span>
                  <h3 className="mt-5 font-bold">{t(`projectLanding.${title}`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{t(`projectLanding.${text}`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F2E9D8]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A86100]">{t('projectLanding.contactEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t('projectLanding.contactTitle')}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#11223C]/65 sm:text-base">{t('projectLanding.contactDescription')}</p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#11223C] underline decoration-[#A86100]/35 decoration-2 underline-offset-4 transition-colors hover:text-[#A86100]">
                  {t('projectLanding.facebookLink')} <ArrowIcon className="h-4 w-4 -rotate-45" />
                </a>
                <a href={meditationCenterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#11223C] underline decoration-[#A86100]/35 decoration-2 underline-offset-4 transition-colors hover:text-[#A86100]">
                  {t('projectLanding.centerLink')} <ArrowIcon className="h-4 w-4 -rotate-45" />
                </a>
              </div>
            </div>

            <Link to="/visit" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#A86100] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(168,97,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#8d5200] lg:min-w-64">
              {t('projectLanding.finalCta')}
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#11223C]/8 bg-[#FFFEF9]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-[#11223C]/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>{t('app.footer')}</p>
          <Link to="/admin/login" className="transition-colors hover:text-[#A86100]">{t('projectLanding.teamLogin')}</Link>
        </div>
      </footer>
    </div>
  )
}
