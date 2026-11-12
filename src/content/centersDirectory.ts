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
  phone?: string
  email?: string
  lineId?: string
}

export interface VerifiedDirectoryCenter {
  id: string
  countryCode: string
  zone: Exclude<CenterZone, 'all'>
  continent: WorldContinentKey
  image: string
  imageWidth: number
  imageHeight: number
  imageClassName?: string
  city: Record<AppLanguage, string>
  badge: Record<AppLanguage, string>
  name: Record<AppLanguage, string>
  description: Record<AppLanguage, string>
  address: Record<AppLanguage, string>
  mapUrl: string
  websiteUrl: string
  contactUrl?: string
  phone?: string
  email?: string
  lineId?: string
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
    noteTh: 'ไทย, สิงคโปร์, ญี่ปุ่น, เกาหลีใต้, ไต้หวัน, มาเลเซีย ฯลฯ',
    noteEn: 'Thailand, Singapore, Japan, South Korea, Taiwan, Malaysia & more',
  },
  {
    key: 'europe',
    anchorUrl: 'https://en.dhammakaya.net/branches/#eu',
    icon: 'compass',
    th: 'ยุโรป (Europe)',
    en: 'Europe',
    noteTh: 'เนเธอร์แลนด์, เบลเยียม, สวิตเซอร์แลนด์, เยอรมนี, ฝรั่งเศส ฯลฯ',
    noteEn: 'Netherlands, Belgium, Switzerland, Germany, France & more',
  },
  {
    key: 'uk',
    anchorUrl: 'https://en.dhammakaya.net/branches/#uk',
    icon: 'compass',
    th: 'สหราชอาณาจักร (UK)',
    en: 'United Kingdom',
    noteTh: 'ลอนดอน, สกอตแลนด์, แมนเชสเตอร์, นิวคาสเซิล',
    noteEn: 'London, Scotland, Manchester & Newcastle',
  },
  {
    key: 'americas',
    anchorUrl: 'https://en.dhammakaya.net/branches/#usa',
    icon: 'compass',
    th: 'อเมริกา (Americas)',
    en: 'North & South America',
    noteTh: 'แคลิฟอร์เนีย (อาซูซา), ซีแอตเทิล, ชิคาโก, นิวเจอร์ซีย์, แคนาดา',
    noteEn: 'California (Azusa), Seattle, Chicago, New Jersey & Canada',
  },
  {
    key: 'oceania',
    anchorUrl: 'https://en.dhammakaya.net/branches/#oc',
    icon: 'compass',
    th: 'โอเชียเนีย (Oceania)',
    en: 'Oceania',
    noteTh: 'ซิดนีย์, เมลเบิร์น, บริสเบน และนิวซีแลนด์',
    noteEn: 'Sydney, Melbourne, Brisbane & New Zealand',
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
 * Verified official Dhammakaya centers and international meditation retreats,
 * ordered with Thailand foreigner-friendly retreats first followed by worldwide branches.
 * Every entry pairs real location photography with verified address, map URL, and official contact channels.
 */
export const VERIFIED_DIRECTORY_CENTERS: readonly VerifiedDirectoryCenter[] = [
  // ======================== THAILAND (PRIMARY) ========================
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
      th: 'ศูนย์ปฏิบัติธรรมบรรยากาศสงบร่มรื่นในจังหวัดพระนครศรีอยุธยา เหมาะสำหรับผู้มาเยือนและชาวต่างชาติที่ต้องการฝึกสมาธิต่อเนื่อง',
      en: 'A serene meditation sanctuary in Phra Nakhon Si Ayutthaya welcoming visitors and international guests seeking guided practice.',
    },
    address: {
      th: '75 ศูนย์พุทธศาสตร์ศึกษา DCI ต.ไทรน้อย อ.บางบาล จ.พระนครศรีอยุธยา 13250',
      en: '75 DCI Center, Sai Noi, Bang Ban, Phra Nakhon Si Ayutthaya 13250, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ayothaya+Meditation+Center+Bang+Ban+Ayutthaya',
    websiteUrl: 'https://ayothayameditation.com/',
    contactUrl: 'https://ayothayameditation.com/',
    phone: '093-145-4998',
    email: 'ayothayameditation@gmail.com',
    lineId: '@ayothayameditation',
  },
  {
    id: 'verified-th-papae',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-papae.jpg',
    imageWidth: 2560,
    imageHeight: 1434,
    city: {
      th: 'แม่แตง, เชียงใหม่',
      en: 'Mae Taeng, Chiang Mai',
    },
    badge: {
      th: 'ในประเทศไทย · เชียงใหม่',
      en: 'Thailand · Chiang Mai',
    },
    name: {
      th: 'ศูนย์ปฏิบัติธรรมนานาชาติป่าแป๋ (Pa Pae)',
      en: 'Pa Pae Meditation Retreat',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมนานาชาติท่ามกลางขุนเขาและธรรมชาติสำหรับชาวต่างชาติ จัดคอร์สสมาธิ 3 วัน, Flexible Retreat และโครงการบวชภาคภาษาอังกฤษ',
      en: 'Forest mountain meditation retreat in northern Thailand tailored for international guests, offering 3-day retreats, flexible stays, and English monk ordination.',
    },
    address: {
      th: 'หมู่ 2 ต.ป่าแป๋ อ.แม่แตง จ.เชียงใหม่ 50150',
      en: 'Moo 2, Tambon Pa Pae, Amphoe Mae Taeng, Chiang Mai 50150, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Pa+Pae+Meditation+Retreat+Mae+Taeng+Chiang+Mai',
    websiteUrl: 'https://www.papaemeditation.org/',
    contactUrl: 'https://www.papaemeditation.org/how-to-get-here',
    phone: '+66 81 417 7505 / +66 84 093 8383',
    email: 'papaemeditation@gmail.com',
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
      th: 'ศูนย์กลางเครือข่ายมูลนิธิธรรมกายในประเทศไทย รองรับผู้มาเยือนและชาวต่างชาติ พร้อมฝ่ายวิเทศสัมพันธ์สำหรับนัดหมายเยี่ยมชม',
      en: 'Main Dhammakaya Foundation headquarters north of Bangkok with international visitor hospitality and guided meditation programs.',
    },
    address: {
      th: '23/2 หมู่ 7 ต.คลองสาม / 40 หมู่ 8 ต.คลองสอง อ.คลองหลวง จ.ปทุมธานี 12120',
      en: '23/2 Moo 7 Khlong Sam / 40 Moo 8 Khlong Song, Khlong Luang, Pathum Thani 12120, Thailand',
    },
    mapUrl: 'https://maps.app.goo.gl/YjxbKFSBEP8YEp7P8',
    websiteUrl: 'https://en.dhammakaya.net/',
    contactUrl: 'https://en.dhammakaya.net/contact/',
    phone: '+66 2 831 1000 / +66 93 228 4126',
    email: 'info@dhammakaya.net',
  },
  {
    id: 'verified-th-samui',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-samui.jpg',
    imageWidth: 1200,
    imageHeight: 900,
    city: {
      th: 'เกาะสมุย, สุราษฎร์ธานี',
      en: 'Koh Samui, Surat Thani',
    },
    badge: {
      th: 'ในประเทศไทย · เกาะสมุย',
      en: 'Thailand · Koh Samui',
    },
    name: {
      th: 'ศูนย์ฝึกสมาธินานาชาติเกาะสมุย (SIMC)',
      en: 'Samui International Meditation Center (SIMC)',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมนานาชาติบนเกาะสมุย เปิดรับชาวต่างชาติและนักเดินทางร่วมคอร์สนั่งสมาธิสายมัชฌิมา 3–7 วัน ในบรรยากาศเงียบสงบ',
      en: 'Island meditation retreat in Koh Samui offering structured 3-to-7-day Middle Way meditation courses in English for international visitors.',
    },
    address: {
      th: '106/23 หมู่ 1 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320',
      en: '106/23 Moo 1, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samui+International+Meditation+Center+Bo+Put+Koh+Samui',
    websiteUrl: 'https://www.samui-meditation.com/',
    contactUrl: 'https://www.samui-meditation.com/',
    phone: '+66 81 956 0190',
    email: 'contact@samui-meditation.com',
  },
  {
    id: 'verified-th-mmi-pophouse',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-pophouse.jpg',
    imageWidth: 1478,
    imageHeight: 1108,
    imageClassName: 'object-[center_30%]',
    city: {
      th: 'คลองสาม, ปทุมธานี',
      en: 'Khlong Sam, Pathum Thani',
    },
    badge: {
      th: 'ในประเทศไทย · นานาชาติ',
      en: 'Thailand · International',
    },
    name: {
      th: 'สถาบันฝึกสมาธิมัชฌิมา (MMI / POP House)',
      en: 'The Middle Way Meditation Institute (MMI)',
    },
    description: {
      th: 'สถาบันจัดอบรมสมาธิภาคภาษาอังกฤษสำหรับชาวต่างชาติทั้งระยะสั้น 3 วันและ 7 วัน พร้อมเครือข่ายอาสาสมัครต่างชาติในประเทศไทย',
      en: 'International meditation institute coordinating English 3-day and 7-day Middle Way retreats in Pathum Thani and northern Thailand.',
    },
    address: {
      th: '6/137 หมู่ 6 ถ.คลองสาม ต.คลองสาม อ.คลองหลวง จ.ปทุมธานี 12120',
      en: '6/137 Moo 6 Khlong Sam Rd., Khlong Sam, Khlong Luang, Pathum Thani 12120, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=6%2F137+Moo+6+Khlong+Sam+Khlong+Luang+Pathum+Thani+12120',
    websiteUrl: 'https://mmipeace.org/',
    contactUrl: 'https://mmipeace.org/',
    phone: '+66 82 141 1400 / +66 82 333 3082',
    email: 'info@mmipeace.org',
  },
  {
    id: 'verified-th-world-peace-valley',
    countryCode: 'TH',
    zone: 'thailand',
    continent: 'asia',
    image: '/images/centers/th-wpv.webp',
    imageWidth: 1280,
    imageHeight: 756,
    city: {
      th: 'ปากช่อง (เขาใหญ่), นครราชสีมา',
      en: 'Pak Chong (Khao Yai), Nakhon Ratchasima',
    },
    badge: {
      th: 'ในประเทศไทย · เขาใหญ่',
      en: 'Thailand · Khao Yai',
    },
    name: {
      th: 'ศูนย์ปฏิบัติธรรมเวิลด์พีซ วัลเลย์ เขาใหญ่',
      en: 'World Peace Valley (Khao Yai)',
    },
    description: {
      th: 'ศูนย์ฝึกอบรมสมาธิและสันติภาพขนาดใหญ่ใกล้เขตอุทยานแห่งชาติเขาใหญ่ รองรับการอบรมและกิจกรรมปฏิบัติธรรมทั้งชาวไทยและนานาชาติ',
      en: 'Large-scale mountain valley meditation and peace training center near Khao Yai hosting national and international retreats.',
    },
    address: {
      th: 'ต.โป่งตาลอง อ.ปากช่อง จ.นครราชสีมา 30130',
      en: 'Pong Talong, Pak Chong District, Nakhon Ratchasima 30130, Thailand',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=World+Peace+Valley+Pak+Chong+Nakhon+Ratchasima',
    websiteUrl: 'https://en.dhammakaya.net/our-activities/meditation-retreat/',
    contactUrl: 'https://en.dhammakaya.net/contact/',
    phone: '+66 2 831 1000 / +66 83 540 4636',
    email: 'info@dhammakaya.net',
  },

  // ======================== INTERNATIONAL BRANCHES ========================
  {
    id: 'verified-intl-singapore',
    countryCode: 'SG',
    zone: 'international',
    continent: 'asia',
    image: '/images/centers/sg-punggol.jpg',
    imageWidth: 960,
    imageHeight: 400,
    city: {
      th: 'Singapore',
      en: 'Singapore',
    },
    badge: {
      th: 'เอเชีย (Asia)',
      en: 'Asia',
    },
    name: {
      th: 'ศูนย์ธรรมกายสิงคโปร์',
      en: 'Dhammakaya Centre Singapore',
    },
    description: {
      th: 'ศูนย์ฝึกสมาธิในประเทศสิงคโปร์ มีรอบปฏิบัติธรรมและสนทนาธรรมภาษาอังกฤษสำหรับชาวท้องถิ่นและชาวต่างชาติ',
      en: 'Kalyanamitta Centre Singapore offering weekly English and bilingual guided meditation and Dhamma study.',
    },
    address: {
      th: '6 Sumang Walk, Punggol, Singapore 828675',
      en: '6 Sumang Walk, Punggol, Singapore 828675',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=6%20Sumang%20Walk%2C%20Punggol%2C%20Singapore%20828675',
    websiteUrl: 'https://dhammakaya.sg/',
    contactUrl: 'https://dhammakaya.sg/',
  },
  {
    id: 'verified-intl-tokyo',
    countryCode: 'JP',
    zone: 'international',
    continent: 'asia',
    image: '/images/centers/jp-tokyo.webp',
    imageWidth: 1920,
    imageHeight: 1282,
    city: {
      th: 'Arakawa-ku, Tokyo',
      en: 'Arakawa-ku, Tokyo',
    },
    badge: {
      th: 'เอเชีย · ญี่ปุ่น',
      en: 'Asia · Japan',
    },
    name: {
      th: 'วัดพระธรรมกายโตเกียว',
      en: 'Wat Phra Dhammakaya Tokyo',
    },
    description: {
      th: 'สาขาวัดพระธรรมกายใจกลางกรุงโตเกียว จัดกิจกรรมฝึกสมาธิสำหรับชาวไทย ชาวญี่ปุ่น และผู้สนใจทั่วไป',
      en: 'Dhammakaya Tokyo meditation temple welcoming local residents and international visitors in Arakawa-ku.',
    },
    address: {
      th: '3-78-5 Arakawa, Arakawa-ku, Tokyo 116-0002, Japan',
      en: '3-78-5 Arakawa, Arakawa-ku, Tokyo 116-0002, Japan',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=3-78-5+Arakawa,+Arakawa-ku,+Tokyo+116-0002,+Japan',
    websiteUrl: 'https://www.watdhammakayatokyo.com/',
    contactUrl: 'https://www.watdhammakayatokyo.com/',
    phone: '+81 3-5604-3021',
  },
  {
    id: 'verified-intl-london',
    countryCode: 'GB',
    zone: 'international',
    continent: 'uk',
    image: '/images/centers/gb-london.jpg',
    imageWidth: 1280,
    imageHeight: 1024,
    city: {
      th: 'Woking, Surrey (UK)',
      en: 'Woking, Surrey (UK)',
    },
    badge: {
      th: 'สหราชอาณาจักร (UK)',
      en: 'United Kingdom',
    },
    name: {
      th: 'วัดพระธรรมกายลอนดอน',
      en: 'Wat Phra Dhammakaya London',
    },
    description: {
      th: 'วัดพระธรรมกายประจำกรุงลอนดอนและเขตเซอร์เรย์ สหราชอาณาจักร เปิดคลาสฝึกสมาธิภาษาอังกฤษสำหรับชุมชนท้องถิ่น',
      en: 'Dhammakaya Buddhist temple in Woking near London offering regular English meditation classes and weekend retreats.',
    },
    address: {
      th: '1–2 Brushfield Way, Knaphill, Woking, GU21 2TG, United Kingdom',
      en: '1–2 Brushfield Way, Knaphill, Woking, GU21 2TG, United Kingdom',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=1-2+Brushfield+Way,+Knaphill,+Woking+GU21+2TG,+UK',
    websiteUrl: 'https://www.watphradhammakayalondon.co.uk/',
    contactUrl: 'https://www.watphradhammakayalondon.co.uk/',
    phone: '+44 1483 475757',
  },
  {
    id: 'verified-intl-scotland',
    countryCode: 'GB',
    zone: 'international',
    continent: 'uk',
    image: '/images/centers/gb-scotland.jpg',
    imageWidth: 800,
    imageHeight: 1400,
    imageClassName: 'object-[center_42%]',
    city: {
      th: 'Helensburgh, Scotland',
      en: 'Helensburgh, Scotland',
    },
    badge: {
      th: 'สหราชอาณาจักร · สกอตแลนด์',
      en: 'UK · Scotland',
    },
    name: {
      th: 'วัดพระธรรมกายสกอตแลนด์',
      en: 'Wat Phra Dhammakaya Scotland',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมสาขาสกอตแลนด์ ใกล้นครกลาสโกว์ จัดคอร์สสมาธิและการเรียนรู้วัฒนธรรมพุทธสำหรับชาวสกอตและนานาชาติ',
      en: 'Scottish Dhammakaya temple in Helensburgh near Glasgow hosting English guided meditation and community gatherings.',
    },
    address: {
      th: '15 Charlotte Street, Helensburgh, G84 7QS, United Kingdom',
      en: '15 Charlotte Street, Helensburgh, G84 7QS, United Kingdom',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=15+Charlotte+Street,+Helensburgh+G84+7QS,+UK',
    websiteUrl: 'https://dhammakayascotland.org/',
    contactUrl: 'https://dhammakayascotland.org/',
    phone: '+44 1436 676024',
    email: 'info@dhammakayascotland.org',
  },
  {
    id: 'verified-intl-netherlands',
    countryCode: 'NL',
    zone: 'international',
    continent: 'europe',
    image: '/images/centers/nl-afferden.jpg',
    imageWidth: 960,
    imageHeight: 640,
    city: {
      th: 'Afferden, Netherlands',
      en: 'Afferden, Netherlands',
    },
    badge: {
      th: 'ยุโรป (Europe)',
      en: 'Europe',
    },
    name: {
      th: 'วัดพระธรรมกายเนเธอร์แลนด์',
      en: 'Wat Phra Dhammakaya Netherlands',
    },
    description: {
      th: 'วัดพระธรรมกายประจำประเทศเนเธอร์แลนด์ พร้อมคอร์สนั่งสมาธิและเสวนาธรรมภาคภาษาอังกฤษและดัตช์สำหรับชาวยุโรป',
      en: 'Wat Phra Dhammakaya Netherlands in Afferden offering meditation retreats for Dutch and international visitors.',
    },
    address: {
      th: 'Koningstraat 47, 6654 AA Afferden, Netherlands',
      en: 'Koningstraat 47, 6654 AA Afferden, Netherlands',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Koningstraat%2047%2C%206654%20AA%20Afferden%2C%20Netherlands',
    websiteUrl: 'https://www.stichting-dhammakaya.nl/nl/',
    contactUrl: 'https://www.stichting-dhammakaya.nl/nl/',
  },
  {
    id: 'verified-intl-benelux',
    countryCode: 'BE',
    zone: 'international',
    continent: 'europe',
    image: '/images/centers/be-benelux.jpg',
    imageWidth: 2500,
    imageHeight: 1874,
    city: {
      th: 'Lede, Belgium',
      en: 'Lede, Belgium',
    },
    badge: {
      th: 'ยุโรป · เบลเยียม',
      en: 'Europe · Belgium',
    },
    name: {
      th: 'วัดพระธรรมกายเบเนลักซ์ (Bron van Stilte)',
      en: 'Wat Phra Dhammakaya Benelux',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมภาคพื้นเบเนลักซ์ ณ ประเทศเบลเยียม เปิดคลาสนั่งสมาธิเป็นประจำสำหรับชาวท้องถิ่นและชาวยุโรป',
      en: 'Meditation center in Lede, Belgium serving Belgian and European practitioners in multiple languages.',
    },
    address: {
      th: 'Ronkenburgstraat 25, B-9340 Lede, Aalst, Belgium',
      en: 'Ronkenburgstraat 25, B-9340 Lede, Aalst, Belgium',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ronkenburgstraat+25,+9340+Lede,+Belgium',
    websiteUrl: 'https://www.bronvanstilte.be/',
    contactUrl: 'https://www.bronvanstilte.be/',
    phone: '+32 5 33 94 909 / +32 4 88 56 99 03',
  },
  {
    id: 'verified-intl-switzerland',
    countryCode: 'CH',
    zone: 'international',
    continent: 'europe',
    image: '/images/centers/ch-switzerland.webp',
    imageWidth: 1024,
    imageHeight: 768,
    city: {
      th: 'Arni BE, Switzerland',
      en: 'Arni BE, Switzerland',
    },
    badge: {
      th: 'ยุโรป · สวิตเซอร์แลนด์',
      en: 'Europe · Switzerland',
    },
    name: {
      th: 'วัดพระธรรมกายสวิตเซอร์แลนด์',
      en: 'Wat Phra Dhammakaya Switzerland',
    },
    description: {
      th: 'วัดพระธรรมกายประจำประเทศสวิตเซอร์แลนด์ท่ามกลางทิวทัศน์เทือกเขาแอลป์ จัดกิจกรรมฝึกสมาธิและอบรมศีลธรรม',
      en: 'Swiss Dhammakaya temple in the Bernese countryside hosting quiet meditation retreats.',
    },
    address: {
      th: 'Gumm 11, 3508 Arni (BE), Switzerland',
      en: 'Gumm 11, 3508 Arni (BE), Switzerland',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gumm+11,+3508+Arni,+Switzerland',
    websiteUrl: 'https://dhammakaya.ch/',
    contactUrl: 'https://dhammakaya.ch/',
    phone: '+41 31 701 11 21',
    email: 'dima_geneva@hotmail.com',
  },
  {
    id: 'verified-intl-azusa',
    countryCode: 'US',
    zone: 'international',
    continent: 'americas',
    image: '/images/centers/us-azusa.jpg',
    imageWidth: 960,
    imageHeight: 641,
    city: {
      th: 'Azusa, California',
      en: 'Azusa, California',
    },
    badge: {
      th: 'อเมริกา (Americas)',
      en: 'Americas',
    },
    name: {
      th: 'ศูนย์สมาธินานาชาติธรรมกาย อาซูซา',
      en: 'Dhammakaya International Meditation Center, Azusa',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมนานาชาติหลักในรัฐแคลิฟอร์เนีย สหรัฐอเมริกา มีคอร์สเจริญสติภาวนาสำหรับชาวอเมริกันและผู้สนใจ',
      en: 'Dhammakaya International Meditation Center in Azusa, California offering English classes and community meditation.',
    },
    address: {
      th: '865 E. Monrovia Pl., Azusa, CA 91702, USA',
      en: '865 E. Monrovia Pl., Azusa, CA 91702, USA',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=865%20E.%20Monrovia%20Pl.%2C%20Azusa%2C%20CA%2091702%2C%20USA',
    websiteUrl: 'https://www.peacepointmeditation.org/',
    contactUrl: 'https://www.peacepointmeditation.org/',
  },
  {
    id: 'verified-intl-seattle',
    countryCode: 'US',
    zone: 'international',
    continent: 'americas',
    image: '/images/centers/us-seattle.jpg',
    imageWidth: 1200,
    imageHeight: 898,
    city: {
      th: 'Mountlake Terrace, WA',
      en: 'Mountlake Terrace, WA',
    },
    badge: {
      th: 'อเมริกา · ซีแอตเทิล',
      en: 'USA · Seattle',
    },
    name: {
      th: 'ศูนย์ปฏิบัติธรรมซีแอตเทิล',
      en: 'Seattle Meditation Center',
    },
    description: {
      th: 'ศูนย์สมาธิในเขตซีแอตเทิล รัฐวอชิงตัน เปิดสอนสมาธิเบื้องต้นเป็นภาษาอังกฤษทุกสัปดาห์สำหรับชุมชนท้องถิ่น',
      en: 'Seattle area meditation center offering guided English mindfulness sessions and community Dhamma talks.',
    },
    address: {
      th: '21910 44th Ave. W., Mountlake Terrace, WA 98043, USA',
      en: '21910 44th Ave. W., Mountlake Terrace, WA 98043, USA',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=21910+44th+Ave+W,+Mountlake+Terrace,+WA+98043,+USA',
    websiteUrl: 'https://www.seattlemeditationcenter.org/',
    contactUrl: 'https://www.seattlemeditationcenter.org/',
    phone: '+1 (425) 608-0096',
  },
  {
    id: 'verified-intl-chicago',
    countryCode: 'US',
    zone: 'international',
    continent: 'americas',
    image: '/images/centers/us-chicago.jpg',
    imageWidth: 1200,
    imageHeight: 800,
    city: {
      th: 'Chicago, Illinois',
      en: 'Chicago, Illinois',
    },
    badge: {
      th: 'อเมริกา · ชิคาโก',
      en: 'USA · Chicago',
    },
    name: {
      th: 'ศูนย์ปฏิบัติธรรมชิคาโก',
      en: 'Meditation Center of Chicago',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมนครชิคาโก รัฐอิลลินอยส์ จัดรอบนั่งสมาธิและกิจกรรมจุดประทีปสันติภาพสำหรับชาวอเมริกันและนานาชาติ',
      en: 'Urban meditation center in Chicago hosting regular evening English guided meditation and peace gatherings.',
    },
    address: {
      th: '6224 W. Gunnison St., Chicago, IL 60630, USA',
      en: '6224 W. Gunnison St., Chicago, IL 60630, USA',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=6224+W+Gunnison+St,+Chicago,+IL+60630,+USA',
    websiteUrl: 'https://www.dmcchicago.org/',
    contactUrl: 'https://www.dmcchicago.org/',
    phone: '+1 (773) 763-8763',
  },
  {
    id: 'verified-intl-newjersey',
    countryCode: 'US',
    zone: 'international',
    continent: 'americas',
    image: '/images/centers/us-newjersey.jpg',
    imageWidth: 1200,
    imageHeight: 674,
    city: {
      th: 'Fanwood, New Jersey',
      en: 'Fanwood, New Jersey',
    },
    badge: {
      th: 'อเมริกา · นิวเจอร์ซีย์',
      en: 'USA · New Jersey',
    },
    name: {
      th: 'ศูนย์สมาธินิวเจอร์ซีย์ (DIMC NJ)',
      en: 'Dhammakaya Meditation Center of New Jersey',
    },
    description: {
      th: 'ศูนย์สมาธินานาชาติธรรมกายประจำรัฐนิวเจอร์ซีย์ จัดคลาสสมาธิและกิจกรรมวัฒนธรรมพุทธสำหรับผู้สนใจทั่วไป',
      en: 'Peaceful suburban sanctuary in Fanwood, New Jersey offering guided meditation for beginners and regulars.',
    },
    address: {
      th: '257 Midway Ave., Fanwood, NJ 07023, USA',
      en: '257 Midway Ave., Fanwood, NJ 07023, USA',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=257+Midway+Ave,+Fanwood,+NJ+07023,+USA',
    websiteUrl: 'https://www.meditationnewjersey.org/',
    contactUrl: 'https://www.meditationnewjersey.org/',
    phone: '+1 (908) 322-4187',
  },
  {
    id: 'verified-intl-sydney',
    countryCode: 'AU',
    zone: 'international',
    continent: 'oceania',
    image: '/images/centers/au-sydney.jpg',
    imageWidth: 960,
    imageHeight: 448,
    city: {
      th: 'Berrilee, New South Wales',
      en: 'Berrilee, New South Wales',
    },
    badge: {
      th: 'โอเชียเนีย (Oceania)',
      en: 'Oceania',
    },
    name: {
      th: 'วัดพระธรรมกายซิดนีย์',
      en: 'Wat Phra Dhammakaya Sydney',
    },
    description: {
      th: 'ศูนย์ปฏิบัติธรรมท่ามกลางหุบเขาและธรรมชาติชานเมืองซิดนีย์ ออสเตรเลีย รองรับการพักปฏิบัติธรรมระยะสั้นและระยะยาว',
      en: 'Wat Phra Dhammakaya Sydney nestled in tranquil Berrilee bushland, New South Wales, Australia.',
    },
    address: {
      th: 'Lot 3 Inspiration Place, Berrilee NSW 2159, Australia',
      en: 'Lot 3 Inspiration Place, Berrilee NSW 2159, Australia',
    },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lot%203%20Inspiration%20Place%2C%20Berrilee%20NSW%202159%2C%20Australia',
    websiteUrl: 'https://www.dhammakaya.org.au/',
    contactUrl: 'https://www.dhammakaya.org.au/',
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

function normalizeUrlHost(url: string | null | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

/**
 * Matches only strictly verified centers to their real location photo and known contact channels.
 * Unknown or unverified DB rows get `src: null` instead of guessed or AI imagery.
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

  const host = normalizeUrlHost(center.website_url)
  const matchedByHost = host
    ? VERIFIED_DIRECTORY_CENTERS.find((item) => normalizeUrlHost(item.websiteUrl) === host)
    : undefined
  if (matchedByHost) {
    return {
      src: matchedByHost.image,
      width: matchedByHost.imageWidth,
      height: matchedByHost.imageHeight,
      zone: matchedByHost.zone,
      continent: matchedByHost.continent,
      phone: matchedByHost.phone,
      email: matchedByHost.email,
      lineId: matchedByHost.lineId,
    }
  }

  if (code === 'TH' && (city.includes('ayutthaya') || city.includes('อยุธยา') || city.includes('บางบาล'))) {
    const c = VERIFIED_DIRECTORY_CENTERS[0]
    return { src: c.image, width: c.imageWidth, height: c.imageHeight, zone, continent: 'asia', phone: c.phone, email: c.email, lineId: c.lineId }
  }
  if (code === 'TH' && (city.includes('pa pae') || city.includes('ป่าแป๋') || city.includes('แม่แตง'))) {
    const c = VERIFIED_DIRECTORY_CENTERS[1]
    return { src: c.image, width: c.imageWidth, height: c.imageHeight, zone, continent: 'asia', phone: c.phone, email: c.email }
  }
  if (code === 'TH' && (city.includes('pathum') || city.includes('khlong') || city.includes('ปทุม'))) {
    const c = VERIFIED_DIRECTORY_CENTERS[2]
    return { src: c.image, width: c.imageWidth, height: c.imageHeight, zone, continent: 'asia', phone: c.phone, email: c.email }
  }
  if (code === 'TH' && (city.includes('samui') || city.includes('สมุย'))) {
    const c = VERIFIED_DIRECTORY_CENTERS[3]
    return { src: c.image, width: c.imageWidth, height: c.imageHeight, zone, continent: 'asia', phone: c.phone, email: c.email }
  }
  if (code === 'NL' && city.includes('afferden')) {
    return { src: '/images/centers/nl-afferden.jpg', width: 960, height: 640, zone, continent: 'europe' }
  }
  if (code === 'SG' && (city.includes('singapore') || city.includes('punggol'))) {
    return { src: '/images/centers/sg-punggol.jpg', width: 960, height: 400, zone, continent: 'asia' }
  }
  if (site.includes('dhammakayasydney.org') || (code === 'AU' && (city.includes('berrilee') || city.includes('sydney')))) {
    return { src: '/images/centers/au-sydney.jpg', width: 960, height: 448, zone, continent: 'oceania' }
  }
  if (site.includes('dimc.info') || (code === 'US' && city.includes('azusa'))) {
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
