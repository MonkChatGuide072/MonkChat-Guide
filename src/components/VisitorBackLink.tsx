import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function VisitorBackLink() {
  const { t } = useTranslation()
  return (
    <Link to="/visit" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#A86100] hover:underline">
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7M3 12h18" />
      </svg>
      {t('visitor.backToHome')}
    </Link>
  )
}
