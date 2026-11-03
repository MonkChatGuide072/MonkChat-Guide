import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../lib/auth'
import { useTranslation } from 'react-i18next'

export function ProtectedRoute() {
  const { session, profile, isLoading } = useAuth()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div role="status" aria-label={t('management.loading')} className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-terracotta"></div>
      </div>
    )
  }

  // User must have an active session, a valid profile, and be active
  if (!session || !profile || !profile.is_active || !['owner', 'team_member'].includes(profile.role)) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
