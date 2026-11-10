import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { LanguageSwitcher } from './LanguageSwitcher'
import { assistantCopy } from '../locales/monkAssistant'
import './AdminLayout.css'

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const { t, i18n } = useTranslation()
  const assistantLabel = assistantCopy[(i18n.resolvedLanguage || i18n.language).startsWith('en') ? 'en' : 'th'].nav
  const navigate = useNavigate()
  const location = useLocation()
  const menuButton = useRef<HTMLButtonElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signOutError, setSignOutError] = useState(false)

  const isOwner = profile?.role === 'owner'
  const isEnglish = (i18n.resolvedLanguage || i18n.language).startsWith('en')

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileMenuOpen(false); menuButton.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])

  const handleSignOut = async () => {
    setSignOutError(false)
    try {
      await signOut()
      navigate('/admin/login', { replace: true })
    } catch { setSignOutError(true) }
  }

  const navItems = [
    { path: '/admin', label: t('admin.nav.dashboard'), end: true },
    { path: '/admin/meditation', label: t('admin.nav.meditation') },
    { path: '/admin/qa', label: t('admin.nav.qa') },
    { path: '/admin/assistant', label: assistantLabel },
    { path: '/admin/centers', label: t('admin.nav.centers') },
    { path: '/admin/bio-links', label: t('admin.nav.bioLinks') },
    { path: '/admin/languages', label: t('admin.nav.languages') },
    { path: '/admin/analytics', label: t('admin.nav.analytics') },
    ...(isOwner
      ? [
          { path: '/admin/students', label: isEnglish ? 'Student Cohorts' : 'รุ่นพระนิสิต' },
          { path: '/admin/team', label: t('admin.nav.team') },
        ]
      : []),
  ]

  const navigation = (mobile = false) => (
    <nav aria-label={isEnglish ? 'Content management' : 'จัดการเนื้อหา'} className="flex flex-col gap-1">
      {navItems.map(item => <NavLink key={item.path} to={item.path} end={item.end}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={({ isActive }) => `flex min-h-11 items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'border-brand-border bg-[#F5F1E9] text-brand-maroon' : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}>
        {item.label}
      </NavLink>)}
    </nav>
  )

  return (
    <div className="cms-shell min-h-screen bg-[#F7F7F5] font-sans text-neutral-900">
      {signOutError && <p role="alert" className="bg-red-50 p-4 text-center text-red-800">{t('management.signOutError')}</p>}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-[96rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/admin" className="flex min-w-0 items-center gap-3 text-brand-maroon">
            <img src="/images/logo/ayutthaya-monk-chat-logo.png" alt="" className="h-12 w-10 shrink-0 object-contain" />
            <span className="text-sm font-medium sm:text-base">MonkChat CMS</span>
          </Link>
          <div className="hidden items-center gap-4 lg:flex">
            <div className="max-w-60 text-right text-sm">
              <p className="break-words font-medium">{profile?.display_name || (isEnglish ? 'Team member' : 'ทีมงาน')}</p>
              <p className="mt-1 text-xs text-neutral-500">{isOwner ? t('admin.dashboard.ownerBadge') : t('admin.dashboard.teamBadge')}</p>
            </div>
            <LanguageSwitcher />
            <Link to="/" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-100">{t('admin.nav.publicSite')}</Link>
            <button onClick={handleSignOut} className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium transition-colors hover:bg-neutral-100">{t('admin.nav.signOut')}</button>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button ref={menuButton} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="cms-mobile-menu"
              aria-label={isEnglish ? 'Toggle management menu' : 'เปิดหรือปิดเมนูจัดการ'}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-neutral-300 transition-colors hover:bg-neutral-100">
              <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && <div id="cms-mobile-menu" className="max-h-[75dvh] overflow-y-auto border-t border-neutral-200 bg-white p-4 lg:hidden">
          <p className="mb-4 break-words text-sm text-neutral-600">{profile?.display_name} · {isOwner ? t('admin.dashboard.ownerBadge') : t('admin.dashboard.teamBadge')}</p>
          {navigation(true)}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
            <Link to="/" className="inline-flex min-h-11 items-center px-3 text-sm text-neutral-600">{t('admin.nav.publicSite')}</Link>
            <button onClick={handleSignOut} className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100">{t('admin.nav.signOut')}</button>
          </div>
        </div>}
      </header>
      <div className="mx-auto grid max-w-[96rem] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden h-[calc(100dvh-5rem)] overflow-y-auto border-r border-neutral-200 bg-white p-4 lg:block">{navigation()}</aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
