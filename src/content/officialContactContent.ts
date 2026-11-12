import type { GuideIconName } from '../components/GuideIcon'
import type { AppLanguage } from '../lib/language'

export interface OfficialContactPill {
  icon: GuideIconName
  label: string
}

export interface OfficialContactContent {
  eyebrow: string
  title: string
  description: string
  facebookLabel: string
  facebookUrl: string
  chatbotLabel: string
  infoPills: OfficialContactPill[]
}

const OFFICIAL_FACEBOOK_URL = 'https://web.facebook.com/MonkChatAyutthaya/'

const officialContactByLanguage: Record<AppLanguage, OfficialContactContent> = {
  th: {
    eyebrow: 'OFFICIAL CONTACT & SOCIAL',
    title: 'ติดต่อสอบถาม & ติดตามเพจอย่างเป็นทางการ',
    description:
      'ติดตามตารางรอบนำสมาธิ ประกาศกิจกรรม และภาพบรรยากาศ Monk Chat วัดมหาธาตุ อยุธยา ได้ทางเพจทางการ หรือสอบถามเบื้องต้นผ่านแชทบอท',
    facebookLabel: 'MonkChat Ayutthaya',
    facebookUrl: OFFICIAL_FACEBOOK_URL,
    chatbotLabel: 'คุยกับแชทบอท',
    infoPills: [
      { icon: 'calendar', label: 'จันทร์ & ศุกร์ · 13:15 น. เป็นต้นไป' },
      { icon: 'pin', label: 'วัดมหาธาตุ พระนครศรีอยุธยา' },
    ],
  },
  en: {
    eyebrow: 'OFFICIAL CONTACT & SOCIAL',
    title: 'Official Contact & Announcements',
    description:
      'Follow updated meditation schedules, daily announcements, and Wat Mahathat activity highlights on our official Facebook page or ask the Q&A chatbot.',
    facebookLabel: 'MonkChat Ayutthaya',
    facebookUrl: OFFICIAL_FACEBOOK_URL,
    chatbotLabel: 'Ask the Chatbot',
    infoPills: [
      { icon: 'calendar', label: 'Mon & Fri · 13:15 onwards' },
      { icon: 'pin', label: 'Wat Mahathat, Ayutthaya' },
    ],
  },
}

export function getOfficialContactContent(language: AppLanguage): OfficialContactContent {
  return officialContactByLanguage[language]
}

