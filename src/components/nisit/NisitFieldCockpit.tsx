import { useState, useRef, useEffect } from 'react'
import { GuideIcon } from '../GuideIcon'

interface QuickPhrase {
  id: string
  category: 'vinaya' | 'rescue' | 'meditation' | 'blessing'
  categoryTh: string
  categoryEn: string
  textEn: string
  textTh: string
  phoneticTh: string
  notesTh: string
}

const QUICK_PHRASES: QuickPhrase[] = [
  // 1. Vinaya Boundaries (พระวินัยและข้อห้าม)
  {
    id: 'v-touch-women',
    category: 'vinaya',
    categoryTh: 'พระวินัย & การสัมผัส',
    categoryEn: 'Vinaya & Physical Contact',
    textEn: 'In our Theravada monastic tradition, monks do not have physical contact with women. Thank you for your kind understanding.',
    textTh: 'ตามพระธรรมวินัยเถรวาท พระสงฆ์จะไม่สัมผัสถูกต้องกายสตรี ขอขอบพระคุณในความเข้าใจอันดีครับ',
    phoneticTh: 'อิน เอา-เออะ เท-ระ-วา-ดะ โม-แนส-ทิก เทร-ดิ-ชัน, มังคส์ ดู น็อต แฮฟ ฟิ-ซิ-เคิล คอน-แทกต์ วิธ วี-มิน...',
    notesTh: 'ใช้กล่าวอย่างนุ่มนวลเมื่อมีนักท่องเที่ยวสตรีขยับเข้ามาใกล้เพื่อจับมือหรือขอถ่ายรูปใกล้ชิด',
  },
  {
    id: 'v-money',
    category: 'vinaya',
    categoryTh: 'พระวินัย & ปัจจัย/เงิน',
    categoryEn: 'Vinaya & Donations',
    textEn: 'Monks do not handle money directly. If you wish to make an offering, please use the temple donation box over there.',
    textTh: 'พระสงฆ์จะไม่จับต้องเงินโดยตรง หากท่านมีความประสงค์จะร่วมบุญ สามารถหยอดตู้บริจาคของวัดที่จุดนั้นได้ครับ',
    phoneticTh: 'มังคส์ ดู น็อต แฮน-เดิล มัน-นี ได-เร็กต์-ลี...',
    notesTh: 'ใช้ชี้แจงเมื่อนักท่องเที่ยวยื่นเงินหรือธนบัตรถวายพระตรงๆ',
  },
  {
    id: 'v-meal-time',
    category: 'vinaya',
    categoryTh: 'พระวินัย & เวลาฉันอาหาร',
    categoryEn: 'Vinaya & Meal Times',
    textEn: 'Buddhist monks take meals only between dawn and noon. After midday, we take only allowed liquids or tea.',
    textTh: 'พระสงฆ์จะฉันภัตตาหารเฉพาะช่วงเช้าถึงก่อนเที่ยงวันเท่านั้น หลังเที่ยงไปแล้วจะฉันเฉพาะน้ำปานะหรือชาครับ',
    phoneticTh: 'บุด-ดิสต์ มังคส์ เทก มีลส์ โอน-ลี บี-ทวีน ดอน แอนด์ นูน...',
    notesTh: 'ใช้อธิบายเมื่อมีผู้มาเยือนยื่นขนมหรืออาหารให้ในช่วงบ่าย',
  },

  // 2. Rescue & Communication (การสื่อสาร & ขอเวลา)
  {
    id: 'r-speak-slower',
    category: 'rescue',
    categoryTh: 'ขอให้พูดช้าลง',
    categoryEn: 'Speak Slower',
    textEn: 'Could you please speak a little more slowly? I want to make sure I understand you completely.',
    textTh: 'รบกวนช่วยพูดช้าลงสักนิดได้ไหมครับ อาตมาอยากมั่นใจว่าเข้าใจความหมายของโยมได้อย่างครบถ้วน',
    phoneticTh: 'คูด ยู พลีส สปีค อะ ลิต-เติล มอร์ สโล-ลี...',
    notesTh: 'ใช้เมื่อชาวต่างชาติพูดเร็วหรือใช้สำเนียงท้องถิ่นที่ฟังยาก',
  },
  {
    id: 'r-write-down',
    category: 'rescue',
    categoryTh: 'ขอให้พิมพ์หรือเขียน',
    categoryEn: 'Write / Type Down',
    textEn: 'That is an interesting question. Could you please type or write down the key word for me?',
    textTh: 'เป็นคำถามที่น่าสนใจมากเลยครับ รบกวนโยมช่วยพิมพ์หรือเขียนคำสำคัญคำนี้ลงในหน้าจอให้หน่อยได้ไหมครับ',
    phoneticTh: 'แดท อิส แอน อิน-เทรส-ติ้ง เควส-ชัน. คูด ยู พลีส ไทป์ ออร์ ไรท์ ดาวน์...',
    notesTh: 'ใช้เมื่อฟังคำศัพท์เฉพาะทางไม่ออก เพื่อให้ผู้มาเยือนพิมพ์คำนั้นให้อ่าน',
  },
  {
    id: 'r-consult-elder',
    category: 'rescue',
    categoryTh: 'ขอปรึกษาพระอาจารย์',
    categoryEn: 'Consult Senior Monk',
    textEn: 'This is a profound question. I will consult with our senior teaching monk and update our guide with a comprehensive answer.',
    textTh: 'ประเด็นนี้เป็นธรรมะที่ลึกซึ้งมาก อาตมาจะนำไปปรึกษาพระมหาเถระผู้เชี่ยวชาญ และรวบรวมคำตอบไว้ในระบบต่อไปครับ',
    phoneticTh: 'ดิส อิส อะ พรอ-ฟาวนด์ เควส-ชัน. ไอ วิล คอน-ซัลต์ วิธ เอา-เออะ ซี-เนียร์ ทีช-ชิ่ง มังค์...',
    notesTh: 'ใช้อย่างสง่างามเมื่อเจอคำถามยากที่ยังไม่มั่นใจในคำตอบ หลีกเลี่ยงการเดาธรรมะส่งเดช',
  },

  // 3. Meditation Guidance (เชิญชวนนั่งสมาธิ)
  {
    id: 'm-invite',
    category: 'meditation',
    categoryTh: 'ชวนนั่งสมาธิ 5 นาที',
    categoryEn: 'Invite Meditation',
    textEn: 'Would you like to experience 5 minutes of peaceful meditation with us right now? It is very gentle and relaxing.',
    textTh: 'โยมสนใจจะทดลองนั่งสมาธิเบื้องต้นสัก 5 นาทีร่วมกันตอนนี้ไหมครับ? ผ่อนคลายและสงบใจง่ายมากครับ',
    phoneticTh: 'วูด ยู ไลค์ ทู เอ็กซ์-พี-เรียนส์ ไฟฟ์ มิน-นิตส์ ออฟ พีซ-ฟูล เม-ดิ-เท-ชัน...',
    notesTh: 'ใช้กล่าวเปิดบทสนทนาเพื่อเชิญชวนนักท่องเที่ยวเริ่มทำสมาธิ',
  },
  {
    id: 'm-eyes-gentle',
    category: 'meditation',
    categoryTh: 'แนะนำการหลับตา',
    categoryEn: 'Closing Eyes',
    textEn: 'Close your eyes gently, like when you are about to fall asleep, without squeezing your eyelids.',
    textTh: 'หลับตาลงเบาๆ นุ่มนวล คล้ายตอนที่เรากำลังจะเคลิ้มหลับ โดยไม่ต้องบีบหรือเกร็งเปลือกตาครับ',
    phoneticTh: 'โคลส ยัวร์ อายส์ เจนท์-ลี, ไลค์ เวน ยู อาร์ อะ-เบาต์ ทู ฟอล อะ-สลีป...',
    notesTh: 'คำแนะนำหัวใจหลักของหลวงพ่อทัตตชีโวในการเริ่มทำสมาธิ',
  },
  {
    id: 'm-center-body',
    category: 'meditation',
    categoryTh: 'วางใจศูนย์กลางกาย',
    categoryEn: 'Center of Body',
    textEn: 'Rest your gentle awareness at the center of your body, two finger-widths above the navel.',
    textTh: 'วางความรู้สึกอย่างนุ่มนวลไว้ที่ศูนย์กลางกาย เหนือระดับสะดือขึ้นมาประมาณ 2 นิ้วมือครับ',
    phoneticTh: 'เรสต์ ยัวร์ เจนท์-เติล อะ-แวร์-เนส แอท เดอะ เซ็น-เทอร์ ออฟ ยัวร์ บอ-ดี...',
    notesTh: 'การอธิบายตำแหน่งฐานที่ 7 เป็นภาษาอังกฤษแบบกระชับ',
  },

  // 4. Blessings & Parting (ให้พรและอำลา)
  {
    id: 'b-peace-blessing',
    category: 'blessing',
    categoryTh: 'ให้พรความสงบสุข',
    categoryEn: 'Peace & Happiness',
    textEn: 'May the merit of your good deeds bring you and your family lasting peace, good health, and joyful minds.',
    textTh: 'ขอให้อานิสงส์แห่งความดีคุ้มครองโยมและครอบครัว ให้ประสบแต่ความสงบสุข สุขภาพแข็งแรง และจิตใจที่ผ่องใสครับ',
    phoneticTh: 'เมย์ เดอะ เมอ-ริท ออฟ ยัวร์ กู๊ด ดีดส์ บริง ยู แอนด์ ยัวร์ แฟ-มิ-ลี ลาส-ติ้ง พีซ...',
    notesTh: 'ใช้ให้พรก่อนที่ผู้มาเยือนจะลุกออกจากโต๊ะสนทนา',
  },
  {
    id: 'b-safe-travels',
    category: 'blessing',
    categoryTh: 'อวยพรการเดินทาง',
    categoryEn: 'Safe Travels',
    textEn: 'Wishing you a pleasant journey in Thailand. May you travel safely and carry inner peace wherever you go.',
    textTh: 'ขอให้โยมมีความสุขและเดินทางท่องเที่ยวในประเทศไทยอย่างปลอดภัย พกพาความสงบในใจติดตัวไปในทุกหนแห่งครับ',
    phoneticTh: 'วิช-ชิ่ง ยู อะ เพลส-เซินท์ เจอร์-นีย์ อิน ไท-แลนด์...',
    notesTh: 'ใช้กล่าวอำลาและอวยพรการท่องเที่ยวในอยุธยาและไทย',
  },
  {
    id: 'b-merit-share',
    category: 'blessing',
    categoryTh: 'อนุโมทนาบุญ',
    categoryEn: 'Anumodana / Rejoicing',
    textEn: 'Sadhu! We rejoice in your good intentions and respect for the Dhamma. Have a peaceful day.',
    textTh: 'สาธุ! ขออนุโมทนาในความตั้งใจดีและความเคารพในพระธรรม ขอให้วันนี้เป็นวันที่เปี่ยมสุขและสงบใจครับ',
    phoneticTh: 'สา-ธุ! วี รี-จอยซ์ อิน ยัวร์ กู๊ด อิน-เทน-ชันส์...',
    notesTh: 'ใช้กล่าวรับเมื่อโยมกล่าวขอบคุณหรือถวายความเคารพ',
  },
]

interface MeditationCue {
  start: number
  end: number
  en: string
  th: string
}

const MEDITATION_CUES: MeditationCue[] = [
  {
    start: 0,
    end: 8,
    en: "It's time to take a mental coffee break.",
    th: 'ขอเรียนเชิญทุกท่าน ละจากภารกิจการงานสักครู่หนึ่ง มาพักใจ พักความคิด ให้ใจได้หยุดนิ่งกันนะครับ',
  },
  {
    start: 8,
    end: 15,
    en: "Let's begin with adjusting your sitting posture.",
    th: 'ให้เราเริ่มต้นด้วยการปรับร่างกาย ปรับท่านั่งของเราให้สะดวกสบายที่สุด',
  },
  {
    start: 15,
    end: 22,
    en: 'You can simply sit in your regular working chair.',
    th: 'จะนั่งบนเก้าอี้ทำงานตามปกติ หรือเลือกท่าทางที่รู้สึกผ่อนคลายที่สุดก็ได้นะครับ',
  },
  {
    start: 22,
    end: 31.5,
    en: 'Please keep your back straight and lay both of your feet flat on the floor.',
    th: 'ให้ขยับร่างกาย ตั้งหลังให้ตรงพอดี ๆ แล้ววางเท้าทั้งสองข้างราบไปกับพื้นสบาย ๆ',
  },
  {
    start: 31.5,
    end: 44,
    en: 'Relieve your entire body from any remaining tension.',
    th: 'ผ่อนคลายร่างกายทุกส่วน ปล่อยความตึงเครียดที่ค้างคาอยู่ให้ออกไปให้หมดสิ้น',
  },
  {
    start: 44,
    end: 58.5,
    en: "Let's close your eyes softly, feeling relaxation around the eyes.",
    th: 'ค่อย ๆ หลับตาลงเบา ๆ ในระดับที่พอดี ๆ ไม่บีบเปลือกตา สัมผัสถึงความผ่อนคลายรอบดวงตาของเรา',
  },
  {
    start: 58.5,
    end: 75,
    en: 'Let the relaxation spread to your facial muscles and the entire body.',
    th: 'ปล่อยกระแสแห่งความผ่อนคลายนี้ แผ่ซ่านไปยังกล้ามเนื้อใบหน้า และขยายไปทั่วทั้งร่างกาย',
  },
  {
    start: 75,
    end: 94.5,
    en: 'Allow the relaxation to fill every part of your body, beginning from the top of your head down to your face, body, legs, and down to your toes.',
    th: 'ให้ความผ่อนคลายนี้เติมเต็มในทุก ๆ ส่วนของร่างกาย ตั้งแต่ยอดศีรษะ ลงมาที่ใบหน้า ลำตัว ขา ไปจนถึงปลายเท้า',
  },
  {
    start: 94.5,
    end: 108,
    en: 'Gently draw your attention back to be with your sensation.',
    th: 'น้อมนำใจนิ่ง ๆ กลับมาอยู่กับเนื้อกับตัว กลับมารับรู้ถึงความรู้สึกภายในที่สงบ',
  },
  {
    start: 108,
    end: 124.5,
    en: 'Keep aware of your body, aware of your whereabouts as you are growing more aware of your presence.',
    th: 'ประคองสติให้อยู่กับตัว มีสติระลึกรู้ตื่นและเบิกบานอยู่ภายใน ณ ขณะนี้ให้มากยิ่งขึ้น',
  },
  {
    start: 124.5,
    end: 138,
    en: 'Inhale deeply and gently feel your breath passing your nostrils.',
    th: 'สูดลมหายใจเข้าลึก ๆ... สัมผัสกระแสลมหายใจที่ผ่านช่องจมูกเข้าไปอย่างแผ่วเบา',
  },
  {
    start: 138,
    end: 154,
    en: 'Let it flow down along the airway until it reaches the final end at the middle of your abdomen.',
    th: 'ปล่อยให้ลมหายใจไหลผ่านช่องทางเดินหายใจอย่างนุ่มนวล ลงไปจนสุดสายที่กึ่งกลางท้อง (ศูนย์กลางกาย)',
  },
  {
    start: 154,
    end: 164.5,
    en: 'Feeling your breath turn into warm out breath.',
    th: 'รับรู้ถึงลมหายใจที่ค่อย ๆ แปรเปลี่ยนเป็นลมหายใจออกที่อบอุ่นและผ่อนคลาย',
  },
  {
    start: 164.5,
    end: 180,
    en: 'Slowly exhale and observe your warm breath coming out from deep within your body.',
    th: 'ค่อย ๆ ผ่อนลมหายใจออกช้า ๆ สังเกตลมหายใจอุ่นที่เดินทางออกมาจากภายในร่างกาย',
  },
  {
    start: 180,
    end: 196,
    en: "Let's inhale deeply again and keep your attention at the end of your breath, at the center space within your body.",
    th: 'สูดลมหายใจเข้าลึก ๆ อีกครั้ง แล้วประคองใจไว้ที่จุดสิ้นสุดของลมหายใจ ณ ศูนย์กลางกายภายในตัวเรา',
  },
  {
    start: 196,
    end: 205,
    en: 'Let your mind rest here for a while.',
    th: 'ปล่อยให้ใจได้หยุดพักนิ่ง ๆ สบาย ๆ อยู่ตรงนี้สักครู่หนึ่ง',
  },
  {
    start: 205,
    end: 214,
    en: 'Maintain your awareness at the center space.',
    th: 'ประคองความรู้สึก ความระลึกรู้ อยู่ที่ศูนย์กลางกายอย่างต่อเนื่องและแผ่วเบา',
  },
  {
    start: 214,
    end: 224.5,
    en: 'Let your mind stand still right there at your comfort spot.',
    th: 'ให้ใจหยุดนิ่งสนิท อยู่ตรงจุดที่รู้สึกสบายที่สุด สว่างที่สุด นุ่มนวลที่สุด',
  },
  {
    start: 224.5,
    end: 233,
    en: 'Let it rest inside comfortably for a while.',
    th: 'ให้ใจได้พักผ่อนอยู่ภายในอย่างแสนสบาย ผ่อนคลายอย่างแท้จริง',
  },
  {
    start: 233,
    end: 245,
    en: 'Let your mind immerse deeply in your inner peace. Here at the comfort spot here. Deep within your body.',
    th: 'ให้ใจได้ดิ่งลึก ดื่มด่ำกับความสงบสุขภายใน ณ จุดที่สบายลึกซึ้งภายในศูนย์กลางกายของเรา',
  },
  {
    start: 245,
    end: 279,
    en: '— Silent Meditation Period (Resting in inner stillness) —',
    th: '— ช่วงเวลาพักใจในความสงบนิ่งและหยุดนิ่ง ณ ศูนย์กลางกาย —',
  },
  {
    start: 279,
    end: 288,
    en: 'Gently bring attention back to be aware of your sensation.',
    th: 'ค่อย ๆ น้อมนำความรู้สึกตัวกลับมา รับรู้ถึงสัมผัสและความสงบสบายในร่างกาย',
  },
  {
    start: 288,
    end: 308.5,
    en: 'Slowly be aware of your ambience and breathe in deeply and softly exhale all the way out.',
    th: 'ค่อย ๆ รับรู้ถึงบรรยากาศรอบตัว สูดลมหายใจเข้าลึก ๆ และผ่อนลมหายใจออกช้า ๆ จนสุดสาย',
  },
  {
    start: 308.5,
    end: 318,
    en: 'Breathe in deeply and exhale.',
    th: 'สูดลมหายใจเข้าลึก ๆ อีกครั้ง... และผ่อนลมหายใจออกอย่างผ่อนคลาย',
  },
  {
    start: 318,
    end: 326.5,
    en: 'Now you can slowly open your eyes.',
    th: 'ตอนนี้ ให้ค่อย ๆ ลืมตาขึ้นช้า ๆ แย้มยิ้มให้กับความสุขและความผ่องใสภายในตัวเรานะครับ',
  },
]

interface LoggedQuestion {
  id: string
  timestamp: string
  dateFormatted: string
  visitorCountry: string
  visitorName?: string
  questionText: string
  notes?: string
  status: 'pending_cms'
}

const STORAGE_UNHANDLED_QUESTIONS = 'monkchat_unhandled_questions_v1'

interface NisitFieldCockpitProps {
  isEnglish: boolean
  studentCode?: string
  studentName?: string
}

export function NisitFieldCockpit({
  isEnglish,
  studentCode = 'AYT-MONK',
  studentName = 'พระนิสิตผู้ปฏิบัติหน้าที่',
}: NisitFieldCockpitProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPhrase, setExpandedPhrase] = useState<QuickPhrase | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [speakingPhraseId, setSpeakingPhraseId] = useState<string | null>(null)

  // Real Audio Guide State
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioSeconds, setAudioSeconds] = useState(0)
  const [audioDuration, setAudioDuration] = useState(326)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [activeCue, setActiveCue] = useState<MeditationCue>(MEDITATION_CUES[0])
  const [audioErrorMessage, setAudioErrorMessage] = useState('')

  // CMS Question Logging State
  const [showLogForm, setShowLogForm] = useState(false)
  const [visitorCountry, setVisitorCountry] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [questionNotes, setQuestionNotes] = useState('')
  const [loggedQuestions, setLoggedQuestions] = useState<LoggedQuestion[]>([])
  const [logSuccessMessage, setLogSuccessMessage] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_UNHANDLED_QUESTIONS)
      if (raw) {
        setLoggedQuestions(JSON.parse(raw) as LoggedQuestion[])
      }
    } catch {
      // Ignore
    }
  }, [])

  // Sync active cue with audio seconds
  useEffect(() => {
    const cue = MEDITATION_CUES.find((c) => audioSeconds >= c.start && audioSeconds < c.end)
    if (cue) {
      setActiveCue(cue)
    }
  }, [audioSeconds])

  const toggleMeditationAudio = async () => {
    const el = audioRef.current
    if (!el) return

    setAudioErrorMessage('')

    if (isPlayingAudio || !el.paused) {
      try {
        el.pause()
      } catch (err) {
        console.warn('Pause error:', err)
      }
      setIsPlayingAudio(false)
    } else {
      try {
        el.muted = false
        el.volume = volume || 1
        setIsPlayingAudio(true)
        await el.play()
      } catch (err) {
        console.error('Audio play error:', err)
        setIsPlayingAudio(false)
        const msg = err instanceof Error ? err.message : String(err)
        setAudioErrorMessage(
          isEnglish
            ? `Audio play blocked or waiting for user interaction: ${msg}`
            : `ระบบบล็อกเสียงอัตโนมัติ กรุณากดปุ่มอีกครั้งเพื่อเปิดเสียง`,
        )
      }
    }
  }

  const handleTimeUpdate = () => {
    const el = audioRef.current
    if (!el) return
    const cur = el.currentTime
    const dur = el.duration || audioDuration || 326
    setAudioSeconds(Math.floor(cur))
    setAudioProgress((cur / dur) * 100)
  }

  const handleSeekRelative = (deltaSeconds: number) => {
    const el = audioRef.current
    if (!el) return
    const dur = el.duration || audioDuration || 326
    const newTime = Math.max(0, Math.min(dur, el.currentTime + deltaSeconds))
    el.currentTime = newTime
    setAudioSeconds(Math.floor(newTime))
    setAudioProgress((newTime / dur) * 100)
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const dur = el?.duration || audioDuration || 326
    const targetTime = percent * dur
    if (el) el.currentTime = targetTime
    setAudioSeconds(Math.floor(targetTime))
    setAudioProgress(percent * 100)
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    setIsMuted(newVol === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVol
      audioRef.current.muted = newVol === 0
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      if (audioRef.current) {
        audioRef.current.muted = false
        audioRef.current.volume = volume || 1
      }
    } else {
      setIsMuted(true)
      if (audioRef.current) {
        audioRef.current.muted = true
      }
    }
  }

  const playSpeech = (phraseId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(
        isEnglish
          ? 'Web Speech synthesis is not supported in this browser.'
          : 'เบราว์เซอร์นี้ไม่รองรับระบบสังเคราะห์เสียง (Web Speech API)',
      )
      return
    }
    try {
      window.speechSynthesis.cancel()
      setSpeakingPhraseId(phraseId)
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.88
        utterance.volume = 1.0

        // Select English voice if available
        const voices = window.speechSynthesis.getVoices()
        const enVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('David') ||
                v.name.includes('Zira')),
          ) || voices.find((v) => v.lang.startsWith('en'))
        if (enVoice) utterance.voice = enVoice

        utterance.onend = () => setSpeakingPhraseId(null)
        utterance.onerror = () => setSpeakingPhraseId(null)
        window.speechSynthesis.speak(utterance)
      }, 50)
    } catch {
      setSpeakingPhraseId(null)
    }
  }

  const copyToClipboard = (phrase: QuickPhrase) => {
    try {
      void navigator.clipboard.writeText(phrase.textEn)
      setCopiedId(phrase.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback
    }
  }

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return

    const now = new Date()
    const newEntry: LoggedQuestion = {
      id: `q_${Date.now()}`,
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      visitorCountry: visitorCountry.trim() || 'ไม่ระบุ',
      visitorName: visitorName.trim() || undefined,
      questionText: questionText.trim(),
      notes: questionNotes.trim() || undefined,
      status: 'pending_cms',
    }

    const updated = [newEntry, ...loggedQuestions]
    try {
      localStorage.setItem(STORAGE_UNHANDLED_QUESTIONS, JSON.stringify(updated))
    } catch {
      setLogSuccessMessage(isEnglish ? 'Could not save. Please copy your question before leaving.' : 'ยังบันทึกไม่ได้ กรุณาคัดลอกคำถามไว้ก่อนออกจากหน้านี้')
      return
    }
    setLoggedQuestions(updated)

    setLogSuccessMessage(
      isEnglish
        ? 'Question saved on this device. Share it with your coordinator when ready.'
        : 'บันทึกคำถามในเครื่องแล้ว สามารถนำไปแจ้งผู้ดูแลเพื่อตรวจสอบต่อได้',
    )
    setVisitorCountry('')
    setVisitorName('')
    setQuestionText('')
    setQuestionNotes('')
    setShowLogForm(false)
    setTimeout(() => setLogSuccessMessage(''), 5000)
  }

  const filteredPhrases = QUICK_PHRASES.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory
    const matchQuery =
      searchQuery.trim() === '' ||
      item.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.textTh.includes(searchQuery) ||
      item.notesTh.includes(searchQuery)
    return matchCat && matchQuery
  })

  return (
    <div className="space-y-6">
      {/* Hidden real audio element powering the station */}
      <audio
        ref={audioRef}
        src="/audio/meditation-5min-en.mp3"
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration) setAudioDuration(e.currentTarget.duration)
        }}
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
        onEnded={() => {
          setIsPlayingAudio(false)
          setAudioSeconds(0)
          setAudioProgress(0)
        }}
        onError={() => {
          setAudioErrorMessage('ไม่สามารถโหลดไฟล์เสียงนำสมาธิได้ กรุณาลองใหม่อีกครั้ง')
        }}
      />

      {/* Cockpit Operation Banner */}
      <div className="training-module-intro rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-600"></span>
            <span>{isEnglish ? 'LIVE TABLE OPERATIONS' : 'โหมดหน้างานจริง ณ โต๊ะสนทนา'}</span>
          </div>
          <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-brand-maroon">
            {isEnglish ? 'On-Site Monk Assistant · Wat Mahathat' : 'ผู้ช่วยประจำโต๊ะพระนิสิต วัดมหาธาตุ อยุธยา'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-brand-muted">
            {isEnglish
              ? 'Instant tools while stationed: One-tap 5-min meditation audio, quick Vinaya spoken phrases, and unhandled Q&A logger.'
              : 'เครื่องมือสนับสนุนพระนิสิตขณะปฏิบัติหน้าที่: เปิดเสียงนำสมาธิ 5 นาทีทันใจ, ประโยคชี้แจงพระวินัยพร้อมฟังเสียงอ่าน, และจดคำถามสดไว้ในเครื่อง'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogForm((v) => !v)}
          className="min-h-11 rounded-xl bg-brand-maroon hover:bg-brand-maroon/90 text-white px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <GuideIcon name="clipboard" className="h-4 w-4" />
          <span>{showLogForm ? (isEnglish ? 'Close Logger' : 'ปิดกล่องจด') : (isEnglish ? '+ Save a Question' : '+ จดคำถามในเครื่อง')}</span>
        </button>
      </div>

      {/* SECTION 1: Master One-Tap Guided Meditation Station (High-Impact Operational Console) */}
      <div className="training-cockpit-player rounded-3xl border border-[#D5B77E]/40 bg-gradient-to-br from-[#0B1528] via-[#11223C] to-[#1A2F50] p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isEnglish ? 'Instant Audio Broadcaster' : 'ระบบเปิดเสียงนำสมาธิสากลประจำโต๊ะ · 5 นาที'}</span>
            </div>
            <h3 className="mt-1 font-serif text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-white">
              {isEnglish ? 'One-Tap 5-Min Guided Meditation' : 'เปิดเสียงนำสมาธิสากล 5 นาทีทันใจ (ONE-TAP AUDIO)'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mt-1">
              {isEnglish
                ? 'English guided meditation audio with calm pacing in Luang Por Dattajeevo style. Tap large button to broadcast through device speaker.'
                : 'เสียงนำสมาธิภาษาอังกฤษสำเนียงสากลสไตล์หลวงพ่อทัตตชีโว กดเปิดให้โยมฟังจากมือถือได้ทันที'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPlayingAudio && (
              <div className="flex items-end gap-1 h-5 pb-1" aria-label="Audio playing indicator">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-5"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-4"></span>
              </div>
            )}
            <span className="text-2xl sm:text-3xl font-mono font-bold text-brand-gold tabular-nums">
              {String(Math.floor(audioSeconds / 60)).padStart(2, '0')}:{String(audioSeconds % 60).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {String(Math.floor(audioDuration / 60)).padStart(2, '0')}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

        {audioErrorMessage && (
          <div role="alert" className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs flex items-center justify-between">
            <span>⚠️ {audioErrorMessage}</span>
            <button
              type="button"
              onClick={() => void toggleMeditationAudio()}
              className="underline font-bold ml-2 cursor-pointer"
            >
              แตะเพื่อเปิดเสียง
            </button>
          </div>
        )}

        {/* Master Control Zone: High-Impact Big Button & Operations */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pt-1">
          <button
            type="button"
            onClick={() => void toggleMeditationAudio()}
            className={`min-h-14 sm:min-h-16 rounded-2xl px-6 sm:px-8 text-base sm:text-lg font-bold transition-all cursor-pointer shadow-lg inline-flex items-center gap-4 ${
              isPlayingAudio
                ? 'bg-amber-700 hover:bg-amber-800 text-white ring-4 ring-amber-500/40'
                : 'bg-brand-gold hover:bg-[#a6741c] text-[#11223C] ring-4 ring-brand-gold/30 hover:ring-brand-gold/50'
            }`}
          >
            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              {isPlayingAudio ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg className="h-6 w-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </span>
            <span>
              {isPlayingAudio
                ? (isEnglish ? 'Pause Meditation' : 'หยุดเสียงชั่วคราว')
                : (isEnglish ? 'Play 5-Min Meditation' : 'กดเปิดเสียงนำสมาธิ')}
            </span>
          </button>

          <div className="space-y-2 flex-1 w-full">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-slate-300">
                {isPlayingAudio
                  ? (isEnglish ? 'Playing English Guided Meditation...' : 'กำลังเปิดเสียงนำสมาธิภาษาอังกฤษ...')
                  : (isEnglish ? 'Ready · Tap button to play' : 'พร้อมเปิดหน้างาน · แตะปุ่มใหญ่เพื่อเปิดเสียง')}
              </span>

              {/* Quick Seek Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSeekRelative(-15)}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono text-slate-300 cursor-pointer transition-colors"
                  title="ย้อนกลับ 15 วินาที"
                >
                  ⏪ -15s
                </button>
                <button
                  type="button"
                  onClick={() => handleSeekRelative(15)}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono text-slate-300 cursor-pointer transition-colors"
                  title="ข้ามไปข้างหน้า 15 วินาที"
                >
                  +15s ⏩
                </button>
              </div>
            </div>

            {/* Clickable Audio Progress Bar */}
            <div
              onClick={handleProgressBarClick}
              className="h-3 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
              title="คลิกที่แถบเพื่อเลื่อนเวลา"
            >
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-200"
                style={{ width: `${Math.max(audioProgress, isPlayingAudio ? 2 : 0)}%` }}
              />
            </div>

            {/* Volume Control Bar */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-white transition-colors cursor-pointer text-xs"
                >
                  {isMuted || volume === 0 ? '🔇 ปิดเสียง' : '🔊 เปิดเสียง'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 sm:w-28 accent-brand-gold h-1.5 cursor-pointer bg-slate-700 rounded-lg"
                  title="ปรับระดับความดังเสียง"
                />
                <span className="font-mono text-[11px] tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
              </div>

              <span className="text-[11px] text-slate-400">
                {isEnglish ? 'Lp Pasura · Dhammakaya Foundation' : 'เสียงบรรยาย: พระอาจารย์พสุธา · วัดพระธรรมกาย'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Subtitle Prompter (Synchronized with speech audio) */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-brand-gold font-mono">
            <span>LIVE TELEPROMPTER · บทอ่านตามเสียงพูดจริง</span>
            <span>{activeCue.start}s – {activeCue.end}s</span>
          </div>
          <p className="text-sm sm:text-base text-slate-100 font-serif italic text-pretty leading-relaxed">
            “{activeCue.en}”
          </p>
          <p className="text-xs text-slate-300 leading-normal">
            ({activeCue.th})
          </p>
        </div>
      </div>

      {/* SECTION 2: CMS Unhandled Question Logger Form */}
      {showLogForm && (
        <form onSubmit={handleSaveQuestion} className="rounded-2xl border border-brand-border bg-stone-50 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <GuideIcon name="clipboard" className="h-4 w-4 text-brand-maroon" />
              <h3 className="font-serif text-base font-bold text-brand-maroon">
                {isEnglish ? 'Save an Unanswered Visitor Question' : 'จดบันทึกคำถามหน้างานไว้ในเครื่อง'}
              </h3>
            </div>
            <span className="text-xs text-brand-muted tabular-nums">{studentName} ({studentCode})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-maroon mb-1">
                {isEnglish ? 'Visitor Country / Nationality' : 'สัญชาติ / ประเทศของนักท่องเที่ยว'}
              </label>
              <input
                type="text"
                value={visitorCountry}
                onChange={(e) => setVisitorCountry(e.target.value)}
                placeholder="เช่น เยอรมนี, ฝรั่งเศส, ญี่ปุ่น"
                className="w-full min-h-11 rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-maroon mb-1">
                {isEnglish ? 'Visitor Name (Optional)' : 'ชื่อผู้มาเยือน (ถ้าทราบ)'}
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="เช่น Michael, Sarah"
                className="w-full min-h-11 rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-maroon mb-1">
              {isEnglish ? 'Question Asked by Visitor *' : 'ข้อความคำถามที่ถูกถามสดหน้างาน (ภาษาอังกฤษหรือไทย) *'}
            </label>
            <textarea
              required
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="เช่น What does Buddhism teach about artificial intelligence having a soul?"
              className="w-full rounded-xl border border-brand-border bg-white p-3 text-sm focus:border-brand-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-maroon mb-1">
              {isEnglish ? 'Context / Reflection Notes' : 'บันทึกเพิ่มเติมของพระนิสิต (ความยาก หรือจุดที่ตอบไม่มั่นใจ)'}
            </label>
            <input
              type="text"
              value={questionNotes}
              onChange={(e) => setQuestionNotes(e.target.value)}
              placeholder="เช่น โยมถามเรื่องจิตวิญญาณของ AI อาตมาไม่แน่ใจว่าจะอธิบายขันธ์ 5 เชื่อมโยงอย่างไร"
              className="w-full min-h-11 rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-gold outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-brand-muted">
              {isEnglish ? 'Saved on this device only. Share with your coordinator for review.' : 'เก็บเฉพาะเครื่องนี้ กรุณานำคำถามให้ผู้ดูแลตรวจสอบต่อ'}
            </span>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-brand-maroon hover:bg-brand-maroon/90 text-white px-5 text-sm font-semibold cursor-pointer transition-colors"
            >
              {isEnglish ? 'Save on this device' : 'บันทึกคำถามในเครื่อง'}
            </button>
          </div>
        </form>
      )}

      {logSuccessMessage && (
        <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
          {logSuccessMessage}
        </div>
      )}

      {/* SECTION 3: Quick Vinaya & Rescue Phrases */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-maroon">
              {isEnglish ? 'Quick Vinaya & Rescue Phrases' : 'คลังประโยคช่วยชีวิตและข้อปฏิบัติพระวินัยหน้างาน'}
            </h3>
            <p className="text-xs text-brand-muted">
              {isEnglish
                ? 'Ready-to-speak phrases with phonetic pronunciation and full-screen card mode.'
                : 'ประโยคภาษาอังกฤษพร้อมคำอ่านภาษาไทย กดฟังเสียงอ่าน หรือเปิดการ์ดแสดงผลเต็มจอเพื่อยื่นให้ผู้มาเยือนอ่าน'}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEnglish ? 'Search phrases...' : 'ค้นหาประโยคหรือคำศัพท์...'}
              className="w-full min-h-11 rounded-xl border border-brand-border bg-white px-3.5 text-sm focus:border-brand-gold outline-none"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', th: 'ทั้งหมด', en: 'All' },
            { id: 'vinaya', th: 'พระวินัย & ข้อห้าม', en: 'Vinaya' },
            { id: 'rescue', th: 'การสื่อสาร & ขอเวลา', en: 'Communication' },
            { id: 'meditation', th: 'ชวนนั่งสมาธิ', en: 'Meditation' },
            { id: 'blessing', th: 'ให้พร & อำลา', en: 'Blessings' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-maroon text-white shadow-xs'
                  : 'bg-white border border-brand-border text-brand-maroon hover:bg-stone-50'
              }`}
            >
              {isEnglish ? cat.en : cat.th}
            </button>
          ))}
        </div>

        {/* Phrases List Cards (Tactile Action Deck) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPhrases.map((phrase) => (
            <div
              key={phrase.id}
              className="rounded-2xl border border-[#E7DFD3] bg-[#FFFDF9] p-5 sm:p-6 shadow-2xs hover:border-brand-gold/80 hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-brand-border/60 pb-2.5">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-brand-maroon border border-brand-border/60">
                    {isEnglish ? phrase.categoryEn : phrase.categoryTh}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExpandedPhrase(phrase)}
                      className="px-2.5 py-1 rounded-lg bg-brand-gold-soft hover:bg-brand-gold/30 text-brand-maroon border border-brand-gold/40 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-2xs"
                      title="ขยายตัวหนังสือเต็มจอเพื่อยื่นให้โยมดู"
                    >
                      📱 ยื่นให้อ่าน
                    </button>
                    <button
                      type="button"
                      onClick={() => playSpeech(phrase.id, phrase.textEn)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all active:scale-95 ${
                        speakingPhraseId === phrase.id
                          ? 'bg-brand-gold text-stone-900 border border-brand-gold font-semibold'
                          : 'bg-stone-100 hover:bg-stone-200 text-brand-maroon border border-brand-border'
                      }`}
                      title="กดฟังเสียงอ่านภาษาอังกฤษ"
                    >
                      {speakingPhraseId === phrase.id ? '🔊 กำลังอ่าน...' : '🔊 ฟังเสียง'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(phrase)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-brand-muted border border-brand-border text-xs font-medium cursor-pointer transition-all active:scale-95"
                      title="คัดลอกข้อความ"
                    >
                      {copiedId === phrase.id ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                  </div>
                </div>

                <p className="font-serif font-semibold text-brand-maroon text-base sm:text-lg leading-snug">
                  “{phrase.textEn}”
                </p>

                <p className="text-xs text-brand-muted leading-relaxed">
                  {phrase.textTh}
                </p>

                <p className="text-xs font-mono text-brand-maroon bg-stone-50 p-2.5 rounded-xl border border-brand-border/60">
                  คำอ่าน: {phrase.phoneticTh}
                </p>
              </div>

              <div className="pt-2.5 border-t border-brand-border/50 text-[11px] text-brand-muted">
                <span className="font-medium text-brand-maroon">บริบทการใช้:</span> {phrase.notesTh}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Recent Logged Questions Table (CMS Link) */}
      {loggedQuestions.length > 0 && (
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-brand-maroon">
              {isEnglish ? 'Questions saved on this device' : 'ประวัติคำถามที่จดบันทึกไว้ในเครื่อง'}
            </h3>
            <span className="text-xs text-brand-muted tabular-nums">{loggedQuestions.length} คำถาม</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-brand-border bg-stone-50/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 border-b border-brand-border text-brand-maroon uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">เวลา</th>
                  <th className="py-2.5 px-3 font-semibold">สัญชาติ / ชื่อ</th>
                  <th className="py-2.5 px-3 font-semibold">คำถามที่ถาม</th>
                  <th className="py-2.5 px-3 font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {loggedQuestions.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-white/60">
                    <td className="py-2.5 px-3 whitespace-nowrap text-brand-muted tabular-nums">{q.dateFormatted}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-brand-maroon">
                      {q.visitorCountry} {q.visitorName ? `(${q.visitorName})` : ''}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-brand-text">{q.questionText}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                        เก็บในเครื่อง
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL-SCREEN CARD MODAL (FOR SHOWING VISITOR ACROSS TABLE) */}
      {expandedPhrase && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-2xl rounded-3xl border-2 border-brand-gold bg-[#0B1528] p-6 sm:p-10 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-brand-gold uppercase tracking-wider">
                <span>Ayutthaya Monk Chat · Card for Tourist</span>
              </div>
              <button
                type="button"
                onClick={() => setExpandedPhrase(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="ปิดหน้าต่างการ์ด"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-2">
              <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white tracking-wide text-pretty uppercase">
                “{expandedPhrase.textEn}”
              </p>
              <p className="text-xs sm:text-sm text-slate-300 italic pt-2">
                ({expandedPhrase.textTh})
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-slate-400">
                ยื่นหน้าจอนี้ให้นักท่องเที่ยวชาวต่างชาติอ่านได้ทันที
              </span>
              <button
                type="button"
                onClick={() => setExpandedPhrase(null)}
                className="min-h-11 rounded-xl bg-brand-gold hover:bg-[#a6741c] text-[#11223C] px-5 text-sm font-bold cursor-pointer transition-colors"
              >
                ปิดหน้าต่างการ์ด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
