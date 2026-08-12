import { useTranslation } from 'react-i18next'

export function AdminLanguagesPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.modules.languages.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('admin.modules.languages.description')}
        </p>
      </div>

      <div className="bg-teal-50 rounded-xl border border-teal-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
          🌐
        </div>
        <h2 className="text-lg font-semibold text-teal-900">
          {t('admin.modules.languages.title')}
        </h2>
        <p className="text-sm text-teal-800/80 max-w-lg mx-auto">
          {t('admin.modules.languages.placeholder')}
        </p>
      </div>
    </div>
  )
}
