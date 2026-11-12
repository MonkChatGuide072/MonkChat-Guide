import type { GuideIconName } from '../components/GuideIcon'

export interface PublicShortcut {
  to: '/' | '/activities' | '/meditation' | '/qa' | '/centers'
  th: string
  en: string
  icon: GuideIconName
}

export const PUBLIC_SHORTCUTS: readonly PublicShortcut[] = [
  { to: '/', th: 'หน้าแรก', en: 'Home', icon: 'home' },
  { to: '/activities', th: 'กิจกรรม', en: 'Activities', icon: 'calendar' },
  { to: '/meditation', th: 'สมาธิ', en: 'Meditate', icon: 'lotus' },
  { to: '/qa', th: 'ถาม–ตอบ', en: 'Q&A', icon: 'chat' },
  { to: '/centers', th: 'ศูนย์', en: 'Centers', icon: 'pin' },
] as const

