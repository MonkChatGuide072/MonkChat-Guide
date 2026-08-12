import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center pt-4 sm:pt-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-4">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600">
          {t('app.title')}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t('app.heading')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          {t('app.description')}
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t('app.status')}
          </span>
        </div>
      </div>

      <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 p-6 text-left space-y-2">
        <h2 className="font-semibold text-slate-900 text-base sm:text-lg">
          {t('pages.home.title')}
        </h2>
        <p className="text-sm text-slate-600">
          {t('pages.home.subtitle')}
        </p>
        <p className="text-xs text-slate-500 italic pt-1">
          {t('pages.home.placeholder')}
        </p>
      </div>
    </div>
  )
}
