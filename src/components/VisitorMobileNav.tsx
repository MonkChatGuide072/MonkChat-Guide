import { Link, useLocation } from 'react-router'
import { GuideIcon } from './GuideIcon'
import { PUBLIC_SHORTCUTS } from '../content/publicShortcuts'
import './VisitorMobileNav.css'
import { MobileNavFrame } from './MobileNavFrame'

// Home stays in the middle; the other destinations retain their existing routes.
const order = ['/activities', '/meditation', '/', '/qa', '/centers'] as const
export function VisitorMobileNav({ isEnglish }: { isEnglish: boolean }) {
  const { pathname } = useLocation()
  return <MobileNavFrame isEnglish={isEnglish}><nav className="visitor-mobile-nav" aria-label={isEnglish ? 'Visitor bottom navigation' : 'เมนูผู้มาเยือนด้านล่าง'}>
    {order.map(path => {
      const item = PUBLIC_SHORTCUTS.find(shortcut => shortcut.to === path)!
      const home = path === '/'
      const active = home ? ['/', '/home', '/visit'].includes(pathname) : pathname === path || pathname.startsWith(`${path}/`)
      return <Link key={path} to={home ? '/visit' : path} aria-current={active ? 'page' : undefined}
        aria-label={path === '/centers' ? (isEnglish ? 'Centers' : 'สถานที่') : isEnglish ? item.en : item.th} className={home ? 'visitor-mobile-home' : undefined}>
        <span className={home ? 'visitor-home-orb' : 'visitor-mobile-icon'} aria-hidden="true"><GuideIcon name={item.icon} /></span>
        <span className="visitor-mobile-label">{path === '/centers' ? (isEnglish ? 'Centers' : 'สถานที่') : isEnglish ? item.en : item.th}</span>
      </Link>
    })}
  </nav></MobileNavFrame>
}
