import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MeditationMark } from './MeditationMark'
import { ChatbotServiceCard } from './ChatbotServiceCard'
import {
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
} from '../lib/language'

export function Layout() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const location = useLocation()
  const [hasSessionLang, setHasSessionLang] = useState(
    () => !!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY),
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHasSessionLang(!!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY))
    const handleLanguageSelected = () => {
      setHasSessionLang(!!sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY))
    }
    window.addEventListener(VISITOR_LANGUAGE_SELECTED_EVENT, handleLanguageSelected)
    return () => window.removeEventListener(VISITOR_LANGUAGE_SELECTED_EVENT, handleLanguageSelected)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname, location.hash])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  const isLanguageGate =
    (location.pathname === '/' || location.pathname === '/home' || location.pathname === '/visit') && !hasSessionLang

  if (isLanguageGate) {
    return <Outlet />
  }

  const navItems = [
    {
      to: '/',
      label: t('nav.home', 'หน้าแรก'),
      end: true,
      isHome: true,
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/visit',
      label: isEnglish ? 'Visitors' : 'ผู้มาเยือน',
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20c-4-3-6-7 0-15 6 8 4 12 0 15Zm0 0C6 20 3 16 3 10c5 1 8 4 9 10Zm0 0c6 0 9-4 9-10-5 1-8 4-9 10Z" />
        </svg>
      ),
    },
    {
      to: '/activities',
      label: t('nav.activities', 'กิจกรรม'),
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: '/meditation',
      label: t('nav.meditation', 'นำสมาธิ'),
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      to: '/qa',
      label: t('nav.qa', 'ถาม-ตอบ'),
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      to: '/centers',
      label: t('nav.centers', 'ศูนย์ปฏิบัติธรรม'),
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-[#FFF8EE] text-[#30251E]">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#EADCC6] bg-[#FFFDF7]/95 shadow-[0_2px_12px_rgba(104,27,22,0.03)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          {/* Logo & Brand */}
          <NavLink
            to="/"
            className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3 text-[#681B16] transition-colors duration-150"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFFDF7] p-0.5 shadow-xs ring-1 ring-[#D5BD94]/70  sm:h-11 sm:w-11">
              <img
                src="/images/logo/ayutthaya-monk-chat-logo.png"
                alt="อยุธยา มังค์แชท — Ayutthaya Monk Chat"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-sans text-sm sm:font-serif font-semibold text-[#681B16] sm:text-base lg:text-lg">
                MonkChat Guide
              </span>
              <span className="hidden text-xs font-medium text-[#A43D1D] sm:block">
                {isEnglish ? 'Meditation & Monk Chat' : 'คู่มือสมาธิและสนทนาธรรม'}
              </span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav aria-label={t('nav.mainNavigation')} className="hidden items-center gap-6 lg:flex lg:gap-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const active = isActive || (Boolean('isHome' in item && item.isHome) && location.pathname === '/home')
                  return `relative inline-flex items-center gap-1.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'text-[#A43D1D] after:absolute after:inset-x-0 after:-bottom-2.5 after:h-0.5 after:bg-[#A43D1D]'
                      : 'text-[#4A3B32] hover:text-[#A43D1D]'
                  }`
                }}
              >
                <span className="opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right actions: Language Switcher & Mobile menu toggle */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <LanguageSwitcher tone="terracotta" />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] shadow-xs transition-colors hover:bg-[#FDF4E3] lg:hidden cursor-pointer"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-[#EADCC6] bg-[#FFFDF7] px-4 py-4 shadow-lg lg:hidden">
            <nav aria-label={t('nav.mainNavigation')} className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    const active = isActive || (Boolean('isHome' in item && item.isHome) && location.pathname === '/home')
                    return `flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? 'bg-[#A43D1D] text-white shadow-xs'
                        : 'text-[#4A3B32] hover:bg-[#FDF4E3] hover:text-[#A43D1D]'
                    }`
                  }}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main
        className={
          location.pathname === '/' || location.pathname === '/home' || location.pathname === '/visit'
            ? 'w-full flex-1'
            : 'mx-auto w-full max-w-[76rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        }
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative isolate overflow-hidden border-t border-[#EADCC6] bg-[#FFFDF7] pb-24 pt-6 text-center text-xs text-[#7D6B5D]">
        <MeditationMark className="pointer-events-none absolute -bottom-16 right-0 -z-10 w-64 text-brand-gold/5" />
        <div className="mx-auto max-w-[76rem] space-y-2 px-4 sm:px-6">
          <p>{t('app.footer')}</p>
          <p className="text-xs text-[#A43D1D]/80">
            Ayutthaya Monk Chat · Ayutthaya, Thailand
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs">
            <Link to="/nisit" className="inline-flex min-h-11 items-center px-2 text-[#681B16] hover:underline">
              {isEnglish ? 'Student Monk Training (/nisit)' : 'มุมฝึกพระนิสิต (/nisit)'}
            </Link>
            <Link to="/admin/login" className="inline-flex min-h-11 items-center px-2 text-[#7D6B5D] hover:text-[#681B16] hover:underline">
              {isEnglish ? 'Team CMS (/admin)' : 'ระบบทีมงาน (/admin)'}
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating verified chatbot card */}
      {!location.pathname.startsWith('/admin')
        && !location.pathname.startsWith('/meditation')
        && !location.pathname.startsWith('/nisit') && <ChatbotServiceCard />}
    </div>
  )
}
