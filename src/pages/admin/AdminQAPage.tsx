import { useTranslation } from 'react-i18next'

export function AdminQAPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.modules.qa.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('admin.modules.qa.description')}
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
          ❓
        </div>
        <h2 className="text-lg font-semibold text-blue-900">
          {t('admin.modules.qa.title')}
        </h2>
        <p className="text-sm text-blue-800/80 max-w-lg mx-auto">
          {t('admin.modules.qa.placeholder')}
        </p>
      </div>
    </div>
  )
}
