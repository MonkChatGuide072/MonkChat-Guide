import { Navigate, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'

const ALLOWED_NISIT_ROLES = new Set(['student', 'owner', 'team_member'])

/** Requires an authenticated active student, team member, or owner account for `/nisit`. */
export function NisitProtectedRoute() {
  const { session, profile, isLoading } = useAuth()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div role="status" aria-label={t('management.loading')} className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-terracotta" />
      </div>
    )
  }

  if (!session || !profile || !profile.is_active || !ALLOWED_NISIT_ROLES.has(profile.role)) {
    return <Navigate to="/nisit/login" replace />
  }

  return <Outlet />
}

