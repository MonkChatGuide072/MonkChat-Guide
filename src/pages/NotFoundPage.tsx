import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-md mx-auto text-center space-y-4 pt-12 sm:pt-16">
      <h1 className="text-4xl font-extrabold text-amber-600">404</h1>
      <h2 className="text-xl font-bold text-slate-900">
        {t('pages.notFound.title')}
      </h2>
      <p className="text-sm text-slate-600">
        {t('pages.notFound.message')}
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
        >
          {t('pages.notFound.backHome')}
        </Link>
      </div>
    </div>
  )
}
