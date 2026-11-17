export type DrillCategory = 'vinaya-life' | 'meditation' | 'dhamma-wisdom' | 'culture-greeting'

export type DrillType = 'choice' | 'scramble'

export interface DrillChoiceOption {
  id: string
  textEn: string
  textTh: string
  isCorrect: boolean
  feedbackTh: string
  feedbackEn: string
}

export interface ScenarioDrill {
  id: string
  category: DrillCategory
  type: DrillType
  visitor: {
    name: string
    countryTh: string
    countryEn: string
    avatar: string
    questionEn: string
    questionTh: string
  }
  // For 'choice'
  options?: DrillChoiceOption[]
  // For 'scramble'
  scramblePromptTh?: string
  scrambleCorrectTokens?: string[]
  scrambleDistractorTokens?: string[]
  explanationTh: string
  explanationEn: string
  vinayaFocusTh?: string
}

export interface DrillCategoryInfo {
  id: DrillCategory
  titleTh: string
  titleEn: string
  subtitleTh: string
  subtitleEn: string
  icon: string
  badgeColor: string
}

export const DRILL_CATEGORIES: DrillCategoryInfo[] = [
  {
    id: 'vinaya-life',
    titleTh: 'วิถีสงฆ์และพระวินัย',
    titleEn: 'Monastic Life & Vinaya',
    subtitleTh: 'การโกนผม, ห้ามสัมผัสสตรี, การฉันอาหาร, และการรักษาสมณสารูป',
    subtitleEn: 'Shaving head, touching women, meal timing, and monastic decorum',
    icon: '🪷',
    badgeColor: 'border-amber-400 bg-amber-50 text-amber-900',
  },
  {
    id: 'meditation',
    titleTh: 'การนำนั่งสมาธิและวางใจ',
    titleEn: 'Guiding Meditation',
    subtitleTh: 'ท่าทาง, วางใจศูนย์กลางกาย, รับมือฟุ้งซ่าน, และแก้ง่วงนอน',
    subtitleEn: 'Posture, 7th base of mind, wandering thoughts, and drowsiness',
    icon: '🧘‍♂️',
    badgeColor: 'border-emerald-400 bg-emerald-50 text-emerald-900',
  },
  {
    id: 'dhamma-wisdom',
    titleTh: 'ธรรมะสากลเพื่อการดับทุกข์',
    titleEn: 'Universal Dhamma',
    subtitleTh: 'การปล่อยวางความเครียด, กฎแห่งกรรม, และการให้อภัย',
    subtitleEn: 'Stress relief, law of karma, letting go, and peaceful living',
    icon: '☀️',
    badgeColor: 'border-sky-400 bg-sky-50 text-sky-900',
  },
  {
    id: 'culture-greeting',
    titleTh: 'บทสนทนาต้อนรับและมารยาท',
    titleEn: 'Greeting & Etiquette',
    subtitleTh: 'ทักทายเมื่อเริ่มพบ, การถ่ายภาพ, และการให้พรภาษาอังกฤษ',
    subtitleEn: 'Warm greetings, taking photos politely, and blessings',
    icon: '🙏',
    badgeColor: 'border-purple-400 bg-purple-50 text-purple-900',
  },
]

export const SCENARIO_DRILLS: ScenarioDrill[] = [
  // ==========================================
  // Category 1: vinaya-life
  // ==========================================
  {
    id: 'v-01-shave-head',
    category: 'vinaya-life',
    type: 'choice',
    visitor: {
      name: 'Emma',
      countryTh: 'สหราชอาณาจักร (UK)',
      countryEn: 'United Kingdom',
      avatar: '👩🏼‍💼',
      questionEn: 'Excuse me, Venerable. Why do Buddhist monks shave their heads?',
      questionTh: 'ขออภัยครับพระคุณเจ้า ทำไมพระสงฆ์ถึงต้องปลงผมครับ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Because Thailand is very hot, so having no hair keeps our head cool.',
        textTh: 'เพราะเมืองไทยอากาศร้อน การไม่มีผมช่วยให้ศีรษะเย็นสบาย',
        isCorrect: false,
        feedbackTh: 'คำตอบนี้ตอบตามความสบายทางกาย แต่ไม่ตรงตามความหมายและเจตนารมณ์แห่งธรรมวินัย',
        feedbackEn: 'Focusing solely on climate misses the core spiritual significance of the Vinaya.',
      },
      {
        id: 'opt-b',
        textEn: 'Shaving the head symbolizes letting go of physical vanity, social status, and personal ego.',
        textTh: 'การปลงผมเป็นสัญลักษณ์แห่งการสละความหลงในรูปกาย วรรณะทางสังคม และตัวตน',
        isCorrect: true,
        feedbackTh: 'ถูกต้องและลึกซึ้งมาก! อธิบายถึงการสละกิเลสและความเท่าเทียมในเพศบรรพชิตได้อย่างสง่างาม',
        feedbackEn: 'Excellent! Articulates renunciation of vanity, simplicity, and monastic humility.',
      },
      {
        id: 'opt-c',
        textEn: 'It is just a rule from the ancient temple that monks must follow without question.',
        textTh: 'เป็นแค่กฎโบราณของวัดที่พระต้องปฏิบัติตามโดยไม่ต้องถาม',
        isCorrect: false,
        feedbackTh: 'คำตอบนี้ห้วนเกินไปและทำให้ผู้มาเยือนรู้สึกว่าพระพุทธศาสนาไม่มีเหตุผลเชิงปัญญา',
        feedbackEn: 'Too blunt; leaves visitors with an impression of dogmatic adherence rather than wisdom.',
      },
    ],
    explanationTh: 'การปลงผมตามพระธรรมวินัย เป็นการตัดความกังวลในการตกแต่งเสริมสวย และเป็นเครื่องเตือนสติว่าตนได้สละวิถีชีวิตฆราวาสเข้าสู่เพศพรหมจรรย์แล้ว',
    explanationEn: 'Tonsure in Buddhist monasticism represents shedding external social adornment and maintaining focus entirely on inner spiritual purification.',
    vinayaFocusTh: 'พระวินัยว่าด้วยสมณสารูปและการละความยินดีในความงามภายนอก',
  },
  {
    id: 'v-02-touching-women',
    category: 'vinaya-life',
    type: 'choice',
    visitor: {
      name: 'Chloe',
      countryTh: 'ฝรั่งเศส',
      countryEn: 'France',
      avatar: '👩🏻',
      questionEn: 'Why are Buddhist monks not allowed to touch or shake hands with women?',
      questionTh: 'ทำไมพระสงฆ์จึงไม่สามารถสัมผัสหรือจับมือกับผู้หญิงได้คะ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Because in Buddhism we believe women are spiritually impure or inferior.',
        textTh: 'เพราะในพระพุทธศาสนาเชื่อว่าผู้หญิงไม่บริสุทธิ์หรือต่ำกว่าทางจิตวิญญาณ',
        isCorrect: false,
        feedbackTh: 'ผิดพลาดร้ายแรง! พระพุทธศาสนาสอนเรื่องความเท่าเทียมในธรรมชาติของมนุษย์ การห้ามแตะต้องไม่ได้เกิดจากการมองว่าสตรีไม่บริสุทธิ์',
        feedbackEn: 'Incorrect and offensive. Buddhism upholds spiritual equality; the precept is about purity of mind, not discrimination.',
      },
      {
        id: 'opt-b',
        textEn: 'It is a sacred discipline to preserve purity of mind, mutual respect, and prevent any trace of emotional attachment or doubt.',
        textTh: 'เป็นพระวินัยอันบริสุทธิ์เพื่อรักษาความสงบของจิตใจ แสดงความเคารพซึ่งกันและกัน และป้องกันความเข้าใจผิดหรือความยึดติดทางอารมณ์',
        isCorrect: true,
        feedbackTh: 'ยอดเยี่ยมมาก! อธิบายด้วยความเคารพ ชี้ให้เห็นว่าเป็นการรักษาความบริสุทธิ์ของจิตทั้งสองฝ่ายตามหลักสมณสารูป',
        feedbackEn: 'Spot on! Expresses monastic discipline with utmost respect, clarity, and philosophical maturity.',
      },
      {
        id: 'opt-c',
        textEn: 'You can touch my hand just for a second if we take a friendly selfie together.',
        textTh: 'แตะมือได้แวบเดียวถ้าพวกเราถ่ายเซลฟี่เป็นเพื่อนกัน',
        isCorrect: false,
        feedbackTh: 'ผิดพระวินัยอย่างชัดเจน! พระสงฆ์ต้องระมัดระวังกายแม้ในสถานการณ์ถ่ายรูปหรือพบปะผู้คน',
        feedbackEn: 'Direct violation of Vinaya. Monastic boundaries must be maintained even in informal cultural moments.',
      },
    ],
    explanationTh: 'ข้อห้ามสัมผัสกายสตรี (สังฆาทิเสสและปาจิตตีย์) มีเจตจำนงเพื่อตัดวงจรแห่งความกำหนัดยินดี และคุ้มครองความปลอดภัยทางใจของทั้งพระสงฆ์และญาติโยม',
    explanationEn: 'The precept against physical touch protects both the monk’s vow of celibacy and the peace of mind of the laywoman, fostering reciprocal dignity.',
    vinayaFocusTh: 'สิกขาบทข้อว่าด้วยการระมัดระวังการถูกต้องกายสตรีและการรักษาสมณสัญญา',
  },
  {
    id: 'v-03-noon-meal',
    category: 'vinaya-life',
    type: 'choice',
    visitor: {
      name: 'Lukas',
      countryTh: 'เยอรมนี',
      countryEn: 'Germany',
      avatar: '👨🏼',
      questionEn: 'I noticed monks do not have dinner. Why do you refrain from eating after midday?',
      questionTh: 'ผมสังเกตว่าพระไม่มีมื้อเย็น ทำไมพระจึงไม่ฉันอาหารหลังเที่ยงวันครับ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Because temple kitchens close strictly at 11:30 AM to save electricity.',
        textTh: 'เพราะโรงครัวของวัดปิดเวลา 11:30 น. เพื่อประหยัดไฟฟ้า',
        isCorrect: false,
        feedbackTh: 'คำตอบนี้ทำให้ผู้มาเยือนเข้าใจว่าเป็นการจัดการของวัด ไม่ใช่หลักปฏิบัติทางจิตวิญญาณ',
        feedbackEn: 'Focuses on administrative logistics instead of the timeless health and meditative purpose of the precept.',
      },
      {
        id: 'opt-b',
        textEn: 'Refraining from evening meals fosters lightness of body, reduces lethargy for meditation, and minimizes burden on the community.',
        textTh: 'การงดฉันมื้อเย็นช่วยให้ร่างกายเบาสบาย ลดความง่วงซึมเกื้อหนุนต่อการนั่งสมาธิ และลดภาระของญาติโยมผู้เกื้อหนุน',
        isCorrect: true,
        feedbackTh: 'ถูกต้องสมบูรณ์แบบ! ครอบคลุมทั้งประโยชน์ต่อการทำสมาธิ ความเบาสบายของร่างกาย และการไม่เบียดเบียนสังคม',
        feedbackEn: 'Perfect! Highlights bodily lightness, clarity during meditation, and minimizing demands on lay patrons.',
      },
      {
        id: 'opt-c',
        textEn: 'We are fasting because we are enduring harsh suffering to attain enlightenment.',
        textTh: 'พวกเราอดอาหารเพราะกำลังทรมานตนเพื่อบรรลุธรรม',
        isCorrect: false,
        feedbackTh: 'ไม่ถูกต้อง! พระพุทธศาสนาปฏิเสธการทรมานตน (อัตตกิลมถานุโยค) และมุ่งเน้นการปฏิบัติตามมัชฌิมาปฏิปทา (ทางสายกลาง)',
        feedbackEn: 'Incorrect. The Buddha rejected ascetic self-mortification; intermediate fasting is for mental agility, not suffering.',
      },
    ],
    explanationTh: 'การงดฉันในเวลาวิกาล (วิกาลโภชนา) ช่วยให้ธาตุขันธ์เบาสบาย นั่งสมาธิได้ตื่นรู้ ไม่อึดอัด และลดการแสวงหาอาหารในยามค่ำคืน',
    explanationEn: 'Avoiding evening solid foods maintains an alert, uncluttered state conducive to meditation and frees time for Dhamma study.',
    vinayaFocusTh: 'สิกขาบทวิกาลโภชนเวรมณี เพื่อความโปร่งเบาแห่งกายและจิต',
  },
  {
    id: 'v-04-robe-meaning',
    category: 'vinaya-life',
    type: 'scramble',
    visitor: {
      name: 'Liam',
      countryTh: 'ออสเตรเลีย',
      countryEn: 'Australia',
      avatar: '🧑🏽',
      questionEn: 'What does the saffron robe of a Buddhist monk represent?',
      questionTh: 'ผ้ากาสาวพัสตร์สีเหลืองส้มของพระสงฆ์เป็นสัญลักษณ์แทนสิ่งใดครับ?',
    },
    scramblePromptTh: 'เรียงคำเพื่ออธิบาย: “ผ้าจีวรเป็นสัญลักษณ์แห่งความเรียบง่ายและจิตใจที่สงบตื่นรู้”',
    scrambleCorrectTokens: [
      'The saffron robe',
      'symbolizes simplicity',
      'and a peaceful,',
      'awakened mind.',
    ],
    scrambleDistractorTokens: ['expensive golden fashion', 'loudly', 'angry'],
    explanationTh: 'ผ้ากาสาวพัสตร์หรือผ้าเหลืองเป็นธงชัยของพระอรหันต์ สื่อถึงความสมถะ การละวางสิ่งฟุ่มเฟือย และจิตที่บริสุทธิ์ปราศจากกิเลส',
    explanationEn: 'The monastic robe is the emblem of ethical simplicity, renouncing luxury to manifest serenity and spiritual wakefulness.',
    vinayaFocusTh: 'ความหมายของไตรจีวร ธงชัยของพระอริยเจ้า',
  },

  // ==========================================
  // Category 2: meditation
  // ==========================================
  {
    id: 'm-01-scramble-eyes',
    category: 'meditation',
    type: 'scramble',
    visitor: {
      name: 'Sophie',
      countryTh: 'แคนาดา',
      countryEn: 'Canada',
      avatar: '👱🏻‍♀️',
      questionEn: 'How should I start if I want to sit in meditation with you right now?',
      questionTh: 'ถ้าฉันต้องการนั่งสมาธิร่วมกับพระคุณเจ้าตอนนี้ ควรเริ่มต้นอย่างไรคะ?',
    },
    scramblePromptTh: 'เรียงคำเพื่อแนะนำ: “หลับตาลงเบา ๆ แล้ววางใจไว้ที่ศูนย์กลางกาย”',
    scrambleCorrectTokens: [
      'Close your eyes',
      'gently,',
      'and rest your mind',
      'at the center',
      'of the body.',
    ],
    scrambleDistractorTokens: ['open widely', 'outside tightly', 'thinking hard'],
    explanationTh: 'การนำสมาธิสากล ให้เน้นคำว่า "Close your eyes gently" (หลับตาเบาๆ ผ่อนคลาย ไม่บีบเปลือกตา) และวางใจไว้ที่ศูนย์กลางกายฐานที่ 7 อย่างนุ่มนวล',
    explanationEn: 'Guiding beginners starts with gentle eyelid relaxation and resting inner attention at the calm center of the abdomen.',
    vinayaFocusTh: 'เทคนิคการนำสมาธิเบื้องต้นสไตล์วิชชาธรรมกาย',
  },
  {
    id: 'm-02-wandering-mind',
    category: 'meditation',
    type: 'choice',
    visitor: {
      name: 'David',
      countryTh: 'สหรัฐอเมริกา (USA)',
      countryEn: 'United States',
      avatar: '👨🏻‍🦱',
      questionEn: 'My mind keeps jumping to work emails and memories. How can I stop wandering thoughts?',
      questionTh: 'ใจของผมชอบกระโดดไปคิดเรื่องงานและความทรงจำต่างๆ จะหยุดความคิดฟุ้งซ่านได้อย่างไรครับ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Force your brain to shut down completely and hold your breath until thoughts stop.',
        textTh: 'บังคับสมองให้หยุดทำงานทั้งหมดและกลั้นหายใจจนกว่าความคิดจะหยุด',
        isCorrect: false,
        feedbackTh: 'การบังคับหรือเพ่งกดดันจะทำให้ปวดศีรษะและตึงเครียด ขัดกับธรรมชาติของสมาธิ',
        feedbackEn: 'Force and breath suppression induce tension and headaches, contrary to natural mindfulness.',
      },
      {
        id: 'opt-b',
        textEn: 'Do not fight your thoughts. Gently acknowledge them, let them pass, and gently return your focus to your center like a soft feather.',
        textTh: 'อย่าต่อสู้กับความคิด เพียงรับรู้อย่างอ่อนโยน ปล่อยให้ผ่านไป และค่อยๆ ประคองใจกลับสู่ศูนย์กลางกายดั่งขนนกที่ลอยแตะผิวน้ำ',
        isCorrect: true,
        feedbackTh: 'ยอดเยี่ยมมาก! การเปรียบเทียบดั่งขนนก (Soft feather) ช่วยให้นักท่องเที่ยวเข้าใจการทำสมาธิแบบผ่อนคลายและมีสติทันที',
        feedbackEn: 'Outstanding! The feather simile captures the relaxed, compassionate re-centering taught in Dhammakaya meditation.',
      },
      {
        id: 'opt-c',
        textEn: 'If your mind wanders, you have failed and must leave the meditation room immediately.',
        textTh: 'ถ้าใจฟุ้งซ่าน แสดงว่าคุณล้มเหลวและต้องออกจากห้องสมาธิทันที',
        isCorrect: false,
        feedbackTh: 'ทำลายกำลังใจผู้ปฏิบัติ! ความคิดฟุ้งซ่านเป็นธรรมดาของจิตที่ยังไม่เคยฝึก พระนิสิตควรให้กำลังใจ',
        feedbackEn: 'Harsh and discouraging. Wandering is normal for untamed minds; guidance must be patient and compassionate.',
      },
    ],
    explanationTh: 'หลักการทำสมาธิคือ "ไม่เพ่ง ไม่บังคับ ไม่ดัน ไม่ดึง" เมื่อรู้ว่าฟุ้ง ให้ทำใจใสๆ นึกถึงดวงแก้วหรือองค์พระที่ศูนย์กลางกายอย่างสบายๆ',
    explanationEn: 'Never battle wandering thoughts. Simply acknowledge them without judgment and softly settle awareness at the 7th base.',
    vinayaFocusTh: 'การประคองอารมณ์สบาย (Sabai) ในการปฏิบัติธรรม',
  },
  {
    id: 'm-03-sleepiness',
    category: 'meditation',
    type: 'choice',
    visitor: {
      name: 'Maya',
      countryTh: 'ญี่ปุ่น',
      countryEn: 'Japan',
      avatar: '👩🏻',
      questionEn: 'I feel very sleepy every time I meditate. Is this normal or am I doing something wrong?',
      questionTh: 'ฉันรู้สึกง่วงนอนทุกครั้งที่นั่งสมาธิ เป็นเรื่องปกติหรือฉันทำอะไรผิดหรือเปล่าคะ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Sleepiness is very common when the body relaxes. Take a few deep breaths, adjust your posture, and visualize a gentle clear sphere at your center.',
        textTh: 'อาการง่วงนอนพบได้บ่อยมากเมื่อร่างกายเริ่มผ่อนคลาย ให้ลองสูดลมหายใจลึกๆ ปรับท่านั่งให้ตั้งตรง และนึกถึงดวงแก้วใสที่ศูนย์กลางกาย',
        isCorrect: true,
        feedbackTh: 'ให้คำแนะนำได้ถูกต้องตามหลักปฏิบัติ! ช่วยปรับทั้งกาย (หายใจ/ท่านั่ง) และจิต (นึกดวงสว่างเพื่อตื่นรู้)',
        feedbackEn: 'Superb! Combines physiological adjustments (breathing/posture) with luminous visualization to counter dullness.',
      },
      {
        id: 'opt-b',
        textEn: 'You should slap your cheeks and drink three cups of strong black espresso before sitting.',
        textTh: 'คุณควรตบแก้มตัวเองและดื่มเอสเปรสโซเข้มๆ 3 ช็อตก่อนนั่ง',
        isCorrect: false,
        feedbackTh: 'สำนวนตลกเกินไปและไม่ได้แนะนำหลักสมาธิที่แท้จริง',
        feedbackEn: 'Overly humorous and unhelpful; monks must advise balanced monastic mindfulness methods.',
      },
      {
        id: 'opt-c',
        textEn: 'Falling asleep is the ultimate goal of Buddhist meditation, so please sleep as long as you wish.',
        textTh: 'การหลับไปคือเป้าหมายสูงสุดของสมาธิในพุทธศาสนา ดังนั้นหลับไปได้เลยนานเท่าที่ต้องการ',
        isCorrect: false,
        feedbackTh: 'ผิดหลักการ! สมาธิคือความตื่นรู้ของจิต (Mindfulness & Alertness) ไม่ใช่การเคลิ้มหลับหรือตกภวังค์',
        feedbackEn: 'Incorrect doctrine. Meditation aims for serene wakefulness (samadhi), distinct from unconscious slumber.',
      },
    ],
    explanationTh: 'ความง่วง (ถีนมิทธะ) เป็นนิวรณ์ข้อหนึ่ง แก้ไขด้วยการยืดกายให้ตรง สูดลมหายใจลึกๆ ปรับการวางใจ และนึกความสว่างไสวที่ศูนย์กลางกาย',
    explanationEn: 'Sloth and torpor (Thina-middha) are overcome by straightening the spine, deep breathing, and inviting internal luminosity.',
    vinayaFocusTh: 'การเอาชนะถีนมิทธนิวรณ์ตามหลักพุทธวิธี',
  },
  {
    id: 'm-04-scramble-mantra',
    category: 'meditation',
    type: 'scramble',
    visitor: {
      name: 'Mark',
      countryTh: 'นิวซีแลนด์',
      countryEn: 'New Zealand',
      avatar: '🧔🏻',
      questionEn: 'Is there a word or sound I can repeat silently to anchor my mind?',
      questionTh: 'มีคำหรือเสียงอะไรที่ฉันสามารถบริกรรมในใจเบาๆ เพื่อยึดเหนี่ยวจิตใจไหมครับ?',
    },
    scramblePromptTh: 'เรียงคำเพื่อแนะนำ: “คุณสามารถบริกรรมภาวนาคำว่า สัมมา อะระหัง ในใจอย่างนุ่มนวล”',
    scrambleCorrectTokens: [
      'You can gently',
      'repeat the mantra',
      'Samma Arahang',
      'silently in your mind.',
    ],
    scrambleDistractorTokens: ['shout loudly', 'forgetting everything', 'running'],
    explanationTh: 'คำบริกรรมภาวนา "สัมมา อะระหัง" มีความหมายถึง พระสัมมาสัมพุทธเจ้าผู้บริสุทธิ์หมดจด นำมาบริกรรมเพื่อประคองใจให้หยุดนิ่งที่ศูนย์กลางกาย',
    explanationEn: 'Repeating the soothing mantra "Samma Arahang" acts as a gentle mental anchor, guiding wandering attention back to center.',
    vinayaFocusTh: 'บริกรรมภาวนา สัมมา อะระหัง เพื่อการหยุดใจ',
  },

  // ==========================================
  // Category 3: dhamma-wisdom
  // ==========================================
  {
    id: 'd-01-stress-relief',
    category: 'dhamma-wisdom',
    type: 'choice',
    visitor: {
      name: 'Alex',
      countryTh: 'สวีเดน',
      countryEn: 'Sweden',
      avatar: '🧑🏼',
      questionEn: 'How can ancient Buddhist wisdom help someone like me dealing with intense corporate stress and burnout?',
      questionTh: 'ภูมิปัญญาพุทธธรรมโบราณจะช่วยคนอย่างผมที่ต้องเจอกับความเครียดและภาวะหมดไฟจากการทำงานได้อย่างไรครับ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Buddhism teaches us to reside in the present moment, recognize that all problems are temporary, and let go of what is beyond our control.',
        textTh: 'พุทธศาสนาสอนให้เราอยู่กับปัจจุบันขณะ ตระหนักรู้ว่าทุกปัญหามีความไม่เที่ยง และรู้จักปล่อยวางสิ่งที่เราควบคุมไม่ได้',
        isCorrect: true,
        feedbackTh: 'ยอดเยี่ยมมาก! นำหลักอนิจจังและสติมาตอบประยุกต์ใช้กับชีวิตคนทำงานในยุคปัจจุบันได้อย่างสร้างสรรค์',
        feedbackEn: 'Brilliant! Bridges timeless Dhamma (mindfulness, impermanence, detachment) with contemporary mental wellbeing.',
      },
      {
        id: 'opt-b',
        textEn: 'You must resign from your job immediately and live in the forest without electricity.',
        textTh: 'คุณต้องลาออกจากงานทันทีและไปอาศัยอยู่ในป่าโดยไม่มีไฟฟ้า',
        isCorrect: false,
        feedbackTh: 'สุดโต่งเกินไป! ฆราวาสสามารถนำหลักธรรมมาประยุกต์ใช้เพื่อความสุขในการทำงานและการครองเรือนได้โดยไม่ต้องทิ้งงาน',
        feedbackEn: 'Extreme and unrealistic. Buddhism offers practical householder ethics and stress-coping strategies for daily life.',
      },
      {
        id: 'opt-c',
        textEn: 'Stress does not exist, you are simply imagining all of your workload.',
        textTh: 'ความเครียดไม่มีจริง คุณแค่จินตนาการเรื่องภาระงานไปเอง',
        isCorrect: false,
        feedbackTh: 'ปฏิเสธความเป็นจริงของความทุกข์ (ทุกขสัจจะ) พระพุทธศาสนาสอนให้ยอมรับความทุกข์ตามความเป็นจริงแล้วดับที่เหตุ',
        feedbackEn: 'Denies the first Noble Truth. Dhamma acknowledges suffering empathetically and offers systematic cessation.',
      },
    ],
    explanationTh: 'การแก้ทุกข์จากความเครียดเริ่มจากการรู้เท่าทันสภาวะจิต ไม่แบกอดีต ไม่พะวงอนาคต ใช้สติประคองใจให้ผ่องใสเพื่อแก้ปัญหาด้วยปัญญา',
    explanationEn: 'Mindfulness calms emotional turbulence, allowing professionals to cultivate clarity, respond wisely, and rest in inner peace.',
    vinayaFocusTh: 'หลักอริยสัจ 4 และสติปัฏฐานเพื่อการบำบัดจิตใจ',
  },
  {
    id: 'd-02-karma-forgiveness',
    category: 'dhamma-wisdom',
    type: 'choice',
    visitor: {
      name: 'Jessica',
      countryTh: 'สิงคโปร์',
      countryEn: 'Singapore',
      avatar: '👩🏻‍💼',
      questionEn: 'If someone betrayed or hurt me badly, why does Buddhism encourage forgiveness rather than revenge?',
      questionTh: 'หากมีคนหักหลังหรือทำร้ายเราอย่างแสนสาหัส ทำไมพระพุทธศาสนาจึงสอนให้เราให้อภัยมากกว่าการแก้แค้นคะ?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Holding anger is like holding hot charcoal to throw at someone else; you are the first to get burned. Forgiveness liberates your own heart, while karma naturally balances actions.',
        textTh: 'การโกรธเปรียบเหมือนการกำถ่านร้อนเพื่อจะขว้างใส่ผู้อื่น ตัวเราเองคือคนแรกที่ถูกไฟลวก การให้อภัยคือการปลดปล่อยใจเราเอง ส่วนกรรมจะทำหน้าที่จัดสรรความยุติธรรมตามธรรมชาติ',
        isCorrect: true,
        feedbackTh: 'ซาบซึ้งและเฉียบคมมาก! เป็นอุปมาอุปไมยตามพระไตรปิฎกที่กินใจชาวต่างชาติ และอธิบายกฎแห่งกรรมได้อย่างถูกต้อง',
        feedbackEn: 'Magnificent! Uses the classic canonical simile of hot coals to demonstrate that resentment harms the bearer first.',
      },
      {
        id: 'opt-b',
        textEn: 'Because revenge is too exhausting and lawyers in Thailand are very expensive.',
        textTh: 'เพราะการแก้แค้นมันเหนื่อยเกินไปและทนายในเมืองไทยค่าจ้างแพงมาก',
        isCorrect: false,
        feedbackTh: 'สำนวนไม่สำรวมและไม่สะท้อนหลักธรรมคำสอน',
        feedbackEn: 'Inappropriate and flippant; undermines the solemn wisdom of Buddhist ethics.',
      },
      {
        id: 'opt-c',
        textEn: 'You should pretend that nothing happened and keep allowing them to harm you again.',
        textTh: 'คุณควรแกล้งทำเป็นว่าไม่มีอะไรเกิดขึ้นและปล่อยให้เขาทำร้ายคุณซ้ำๆ ต่อไป',
        isCorrect: false,
        feedbackTh: 'เข้าใจการให้อภัยผิดทาง การให้อภัยทางพุทธมาพร้อมกับปัญญาและอุเบกขา ไม่ใช่การยอมให้ผู้อื่นเบียดเบียนตนเอง',
        feedbackEn: 'Confuses forgiveness with foolish passivity. Buddhism pairs compassion with wisdom and healthy boundaries.',
      },
    ],
    explanationTh: 'เวรย่อมระงับด้วยการไม่จองเวร (น หิ เวเรน เวรานิ) การให้อภัยมิใช่เพื่อคนอื่น แต่เป็นการชำระล้างจิตใจตนเองให้เป็นอิสระจากความพยาบาท',
    explanationEn: 'Hatred never ceases by hatred; it ceases only by loving-kindness. Forgiveness unburdens your heart from karmic knots.',
    vinayaFocusTh: 'พุทธพจน์ว่าด้วยการระงับเวรและเมตตาภาวนา',
  },
  {
    id: 'd-03-scramble-four-truths',
    category: 'dhamma-wisdom',
    type: 'scramble',
    visitor: {
      name: 'Daniel',
      countryTh: 'เนเธอร์แลนด์',
      countryEn: 'Netherlands',
      avatar: '👨🏼‍🦰',
      questionEn: 'How would you summarize the core message of the Buddha’s first teaching in one sentence?',
      questionTh: 'พระคุณเจ้าจะสรุปสาระสำคัญของปฐมเทศนาของพระพุทธเจ้าเป็นหนึ่งประโยคสั้นๆ อย่างไรครับ?',
    },
    scramblePromptTh: 'เรียงคำเพื่ออธิบาย: “การเข้าใจความจริงของทุกข์ และหนทางปฏิบัติสู่ความพ้นทุกข์”',
    scrambleCorrectTokens: [
      'Understanding the truth',
      'of suffering,',
      'and following the path',
      'to inner freedom.',
    ],
    scrambleDistractorTokens: ['believing in luck', 'endless sorrow', 'winning arguments'],
    explanationTh: 'อริยสัจ 4 คือแก่นธรรมอันประเสริฐ: รู้ทุกข์, ละเหตุแห่งทุกข์, เข้าถึงความดับทุกข์, และเจริญมรรคมีองค์ 8',
    explanationEn: 'The Four Noble Truths summarize the diagnosis of dissatisfaction and the holistic Noble Eightfold Path toward ultimate peace.',
    vinayaFocusTh: 'ธัมมจักกัปปวัตตนสูตรและอริยสัจ 4',
  },

  // ==========================================
  // Category 4: culture-greeting
  // ==========================================
  {
    id: 'c-01-welcome-table',
    category: 'culture-greeting',
    type: 'choice',
    visitor: {
      name: 'Peter & Family',
      countryTh: 'สหรัฐอเมริกา (USA)',
      countryEn: 'United States',
      avatar: '👨‍👩‍👧',
      questionEn: '(A tourist family walks cautiously toward the Monk Chat table, unsure whether they are permitted to approach)',
      questionTh: '(ครอบครัวนักท่องเที่ยวเดินเก้ๆ กังๆ มาที่โต๊ะ Monk Chat ไม่แน่ใจว่าจะเข้ามาคุยได้หรือไม่)',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Warm greetings! Welcome to Ayutthaya Monk Chat. Please feel free to sit down, relax, and ask any questions you have.',
        textTh: 'ยินดีต้อนรับสู่ Ayutthaya Monk Chat ครับ เชิญนั่งตามสบาย ผ่อนคลาย และสามารถสอบถามข้อสงสัยได้เลยครับ',
        isCorrect: true,
        feedbackTh: 'สมบูรณ์แบบมาก! สุภาพ เป็นมิตร อบอุ่น เปิดกว้าง และสร้างความมั่นใจให้ผู้มาเยือนได้ทันที',
        feedbackEn: 'Exemplary hospitality! Welcomes foreign guests with warmth, calm poise, and approachable openness.',
      },
      {
        id: 'opt-b',
        textEn: 'What do you want? Hurry up because I only have five minutes.',
        textTh: 'คุณต้องการอะไร? รีบๆ หน่อยนะเพราะอาตมามีเวลาแค่ 5 นาที',
        isCorrect: false,
        feedbackTh: 'ห้วนและไร้เมตตาธรรม พระธรรมทูตต้องมีรอยยิ้มและความปรารถนาดีเป็นเบื้องหน้า',
        feedbackEn: 'Cold and impatient; violates the welcoming and compassionate spirit of monastic outreach.',
      },
      {
        id: 'opt-c',
        textEn: 'Stop! You must pay 100 Baht entry fee before sitting on this bench.',
        textTh: 'หยุดก่อน! คุณต้องจ่ายค่าธรรมเนียม 100 บาทก่อนนั่งเก้าอี้ตัวนี้',
        isCorrect: false,
        feedbackTh: 'ผิดพระวินัยและระเบียบโครงการ! กิจกรรม Monk Chat จัดขึ้นด้วยจิตอาสาเพื่อเผยแผ่ธรรมะ ไม่มีการเก็บค่าใช้จ่ายใดๆ',
        feedbackEn: 'Unacceptable and false. Monk Chat is completely free and motivated by pure Dhamma dissemination.',
      },
    ],
    explanationTh: 'กิริยาต้อนรับของพระธรรมทูตต้องเปี่ยมด้วยเมตตาการุณย์ พร้อมกล่าวคำปฏิสันถารที่ทำให้ชาวต่างชาติรู้สึกอบอุ่นและเคารพในพระรัตนตรัย',
    explanationEn: 'First impressions matter greatly; compassionate hospitality puts hesitant visitors at ease and reflects the Buddha’s loving-kindness.',
    vinayaFocusTh: 'ปฏิสันถารคารวตา การต้อนรับผู้มาเยือนด้วยธรรม',
  },
  {
    id: 'c-02-take-photo',
    category: 'culture-greeting',
    type: 'choice',
    visitor: {
      name: 'Elena',
      countryTh: 'อิตาลี',
      countryEn: 'Italy',
      avatar: '📸',
      questionEn: 'Venerable, is it respectful if my friend takes a photograph of our conversation together?',
      questionTh: 'พระคุณเจ้าคะ จะเป็นการสุภาพไหมคะถ้าเพื่อนของฉันจะขอถ่ายรูปการสนทนาของเราไว้ด้วย?',
    },
    options: [
      {
        id: 'opt-a',
        textEn: 'Yes, you are very welcome to take photos, as long as we maintain a respectful posture and comfortable distance.',
        textTh: 'ยินดีเป็นอย่างยิ่งครับ สามารถถ่ายรูปได้เลย โดยรักษาอิริยาบถที่สุภาพและเว้นระยะห่างที่เหมาะสมครับ',
        isCorrect: true,
        feedbackTh: 'ตอบได้อย่างชาญฉลาด! อนุญาตด้วยความเมตตา ควบคู่กับการย้ำเตือนเรื่องระยะห่างและสมณสารูปอย่างนุ่มนวล',
        feedbackEn: 'Diplomatic and graceful. Permits photography while gently upholding monastic propriety.',
      },
      {
        id: 'opt-b',
        textEn: 'No photos allowed! Cameras steal our spiritual karma and break meditation.',
        textTh: 'ห้ามถ่ายรูปเด็ดขาด! กล้องถ่ายรูปจะขโมยกรรมทางจิตวิญญาณและทำลายสมาธิ',
        isCorrect: false,
        feedbackTh: 'คำตอบงมงายและสร้างความเข้าใจผิดเกี่ยวกับพุทธศาสนา',
        feedbackEn: 'Superstitious and inaccurate; damages understanding of Buddhist reason.',
      },
      {
        id: 'opt-c',
        textEn: 'Sure! Let me make a funny hand sign and put my arm around your shoulder.',
        textTh: 'ได้เลย! เดี๋ยวอาตมาทำท่าชูนิ้วตลกๆ และเอาแขนไปโอบไหล่โยมนะ',
        isCorrect: false,
        feedbackTh: 'ผิดสมณสารูปอย่างยิ่ง! พระสงฆ์ต้องรักษาอาการสำรวม ไม่ทำท่าทางหยอกล้อหรือสัมผัสตัวโยม',
        feedbackEn: 'Severely breaches monastic decorum. Monks must maintain composed bodily restraint.',
      },
    ],
    explanationTh: 'การถ่ายภาพในกิจกรรม Monk Chat ทำได้เพื่อเป็นที่ระลึกและการประชาสัมพันธ์ แต่พระภิกษุต้องรักษาอากัปกิริยาสำรวม นั่งตัวตรง ไม่โพสท่าล้อเล่น',
    explanationEn: 'Photographs are permitted for cultural memories, provided monks uphold serene posture without playful poses.',
    vinayaFocusTh: 'กายสังวรณ์ ความสำรวมกายและรักษาระยะห่างตามสมณสารูป',
  },
  {
    id: 'c-03-scramble-blessing',
    category: 'culture-greeting',
    type: 'scramble',
    visitor: {
      name: 'Leaving Visitor',
      countryTh: 'นักท่องเที่ยวทุกคน',
      countryEn: 'Departing guest',
      avatar: '🙏',
      questionEn: 'Thank you so much for your peaceful time and wisdom today, Venerable.',
      questionTh: 'ขอบพระคุณพระคุณเจ้าอย่างยิ่งสำหรับเวลาอันเงียบสงบและปัญญาในวันนี้ครับ',
    },
    scramblePromptTh: 'เรียงคำเพื่อกล่าวให้พร: “ขอให้ความสงบสุขและความสุขที่แท้จริงจงอยู่กับท่านเสมอ”',
    scrambleCorrectTokens: [
      'May peacefulness',
      'and true happiness',
      'remain with you',
      'always.',
    ],
    scrambleDistractorTokens: ['give me money', 'never come back', 'crying'],
    explanationTh: 'การกล่าวอวยพรส่งท้ายด้วยจิตเมตตาภาษาอังกฤษสั้นๆ เช่น "May peacefulness and true happiness remain with you always" ช่วยสร้างความประทับใจมิรู้ลืมแก่นักท่องเที่ยว',
    explanationEn: 'Closing conversations with a heartfelt Buddhist blessing leaves visitors with an enduring imprint of peace and benevolence.',
    vinayaFocusTh: 'การแผ่เมตตาและอนุโมทนาทานภาษาอังกฤษ',
  },
]
