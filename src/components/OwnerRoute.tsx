import { useAuth } from '../lib/auth'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'

export function OwnerRoute({ children }: { children?: React.ReactNode }) {
  const { profile } = useAuth()
  const { t } = useTranslation()

  if (profile?.role !== 'owner') {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 sm:p-8 shadow-xs text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {t('admin.accessDeniedTitle')}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {t('admin.accessDeniedDesc')}
        </p>
        <div className="pt-2">
          <Link
            to="/admin"
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            {t('admin.backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}
