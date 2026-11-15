import { Navigate, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'

const ALLOWED_NISIT_ROLES = new Set(['student', 'owner', 'team_member'])

/**
 * Route access for `/nisit`:
 * - Active students, owners, and team members are granted full access.
 * - Suspended student accounts are redirected to `/nisit/login`.
 * - Unauthenticated visitors / guest learners can freely review and practice
 *   all 5 training modules in local on-device mode.
 */
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

  // Suspended accounts are blocked
  if (session && profile && !profile.is_active) {
    return <Navigate to="/nisit/login" replace />
  }

  // Authenticated accounts with non-allowed roles are redirected
  if (session && profile && !ALLOWED_NISIT_ROLES.has(profile.role)) {
    return <Navigate to="/nisit/login" replace />
  }

  return <Outlet />
}

