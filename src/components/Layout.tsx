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
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-[#FFFEF9] text-[#11223C]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_88%_5%,rgba(168,97,0,0.10),transparent_28%),radial-gradient(circle_at_8%_18%,rgba(17,34,60,0.07),transparent_30%)]" />

      <header className="sticky top-0 z-30 border-b border-[#11223C]/8 bg-[#FFFEF9]/90 shadow-[0_8px_30px_rgba(17,34,60,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <NavLink
            to="/visit"
            className="group flex min-w-0 items-center gap-3 text-[#11223C]"
          >
            <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl shadow-sm ring-1 ring-[#11223C]/10 transition-transform group-hover:-rotate-3" />
            <span className="min-w-0 leading-tight">
              <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[#A86100]">MonkChat</span>
              <span className="block truncate text-sm font-extrabold tracking-tight sm:text-base">Guide</span>
            </span>
          </NavLink>

          <nav aria-label={t('nav.mainNavigation')} className="hidden items-center gap-1 rounded-full border border-[#11223C]/8 bg-white/70 p-1 shadow-sm lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#11223C] text-white shadow-md'
                      : 'text-[#11223C]/60 hover:bg-[#F4EFE5] hover:text-[#11223C]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center">
            <LanguageSwitcher />
          </div>
        </div>

        <nav aria-label={t('nav.mainNavigation')} className="border-t border-[#11223C]/6 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-2 sm:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 shrink-0 items-center rounded-full px-3.5 text-xs font-bold whitespace-nowrap transition-all sm:text-sm ${
                    isActive
                      ? 'bg-[#11223C] text-white shadow-sm'
                      : 'text-[#11223C]/60 hover:bg-[#F4EFE5] hover:text-[#11223C]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-9 lg:px-12 lg:py-12">
        <Outlet />
      </main>

      <footer className="mt-4 bg-[#11223C] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <img src="/monkchat-placeholder.svg" alt="" className="h-9 w-9 rounded-xl ring-1 ring-white/15" />
            <div>
              <p className="text-sm font-bold">MonkChat Guide</p>
              <p className="mt-0.5 text-xs text-white/55">{t('app.footer')}</p>
            </div>
          </div>
          <div>
            <NavLink to="/" className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-xs font-bold text-white/75 transition-colors hover:border-[#DDA756]/50 hover:text-[#DDA756]">
              {t('nav.aboutProject')}
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
