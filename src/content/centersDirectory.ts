import type { GuideIconName } from '../components/GuideIcon'
import type { AppLanguage } from '../lib/language'

export type CenterZone = 'all' | 'thailand' | 'international'
export type WorldContinentKey = 'asia' | 'europe' | 'uk' | 'americas' | 'oceania' | 'africa'

export interface CenterMediaMatch {
  src: string | null
  width: number
  height: number
  zone: Exclude<CenterZone, 'all'>
  continent: WorldContinentKey | null
}

export interface VerifiedThailandCenter {
  id: string
  countryCode: 'TH'
  zone: 'thailand'
  continent: 'asia'
  image: string
  imageWidth: number
  imageHeight: number
  city: Record<AppLanguage, string>
  badge: Record<AppLanguage, string>
  name: Record<AppLanguage, string>
  description: Record<AppLanguage, string>
  address: Record<AppLanguage, string>
  mapUrl: string
  websiteUrl: string
  contactUrl?: string
}

export interface GlobalBranchContinent {
  key: WorldContinentKey
  anchorUrl: string
  icon: GuideIconName
  th: string
  en: string
  noteTh: string
  noteEn: string
}

export const GLOBAL_BRANCH_CONTINENTS: readonly GlobalBranchContinent[] = [
  {
    key: 'asia',
    anchorUrl: 'https://en.dhammakaya.net/branches/#as',
    icon: 'globe',
    th: 'เอเชีย (Asia)',
    en: 'Asia',
    noteTh: 'สิงคโปร์, ญี่ปุ่น, เกาหลีใต้, ไต้หวัน, มาเลเซีย ฯลฯ',
    noteEn: 'Singapore, Japan, South Korea, Taiwan, Malaysia & more',
  },
  {
    key: 'europe',
    anchorUrl: 'https://en.dhammakaya.net/branches/#eu',
    icon: 'compass',
    th: 'ยุโรป (Europe)',
    en: 'Europe',
    noteTh: 'เนเธอร์แลนด์, เยอรมนี, ฝรั่งเศส, เบลเยียม, สแกนดิเนเวีย ฯลฯ',
    noteEn: 'Netherlands, Germany, France, Belgium, Scandinavia & more',
  },
  {
    key: 'uk',
    anchorUrl: 'https://en.dhammakaya.net/branches/#uk',
    icon: 'compass',
    th: 'สหราชอาณาจักร (UK)',
    en: 'United Kingdom',
    noteTh: 'ลอนดอน, แมนเชสเตอร์, นิวคาสเซิล, กลาสโกว์',
    noteEn: 'London, Manchester, Newcastle & Glasgow',
  },
  {
    key: 'americas',
    anchorUrl: 'https://en.dhammakaya.net/branches/#usa',
    icon: 'compass',
    th: 'อเมริกา (Americas)',
    en: 'North & South America',
    noteTh: 'แคลิฟอร์เนีย (อาซูซา), สหรัฐฯ, แคนาดา, เม็กซิโก',
    noteEn: 'California (Azusa), USA branches, Canada & Mexico',
  },
  {
    key: 'oceania',
    anchorUrl: 'https://en.dhammakaya.net/branches/#oc',
    icon: 'compass',
    th: 'โอเชียเนีย (Oceania)',
    en: 'Oceania',
    noteTh: 'ซิดนีย์, ออสเตรเลีย และนิวซีแลนด์',
    noteEn: 'Sydney, Australia & New Zealand',
  },
  {
    key: 'africa',
    anchorUrl: 'https://en.dhammakaya.net/branches/#af',
    icon: 'compass',
    th: 'แอฟริกา (Africa)',
    en: 'Africa',
    noteTh: 'โจฮันเนสเบิร์ก และเคปทาวน์ (แอฟริกาใต้)',
    noteEn: 'Johannesburg & Cape Town (South Africa)',
  },
] as const

/**
 * Confirmed official centers inside Thailand, paired with verified real photography
 * and map URLs matching the exact physical locations.
 */
export const VERIFIED_THAILAND_CENTERS: readonly VerifiedThailandCenter[] = [
  {
    id: 'verified-th-ayothaya',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-ayothaya.jpg',
    imageWidth: 960,
    imageHeight: 640,
    city: {
      th: 'บางบาล, พระนครศรีอยุธยา',
      en: 'Bang Ban, Ayutthaya',
    },
    badge: {
      th: 'ในประเทศไทย · อยุธยา',
      en: 'Thailand · Ayutthaya',
    },
    name: {
      th: 'ศูนย์ปฏิบัติธรรมอโยธยา',
      en: 'Ayothaya Meditation Center',
    },
    description: {
      th: 'สถานที่ปฏิบัติธรรมบรรยากาศสงบร่มรื่นในจังหวัดพระนครศรีอยุธยา สามารถดูข้อมูลสถานที่และสอบถามกิจกรรมโดยตรงก่อนเดินทาง',
      en: 'A peaceful meditation sanctuary in Phra Nakhon Si Ayutthaya; explore center details and inquire directly before travelling.',
    },
    address: {
      th: '75 ศูนย์พุทธศาสตร์ศึกษา DCI ต.ไทรน้อย อ.บางบาล จ.พระนครศรีอยุธยา 13250',
      en: '75 DCI Center, Sai Noi, Bang Ban, Phra Nakhon Si Ayutthaya 13250, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ayothaya+Meditation+Center+Bang+Ban+Ayutthaya',
    websiteUrl: 'https://ayothayameditation.com/',
  },
  {
    id: 'verified-th-dhammakaya-hq',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-dhammakaya.jpg',
    imageWidth: 960,
    imageHeight: 720,
    city: {
      th: 'คลองหลวง, ปทุมธานี',
      en: 'Khlong Luang, Pathum Thani',
    },
    badge: {
      th: 'สำนักงานใหญ่ · ประเทศไทย',
      en: 'Thailand Headquarters',
    },
    name: {
      th: 'วัดพระธรรมกาย (สำนักงานใหญ่)',
      en: 'Wat Phra Dhammakaya (Headquarters)',
    },
    description: {
      th: 'ศูนย์กลางเครือข่ายมูลนิธิธรรมกายในประเทศไทย รองรับผู้มาเยือนและผู้สนใจฝึกสมาธิ สามารถตรวจสอบข้อมูลติดต่อทางการก่อนเยี่ยมชม',
      en: 'Main Dhammakaya Foundation headquarters in Thailand; consult official visitor contact channels before travelling.',
    },
    address: {
      th: '23/2 หมู่ 7 ต.คลองสาม อ.คลองหลวง จ.ปทุมธานี 12120',
      en: '23/2 Moo 7, Khlong Sam, Khlong Luang, Pathum Thani 12120, Thailand',
    },
    mapUrl: 'https://maps.app.goo.gl/YjxbKFSBEP8YEp7P8',
    websiteUrl: 'https://en.dhammakaya.net/branches/',
    contactUrl: 'https://en.dhammakaya.net/contact/',
  },
] as const

const COUNTRY_CONTINENT_MAP: Record<string, WorldContinentKey> = {
  TH: 'asia',
  SG: 'asia',
  JP: 'asia',
  KR: 'asia',
  TW: 'asia',
  HK: 'asia',
  MY: 'asia',
  ID: 'asia',
  PH: 'asia',
  MN: 'asia',
  CN: 'asia',
  NP: 'asia',
  KH: 'asia',
  BN: 'asia',
  GB: 'uk',
  UK: 'uk',
  NL: 'europe',
  DE: 'europe',
  FR: 'europe',
  BE: 'europe',
  DK: 'europe',
  NO: 'europe',
  SE: 'europe',
  CH: 'europe',
  IT: 'europe',
  AT: 'europe',
  IS: 'europe',
  US: 'americas',
  CA: 'americas',
  MX: 'americas',
  AU: 'oceania',
  NZ: 'oceania',
  SB: 'oceania',
  ZA: 'africa',
}

/**
 * Matches only strictly verified centers to their real location photo.
 * Unknown or newly added rows get `src: null` instead of mismatched/AI imagery.
 */
export function resolveCenterMedia(center: {
  country_code: string
  city: string
  website_url?: string | null
}): CenterMediaMatch {
  const code = (center.country_code || '').trim().toUpperCase()
  const city = (center.city || '').toLowerCase()
  const site = (center.website_url || '').toLowerCase()
  const zone: Exclude<CenterZone, 'all'> = code === 'TH' ? 'thailand' : 'international'
  const continent = COUNTRY_CONTINENT_MAP[code] ?? null

  if (site.includes('ayothayameditation.com') || (code === 'TH' && (city.includes('ayutthaya') || city.includes('อยุธยา') || city.includes('บางบาล')))) {
    return { src: '/images/centers/th-ayothaya.jpg', width: 960, height: 640, zone, continent: 'asia' }
  }
  if (site.includes('dhammakaya.net') || (code === 'TH' && (city.includes('pathum') || city.includes('khlong') || city.includes('ปทุม')))) {
    return { src: '/images/centers/th-dhammakaya.jpg', width: 960, height: 720, zone, continent: 'asia' }
  }
  if (site.includes('stichting-dhammakaya.nl') || (code === 'NL' && city.includes('afferden'))) {
    return { src: '/images/centers/nl-afferden.jpg', width: 960, height: 640, zone, continent: 'europe' }
  }
  if (site.includes('dhammakaya.sg') || (code === 'SG' && (city.includes('singapore') || city.includes('punggol')))) {
    return { src: '/images/centers/sg-punggol.jpg', width: 960, height: 400, zone, continent: 'asia' }
  }
  if (site.includes('dhammakaya.org.au') || site.includes('dhammakayasydney.org') || (code === 'AU' && (city.includes('berrilee') || city.includes('sydney')))) {
    return { src: '/images/centers/au-sydney.jpg', width: 960, height: 448, zone, continent: 'oceania' }
  }
  if (site.includes('peacepointmeditation.org') || site.includes('dimc.info') || (code === 'US' && city.includes('azusa'))) {
    return { src: '/images/centers/us-azusa.jpg', width: 960, height: 641, zone, continent: 'americas' }
  }

  return { src: null, width: 0, height: 0, zone, continent }
}

export function getContinentLabel(continent: WorldContinentKey | null, language: AppLanguage): string {
  if (!continent) return language === 'en' ? 'International' : 'ต่างประเทศ'
  const found = GLOBAL_BRANCH_CONTINENTS.find((item) => item.key === continent)
  if (!found) return continent
  return found[language]
}

