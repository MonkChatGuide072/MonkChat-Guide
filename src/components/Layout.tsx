import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MeditationMark } from './MeditationMark'
import {
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
} from '../lib/language'

export function Layout() {
  const { t } = useTranslation()
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
    return <Outlet />
  }

  const navItems = [
    { to: '/visit', label: t('nav.home'), end: true },
    { to: '/meditation', label: t('nav.meditation') },
    { to: '/qa', label: t('nav.qa') },
    { to: '/centers', label: t('nav.centers') },
  ]

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-[#d8ccb8] text-[#2c3028]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_4%,rgba(255,249,235,.82),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,.46),transparent_30%),linear-gradient(155deg,#ddd2bf_0%,#cfc1aa_100%)]" />
      <MeditationMark className="pointer-events-none fixed -right-24 top-24 -z-10 w-[34rem] text-white/28 sm:-right-10 sm:w-[42rem]" />
      <MeditationMark className="pointer-events-none fixed -bottom-60 -left-44 -z-10 hidden w-[38rem] rotate-[-10deg] text-white/16 lg:block" showCore={false} />

      <header className="sticky top-0 z-40 border-b border-[#473d2e]/12 bg-[#ded2bd]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-4 px-4 py-3 sm:px-7 lg:px-8">
          <NavLink to="/visit" className="group flex min-w-0 items-center gap-3 text-[#2d322a]">
            <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl bg-[#303a2f] shadow-sm ring-1 ring-white/30 transition-transform group-hover:-rotate-3" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold tracking-tight sm:text-base">MonkChat Guide</span>
              <span className="mt-1 block text-[.55rem] font-bold uppercase tracking-[.19em] text-[#a34e39]">Inner Peace Companion</span>
            </span>
          </NavLink>

          <nav aria-label={t('nav.mainNavigation')} className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `relative py-3 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-3 after:h-0.5 after:origin-center after:bg-[#a94732] after:transition-transform ${isActive ? 'font-bold text-[#272b25] after:scale-x-100' : 'font-medium text-[#625b50] after:scale-x-0 hover:text-[#272b25]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <LanguageSwitcher />
        </div>

        <nav aria-label={t('nav.mainNavigation')} className="border-t border-[#473d2e]/9 lg:hidden">
          <div className="mx-auto flex max-w-[76rem] gap-1 overflow-x-auto px-3 py-2 sm:px-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'bg-[#354033] text-[#fff4de]' : 'text-[#625b50] hover:bg-white/35 hover:text-[#272b25]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 py-7 sm:px-7 sm:py-9 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-[76rem] px-4 pb-5 text-center text-[.65rem] text-[#6f675a] sm:px-7">
        {t('app.footer')}
      </footer>
    </div>
  )
}
