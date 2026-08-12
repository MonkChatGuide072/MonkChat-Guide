import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { LanguageSwitcher } from './LanguageSwitcher'

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isOwner = profile?.role === 'owner'

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  const navItems = [
    { path: '/admin', label: t('admin.nav.dashboard'), end: true },
    { path: '/admin/meditation', label: t('admin.nav.meditation') },
    { path: '/admin/qa', label: t('admin.nav.qa') },
    { path: '/admin/centers', label: t('admin.nav.centers') },
    { path: '/admin/bio-links', label: t('admin.nav.bioLinks') },
    { path: '/admin/languages', label: t('admin.nav.languages') },
    ...(isOwner ? [{ path: '/admin/team', label: t('admin.nav.team') }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Title */}
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="font-bold text-lg text-amber-400 hover:text-amber-300 flex items-center gap-2">
                <span>MonkChat CMS</span>
              </Link>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                {t('admin.adminBadge', 'Admin')}
              </span>
            </div>

            {/* Desktop User info & Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-100 leading-tight">
                  {profile?.display_name || 'Team Member'}
                </p>
                <p className="text-xs text-amber-400 font-medium">
                  {isOwner ? t('admin.dashboard.ownerBadge') : t('admin.dashboard.teamBadge')}
                </p>
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              <Link
                to="/"
                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {t('admin.nav.publicSite')}
              </Link>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
              >
                {t('admin.nav.signOut')}
              </button>
            </div>

            {/* Mobile menu toggle button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSwitcher />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 pt-3 pb-4 space-y-2">
            <div className="pb-3 border-b border-slate-700 mb-2">
              <p className="text-sm font-semibold text-slate-100">
                {profile?.display_name || 'Team Member'}
              </p>
              <p className="text-xs text-amber-400 font-medium">
                {isOwner ? t('admin.dashboard.ownerBadge') : t('admin.dashboard.teamBadge')}
              </p>
            </div>

            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
              <Link
                to="/"
                className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded bg-slate-700"
              >
                {t('admin.nav.publicSite')}
              </Link>

              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                {t('admin.nav.signOut')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Secondary Desktop Navigation Bar */}
      <nav className="hidden md:block bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
