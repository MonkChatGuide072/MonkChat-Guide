import { GuideIcon } from '../GuideIcon'
import { nisitTrainingModules, type NisitTab } from '../../content/nisitTrainingModules'
import './NisitMobileNav.css'
import { MobileNavFrame } from '../MobileNavFrame'

const shortLabels: Record<string, [string, string]> = {
  vocab: ['คำศัพท์', 'Words'], drills: ['เกมฝึก', 'Games'],
  cockpit: ['ประโยค/เครื่องมือ', 'Tools'], videos: ['วิดีโอ/เรียนรู้', 'Learning'],
  cards: ['การ์ดขอบคุณ', 'Thanks'],
}

/** Share five ordered destinations with the desktop navigation. */
export function NisitMobileNav({ activeTab, isEnglish, onSelect }: {
  activeTab: NisitTab; isEnglish: boolean; onSelect: (tab: NisitTab) => boolean
}) {
  return <MobileNavFrame isEnglish={isEnglish}><nav className="nisit-mobile-nav" aria-label={isEnglish ? 'Mobile practice navigation' : 'เมนูฝึกบนมือถือ'}>
    {nisitTrainingModules.map(item => <button key={item.id} type="button"
      aria-label={isEnglish ? `Open ${item.en}` : `เปิด${item.th}`}
      aria-pressed={activeTab === item.id} aria-controls={`panel-${item.id}`}
      onClick={() => onSelect(item.id)}>
      <span className="nisit-mobile-icon"><GuideIcon name={item.icon} /></span>
      <span>{shortLabels[item.id][isEnglish ? 1 : 0]}</span>
    </button>)}
  </nav></MobileNavFrame>
}
