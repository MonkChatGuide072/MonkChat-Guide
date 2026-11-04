import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { GuideIcon } from '../components/GuideIcon'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-8 text-brand-text sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link to="/" aria-label="MonkChat Guide" className="inline-flex min-h-12 items-center gap-3 text-sm font-medium text-brand-maroon">
          <img src="/images/logo/ayutthaya-monk-chat-logo.png" alt="" className="h-12 w-12 object-contain" />
          <span>MonkChat Guide</span>
        </Link>
        <LanguageSwitcher />
      </div>
      <section className="mx-auto mt-12 max-w-3xl border-t border-brand-border pt-8 sm:mt-20 sm:pt-12">
        <p className="text-sm tabular-nums text-brand-muted">404</p>
        <h1 className="mt-4 font-serif text-3xl font-medium leading-snug text-brand-maroon sm:text-4xl">{t('pages.notFound.title')}</h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-brand-muted">{t('pages.notFound.message')}</p>
        <Link to="/" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-terracotta px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-terracotta-dark">
          <GuideIcon name="home" />
          {t('pages.notFound.backHome')}
        </Link>
      </section>
    </main>
  )
}
