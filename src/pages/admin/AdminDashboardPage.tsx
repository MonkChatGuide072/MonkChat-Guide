import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { assistantCopy } from '../../locales/monkAssistant'

export function AdminDashboardPage() {
  const { profile } = useAuth()
  const { t, i18n } = useTranslation()
  const assistant = assistantCopy[(i18n.resolvedLanguage || i18n.language).startsWith('en') ? 'en' : 'th']

  const isOwner = profile?.role === 'owner'

  const modules = [
    { key: 'assistant', title: assistant.nav, description: assistant.intro, path: '/admin/assistant' },
    {
      key: 'meditation',
      title: t('admin.modules.meditation.title'),
      description: t('admin.modules.meditation.description'),
      path: '/admin/meditation',
    },
    {
      key: 'qa',
      title: t('admin.modules.qa.title'),
      description: t('admin.modules.qa.description'),
      path: '/admin/qa',
    },
    {
      key: 'centers',
      title: t('admin.modules.centers.title'),
      description: t('admin.modules.centers.description'),
      path: '/admin/centers',
    },
    {
      key: 'bioLinks',
      title: t('admin.modules.bioLinks.title'),
      description: t('admin.modules.bioLinks.description'),
      path: '/admin/bio-links',
    },
    {
      key: 'languages',
      title: t('admin.modules.languages.title'),
      description: t('admin.modules.languages.description'),
      path: '/admin/languages',
    },
    {
      key: 'analytics',
      title: t('admin.modules.analytics.title'),
      description: t('admin.modules.analytics.description'),
      path: '/admin/analytics',
    },
    ...(isOwner
      ? [
          {
            key: 'team',
            title: t('admin.modules.team.title'),
            description: t('admin.modules.team.description'),
            path: '/admin/team',
            ownerOnly: true,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-slate-900">
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
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full  ${
              isOwner ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
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
            className={`block bg-white rounded-xl border border-slate-200  p-6  hover:border-brand-border-dark transition-colors group`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-slate-900 group-hover:text-brand-maroon transition-colors">
                {mod.title}
              </h2>
              {mod.ownerOnly && (
                <span className="text-xs bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded font-medium">
                  {t('admin.dashboard.ownerOnlyTag')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {mod.description}
            </p>
            <span className="text-sm font-medium text-brand-maroon group-hover:text-brand-terracotta-dark flex items-center gap-1">
              <span>{t('admin.dashboard.openModule')}</span>
              <span>&rarr;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
