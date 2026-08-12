import { useTranslation } from 'react-i18next'

export function AdminTeamPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.modules.team.title')}
          </h1>
          <span className="text-xs bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-medium">
            {t('admin.dashboard.ownerOnlyTag')}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          {t('admin.modules.team.description')}
        </p>
      </div>

      <div className="bg-rose-50 rounded-xl border border-rose-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xl">
          👥
        </div>
        <h2 className="text-lg font-semibold text-rose-900">
          {t('admin.modules.team.title')}
        </h2>
        <p className="text-sm text-rose-800/80 max-w-lg mx-auto">
          {t('admin.modules.team.placeholder')}
        </p>
      </div>
    </div>
  )
}
