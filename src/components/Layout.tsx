import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
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
  }, [location.pathname])

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

  const isLanguageGate = (location.pathname === '/' || location.pathname === '/visit') && !hasSessionLang

  if (isLanguageGate) {
    return <Outlet />
  }

  const navItems = [
    {
      to: '/',
      label: t('nav.home', 'หน้าแรก'),
      end: true,
      icon: (
        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
      {/* Subtle background ambient gradients and meditation mark safely clipped */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_16%_6%,rgba(255,243,224,0.7),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(255,249,235,0.8),transparent_40%),linear-gradient(180deg,#FFF8EE_0%,#FFF6E9_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <MeditationMark
          className="absolute -right-24 top-20 w-[32rem] text-[#B77A24]/6 sm:-right-10 sm:w-[40rem]"
        />
      </div>

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
              <span className="block truncate font-serif text-sm font-semibold text-[#681B16] sm:text-base lg:text-lg">
                {isEnglish ? 'Ayutthaya Monk Chat' : 'อยุธยา มังค์แชท'}
              </span>
              <span className="hidden text-xs font-medium text-[#A43D1D] sm:block">
                {isEnglish ? 'Ayutthaya Monk Chat Guide' : 'คู่มือสมาธิและสนทนาธรรม'}
              </span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav aria-label={t('nav.mainNavigation')} className="hidden items-center gap-6 lg:flex lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative inline-flex items-center gap-1.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[#A43D1D] after:absolute after:inset-x-0 after:-bottom-2.5 after:h-0.5 after:bg-[#A43D1D]'
                      : 'text-[#4A3B32] hover:text-[#A43D1D]'
                  }`
                }
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
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#A43D1D] text-white shadow-xs'
                        : 'text-[#4A3B32] hover:bg-[#FDF4E3] hover:text-[#A43D1D]'
                    }`
                  }
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
          location.pathname === '/' || location.pathname === '/visit'
            ? 'w-full flex-1'
            : 'mx-auto w-full max-w-[76rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        }
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EADCC6] bg-[#FFFDF7] pb-24 pt-6 text-center text-xs text-[#7D6B5D]">
        <div className="mx-auto max-w-[76rem] px-4 sm:px-6">
          <p>{t('app.footer')}</p>
          <p className="mt-1 text-xs text-[#A43D1D]/80">
            อยุธยา มังค์แชท (Ayutthaya Monk Chat) · Mahachulalongkornrajavidyalaya University (MCU)
          </p>
        </div>
      </footer>

      {/* Floating verified chatbot card */}
      <ChatbotServiceCard />
    </div>
  )
}
