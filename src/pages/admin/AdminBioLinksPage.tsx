import { useTranslation } from 'react-i18next'

export function AdminBioLinksPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.modules.bioLinks.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('admin.modules.bioLinks.description')}
        </p>
      </div>

      <div className="bg-purple-50 rounded-xl border border-purple-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
          🔗
        </div>
        <h2 className="text-lg font-semibold text-purple-900">
          {t('admin.modules.bioLinks.title')}
        </h2>
        <p className="text-sm text-purple-800/80 max-w-lg mx-auto">
          {t('admin.modules.bioLinks.placeholder')}
        </p>
      </div>
    </div>
  )
}
