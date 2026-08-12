import { useTranslation } from 'react-i18next'

export function AdminCentersPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.modules.centers.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('admin.modules.centers.description')}
        </p>
      </div>

      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
          🏛️
        </div>
        <h2 className="text-lg font-semibold text-emerald-900">
          {t('admin.modules.centers.title')}
        </h2>
        <p className="text-sm text-emerald-800/80 max-w-lg mx-auto">
          {t('admin.modules.centers.placeholder')}
        </p>
      </div>
    </div>
  )
}
