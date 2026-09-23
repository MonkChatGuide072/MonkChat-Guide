import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import {
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
} from '../lib/language'

export function Layout() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/visit', label: t('nav.home'), end: true },
    { to: '/meditation', label: t('nav.meditation') },
    { to: '/qa', label: t('nav.qa') },
    { to: '/centers', label: t('nav.centers') },
  ]

  const location = useLocation()
  const [hasSessionLang, setHasSessionLang] = useState(
    () => !!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY),
  )

  useEffect(() => {
    setHasSessionLang(!!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY))
    const handleLanguageSelected = () => {
      setHasSessionLang(!!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY))
    }
    window.addEventListener(VISITOR_LANGUAGE_SELECTED_EVENT, handleLanguageSelected)
    return () => window.removeEventListener(VISITOR_LANGUAGE_SELECTED_EVENT, handleLanguageSelected)
  }, [])

  const isProjectInfo = location.pathname === '/'
  const isLanguageGate = location.pathname === '/visit' && !hasSessionLang

  if (isProjectInfo || isLanguageGate) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-slate-800">
        <main className="flex-1 w-full"><Outlet /></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <NavLink
            to="/visit"
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
        <nav aria-label={t('nav.mainNavigation')} className="border-t border-slate-100 bg-slate-50/70">
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
          <div className="pt-2">
            <NavLink to="/" className="text-amber-700 hover:underline">
              {t('nav.aboutProject')}
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
