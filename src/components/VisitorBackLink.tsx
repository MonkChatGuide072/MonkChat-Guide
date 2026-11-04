import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function VisitorBackLink() {
  const { t } = useTranslation()
  return (
    <Link to="/visit" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-4 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft">
      <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7M3 12h18" />
      </svg>
      {t('visitor.backToHome')}
    </Link>
  )
}
