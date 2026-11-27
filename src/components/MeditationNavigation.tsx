import { NavLink } from 'react-router'

export function MeditationNavigation({ english }: { english: boolean }) {
  return <nav aria-label={english ? 'Meditation pages' : 'หน้าย่อยนั่งสมาธิ'} className="flex flex-wrap gap-2 rounded-2xl border border-brand-border bg-brand-surface p-2">
    {[['/meditation', english ? 'Beginner’s Guide' : 'คู่มือเริ่มต้น'], ['/meditation/now', english ? 'Meditate Now' : 'เริ่มนั่งสมาธิ']].map(([path, label]) =>
      <NavLink key={path} to={path} end className={({ isActive }) => `inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium ${isActive ? 'bg-brand-terracotta text-white' : 'text-brand-maroon hover:bg-brand-gold-soft'}`}>{label}</NavLink>)}
  </nav>
}
