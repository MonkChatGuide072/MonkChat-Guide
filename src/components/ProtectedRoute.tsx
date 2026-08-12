import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../lib/auth'

export function ProtectedRoute() {
  const { session, profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  // User must have an active session, a valid profile, and be active
  if (!session || !profile || !profile.is_active) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
