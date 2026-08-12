import { useAuth } from '../lib/auth'

export function AdminPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, {profile?.display_name || 'Team Member'}
            </p>
          </div>
          
          <button
            onClick={signOut}
            className="mt-4 sm:mt-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-amber-50 rounded-lg p-6 border border-amber-200/60">
          <p className="text-amber-800 font-medium">
            CMS management features will be available in the next phase.
          </p>
          <p className="text-amber-700/80 text-sm mt-2">
            Your role: <span className="font-semibold uppercase">{profile?.role}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
