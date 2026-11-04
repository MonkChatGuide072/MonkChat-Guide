import { useAuth } from '../lib/auth'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'

export function OwnerRoute({ children }: { children?: React.ReactNode }) {
  const { profile, isLoading, session } = useAuth()
  const { t } = useTranslation()

  if (isLoading) return <p role="status">{t('management.loading')}</p>
  if (!session || !profile?.is_active || profile.role !== 'owner') {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 sm:p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
        <h1 className="text-xl font-medium text-slate-900">
          {t('admin.accessDeniedTitle')}
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {t('admin.accessDeniedDesc')}
        </p>
        <div className="pt-2">
          <Link
            to="/admin"
            className="inline-flex min-h-12 items-center rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-brand-terracotta-dark transition-colors"
          >
            {t('admin.backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}
