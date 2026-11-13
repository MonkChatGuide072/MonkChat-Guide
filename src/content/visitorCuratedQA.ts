/**
 * Curated Q&A Collection for International Visitors (Public /qa)
 * Filtered for foreign tourists, cultural explorers, and meditation seekers.
 * Concise, welcoming, polite, and diplomatic in Luang Por Dattajeevo's style.
 */

export interface VisitorQATranslation {
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

export interface VisitorQAItem {
  id: string
  category: string
  content_status: 'published'
  verification_status: 'verified'
  is_published: boolean
  qa_translations: VisitorQATranslation[]
}

export const CURATED_VISITOR_QA_ITEMS: VisitorQAItem[] = [
  // 1. Meditation
  {
    id: 'vis-med-01',
    category: 'Meditation',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Can anyone practice meditation here, even if I follow another religion or no religion?',
        short_answer: 'Yes, absolutely. Meditation is a universal practice of calming and resting the mind. It does not require you to change your beliefs, chant, or adopt any religious doctrine—it is open to everyone seeking inner peace.',
        detailed_answer: 'You are welcome to sit comfortably, relax your body, and observe your breath or center in whatever way feels natural and peaceful to you.'
      },
      {
        language_code: 'th',
        question: 'คนต่างศาสนา หรือผู้ที่ไม่ได้นับถือศาสนาใด สามารถฝึกสมาธิที่นี่ได้หรือไม่?',
        short_answer: 'สามารถฝึกได้ทุกคนอย่างสบายใจ การฝึกสมาธิคือการพักผ่อนใจให้สงบเป็นสากล ไม่จำเป็นต้องเปลี่ยนศาสนาหรือสวดมนต์ เป็นพื้นที่เปิดสำหรับทุกคนที่แสวงหาความสงบภายใน',
        detailed_answer: 'ท่านสามารถนั่งในท่าที่สบาย ผ่อนคลายร่างกาย และวางใจอย่างเป็นธรรมชาติได้โดยไม่มีข้อจำกัด'
      }
    ]
  },
  {
    id: 'vis-med-02',
    category: 'Meditation',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'How do I handle wandering thoughts or restlessness while trying to meditate?',
        short_answer: 'Do not fight or suppress your thoughts. The mind naturally wanders like ripples on water. When you notice a thought, gently smile at it, let it pass, and softly return your awareness to the center of your body.',
        detailed_answer: 'Like dust in a quiet glass of water, sediment settles on its own when the glass is left undisturbed.'
      },
      {
        language_code: 'th',
        question: 'ทำอย่างไรเมื่อรู้สึกฟุ้งซ่าน หรือมีความคิดกังวลผุดขึ้นมาตอนนั่งสมาธิ?',
        short_answer: 'อย่าไปสู้รบกับความคิด ใจของเราเหมือนน้ำในแก้วที่มีฝุ่นผง เมื่อมีเรื่องแวบเข้ามา แค่ยิ้มรับเบา ๆ แล้วปล่อยให้ผ่านไป แล้วค่อย ๆ พาใจกลับมาพักที่ศูนย์กลางกายเบา ๆ',
        detailed_answer: 'เมื่อเราปล่อยให้แก้วน้ำอยู่นิ่ง ๆ ตะกอนจะค่อย ๆ ตกผลึกลงไปเองโดยไม่ต้องออกแรงกดดัน'
      }
    ]
  },
  {
    id: 'vis-med-03',
    category: 'Meditation',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Why do we place our gentle attention at the center of the body?',
        short_answer: 'The center of the body (two finger-breadths above the navel) is the natural balance point of human awareness. Resting your attention here creates a grounded, centered feeling of calm without mental strain.',
        detailed_answer: 'It prevents mental energy from rushing up to the head or eyes, allowing both body and mind to relax deeply.'
      },
      {
        language_code: 'th',
        question: 'ทำไมจึงต้องวางใจเบา ๆ ที่ศูนย์กลางกายฐานที่ 7?',
        short_answer: 'ศูนย์กลางกาย (เหนือสะดือ 2 นิ้วมือ) คือจุดสมดุลตามธรรมชาติของจิตใจ การวางใจไว้ตรงนี้ช่วยให้รู้สึกผ่อนคลาย มั่นคง และสงบโดยไม่ต้องเพ่งหรือเกร็งศีรษะ',
        detailed_answer: 'ช่วยป้องกันไม่ให้พลังงานตึงเครียดวิ่งขึ้นสู่สมองหรือดวงตา ทำให้ใจและกายผ่อนคลายลึกซึ้ง'
      }
    ]
  },

  // 2. Monastic Life & Buddhism
  {
    id: 'vis-bud-01',
    category: 'Buddhism',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Why do Buddhist monks wear orange or saffron robes?',
        short_answer: 'The saffron hue (kasaya) comes from the ancient Buddhist tradition of dyeing cloth with natural roots and bark. It represents modesty, simplicity, and renunciation of luxury.',
        detailed_answer: 'The robe reminds both the monk and the community of a life devoted to peace, service, and harmlessness.'
      },
      {
        language_code: 'th',
        question: 'ทำไมพระสงฆ์จึงครองจีวรสีส้มหรือสีกาสาวพัสตร์?',
        short_answer: 'ผ้ากาสาวพัสตร์สืบทอดมาจากสมัยพุทธกาลที่ย้อมผ้าด้วยเปลือกไม้และรากไม้ตามธรรมชาติ สื่อถึงความเรียบง่าย สมถะ และการสละความฟุ้งเฟ้อทางโลก',
        detailed_answer: 'จีวรเป็นสัญลักษณ์เตือนใจถึงชีวิตที่อุทิศเพื่อความสงบ การเกื้อกูล และความไม่เบียดเบียน'
      }
    ]
  },
  {
    id: 'vis-bud-02',
    category: 'Buddhism',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Why do monks shave their heads and eyebrows?',
        short_answer: 'Shaving hair is a symbol of renouncing vanity, external beauty, and worldly attachment. It signifies a fresh commitment to simplicity, purity, and inner growth.',
        detailed_answer: 'In Thai Theravada tradition, shaving eyebrows also became a distinctive mark promoting humility and communal unity.'
      },
      {
        language_code: 'th',
        question: 'ทำไมพระสงฆ์จึงต้องโกนศีรษะและคิ้ว?',
        short_answer: 'การโกนผมเป็นสัญลักษณ์ของการละความยึดติดในรูปโฉมภายนอก และความสวยงามทางโลก เพื่อเริ่มต้นชีวิตที่เรียบง่าย บริสุทธิ์ และมุ่งพัฒนาจิตใจ',
        detailed_answer: 'ในธรรมเนียมไทย การโกนคิ้วยังเป็นเอกลักษณ์ที่แสดงถึงความอ่อนน้อมถ่อมตนและความเป็นระเบียบเรียบร้อยของหมู่สงฆ์'
      }
    ]
  },
  {
    id: 'vis-bud-03',
    category: 'Buddhism',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Why are women requested not to physically touch a Buddhist monk?',
        short_answer: 'Monks take vows of complete celibacy and simplicity. Maintaining a respectful physical distance is a reciprocal tradition of honor, protecting both the monk’s monastic precepts and the visitor’s peace of mind.',
        detailed_answer: 'When offering items, women may place them on an offering cloth (pha rap prakhen) or table, which the monk receives with respectful gratitude.'
      },
      {
        language_code: 'th',
        question: 'ทำไมสตรีจึงได้รับคำแนะนำไม่ให้สัมผัสตัวพระสงฆ์โดยตรง?',
        short_answer: 'พระภิกษุมีพระวินัยในการรักษาพรหมจรรย์อย่างเคร่งครัด การเว้นระยะห่างทางกายภาพจึงเป็นธรรมเนียมแห่งความเคารพซึ่งกันและกัน และเกื้อกูลต่อความบริสุทธิ์ของศีล',
        detailed_answer: 'ในการถวายของ สตรีสามารถวางสิ่งของลงบนผ้ารับประเคนหรือโต๊ะ ซึ่งพระสงฆ์จะรับด้วยความสำรวมและอนุโมทนา'
      }
    ]
  },

  // 3. Etiquette & Visiting
  {
    id: 'vis-eti-01',
    category: 'Etiquette',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'What is the appropriate dress code when visiting temples in Thailand?',
        short_answer: 'Please dress modestly: cover your shoulders, chest, and knees. Avoid sleeveless tops, tank tops, and short shorts. Shoes should be removed before stepping into sacred temple halls.',
        detailed_answer: 'Loose, comfortable, and breathable clothing is ideal, especially if you plan to sit for meditation.'
      },
      {
        language_code: 'th',
        question: 'การแต่งกายที่เหมาะสมและสุภาพเมื่อเข้าชมวัดในประเทศไทยเป็นอย่างไร?',
        short_answer: 'ควรแต่งกายสุภาพ: สวมเสื้อมีแขน ปิดหัวไหล่และหน้าอก กางเกงหรือกระโปรงยาวคลุมเข่า ควรถอดรองเท้าก่อนก้าวเข้าสู่พระอุโบสถหรือวิหารศักดิ์สิทธิ์',
        detailed_answer: 'เสื้อผ้าที่หลวม โปร่ง สบาย ระบายอากาศได้ดี จะช่วยให้นั่งสมาธิหรือสนทนาธรรมได้อย่างสะดวกสบาย'
      }
    ]
  },
  {
    id: 'vis-eti-02',
    category: 'Etiquette',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Is it permitted to take photographs inside temples and during Monk Chat?',
        short_answer: 'Photography is generally welcome around temple grounds and during Monk Chat with polite permission. Please be discreet, avoid flash photography during meditation, and refrain from climbing on sacred Buddha statues or ruins.',
        detailed_answer: 'Student monks are happy to take a commemorative photo with you at the end of your conversation.'
      },
      {
        language_code: 'th',
        question: 'สามารถถ่ายภาพภายในวัดและระหว่างการสนทนาธรรม Monk Chat ได้หรือไม่?',
        short_answer: 'สามารถถ่ายภาพได้ด้วยความสำรวมและขออนุญาตก่อนอย่างสุภาพ กรุณาปิดแฟลชระหว่างการทำสมาธิ และไม่ปีนป่ายโบราณสถานหรือพระพุทธรูป',
        detailed_answer: 'หลังจบการสนทนาธรรม พระนิสิตยินดีร่วมบันทึกภาพความประทับใจเป็นที่ระลึก'
      }
    ]
  },
  {
    id: 'vis-eti-03',
    category: 'Etiquette',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'How should I greet a monk respectfully?',
        short_answer: 'You may perform a gentle ‘Wai’—placing your palms together at chest level and bowing your head slightly. A friendly, gentle smile and a quiet tone of voice are always appreciated.',
        detailed_answer: 'Monks do not return the Wai to lay visitors, but will welcome you with warmth, kindness, and blessings.'
      },
      {
        language_code: 'th',
        question: 'ควรทักทายและทำความเคารพพระสงฆ์อย่างสุภาพอย่างไร?',
        short_answer: 'สามารถทำความเคารพด้วยการ ‘ไหว้’ พนมมือระดับอกและค้อมศีรษะลงเล็กน้อยอย่างนอบน้อม พร้อมรอยยิ้มและน้ำเสียงที่สุภาพอ่อนโยน',
        detailed_answer: 'พระภิกษุสงฆ์จะไม่ไหว้ตอบฆราวาสตามพระวินัย แต่จะต้อนรับด้วยรอยยิ้ม ไมตรีจิต และการให้พร'
      }
    ]
  },

  // 4. Monk Chat
  {
    id: 'vis-chat-01',
    category: 'Monk Chat',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'What is Monk Chat at Wat Mahathat, and what can we talk about?',
        short_answer: 'Monk Chat is an open, friendly cultural and spiritual exchange where visitors can sit under the shade of trees with Buddhist student monks, ask questions about monastic life or mindfulness, and share life perspectives.',
        detailed_answer: 'It takes place outdoors at Wat Mahathat Ayutthaya. No prior booking is needed; just walk in with an open heart.'
      },
      {
        language_code: 'th',
        question: 'Monk Chat ณ วัดมหาธาตุ คืออะไร และสามารถสนทนาเรื่องใดได้บ้าง?',
        short_answer: 'Monk Chat คือพื้นที่เปิดกว้างสำหรับการแลกเปลี่ยนวัฒนธรรมและธรรมะอย่างเป็นกันเอง ผู้มาเยือนสามารถนั่งใต้ร่มไม้สนทนากับพระนิสิต ซักถามข้อสงสัยในชีวิตสมณะ สมาธิ และแลกเปลี่ยนมุมมองชีวิต',
        detailed_answer: 'จัดขึ้น ณ วัดมหาธาตุ พระนครศรีอยุธยา ไม่ต้องจองล่วงหน้า เพียงเดินเข้ามาด้วยใจที่เปิดกว้าง'
      }
    ]
  },
  {
    id: 'vis-chat-02',
    category: 'Monk Chat',
    content_status: 'published',
    verification_status: 'verified',
    is_published: true,
    qa_translations: [
      {
        language_code: 'en',
        question: 'Is there any fee or donation required to participate in Monk Chat?',
        short_answer: 'Monk Chat is 100% free. Monks offer their time, knowledge, and hospitality as a gift of Dhamma (spiritual sharing). You are our guest, and your sincere questions are the greatest gift.',
        detailed_answer: 'Donation boxes are available in the temple if visitors wish to support temple maintenance, but it is entirely voluntary.'
      },
      {
        language_code: 'th',
        question: 'การเข้าร่วม Monk Chat มีค่าใช้จ่ายหรือต้องบริจาคเงินหรือไม่?',
        short_answer: 'ไม่มีค่าใช้จ่ายใด ๆ ทั้งสิ้น พระสงฆ์สละเวลาและแบ่งปันปัญญาธรรมด้วยไมตรีจิต ท่านคือแขกผู้มาเยือน และคำถามที่จริงใจของท่านคือสิ่งที่มีค่ายิ่ง',
        detailed_answer: 'หากต้องการร่วมทำบุญบำรุงวัดสามารถหยอดตู้บริจาคของวัดได้ตามจิตศรัทธา โดยไม่มีการบังคับใด ๆ'
      }
    ]
  }
]
