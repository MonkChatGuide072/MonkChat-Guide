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

export type MeditationScene = 'sit' | 'relax' | 'let-go' | 'center' | 'crystal' | 'wandering' | 'straining' | 'lightness' | 'small-self' | 'buddha' | 'brightness' | 'other'
export interface MeditationPictureCard { scene: MeditationScene; title: string; body: string; note?: string }

/** The owner's actual spoken script, condensed for a glance before closing the eyes. */
export const preparationCards: Record<'th' | 'en', MeditationPictureCard[]> = {
  th: [
    { scene: 'sit', title: 'นั่งให้สบาย', body: 'ขาขวาทับขาซ้าย มือขวาวางบนมือซ้าย หงายฝ่ามือขึ้น', note: 'ปรับท่าให้สบายก่อนเริ่ม' },
    { scene: 'relax', title: 'หลับตาเบา ๆ', body: 'หายใจเข้า–ออกสบาย ๆ แล้วคลายกล้ามเนื้อทั่วตัว', note: 'ไม่บีบตา ไม่เกร็งร่างกาย' },
    { scene: 'let-go', title: 'พักเรื่องต่าง ๆ ไว้ก่อน', body: 'วางเรื่องงานและความกังวล นึกว่าตัวเราเบาเหมือนลูกโป่ง', note: 'เป็นภาพเปรียบเทียบให้รู้สึกผ่อนคลาย' },
    { scene: 'center', title: 'วางใจกลางท้อง', body: 'ค่อย ๆ น้อมใจมาพักไว้ภายในกลางท้องอย่างสบาย', note: 'ดูตำแหน่งฐานที่ 7 เพิ่มได้ด้านล่าง ไม่ต้องเพ่งหาจุด' },
    { scene: 'crystal', title: 'นึกดวงแก้วใสเบา ๆ', body: 'นึกดวงแก้วกลมใสกลางท้อง ชัดแค่ไหนก็เอาแค่นั้น', note: 'ค่อย ๆ รักษาใจให้สงบ ไม่บังคับให้เห็นชัด' },
  ],
  en: [
    { scene: 'sit', title: 'Sit comfortably', body: 'Right leg over left. Right hand on left, palms up.', note: 'Adjust your position until you feel comfortable.' },
    { scene: 'relax', title: 'Close your eyes gently', body: 'Take a few easy breaths. Let your whole body relax.', note: 'Keep your eyes soft and your body at ease.' },
    { scene: 'let-go', title: 'Let your worries go', body: 'Set aside work and worries. Imagine feeling light, like a balloon.', note: 'This is a picture to help you relax.' },
    { scene: 'center', title: 'Rest at the center', body: 'Gently rest your attention in the middle of your abdomen.', note: 'See base 7 below if you wish. No need to search for a point.' },
    { scene: 'crystal', title: 'Imagine a clear crystal ball', body: 'Imagine a round, clear ball in your abdomen. Any clarity is fine.', note: 'Stay relaxed. There is no need to force an image.' },
  ],
}

/** Owner-requested conversation prompts, not promised outcomes or attainment labels. */
export const reflectionCards: Record<'th' | 'en', MeditationPictureCard[]> = {
  th: [
    { scene: 'wandering', title: 'ใจคิดเรื่องอื่น', body: 'ระหว่างนั่ง ฉันนึกถึงหลายเรื่อง ใจลอยไปบ้าง', note: 'เล่าให้พระฟังได้ว่าใจไปคิดเรื่องอะไร' },
    { scene: 'straining', title: 'พยายามมากจนเกร็ง', body: 'ฉันอยากนั่งให้ได้ จนเผลอเพ่งหรือเค้นตัวเอง', note: 'บอกพระได้ตรง ๆ เพื่อช่วยปรับให้สบายขึ้น' },
    { scene: 'lightness', title: 'โปร่ง โล่ง เบาสบาย', body: 'ฉันรู้สึกผ่อนคลาย ตัวเบา หรือใจสบาย', note: 'เล่าความรู้สึกด้วยคำของเราเองได้เลย' },
    { scene: 'crystal', title: 'เห็นดวงกลมใส', body: 'ฉันเห็นหรือนึกถึงดวงกลมใส คล้ายลูกแก้วคริสตัล', note: 'ชัดหรือไม่ชัด ก็เล่าตามที่รู้สึกได้' },
    { scene: 'small-self', title: 'รู้สึกเหมือนตัวเล็ก', body: 'ฉันรู้สึกหรือเห็นภาพเหมือนตัวเองมีขนาดเล็กลง', note: 'อธิบายได้ว่าเป็นความรู้สึกหรือภาพในใจ' },
    { scene: 'buddha', title: 'เห็นภาพองค์พระภายใน', body: 'ฉันเห็นหรือนึกถึงภาพองค์พระอยู่ภายใน', note: 'เล่าตามที่พบ โดยไม่ต้องตีความว่าเป็นระดับใด' },
    { scene: 'brightness', title: 'เห็นแสงสว่าง', body: 'ฉันเห็นหรือรู้สึกถึงแสงสว่างระหว่างนั่ง', note: 'เล่าให้พระฟังได้ว่าเป็นอย่างไร' },
    { scene: 'other', title: 'อย่างอื่น หรือยังไม่แน่ใจ', body: 'ฉันไม่เห็นภาพอะไร รู้สึกหลายอย่าง หรือยังอธิบายไม่ถูก', note: 'ไม่จำเป็นต้องเลือกให้เหมือนภาพใดภาพหนึ่ง' },
  ],
  en: [
    { scene: 'wandering', title: 'My mind wandered', body: 'I thought about different things while sitting.', note: 'You can tell the monk what was on your mind.' },
    { scene: 'straining', title: 'I tried too hard', body: 'I wanted to do it well, and I felt tense or forced it.', note: 'Tell the monk so you can find a more relaxed approach.' },
    { scene: 'lightness', title: 'I felt light and relaxed', body: 'My body felt light, or my mind felt calm and at ease.', note: 'Use your own words to describe the feeling.' },
    { scene: 'crystal', title: 'I pictured a clear ball', body: 'I saw or imagined a round, clear ball, like crystal.', note: 'You can describe it whether it felt clear or faint.' },
    { scene: 'small-self', title: 'I felt small', body: 'I felt or pictured myself becoming smaller.', note: 'You can say whether it was a feeling or a mental image.' },
    { scene: 'buddha', title: 'I pictured a Buddha within', body: 'I saw or imagined a Buddha image within me.', note: 'Describe what you experienced without assigning it a level.' },
    { scene: 'brightness', title: 'I noticed light', body: 'I saw or sensed brightness during meditation.', note: 'You can tell the monk what it was like.' },
    { scene: 'other', title: 'Something else, or not sure', body: 'I saw no image, felt several things, or cannot describe it yet.', note: 'Your experience does not need to match any picture.' },
  ],
}

export const meditationJourneyCopy = {
  th: {
    title: 'ก่อนนั่ง · ช่วงนั่ง · หลังนั่ง', intro: 'ดูภาพเตรียมตัว แล้วพักหน้าจอเพื่อฟังพระนำสมาธิ',
    phases: ['ก่อนนั่ง', 'ช่วงนั่ง', 'หลังนั่ง'], phaseLabel: 'ช่วงของการนั่งสมาธิ',
    beforeTitle: 'เตรียมตัวง่าย ๆ 5 ขั้น', beforeIntro: 'ย่อจากบทนำนั่งที่ใช้ในกิจกรรม ดูให้เข้าใจก่อนหลับตา',
    duringTitle: 'ถึงเวลาพักใจ', duringBody: 'นั่งสบาย ๆ หลับตา แล้วฟังพระนำ ไม่ต้องปัดการ์ดต่อ', duringNote: 'ถ้าฝึกด้วยตัวเอง เปิดเสียงนำสมาธิด้านล่างได้', duringImage: 'ภาพพระนั่งสมาธิอย่างสงบใต้ต้นไม้',
    afterTitle: 'เมื่อกี้รู้สึกอย่างไรบ้าง?', afterIntro: 'ภาพช่วยเล่าให้พระฟัง ไม่ใช่เป้าหมายที่ต้องทำให้ได้',
    afterNote: 'ภาพเป็นเพียงตัวอย่างประสบการณ์ ไม่ใช่สิ่งที่ต้องเห็นหรือคะแนนความสำเร็จ ไม่เห็นภาพอะไรก็เล่าได้',
    previous: 'การ์ดก่อนหน้า', next: 'การ์ดถัดไป', card: 'การ์ด', count: 'จาก', swipe: 'ปัดการ์ดหรือใช้ปุ่มลูกศร',
    basesToggle: 'รู้จักฐานทั้ง 7 เพิ่มเติม', basesHide: 'ซ่อนรายละเอียดฐานทั้ง 7', basesTitle: 'ฐานที่ตั้งของใจทั้ง 7', base7: 'ไปฐานที่ 7', base: 'ฐานที่',
    basePrevious: 'ฐานก่อนหน้า', baseNext: 'ฐานถัดไป', baseSwipe: 'ปัดรายละเอียดฐานหรือใช้ปุ่มลูกศร',
    source: 'แหล่งอ่านเพิ่มเติมเรื่องฐานที่ตั้งของใจ', readSource: 'อ่านฉบับเต็ม', listen: 'เปิดเสียงนำสมาธิ', diagram: 'ภาพตำแหน่งภายในร่างกายโดยสังเขป',
  },
  en: {
    title: 'Your meditation guide', intro: 'Prepare, sit, then share how it felt.',
    phases: ['Before', 'Meditation time', 'After'], phaseLabel: 'Meditation stages',
    beforeTitle: 'Get ready in five steps', beforeIntro: 'Based on the session’s spoken guide.',
    duringTitle: 'Time to rest your mind', duringBody: 'Sit comfortably, close your eyes, and listen to the monk. No more swiping needed.', duringNote: 'Practising on your own? You can play the audio below.', duringImage: 'A monk sitting peacefully beneath a tree',
    afterTitle: 'How did it feel?', afterIntro: 'Pictures to talk about, not goals to achieve.',
    afterNote: 'These are examples, not things you must see or a score of success. You can also describe seeing no image.',
    previous: 'Previous card', next: 'Next card', card: 'Card', count: 'of', swipe: 'Swipe cards or use arrow keys',
    basesToggle: 'Explore the seven bases', basesHide: 'Hide the seven bases', basesTitle: 'The seven bases of the mind', base7: 'Go to base 7', base: 'Base',
    basePrevious: 'Previous base', baseNext: 'Next base', baseSwipe: 'Swipe base details or use arrow keys',
    source: 'Further reading about the seven bases', readSource: 'Read the full guide', listen: 'Play guided meditation', diagram: 'Schematic of locations inside the body',
  },
} as const
