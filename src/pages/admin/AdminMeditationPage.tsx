import { useTranslation } from 'react-i18next'

export function AdminMeditationPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.modules.meditation.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('admin.modules.meditation.description')}
        </p>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">
          🎧
        </div>
        <h2 className="text-lg font-semibold text-amber-900">
          {t('admin.modules.meditation.title')}
        </h2>
        <p className="text-sm text-amber-800/80 max-w-lg mx-auto">
          {t('admin.modules.meditation.placeholder')}
        </p>
      </div>
    </div>
  )
}
