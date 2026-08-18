import { NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Layout() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/visit', label: t('nav.visitor') },
    { to: '/meditation', label: t('nav.meditation') },
    { to: '/qa', label: t('nav.qa') },
    { to: '/centers', label: t('nav.centers') },
    { to: '/admin/login', label: t('nav.login') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-slate-900 tracking-tight hover:text-amber-700 transition-colors"
          >
            <span className="inline-block w-3 h-3 rounded-full bg-amber-600"></span>
            <span className="text-base sm:text-lg">MonkChat Guide</span>
          </NavLink>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Navigation Bar */}
        <nav aria-label="Main Navigation" className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs sm:text-sm text-slate-500">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p>{t('app.footer')}</p>
          <p className="text-slate-400 font-medium">{t('app.status')}</p>
        </div>
      </footer>
    </div>
  )
}
