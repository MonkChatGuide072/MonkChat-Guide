import type { MeditationScene } from './meditationGuide'

export interface ParsedNisitId {
  valid: boolean
  code: string
  thaiYear: string
  statusCode: string
  seatNumber: number
}

const NISIT_ID_PATTERN = /^([4-6]\d)(110)(0[1-9]|[1-5]\d|60)$/

/** Computes the next index when handling ArrowLeft/ArrowRight/Home/End on a tablist. */
export function getNextRovingTabIndex(key: string, currentIndex: number, count: number): number | null {
  if (count <= 0) return null
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowRight') return (currentIndex + 1) % count
  if (key === 'ArrowLeft') return (currentIndex - 1 + count) % count
  return null
}

/** Parses and validates MCU student monk codes 4011001–6911060 (year + 110 + seat 01–60). */
export function parseNisitStudentId(raw: string): ParsedNisitId | null {
  const cleaned = raw.trim()
  const match = cleaned.match(NISIT_ID_PATTERN)
  if (!match) return null
  return {
    valid: true,
    code: cleaned,
    thaiYear: match[1],
    statusCode: match[2],
    seatNumber: Number(match[3]),
  }
}

/** Converts only trusted HTTPS YouTube links into privacy-enhanced embed URLs. */
export function parseSafeYouTubeEmbedUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw.trim())
    if (parsed.protocol !== 'https:') return null
    const host = parsed.hostname.toLowerCase()
    let videoId = ''
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0] ?? ''
    } else if (
      host === 'youtube.com'
      || host === 'www.youtube.com'
      || host === 'm.youtube.com'
      || host === 'www.youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') ?? ''
      } else if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] ?? ''
      }
    } else {
      return null
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  } catch {
    return null
  }
}

export interface NisitVocabTerm {
  word: string
  readingTh: string
  meaningTh: string
}

export interface NisitMeditationLesson {
  id: string
  scene: MeditationScene
  stageTh: string
  stageEn: string
  spokenPromptEn: string
  meaningTh: string
  coachingTipTh: string
  terms: NisitVocabTerm[]
}

/** Student-facing meditation English guiding cards derived from the project's guiding framework. */
export const nisitMeditationLessons: NisitMeditationLesson[] = [
  {
    id: 'lesson-posture',
    scene: 'sit',
    stageTh: '1. ปรับท่านั่งและวางมือ',
    stageEn: '1. Adjusting sitting posture',
    spokenPromptEn: 'Please sit comfortably with your back straight, and place your right hand gently over your left.',
    meaningTh: 'กรุณานั่งให้สบาย ตั้งหลังให้ตรงพอดี และวางมือขวาซ้อนบนมือซ้ายอย่างนุ่มนวล',
    coachingTipTh: 'หากผู้มาเยือนนั่งเก้าอี้ ให้เสริมว่า "lay both of your feet flat on the floor" เพื่อให้วางเท้าสบายไม่เกร็ง',
    terms: [
      { word: 'sitting posture', readingTh: 'ซิท-ทิง พอส-เชอะ', meaningTh: 'ท่าทางในการนั่ง' },
      { word: 'back straight', readingTh: 'แบ็ก สเทรท', meaningTh: 'หลังตั้งตรง (แบบไม่เกร็ง)' },
      { word: 'flat on the floor', readingTh: 'แฟลท ออน เดอะ ฟลอร์', meaningTh: 'วางราบไปกับพื้น' },
    ],
  },
  {
    id: 'lesson-relax',
    scene: 'relax',
    stageTh: '2. หลับตาและคลายกล้ามเนื้อ',
    stageEn: '2. Closing eyes softly',
    spokenPromptEn: 'Close your eyes softly, as if falling asleep, and relieve any remaining tension in your body.',
    meaningTh: 'หลับตาลงเบา ๆ คล้ายกำลังจะพักผ่อน และคลายความตึงเครียดที่ค้างอยู่ทั่วร่างกาย',
    coachingTipTh: 'ย้ำคำว่า softly / gently เสมอ เพื่อไม่ให้ชาวต่างชาติเผลอบีบเปลือกตาหรือเพ่งเกินไป',
    terms: [
      { word: 'softly / gently', readingTh: 'ซอฟท์-ลี / เจนท-ลี', meaningTh: 'อย่างนุ่มนวล เบา ๆ' },
      { word: 'relieve tension', readingTh: 'ริ-ลีฟ เทน-เชิน', meaningTh: 'ผ่อนคลายความตึงเครียด' },
      { word: 'facial muscles', readingTh: 'เฟ-เชียล มัส-เซิลส์', meaningTh: 'กล้ามเนื้อบนใบหน้า' },
    ],
  },
  {
    id: 'lesson-breathe',
    scene: 'breathe',
    stageTh: '3. การหายใจเข้า–ออกให้ใจผ่อนคลาย',
    stageEn: '3. Mindful breathing',
    spokenPromptEn: 'Inhale deeply and slowly exhale. Observe your warm breath coming out, then let it flow naturally.',
    meaningTh: 'สูดลมหายใจเข้าลึก ๆ และค่อย ๆ ผ่อนออก รับรู้ถึงความผ่อนคลาย แล้วปล่อยลมหายใจให้เป็นธรรมชาติ',
    coachingTipTh: 'ออกเสียงคำว่า Inhale (หายใจเข้า) และ Exhale (หายใจออก) ให้เว้นจังหวะช้ากว่าพูดปกติประมาณ 1 เท่า',
    terms: [
      { word: 'inhale deeply', readingTh: 'อิน-เฮล ดีพ-ลี', meaningTh: 'หายใจเข้าลึก ๆ อย่างสบาย' },
      { word: 'slowly exhale', readingTh: 'สโลว์-ลี เอ็กซ์-เฮล', meaningTh: 'ค่อย ๆ ผ่อนลมหายใจออก' },
      { word: 'nostrils', readingTh: 'นอส-ทริลส์', meaningTh: 'ช่องจมูก' },
    ],
  },
  {
    id: 'lesson-presence',
    scene: 'let-go',
    stageTh: '4. กลับมารู้สึกตัวและปล่อยวาง',
    stageEn: '4. Letting go & awareness',
    spokenPromptEn: 'Keep aware of your body and your whereabouts as you grow more aware of your peaceful presence.',
    meaningTh: 'ประคองความรู้สึกตัวอยู่กับปัจจุบันและสถานที่ตรงนี้ ปล่อยวางความกังวลทั้งหมดไว้ชั่วคราว',
    coachingTipTh: 'คำว่า whereabouts (แวร์-อะ-เบาทส์) ในคลิป 01:48 ออกเสียงชัดทีละพยางค์ หมายถึงการรับรู้ตำแหน่ง/สภาวะรอบตัว',
    terms: [
      { word: 'whereabouts', readingTh: 'แวร์-อะ-เบาทส์', meaningTh: 'การรับรู้ตำแหน่ง/สภาพแวดล้อมรอบตัว' },
      { word: 'sensation', readingTh: 'เซน-เซ-เชิน', meaningTh: 'ความรู้สึกตัวทางกาย' },
      { word: 'let worries go', readingTh: 'เล็ท เวอ-รีส์ โก', meaningTh: 'ปล่อยวางเรื่องกังวล' },
    ],
  },
  {
    id: 'lesson-center',
    scene: 'center',
    stageTh: '5. วางใจไว้ที่ศูนย์กลางกาย',
    stageEn: '5. Resting at the center space',
    spokenPromptEn: 'Let your mind stand still right there at the center space within your body, at your comfort spot.',
    meaningTh: 'น้อมใจให้หยุดนิ่งอย่างสบาย ณ ศูนย์กลางกายภายใน จุดที่รู้สึกพอดีและสงบที่สุด',
    coachingTipTh: 'ใช้คำว่า "center of the abdomen" หรือ "comfort spot" ช่วยให้ผู้เริ่มต้นที่ไม่คุ้นศัพท์ธรรมะเข้าใจง่ายขึ้น',
    terms: [
      { word: 'center space', readingTh: 'เซน-เทอะ สเปซ', meaningTh: 'พื้นที่ว่างกลางกาย / กลางท้อง' },
      { word: 'comfort spot', readingTh: 'คัม-เฟิร์ท สปอท', meaningTh: 'จุดที่ใจรู้สึกสบายและพอดีที่สุด' },
      { word: 'stand still', readingTh: 'สแตนด์ สทิล', meaningTh: 'หยุดนิ่งอย่างสงบ' },
    ],
  },
  {
    id: 'lesson-immerse',
    scene: 'crystal',
    stageTh: '6. นึกดวงแก้วใสและพักใจในความสงบ',
    stageEn: '6. Resting in inner peace',
    spokenPromptEn: 'Imagine a clear crystal ball effortlessly. Let your mind immerse deeply in your inner peace.',
    meaningTh: 'นึกถึงดวงแก้วกลมใสอย่างเป็นธรรมชาติ และปล่อยใจให้ซึมซับความสงบภายในอย่างสบาย ๆ',
    coachingTipTh: 'เน้นว่า "Any clarity is fine" (ชัดแค่ไหนก็เอาแค่นั้น) เพื่อคลายความกดดันให้ชาวต่างชาติ',
    terms: [
      { word: 'clear crystal ball', readingTh: 'เคลียร์ คริส-ทัล บอล', meaningTh: 'ดวงแก้วกลมใส' },
      { word: 'immerse deeply', readingTh: 'อิม-เมิร์ส ดีพ-ลี', meaningTh: 'ดิ่งหรือซึมซับลงสู่ความสงบ' },
      { word: 'inner peace', readingTh: 'อิน-เนอะ พีซ', meaningTh: 'ความสงบสุขอันบริสุทธิ์ภายใน' },
    ],
  },
  {
    id: 'lesson-open',
    scene: 'lightness',
    stageTh: '7. ช่วงถอนสมาธิและเปิดตาอย่างช้า ๆ',
    stageEn: '7. Returning gently & opening eyes',
    spokenPromptEn: 'Slowly be aware of your ambience, breathe in deeply, exhale, and now you can slowly open your eyes.',
    meaningTh: 'ค่อย ๆ รับรู้บรรยากาศรอบตัว สูดลมหายใจเข้าลึก ๆ ผ่อนออก และลืมตาขึ้นอย่างช้า ๆ',
    coachingTipTh: 'เว้นจังหวะพูดช้าและนุ่มนวลที่สุดในช่วงนี้ แล้วค่อยชวนสนทนาความรู้สึกหลังนั่งด้วยการ์ดสะท้อนผล',
    terms: [
      { word: 'ambience', readingTh: 'แอม-เบียนซ์', meaningTh: 'บรรยากาศโดยรอบตัว' },
      { word: 'exhale all the way out', readingTh: 'เอ็กซ์-เฮล ออล เดอะ เวย์ เอาท์', meaningTh: 'ผ่อนลมหายใจออกจนสุดสบาย ๆ' },
      { word: 'slowly open your eyes', readingTh: 'สโลว์-ลี โอ-เพิน ยัวร์ อายส์', meaningTh: 'ค่อย ๆ ลืมตาขึ้นอย่างช้า ๆ' },
    ],
  },
]

export interface NisitStudyResource {
  id: string
  categoryTh: string
  categoryEn: string
  titleTh: string
  titleEn: string
  descriptionTh: string
  descriptionEn: string
  url: string | null
  focusTerms: string[]
}

/** Curated external listening/reading resources (verified URLs + team-review video slots). */
export const nisitStudyResources: NisitStudyResource[] = [
  {
    id: 'ref-lets-practice',
    categoryTh: 'สื่อต้นฉบับภาษาอังกฤษ',
    categoryEn: 'Official English Reference',
    titleTh: 'บทฝึกสมาธิพื้นฐานภาษาอังกฤษ — Let’s practice (Dhammakaya Foundation)',
    titleEn: 'Let’s practice — Dhammakaya Foundation',
    descriptionTh: 'ใช้อ่านทบทวนโครงสร้างประโยคภาษาอังกฤษเรื่องท่านั่ง ฐานทั้ง 7 และการวางใจกลางท้องในระดับสากล',
    descriptionEn: 'Review natural English meditation terminology for posture, the seven bases, and gentle resting of the mind.',
    url: 'https://en.dhammakaya.net/meditation-wisdom/lets-practice/',
    focusTerms: ['sitting posture', 'inner corner of the eye', 'two finger breadths', 'center of the abdomen'],
  },
  {
    id: 'ref-seven-bases-th',
    categoryTh: 'หลักวิชชาภาษาไทย',
    categoryEn: 'Seven Bases Reference (Thai)',
    titleTh: 'ทางเดินของใจ ๗ ฐาน — วัดพระธรรมกาย',
    titleEn: 'Path of the Mind: The Seven Bases (Wat Phra Dhammakaya)',
    descriptionTh: 'ทบทวนตำแหน่งฐานทั้ง 7 ให้แม่นยำก่อนอธิบายและแปลให้ผู้มาเยือนชาวต่างชาติฟังหน้างาน',
    descriptionEn: 'Verify the exact anatomical positions of the seven bases before guiding visitors.',
    url: 'https://dhammakaya.com/4442',
    focusTerms: ['ปากช่องจมูก', 'หัวตาด้านใน', 'เพลาตา', 'ศูนย์กลางกายฐานที่ 7'],
  },
  {
    id: 'ref-ayothaya-center',
    categoryTh: 'ข้อมูลสถานที่และที่พัก/ปฏิบัติต่อ',
    categoryEn: 'Local Practice Destination',
    titleTh: 'ศูนย์ปฏิบัติธรรมอโยธยา — ข้อมูลติดต่อและรายละเอียดจริง',
    titleEn: 'Ayothaya Meditation Center — Official Information',
    descriptionTh: 'ใช้ตรวจสอบข้อมูลจริงของศูนย์ในจังหวัดพระนครศรีอยุธยาก่อนแนะนำผู้สนใจไปปฏิบัติธรรมต่อเนื่อง',
    descriptionEn: 'Consult verified local center details before recommending ongoing retreat visits to tourists.',
    url: 'https://ayothayameditation.com/',
    focusTerms: ['Ayutthaya', 'meditation center', 'retreat inquiry'],
  },
  {
    id: 'video-slot-pronunciation',
    categoryTh: 'วิดีโอฝึกฟังและออกเสียง',
    categoryEn: 'Listening & Pronunciation Video',
    titleTh: 'คลิปแนะนำการนำนั่งสมาธิ 5 นาที (รอลิงก์วิดีโอ YouTube ที่อาจารย์อนุมัติ)',
    titleEn: '5-Minute Guided Meditation Video (Awaiting team-approved YouTube URL)',
    descriptionTh: 'ระหว่างรออาจารย์เพิ่มลิงก์ YouTube ประจำรายวิชา สามารถฝึกออกเสียงจากเครื่องเล่นเสียงในแท็บที่ 2 หรือวางลิงก์ YouTube ของห้องเรียนลงในช่องฝึกด้านล่างได้เลยครับ',
    descriptionEn: 'While waiting for the approved class video link, practice pronunciation with the synchronized audio tab or paste a class YouTube link below.',
    url: null,
    focusTerms: ['rhythm', 'calm intonation', 'pause timing'],
  },
]

export const thankYouMessages = [
  {
    id: 'peace',
    labelTh: 'สันติสุขภายใน',
    labelEn: 'Inner Peace',
    en: 'Thank you for visiting Ayutthaya Monk Chat at Wat Mahathat. May calm and inner peace stay with you wherever your journey leads.',
    th: 'ขออนุโมทนาและขอบคุณที่มาร่วมกิจกรรม Ayutthaya Monk Chat ณ วัดมหาธาตุ ขอให้ความสงบสุขภายในอยู่เคียงข้างทุกการเดินทางของคุณ',
  },
  {
    id: 'mindfulness',
    labelTh: 'สติและความเบิกบาน',
    labelEn: 'Mindfulness & Joy',
    en: 'Thank you for sharing a quiet moment of meditation and conversation with us in Ayutthaya. Wishing you clarity, kindness, and joy every day.',
    th: 'ขอบคุณที่มาร่วมแบ่งปันช่วงเวลาแห่งสติและการสนทนาธรรม ณ พระนครศรีอยุธยา ขอให้มีความสว่างไสว เมตตา และความเบิกบานในทุก ๆ วัน',
  },
] as const

