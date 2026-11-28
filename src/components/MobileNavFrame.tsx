import { useEffect, useRef, useState, type ReactNode } from 'react'
import './MobileNavFrame.css'

/** Hide shortcuts while reading down; scroll up or use the small handle to return. */
export function MobileNavFrame({ children, isEnglish, className = '' }: { children: ReactNode; isEnglish: boolean; className?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let previous = window.scrollY
    const onScroll = () => {
      const current = Math.max(0, window.scrollY)
      const delta = current - previous
      if (Math.abs(delta) < 16) return
      previous = current
      if (frame.current?.contains(document.activeElement) && document.activeElement?.matches(':focus-visible')) return
      if (current < 100 || delta < -16) setCollapsed(false)
      else if (delta > 16) setCollapsed(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div ref={frame} className={`mobile-nav-frame ${className}`} data-collapsed={collapsed}>
    <button type="button" className="mobile-nav-handle" aria-expanded={!collapsed}
      onClick={() => setCollapsed(value => !value)}>
      <span aria-hidden="true">{collapsed ? '⌃' : '⌄'}</span> {isEnglish ? (collapsed ? 'Show menu' : 'Hide menu') : (collapsed ? 'แสดงเมนู' : 'ซ่อนเมนู')}
    </button>
    <div className="mobile-nav-content" inert={collapsed ? true : undefined}>{children}</div>
  </div>
}
