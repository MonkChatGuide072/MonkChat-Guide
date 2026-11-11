import type { GuideIconName } from '../components/GuideIcon'
import type { AppLanguage } from '../lib/language'

export interface ActivityHeroChip {
  icon: GuideIconName
  label: string
}

export interface ActivityMomentCard {
  id: string
  image: string
  imageWidth: number
  imageHeight: number
  imageClassName?: string
  badge: string
  title: string
  description: string
  metaIcon: GuideIconName
  metaLeft: string
  metaRight: string
  linkTo?: string
}

export interface ActivityEtiquetteItem {
  id: string
  icon: GuideIconName
  title: string
  description: string
}

export interface ActivitiesPageContent {
  hero: {
    badge: string
    eyebrow: string
    title: string
    description: string
    chips: ActivityHeroChip[]
  }
  gallery: {
    eyebrow: string
    title: string
    pillLabel: string
    scheduleNoteTitle: string
    scheduleNoteBody: string
    cards: ActivityMomentCard[]
  }
  contact: {
    eyebrow: string
    title: string
    description: string
    facebookLabel: string
    facebookUrl: string
    chatbotLabel: string
    infoPills: ActivityHeroChip[]
  }
  etiquette: {
    eyebrow: string
    title: string
    items: ActivityEtiquetteItem[]
  }
}

/**
 * Verified Facebook URL used elsewhere in the project (`src/locales/projectLanding.ts`).
 * Keep phone numbers / email addresses omitted until confirmed directly by the Project Owner.
 */
const OFFICIAL_FACEBOOK_URL = 'https://web.facebook.com/MonkChatAyutthaya/'

const contentByLanguage: Record<AppLanguage, ActivitiesPageContent> = {
  th: {
    hero: {
      badge: 'วัดมหาธาตุ · มรดกโลกอยุธยา',
      eyebrow: 'MONK CHAT & MEDITATION',
      title: 'กิจกรรมและการปฏิบัติธรรม ณ วัดมหาธาตุ พระนครศรีอยุธยา',
      description:
        'สัมผัสประสบการณ์แห่งความสงบทางใจท่ามกลางบรรยากาศโบราณสถานอันทรงคุณค่า ร่วมล้อมวงใต้ร่มเงาไม้ใหญ่ สนทนาธรรมแลกเปลี่ยนมุมมองชีวิต ภาษา และวัฒนธรรมกับพระนิสิต มจร อย่างเป็นกันเอง พร้อมเจริญสติภาวนาสั้น ๆ เพื่อเติมเต็มความสุขสงบในใจ',
      chips: [
        { icon: 'lotus', label: 'Free Walk-in' },
        { icon: 'calendar', label: 'ทุกวันจันทร์และวันศุกร์ 13:15 น. เป็นต้นไป' },
        { icon: 'pin', label: 'ใต้ร่มไม้ใหญ่ วัดมหาธาตุ' },
      ],
    },
    gallery: {
      eyebrow: 'ภาพบรรยากาศและกิจกรรม',
      title: 'บรรยากาศจริงรอบกิจกรรม Monk Chat',
      pillLabel: 'บรรยากาศจริง ณ วัดมหาธาตุ อยุธยา',
      scheduleNoteTitle: 'ข้อแนะนำตารางกิจกรรม:',
      scheduleNoteBody:
        'จัดเป็นประจำทุกวันจันทร์และวันศุกร์ ตั้งแต่เวลา 13:15 น. เป็นต้นไป (เข้าร่วมฟรี ไม่ต้องลงทะเบียนล่วงหน้า) รอบกิจกรรมอาจปรับตามตารางการศึกษาหรือศาสนกิจของพระนิสิต',
      cards: [
        {
          id: 'courtyard',
          image: '/images/activities/activity-1.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          badge: 'ลานประวัติศาสตร์',
          title: 'สนทนาธรรม Monk Chat ณ วัดมหาธาตุ',
          description:
            'บรรยากาศสงบร่มเย็นใต้ร่มไม้ใหญ่เคียงข้างโบราณสถานวัดมหาธาตุ ชาวไทยและนักท่องเที่ยวร่วมสนทนาอย่างอบอุ่นและผ่อนคลาย',
          metaIcon: 'pin',
          metaLeft: 'วงสนทนากลางแจ้ง',
          metaRight: 'Free Walk-in',
        },
        {
          id: 'exchange',
          image: '/images/activities/activity-2.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          imageClassName: 'object-[center_35%]',
          badge: 'เสวนาเปิดใจ',
          title: 'แลกเปลี่ยนภาษาและมุมมองธรรมะ',
          description:
            'พระนิสิตพร้อมตอบคำถามเกี่ยวกับวิถีชีวิตพระสงฆ์ ความหมายของการฝึกสติ และหลักคิดดีงามในการดำเนินชีวิตประจำวัน',
          metaIcon: 'clock',
          metaLeft: 'English & Thai',
          metaRight: '13:15 น. เป็นต้นไป',
        },
        {
          id: 'meditation',
          image: '/images/activities/activity-3.jpg',
          imageWidth: 1024,
          imageHeight: 768,
          imageClassName: 'object-[center_28%]',
          badge: 'เจริญสติภาวนา',
          title: 'เจริญสติกำหนดลมหายใจ',
          description:
            'สัมผัสความสงบภายในใจด้วยการกำหนดสติรับรู้ลมหายใจเข้า-ออก ปฏิบัติได้ง่าย ๆ เหมาะสำหรับผู้เริ่มต้นทุกพื้นฐาน',
          metaIcon: 'lotus',
          metaLeft: 'Mindfulness',
          metaRight: 'ฟังเสียงนำสมาธิ →',
          linkTo: '/meditation',
        },
        {
          id: 'discussion',
          image: '/images/activities/activity-4.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          badge: 'บรรยากาศธรรมชาติ',
          title: 'สนทนาผ่อนคลายไร้พรมแดน',
          description:
            'นั่งเก้าอี้สบายใต้ร่มไม้ใหญ่ พูดคุยเปิดใจแลกเปลี่ยนความเห็นด้านวัฒนธรรมท่ามกลางโบราณสถานอยุธยา',
          metaIcon: 'chat',
          metaLeft: 'Open Discussion',
          metaRight: 'พระสงฆ์ & ผู้มาเยือน',
        },
        {
          id: 'calm',
          image: '/images/activities/activity-5.jpg',
          imageWidth: 1024,
          imageHeight: 682,
          imageClassName: 'object-[center_32%]',
          badge: 'ช่วงเวลาสงบ',
          title: 'ช่วงเวลาแห่งความสงบร่วมกัน',
          description:
            'ผู้มาเยือนจากหลากหลายประเทศร่วมหลับตาทำใจให้สงบ ตระหนักรู้ความผ่อนคลายท่ามกลางบรรยากาศวัด',
          metaIcon: 'hourglass',
          metaLeft: 'Peaceful Moment',
          metaRight: 'สงบและผ่อนคลาย',
        },
        {
          id: 'friendship',
          image: '/images/activities/activity-6.jpg',
          imageWidth: 1024,
          imageHeight: 682,
          imageClassName: 'object-[center_32%]',
          badge: 'มิตรภาพและรอยยิ้ม',
          title: 'รอยยิ้มและมิตรภาพอันอบอุ่น',
          description:
            'สร้างความเข้าใจต่างวัฒนธรรมอย่างเป็นกันเอง พระนิสิตพร้อมต้อนรับและให้คำแนะนำอย่างเปิดกว้าง',
          metaIcon: 'globe',
          metaLeft: 'Cultural Exchange',
          metaRight: 'ทุกคนร่วมได้',
        },
      ],
    },
    contact: {
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
    etiquette: {
      eyebrow: 'ข้อควรปฏิบัติสำหรับผู้ร่วมกิจกรรม',
      title: 'ข้อแนะนำเบื้องต้นในการร่วมกิจกรรมในวัด',
      items: [
        {
          id: 'dress',
          icon: 'user',
          title: 'การแต่งกายสุภาพ',
          description: 'สวมใส่เสื้อผ้าสุภาพ ปกปิดหัวไหล่และหัวเข่า เพื่อแสดงความเคารพต่อสถานที่ศักดิ์สิทธิ์',
        },
        {
          id: 'shoes',
          icon: 'check',
          title: 'ถอดรองเท้า',
          description: 'ถอดรองเท้าและหมวกก่อนเข้าสู่ศาลาปฏิบัติธรรมหรือบริเวณปูเสื่อสำหรับสนทนา',
        },
        {
          id: 'calm',
          icon: 'volumeMute',
          title: 'กิริยาที่สงบสำรวม',
          description: 'ตั้งเสียงโทรศัพท์เป็นระบบเงียบ สำรวมกาย วาจา และพูดคุยด้วยความเคารพเป็นมิตร',
        },
      ],
    },
  },
  en: {
    hero: {
      badge: 'Wat Mahathat · Ayutthaya Heritage',
      eyebrow: 'MONK CHAT & MEDITATION',
      title: 'Activities & Meditation at Wat Mahathat, Ayutthaya',
      description:
        'Experience quiet reflection amidst historic Ayutthaya temple grounds. Sit together under shaded trees for open conversation about Buddhism, monastic life, language, and Thai culture with MCU student monks, alongside gentle 5–10 minute guided meditation.',
      chips: [
        { icon: 'lotus', label: 'Free Walk-in' },
        { icon: 'calendar', label: 'Every Mon & Fri · 13:15 onwards' },
        { icon: 'pin', label: 'Shaded courtyard, Wat Mahathat' },
      ],
    },
    gallery: {
      eyebrow: 'Moments & Atmosphere',
      title: 'Real Atmosphere Around Monk Chat',
      pillLabel: 'Wat Mahathat, Ayutthaya',
      scheduleNoteTitle: 'Schedule note:',
      scheduleNoteBody:
        'Held every Monday and Friday from 13:15 onwards at Wat Mahathat (free walk-in, no advance registration required). Times may occasionally adjust for academic examinations or monastic duties.',
      cards: [
        {
          id: 'courtyard',
          image: '/images/activities/activity-1.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          badge: 'Historic Courtyard',
          title: 'Monk Chat at Wat Mahathat',
          description:
            'Open, welcoming Dhamma conversation under the shade trees beside historic Wat Mahathat with MCU student monks.',
          metaIcon: 'pin',
          metaLeft: 'Open-air setting',
          metaRight: 'Free Walk-in',
        },
        {
          id: 'exchange',
          image: '/images/activities/activity-2.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          imageClassName: 'object-[center_35%]',
          badge: 'Open Dialogue',
          title: 'Language & Dhamma Exchange',
          description:
            'MCU student monks share perspectives on monastic life, mindfulness, and practical Thai Buddhist wisdom.',
          metaIcon: 'clock',
          metaLeft: 'English & Thai',
          metaRight: '13:15 onwards',
        },
        {
          id: 'meditation',
          image: '/images/activities/activity-3.jpg',
          imageWidth: 1024,
          imageHeight: 768,
          imageClassName: 'object-[center_28%]',
          badge: 'Mindfulness',
          title: 'Mindful Breath Meditation (5–10 min)',
          description:
            'Gentle 5–10 minute breath awareness practiced on temple grounds or anytime through our guided web audio.',
          metaIcon: 'lotus',
          metaLeft: 'Mindfulness',
          metaRight: 'Try guided audio →',
          linkTo: '/meditation',
        },
        {
          id: 'discussion',
          image: '/images/activities/activity-4.jpg',
          imageWidth: 1024,
          imageHeight: 576,
          badge: 'Natural Setting',
          title: 'Welcoming Conversation',
          description:
            'Relaxed open-air dialogue under tree shade, welcoming questions from visitors of every culture and belief.',
          metaIcon: 'chat',
          metaLeft: 'Open Discussion',
          metaRight: 'Monks & Visitors',
        },
        {
          id: 'calm',
          image: '/images/activities/activity-5.jpg',
          imageWidth: 1024,
          imageHeight: 682,
          imageClassName: 'object-[center_32%]',
          badge: 'Peaceful Moment',
          title: 'Shared Stillness Together',
          description:
            'Visitors from around the world pause together in quiet breath meditation, stepping away from busy travel.',
          metaIcon: 'hourglass',
          metaLeft: 'Peaceful Moment',
          metaRight: 'Peace & Calm',
        },
        {
          id: 'friendship',
          image: '/images/activities/activity-6.jpg',
          imageWidth: 1024,
          imageHeight: 682,
          imageClassName: 'object-[center_32%]',
          badge: 'Cultural Exchange',
          title: 'Warm Hospitality & Friendship',
          description:
            'Friendly cross-cultural connection where MCU student monks warmly greet and guide first-time visitors.',
          metaIcon: 'globe',
          metaLeft: 'Cultural Exchange',
          metaRight: 'All welcome',
        },
      ],
    },
    contact: {
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
    etiquette: {
      eyebrow: 'Visitor Etiquette',
      title: 'Simple Guidelines for Temple Activities',
      items: [
        {
          id: 'dress',
          icon: 'user',
          title: 'Dress Modestly',
          description: 'Please wear clothing that covers your shoulders and knees out of respect for the monastic setting.',
        },
        {
          id: 'shoes',
          icon: 'check',
          title: 'Remove Footwear',
          description: 'Remove shoes and hats before entering meditation halls, pavilions, and seated mat areas.',
        },
        {
          id: 'calm',
          icon: 'volumeMute',
          title: 'Respectful Presence',
          description: 'Turn mobile phones to silent mode. Speak softly and show kindness towards monks and fellow visitors.',
        },
      ],
    },
  },
}

export function getActivitiesPageContent(language: AppLanguage): ActivitiesPageContent {
  return contentByLanguage[language]
}
