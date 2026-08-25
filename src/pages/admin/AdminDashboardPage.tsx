import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'

export function AdminDashboardPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()

  const isOwner = profile?.role === 'owner'

  const modules = [
    {
      key: 'meditation',
      title: t('admin.modules.meditation.title'),
      description: t('admin.modules.meditation.description'),
      path: '/admin/meditation',
      color: 'border-l-amber-500',
    },
    {
      key: 'qa',
      title: t('admin.modules.qa.title'),
      description: t('admin.modules.qa.description'),
      path: '/admin/qa',
      color: 'border-l-blue-500',
    },
    {
      key: 'centers',
      title: t('admin.modules.centers.title'),
      description: t('admin.modules.centers.description'),
      path: '/admin/centers',
      color: 'border-l-emerald-500',
    },
    {
      key: 'bioLinks',
      title: t('admin.modules.bioLinks.title'),
      description: t('admin.modules.bioLinks.description'),
      path: '/admin/bio-links',
      color: 'border-l-purple-500',
    },
    {
      key: 'languages',
      title: t('admin.modules.languages.title'),
      description: t('admin.modules.languages.description'),
      path: '/admin/languages',
      color: 'border-l-teal-500',
    },
    {
      key: 'analytics',
      title: t('admin.modules.analytics.title'),
      description: t('admin.modules.analytics.description'),
      path: '/admin/analytics',
      color: 'border-l-cyan-500',
    },
    ...(isOwner
      ? [
          {
            key: 'team',
            title: t('admin.modules.team.title'),
            description: t('admin.modules.team.description'),
            path: '/admin/team',
            color: 'border-l-rose-500',
            ownerOnly: true,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-600">
              {t('admin.dashboard.welcome')} <strong className="text-slate-900">{profile?.display_name}</strong>
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
              isOwner ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {profile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Link
            key={mod.key}
            to={mod.path}
            className={`block bg-white rounded-xl border border-slate-200 border-l-4 ${mod.color} p-6 shadow-xs hover:shadow-md transition-shadow group`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {mod.title}
              </h2>
              {mod.ownerOnly && (
                <span className="text-xs bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">
                  {t('admin.dashboard.ownerOnlyTag')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {mod.description}
            </p>
            <span className="text-xs font-semibold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
              <span>{t('admin.dashboard.openModule')}</span>
              <span>&rarr;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
