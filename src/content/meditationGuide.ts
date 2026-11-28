/** Concise paraphrases of the linked temple publications; never a transcript of the audio. */
export const meditationGuideSources = {
  en: 'https://en.dhammakaya.net/meditation-wisdom/lets-practice/',
  th: 'https://dhammakaya.com/4442',
}
export const meditationBases = [
  { id: 1, th: { title: 'ปากช่องจมูก', body: 'ชายอยู่ข้างขวา หญิงอยู่ข้างซ้าย', note: 'ซ้าย–ขวาหมายถึงด้านของผู้ฝึก' }, en: { title: 'Rim of the nostril', body: 'Right side for men; left side for women.', note: 'Left and right refer to your own body.' } },
  { id: 2, th: { title: 'หัวตาด้านใน', body: 'บริเวณหัวตาที่น้ำตาไหล ชายข้างขวา หญิงข้างซ้าย', note: 'เรียกอีกอย่างว่า “เพลาตา”' }, en: { title: 'Inner corner of the eye', body: 'Right side for men; left side for women.', note: 'The inner corner, near the nose.' } },
  { id: 3, th: { title: 'กลางศีรษะ', body: 'อยู่ภายในกลางศีรษะ ระดับเดียวกับหัวตา', note: 'ไม่ใช่บริเวณหน้าผากหรือกระหม่อม' }, en: { title: 'Center of the head', body: 'Inside the head, at eye level.', note: 'Not on the forehead or the crown.' } },
  { id: 4, th: { title: 'เพดานปาก', body: 'บริเวณช่องเพดานปาก ภายในปาก', note: '' }, en: { title: 'Roof of the mouth', body: 'At the palate, inside the mouth.', note: '' } },
  { id: 5, th: { title: 'ปากช่องลำคอ', body: 'ตรงกลางช่องคอ เหนือลูกกระเดือก', note: '' }, en: { title: 'Upper throat', body: 'In the center of the throat, above the Adam’s apple.', note: '' } },
  { id: 6, th: { title: 'กลางท้องระดับสะดือ', body: 'อยู่ภายในกลางตัว ระดับเดียวกับสะดือ', note: 'จุดตัดของแนวสะดือ–หลัง และแนวซ้าย–ขวา' }, en: { title: 'Center at navel level', body: 'Inside the abdomen, level with the navel.', note: 'Where front–back and left–right lines meet.' } },
  { id: 7, th: { title: 'ศูนย์กลางกายฐานที่ 7', body: 'เหนือฐานที่ 6 ขึ้นมา 2 นิ้วมือ ภายในกลางท้อง', note: 'เป็นตำแหน่งวางใจหลัก ไม่ต้องเพ่งหรือควานหาจุด' }, en: { title: 'The seventh base', body: 'Two finger breadths above base 6, inside the abdomen.', note: 'Rest attention here gently, without searching or straining.' } },
] as const

export type MeditationScene = 'sit' | 'relax' | 'breathe' | 'let-go' | 'center' | 'crystal' | 'wandering' | 'straining' | 'lightness' | 'small-self' | 'buddha' | 'brightness' | 'other'
export interface MeditationPictureCard { scene: MeditationScene; title: string; body: string; note?: string }

/** The owner's actual spoken script, condensed for a glance before closing the eyes. */
export const preparationCards: Record<'th' | 'en', MeditationPictureCard[]> = {
  th: [
    { scene: 'sit', title: 'นั่งให้สบาย', body: 'ขาขวาทับขาซ้าย มือขวาวางบนมือซ้าย หงายฝ่ามือขึ้น', note: 'ปรับท่าให้สบายก่อนเริ่ม' },
    { scene: 'relax', title: 'หลับตาเบา ๆ', body: 'หลับตาเบา ๆ เหมือนกำลังจะหลับ แล้วคลายกล้ามเนื้อทั่วตัว', note: 'ไม่บีบตา ไม่เกร็งร่างกาย' },
    { scene: 'breathe', title: 'หายใจเข้า–ออกช้า ๆ', body: 'หายใจเข้าลึก ๆ อย่างสบาย แล้วค่อย ๆ ผ่อนออก ทำสองสามครั้ง', note: 'จากนั้นปล่อยลมหายใจให้เป็นธรรมชาติ ไม่ต้องฝืน' },
    { scene: 'let-go', title: 'พักเรื่องต่าง ๆ ไว้ก่อน', body: 'วางเรื่องงานและความกังวล นึกว่าตัวเราเบาเหมือนลูกโป่ง', note: 'เป็นภาพเปรียบเทียบให้รู้สึกผ่อนคลาย' },
    { scene: 'center', title: 'วางใจกลางท้อง', body: 'ค่อย ๆ น้อมใจมาพักไว้ภายในกลางท้องอย่างสบาย', note: 'ดูตำแหน่งฐานที่ 7 เพิ่มได้ด้านล่าง ไม่ต้องเพ่งหาจุด' },
    { scene: 'crystal', title: 'นึกดวงแก้วใสเบา ๆ', body: 'นึกดวงแก้วกลมใสกลางท้อง ชัดแค่ไหนก็เอาแค่นั้น', note: 'ค่อย ๆ รักษาใจให้สงบ ไม่บังคับให้เห็นชัด' },
    { scene: 'center', title: 'ประคองความสบายสักครู่', body: 'พักใจอยู่กับความสบายนี้สักครู่ ให้ใจนุ่มนวลและต่อเนื่อง', note: 'ไม่ต้องรีบหรือพยายามเพิ่มอะไร' },
  ],
  en: [
    { scene: 'sit', title: 'Sit comfortably', body: 'Right leg over left. Right hand on left, palms up.', note: 'Adjust your position until you feel comfortable.' },
    { scene: 'relax', title: 'Close your eyes gently', body: 'Close your eyes softly, as if falling asleep. Let your body relax.', note: 'Keep your eyes soft and your body at ease.' },
    { scene: 'breathe', title: 'Breathe slowly', body: 'Take a gentle, deep breath in. Slowly breathe out. Repeat a few times.', note: 'Then let your breath flow naturally.' },
    { scene: 'let-go', title: 'Let your worries go', body: 'Set aside work and worries. Imagine feeling light, like a balloon.', note: 'This is a picture to help you relax.' },
    { scene: 'center', title: 'Rest at the center', body: 'Gently rest your attention in the middle of your abdomen.', note: 'See base 7 below if you wish. No need to search for a point.' },
    { scene: 'crystal', title: 'Imagine a clear crystal ball', body: 'Imagine a round, clear ball in your abdomen. Any clarity is fine.', note: 'Stay relaxed. There is no need to force an image.' },
    { scene: 'center', title: 'Stay with this gentle ease', body: 'Rest with this comfortable, relaxed feeling for a little while. Keep your attention soft and steady.', note: 'There is no need to rush or add anything.' },
  ],
}

/** Owner-requested practical follow-up tips. Source mapping is retained in private project documentation. */
export const reflectionCards: Record<'th' | 'en', MeditationPictureCard[]> = {
  "th": [
    {
      "scene": "wandering",
      "title": "ใจคิดเรื่องอื่น",
      "body": "ปล่อยความคิดผ่านไปเบา ๆ แล้วกลับมาพักใจอย่างสบาย",
      "note": "ไม่ต้องไล่ตาม และไม่ต้องผลักไส"
    },
    {
      "scene": "straining",
      "title": "พยายามมากจนเกร็ง",
      "body": "คลายความตั้งใจ ผ่อนใบหน้าและไหล่ แล้วเริ่มใหม่เบา ๆ",
      "note": "ถ้ายังตึง ลืมตาพักสักครู่"
    },
    {
      "scene": "lightness",
      "title": "โปร่ง โล่ง เบาสบาย",
      "body": "พักอยู่กับความสบายอย่างรู้ตัว ไม่ต้องพยายามเพิ่มอะไร",
      "note": "ให้ความผ่อนคลายค่อย ๆ ต่อเนื่อง"
    },
    {
      "scene": "crystal",
      "title": "เห็นดวงกลมใส",
      "body": "มองอย่างสบาย ๆ ชัดแค่ไหนก็พอ ไม่ต้องเพ่งให้ชัดขึ้น",
      "note": "หากภาพเลือน ปล่อยให้เป็นไปตามธรรมชาติ"
    },
    {
      "scene": "small-self",
      "title": "รู้สึกเหมือนตัวเล็ก",
      "body": "รับรู้อย่างผ่อนคลาย ไม่ต้องปรับภาพหรือฝืนความรู้สึก",
      "note": "ไม่ต้องเร่งหรือควบคุมสิ่งที่เกิดขึ้น"
    },
    {
      "scene": "buddha",
      "title": "เห็นภาพองค์พระภายใน",
      "body": "รับรู้ภาพอย่างเบาสบาย โดยไม่ต้องบังคับให้คงอยู่",
      "note": "ไม่จำเป็นต้องตีความสิ่งที่เห็น"
    },
    {
      "scene": "brightness",
      "title": "เห็นแสงสว่าง",
      "body": "วางใจสบาย ๆ ไม่ต้องจ้องแสงหรือพยายามให้สว่างขึ้น",
      "note": "รักษาความผ่อนคลายไว้"
    },
    {
      "scene": "other",
      "title": "อย่างอื่น หรือยังไม่แน่ใจ",
      "body": "ไม่ต้องรีบให้เกิดภาพ กลับมาดูแลความสบายของกายและใจ",
      "note": "ฝึกต่อได้ในจังหวะของตัวเอง"
    }
  ],
  "en": [
    {
      "scene": "wandering",
      "title": "My mind wandered",
      "body": "Let thoughts pass gently, then return to a comfortable resting point.",
      "note": "No need to follow them or push them away."
    },
    {
      "scene": "straining",
      "title": "I tried too hard",
      "body": "Ease your effort. Soften your face and shoulders, then begin again gently.",
      "note": "If tension remains, open your eyes and take a short break."
    },
    {
      "scene": "lightness",
      "title": "I felt light and relaxed",
      "body": "Rest with that ease while staying aware. There is no need to add anything.",
      "note": "Let the relaxation continue gently."
    },
    {
      "scene": "crystal",
      "title": "I pictured a clear ball",
      "body": "Observe it gently, however clear or faint it is. There is no need to sharpen it.",
      "note": "If it fades, let it change naturally."
    },
    {
      "scene": "small-self",
      "title": "I felt small",
      "body": "Notice the feeling gently, without trying to change the image or resist it.",
      "note": "There is no need to rush or control the experience."
    },
    {
      "scene": "buddha",
      "title": "I pictured a Buddha within",
      "body": "Let the image be there gently, without trying to hold it in place.",
      "note": "There is no need to interpret what you see."
    },
    {
      "scene": "brightness",
      "title": "I noticed light",
      "body": "Stay at ease, without staring at the light or trying to make it brighter.",
      "note": "Keep your attention soft and relaxed."
    },
    {
      "scene": "other",
      "title": "Something else, or not sure",
      "body": "There is no need to create an image. Return to comfort in your body and mind.",
      "note": "Continue at your own pace."
    }
  ]
}

export const meditationJourneyCopy = {
  th: {
    title: 'ก่อนนั่ง · ช่วงนั่ง · หลังนั่ง', intro: 'ดูภาพเตรียมตัว แล้วพักหน้าจอเพื่อฟังพระนำสมาธิ',
    phases: ['ก่อนนั่ง', 'ช่วงนั่ง', 'หลังนั่ง'], phaseLabel: 'ช่วงของการนั่งสมาธิ',
    beforeTitle: 'เตรียมตัวง่าย ๆ 7 ขั้น', beforeIntro: 'ดูภาพเตรียมตัวก่อนเริ่มนั่งสมาธิ', breathIn: 'หายใจเข้า', breathOut: 'หายใจออก',
    duringTitle: 'ถึงเวลาพักใจ', duringBody: 'นั่งสบาย ๆ หลับตา แล้วฟังพระนำ ไม่ต้องปัดการ์ดต่อ', duringNote: 'ถ้าฝึกด้วยตัวเอง เปิดเสียงนำสมาธิด้านล่างได้', duringImage: 'ภาพพระนั่งสมาธิอย่างสงบใต้ต้นไม้',
    afterTitle: 'ฝึกต่ออย่างไรให้สบาย?', afterIntro: 'เลือกสิ่งที่ใกล้กับประสบการณ์ของคุณ แล้วลองปรับอย่างอ่อนโยน',
    afterNote: 'ภาพเป็นเพียงตัวอย่างประสบการณ์ ไม่ใช่สิ่งที่ต้องเห็นหรือคะแนนความสำเร็จ ไม่เห็นภาพอะไรก็เล่าได้',
    previous: 'การ์ดก่อนหน้า', next: 'การ์ดถัดไป', card: 'การ์ด', count: 'จาก', swipe: 'ปัดการ์ดหรือใช้ปุ่มลูกศร',
    basesToggle: 'รู้จักฐานทั้ง 7 เพิ่มเติม', basesHide: 'ซ่อนรายละเอียดฐานทั้ง 7', basesTitle: 'ฐานที่ตั้งของใจทั้ง 7', base7: 'ไปฐานที่ 7', base: 'ฐานที่',
    basePrevious: 'ฐานก่อนหน้า', baseNext: 'ฐานถัดไป', baseSwipe: 'ปัดรายละเอียดฐานหรือใช้ปุ่มลูกศร',
    source: 'แหล่งอ่านเพิ่มเติมเรื่องฐานที่ตั้งของใจ', readSource: 'อ่านฉบับเต็ม', listen: 'เปิดเสียงนำสมาธิ', diagram: 'ภาพตำแหน่งภายในร่างกายโดยสังเขป',
  },
  en: {
    title: 'Your meditation guide', intro: 'Prepare, sit, then share how it felt.',
    phases: ['Before', 'Meditation time', 'After'], phaseLabel: 'Meditation stages',
    beforeTitle: 'Get ready in seven steps', beforeIntro: 'A few simple steps before you begin.', breathIn: 'Breathe in', breathOut: 'Breathe out',
    duringTitle: 'Time to rest your mind', duringBody: 'Sit comfortably, close your eyes, and listen to the monk. No more swiping needed.', duringNote: 'Practising on your own? You can play the audio below.', duringImage: 'A monk sitting peacefully beneath a tree',
    afterTitle: 'A gentle way to continue', afterIntro: 'Find what feels familiar, and explore a gentle adjustment.',
    afterNote: 'These are examples, not things you must see or a score of success. You can also describe seeing no image.',
    previous: 'Previous card', next: 'Next card', card: 'Card', count: 'of', swipe: 'Swipe cards or use arrow keys',
    basesToggle: 'Explore the seven bases', basesHide: 'Hide the seven bases', basesTitle: 'The seven bases of the mind', base7: 'Go to base 7', base: 'Base',
    basePrevious: 'Previous base', baseNext: 'Next base', baseSwipe: 'Swipe base details or use arrow keys',
    source: 'Further reading about the seven bases', readSource: 'Read the full guide', listen: 'Play guided meditation', diagram: 'Schematic of locations inside the body',
  },
} as const
