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

export const meditationGuideCopy = {
  th: {
    title: 'คู่มือภาพ: ฐานที่ตั้งของใจทั้ง 7', intro: 'ปัดดูทีละการ์ด แล้วฟังเสียงนำสมาธิด้านล่าง',
    prepare: 'เตรียมตัว', bases: 'ฐานทั้ง 7', settle: 'ฐานที่ 7', base: 'ฐานที่',
    firstTitle: 'นั่งสบาย ผ่อนคลายก่อนเริ่ม', firstBody: 'นั่งขัดสมาธิ ขาขวาทับขาซ้าย มือขวาวางบนมือซ้าย ให้นิ้วชี้ขวาจรดหัวแม่มือซ้าย', firstNote: 'หลับตาเบา ๆ คลายกายและใจ ไม่เกร็ง',
    lastTitle: 'หยุดใจเบา ๆ ที่กลางท้อง', lastBody: 'นึกดวงใสที่ฐานที่ 7 อย่างสบาย จะภาวนา “สัมมา อะระหัง” ในใจเบา ๆ ด้วยก็ได้', lastNote: 'หากนึกภาพแล้วตึง ให้วางใจนิ่ง ๆ โดยไม่ต้องนึกภาพ',
    previous: 'การ์ดก่อนหน้า', next: 'การ์ดถัดไป', count: 'จาก', card: 'การ์ด',
    diagram: 'ภาพแสดงตำแหน่งภายในร่างกายโดยสังเขป', posture: 'ภาพวาดพระนั่งสมาธิอย่างสงบ',
    source: 'ย่อยจากคำแนะนำของวัดพระธรรมกาย', readSource: 'อ่านฉบับเต็ม', listen: 'พร้อมแล้ว ฟังเสียงสมาธิ',
    lesson: 'คู่มือภาพแบบธรรมกาย', sectionLabel: 'การ์ดเรียนรู้สมาธิ', keyboardHint: 'ปัดการ์ดหรือใช้ปุ่มลูกศร',
  },
  en: {
    title: 'Picture guide: the seven bases', intro: 'Swipe through the cards, then listen below.',
    prepare: 'Prepare', bases: 'Seven bases', settle: 'Base 7', base: 'Base',
    firstTitle: 'Sit comfortably', firstBody: 'Right leg over left. Place your right hand on your left; touch the right index fingertip to the left thumb.', firstNote: 'Close your eyes softly and release tension.',
    lastTitle: 'Rest gently at the center', lastBody: 'Imagine a clear sphere at base 7. You may silently repeat “Samma-arahang”.', lastNote: 'If imagining feels tense, rest attention there without an image.',
    previous: 'Previous card', next: 'Next card', count: 'of', card: 'Card',
    diagram: 'Schematic of locations inside the body', posture: 'Illustration of a monk sitting peacefully',
    source: 'Adapted from Wat Phra Dhammakaya guidance', readSource: 'Read the full guide', listen: 'Ready to listen',
    lesson: 'Dhammakaya picture guide', sectionLabel: 'Meditation learning cards', keyboardHint: 'Swipe cards or use arrow keys',
  },
} as const
