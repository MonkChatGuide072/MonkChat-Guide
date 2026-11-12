import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MeditationMark } from './MeditationMark'
import { ChatbotServiceCard } from './ChatbotServiceCard'
import { GuideIcon, type GuideIconName } from './GuideIcon'
import { PUBLIC_SHORTCUTS } from '../content/publicShortcuts'
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

  const isSubShortcutPage = ['/activities', '/meditation', '/qa', '/centers'].some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  )
  const isHomeRoute = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/visit'

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
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-brand-cream text-brand-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-brand-maroon focus:px-4 focus:text-sm focus:font-medium focus:text-white"
      >
        {isEnglish ? 'Skip to main content' : 'ข้ามไปยังเนื้อหาหลัก'}
      </a>
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/95 shadow-[0_2px_12px_rgba(17,34,60,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-2 px-2.5 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          {/* Logo & Brand */}
          <NavLink
            to="/"
            className="group flex min-h-11 min-w-0 shrink items-center gap-2 sm:gap-3 text-brand-maroon transition-colors duration-150 lg:shrink-0"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-surface p-0.5 shadow-xs ring-1 ring-brand-gold/45 sm:h-11 sm:w-11">
              <img
                src="/images/logo/ayutthaya-monk-chat-logo.png"
                alt="อยุธยา มังค์แชท — Ayutthaya Monk Chat"
                width={1001}
                height={1024}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="min-w-0 leading-tight">
              <span className="block truncate whitespace-nowrap font-sans text-[13px] min-[390px]:text-sm font-semibold text-brand-maroon sm:font-serif sm:text-base lg:text-lg">
                MonkChat Guide
              </span>
              <span className="hidden whitespace-nowrap text-xs font-medium text-brand-gold xl:block">
                {isEnglish ? 'Meditation & Monk Chat' : 'คู่มือสมาธิและสนทนาธรรม'}
              </span>
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav aria-label={t('nav.mainNavigation')} className="hidden items-center gap-3 lg:flex xl:gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const active = isActive || (Boolean('isHome' in item && item.isHome) && isHomeRoute)
                  return `relative inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-1 text-[13px] font-medium transition-colors duration-150 xl:text-sm ${
                    active
                      ? 'text-brand-terracotta after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:bg-brand-terracotta'
                      : 'text-brand-muted hover:text-brand-maroon'
                  }`
                }}
              >
                <span className="opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right actions: Chatbot (header trigger), Language Switcher & Mobile menu toggle */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {!location.pathname.startsWith('/admin')
              && !location.pathname.startsWith('/nisit') && <ChatbotServiceCard placement="header" />}
            <LanguageSwitcher tone="terracotta" />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-maroon shadow-xs transition-colors hover:bg-brand-gold-soft lg:hidden cursor-pointer"
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

        {/* Persistent 5-icon visitor shortcut bar when inside sub-pages on mobile/tablet */}
        {isSubShortcutPage && (
          <nav
            aria-label={isEnglish ? 'Visitor quick shortcuts' : 'ทางลัดเมนูหลัก'}
            className="border-t border-brand-border/80 bg-brand-surface/95 px-2 py-1.5 lg:hidden"
          >
            <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1 min-[390px]:gap-1.5">
              {PUBLIC_SHORTCUTS.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-0.5 py-1.5 text-center transition-colors duration-150 ${
                      isActive
                        ? 'border-brand-terracotta bg-brand-terracotta text-white'
                        : 'border-brand-border bg-brand-cream/70 text-brand-maroon hover:border-brand-terracotta hover:bg-brand-gold-soft'
                    }`}
                  >
                    <GuideIcon name={item.icon as GuideIconName} className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-full px-0.5 text-[11px] font-medium leading-tight min-[390px]:text-xs">
                      {isEnglish ? item.en : item.th}
                    </span>
                  </NavLink>
                )
              })}
            </div>
          </nav>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-brand-border bg-brand-surface px-4 py-4 shadow-lg lg:hidden">
            <nav aria-label={t('nav.mainNavigation')} className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    const active = isActive || (Boolean('isHome' in item && item.isHome) && isHomeRoute)
                    return `flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? 'bg-brand-terracotta text-white shadow-xs'
                        : 'text-brand-text hover:bg-brand-gold-soft hover:text-brand-maroon'
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
        id="main-content"
        tabIndex={-1}
        className={
          isHomeRoute
            ? 'w-full flex-1 scroll-mt-20 outline-none'
            : 'mx-auto w-full max-w-[76rem] flex-1 scroll-mt-20 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8'
        }
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative isolate overflow-hidden border-t border-brand-border bg-brand-surface py-8 text-center text-xs text-brand-muted">
        <MeditationMark className="pointer-events-none absolute -bottom-16 right-0 -z-10 w-64 text-brand-gold/8" />
        <div className="mx-auto max-w-[76rem] space-y-2 px-4 sm:px-6">
          <p>{t('app.footer')}</p>
          <p className="text-xs font-medium text-brand-gold">
            Ayutthaya Monk Chat · Ayutthaya, Thailand
          </p>
        </div>
      </footer>
    </div>
  )
}
