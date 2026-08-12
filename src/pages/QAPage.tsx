import { useTranslation } from 'react-i18next'

export function QAPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 sm:pt-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t('pages.qa.title')}
        </h1>
        <p className="text-sm text-slate-600">
          {t('pages.qa.subtitle')}
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-2">
        <p className="text-sm text-slate-500 font-medium">
          {t('pages.qa.placeholder')}
        </p>
      </div>
    </div>
  )
}
