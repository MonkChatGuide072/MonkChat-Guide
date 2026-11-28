import type { MeditationScene } from './meditationGuide'
import { nisitMeditationLessons } from './nisitPractice'

export interface GuidingParagraph {
  id: string
  titleTh: string
  titleEn: string
  scene: MeditationScene
  en: string
  th: string
  readingTh: string
  pause?: boolean
}
export interface GuidingScript {
  id: string
  titleTh: string
  titleEn: string
  descriptionTh: string
  descriptionEn: string
  paragraphs: GuidingParagraph[]
}

/** Approximate Thai reading cues for rehearsal, not a phonetic transcription or timed subtitle. */
export const guidingReadings: Record<string, string> = {
  'lesson-posture': 'พลีซ ซิท คัมฟ์เทอะบลี วิธ ยัวร์ แบ็ก สเทรท แอนด์ เพลส ยัวร์ ไรท์ แฮนด์ เจนท์ลี โอเวอร์ ยัวร์ เลฟท์',
  'lesson-relax': 'โคลซ ยัวร์ อายส์ ซอฟท์ลี แอซ อิฟ ฟอลลิง อะสลีพ แอนด์ ริลีฟ เอนี รีเมนนิง เทนเชิน อิน ยัวร์ บอดี',
  'lesson-breathe': 'อินเฮล ดีพลี แอนด์ สโลว์ลี เอ็กซ์เฮล อับเซิร์ฟ ยัวร์ วอร์ม เบรธ คัมมิง เอาท์ เด็น เล็ท อิท โฟลว์ แนเชอเริลลี',
  'lesson-presence': 'คีพ อะแวร์ ออฟ ยัวร์ บอดี แอนด์ ยัวร์ แวร์อะเบาทส์ แอซ ยู โกรว์ มอร์ อะแวร์ ออฟ ยัวร์ พีซฟูล เพรเซินซ์',
  'lesson-center': 'เล็ท ยัวร์ ไมนด์ สแตนด์ สทิล ไรท์ แดร์ แอท เดอะ เซ็นเทอร์ สเปซ วิธอิน ยัวร์ บอดี แอท ยัวร์ คัมเฟิร์ท สปอท',
  'lesson-immerse': 'อิแมจิน อะ เคลียร์ คริสเทิล บอล เอฟเฟิร์ทเลสลี เล็ท ยัวร์ ไมนด์ อิเมิร์ส ดีพลี อิน ยัวร์ อินเนอร์ พีซ',
  'lesson-stillness': 'เรสท์ วิธ ดิส คัมฟ์เทอะเบิล รีแลกซ์ท ฟีลิง ฟอร์ อะ ลิทเทิล ไวล์',
  'lesson-open': 'สโลว์ลี บี อะแวร์ ออฟ ยัวร์ แอมเบียนซ์ บรีธ อิน ดีพลี เอ็กซ์เฮล แอนด์ นาว ยู แคน สโลว์ลี โอเพิน ยัวร์ อายส์',
}

const basic: GuidingScript = {
  id: 'basic', titleTh: 'บทพื้นฐาน: เตรียมตัวจนจบการนั่ง', titleEn: 'Basic guidance: from preparation to closing',
  descriptionTh: 'ฝึกตามการ์ดเดิม เพิ่มช่วงประคองความสบายก่อนค่อย ๆ ลืมตา',
  descriptionEn: 'The familiar guiding cards, with a quiet pause before returning gently.',
  paragraphs: nisitMeditationLessons.map(lesson => ({
    id: lesson.id, titleTh: lesson.stageTh, titleEn: lesson.stageEn, scene: lesson.scene,
    en: lesson.spokenPromptEn, th: lesson.meaningTh, readingTh: guidingReadings[lesson.id], pause: lesson.id === 'lesson-stillness',
  })),
}

/** Owner-supplied English guiding script, edited for grammar and natural delivery. Source retained in handoff. */
const relaxation: GuidingScript = {
  id: 'relaxation', titleTh: 'บทผ่อนคลายและดวงแก้ว: ต่อด้วยช่วงเงียบ', titleEn: 'Relaxation and the crystal: continuing in silence',
  descriptionTh: 'ค่อย ๆ ผ่อนคลายกาย นึกดวงแก้วและประคองความสบาย ก่อนนั่งเงียบต่อ',
  descriptionEn: 'An alternative script: invitation, relaxation, gentle visualization and a quiet sitting period.',
  paragraphs: [
    { id:'invitation',titleTh:'1. เชิญเริ่มนั่ง',titleEn:'1. Begin together',scene:'sit',en:'May I invite you all to meditate together?',th:'ขอเชิญทุกท่านนั่งสมาธิร่วมกันนะครับ',readingTh:'เมย์ ไอ อินไวท์ ยู ออล ทู เมดิเทท ทูเกเธอร์' },
    { id:'position',titleTh:'2. ปรับท่านั่ง',titleEn:'2. Find a comfortable seat',scene:'sit',en:'Start by adjusting your sitting position. Sit comfortably, with your right leg over your left if that is comfortable for you.',th:'เริ่มจากปรับท่านั่งให้สบาย หากนั่งขัดสมาธิได้สะดวก ให้ขาขวาทับขาซ้าย',readingTh:'สตาร์ท บาย อะจัสทิง ยัวร์ ซิททิง พะซิเชิน ซิท คัมฟ์เทอะบลี วิธ ยัวร์ ไรท์ เลก โอเวอร์ ยัวร์ เลฟท์ อิฟ แดท อิซ คัมฟ์เทอะเบิล ฟอร์ ยู' },
    { id:'hands',titleTh:'3. วางมือ',titleEn:'3. Rest your hands',scene:'sit',en:'Place your right hand over your left hand, palms facing up. Adjust your position until you feel comfortable, and breathe naturally.',th:'วางมือขวาทับมือซ้าย หงายฝ่ามือขึ้น ปรับท่าจนรู้สึกสบาย แล้วหายใจตามธรรมชาติ',readingTh:'เพลส ยัวร์ ไรท์ แฮนด์ โอเวอร์ ยัวร์ เลฟท์ แฮนด์ พาล์มส์ เฟซิง อัพ อะจัสท์ ยัวร์ พะซิเชิน อันทิล ยู ฟีล คัมฟ์เทอะเบิล แอนด์ บรีธ แนเชอเริลลี' },
    { id:'eyes',titleTh:'4. หลับตาอย่างอ่อนโยน',titleEn:'4. Close your eyes gently',scene:'relax',en:'Gently close your eyes, as if you were going to fall asleep. Do not squeeze your eyelids or force them shut.',th:'หลับตาเบา ๆ คล้ายกำลังจะหลับ ไม่บีบเปลือกตาหรือฝืนปิดตาให้แน่น',readingTh:'เจนท์ลี โคลซ ยัวร์ อายส์ แอซ อิฟ ยู เวอร์ โกอิง ทู ฟอล อะสลีพ ดู นอท สควีซ ยัวร์ อายลิดส์ ออร์ ฟอร์ซ เด็ม ชัท' },
    { id:'breathing',titleTh:'5. ผ่อนลมหายใจ',titleEn:'5. Let the breath settle',scene:'breathe',en:'Next, take a few comfortable, deep breaths. Inhale gently and slowly breathe out. Then let your breathing return to its natural rhythm.',th:'หายใจเข้าลึก ๆ อย่างสบายสองสามครั้ง ค่อย ๆ ผ่อนลมหายใจออก แล้วปล่อยให้ลมหายใจเป็นธรรมชาติ',readingTh:'เน็กซ์ท เทค อะ ฟิว คัมฟ์เทอะเบิล ดีพ เบรธส์ อินเฮล เจนท์ลี แอนด์ สโลว์ลี บรีธ เอาท์ เด็น เล็ท ยัวร์ บรีธิง รีเทิร์น ทู อิทส์ แนเชอเริล ริธึม' },
    { id:'letting-go',titleTh:'6. พักภารกิจไว้ก่อน',titleEn:'6. Set responsibilities aside',scene:'let-go',en:'Take a moment to let go of responsibilities relating to work, family, or anything else. Let everything rest for now. Let your mind be joyful and free from worry.',th:'ใช้เวลาสักครู่พักเรื่องงาน ครอบครัว และภารกิจต่าง ๆ ไว้ก่อน ให้ใจเบิกบาน ผ่อนคลายจากความกังวล',readingTh:'เทค อะ โมเมินท์ ทู เล็ท โก ออฟ รีสพอนซะบิลิทีส์ ริเลทิง ทู เวิร์ค แฟมิลี ออร์ เอนีธิง เอลส์ เล็ท เอเวอรีธิง เรสท์ ฟอร์ นาว เล็ท ยัวร์ ไมนด์ บี จอยฟูล แอนด์ ฟรี ฟรอม เวอรี' },
    { id:'body-relaxation',titleTh:'7. คลายทั่วร่างกาย',titleEn:'7. Relax the whole body',scene:'relax',en:'Relax every muscle in your body. Let go of any tension, little by little, until your whole body feels at ease.',th:'ผ่อนคลายกล้ามเนื้อทุกส่วน ค่อย ๆ คลายความเกร็ง จนรู้สึกสบายทั่วร่างกาย',readingTh:'รีแลกซ์ เอเวอรี มัสเซิล อิน ยัวร์ บอดี เล็ท โก ออฟ เอนี เทนเชิน ลิทเทิล บาย ลิทเทิล อันทิล ยัวร์ โฮล บอดี ฟีลส์ แอท อีซ' },
    { id:'lightness',titleTh:'8. รู้สึกเบาสบาย',titleEn:'8. Notice lightness and ease',scene:'lightness',en:'Allow yourself to feel light and relaxed. Let your mind become cheerful, clear and bright. There is no need to force thoughts away.',th:'ให้กายและใจรู้สึกเบาสบาย เบิกบานและผ่องใส โดยไม่ต้องฝืนผลักความคิดออกไป',readingTh:'อะลาว ยัวร์เซลฟ์ ทู ฟีล ไลท์ แอนด์ รีแลกซ์ท เล็ท ยัวร์ ไมนด์ บีคัม เชียร์ฟูล เคลียร์ แอนด์ ไบรท์ แดร์ อิซ โน นีด ทู ฟอร์ซ ธอทส์ อะเวย์' },
    { id:'spaciousness',titleTh:'9. นึกถึงความโปร่งเบา',titleEn:'9. Imagine spaciousness',scene:'let-go',en:'Imagine the inside of your body as open and spacious, like a gently inflated balloon. Let it feel light, as if it were weightless.',th:'นึกเป็นภาพเปรียบเทียบว่าภายในร่างกายโปร่ง โล่ง คล้ายลูกโป่งที่พองเบา ๆ ราวกับไร้น้ำหนัก',readingTh:'อิแมจิน ดิ อินไซด์ ออฟ ยัวร์ บอดี แอซ โอเพิน แอนด์ สเปเชิส ไลค์ อะ เจนท์ลี อินเฟลทิด บะลูน เล็ท อิท ฟีล ไลท์ แอซ อิฟ อิท เวอร์ เวทเลส' },
    { id:'surroundings',titleTh:'10. ผ่อนคลายไปกับบรรยากาศ',titleEn:'10. Rest with your surroundings',scene:'lightness',en:'Imagine your body gradually blending with the peaceful surroundings, becoming one with nature. Let yourself enjoy this feeling of peacefulness.',th:'นึกว่ากายค่อย ๆ กลมกลืนกับบรรยากาศและธรรมชาติรอบตัว แล้วพักอยู่กับความสงบเย็นนี้',readingTh:'อิแมจิน ยัวร์ บอดี แกรจูอะลี เบลนดิง วิธ เดอะ พีซฟูล เซอราวนดิงส์ บีคัมมิง วัน วิธ เนเชอร์ เล็ท ยัวร์เซลฟ์ เอนจอย ดิส ฟีลิง ออฟ พีซฟูลเนส' },
    { id:'center',titleTh:'11. วางใจกลางกาย',titleEn:'11. Rest at the center',scene:'center',en:'Now, gently bring your attention to the center of your body, in the middle of your abdomen. Rest your mind there comfortably.',th:'ค่อย ๆ น้อมใจมาพักที่ศูนย์กลางกาย ภายในกลางท้อง แล้ววางใจไว้ตรงนั้นอย่างสบาย',readingTh:'นาว เจนท์ลี บริง ยัวร์ อะเทนเชิน ทู เดอะ เซ็นเทอร์ ออฟ ยัวร์ บอดี อิน เดอะ มิดเดิล ออฟ ยัวร์ แอบดะเมิน เรสท์ ยัวร์ ไมนด์ แดร์ คัมฟ์เทอะบลี' },
    { id:'object',titleTh:'12. มีที่พักให้ใจ',titleEn:'12. Give your attention a resting point',scene:'crystal',en:'Softly imagine a meditation object within you, giving your attention a gentle place to rest. If your mind wanders, return to it with ease.',th:'ค่อย ๆ นึกภาพภายในอย่างแผ่วเบาให้เป็นที่พักของใจ หากคิดเรื่องอื่น ให้กลับมาอย่างผ่อนคลาย',readingTh:'ซอฟท์ลี อิแมจิน อะ เมดิเทเชิน ออบเจ็กท์ วิธอิน ยู กิฟวิง ยัวร์ อะเทนเชิน อะ เจนเทิล เพลส ทู เรสท์ อิฟ ยัวร์ ไมนด์ วอนเดอร์ส รีเทิร์น ทู อิท วิธ อีซ' },
    { id:'crystal',titleTh:'13. นึกถึงดวงแก้ว',titleEn:'13. Imagine the crystal',scene:'crystal',en:'You may imagine a flawless diamond, of any size you like, round like a clear, pure crystal ball.',th:'อาจนึกถึงเพชรที่ใสบริสุทธิ์ ขนาดใดก็ได้ที่รู้สึกสบาย ให้กลมเหมือนดวงแก้วใส',readingTh:'ยู เมย์ อิแมจิน อะ ฟลอเลส ไดเมินด์ ออฟ เอนี ไซซ์ ยู ไลค์ ราวนด์ ไลค์ อะ เคลียร์ เพียวร์ คริสเทิล บอล' },
    { id:'imagine-easily',titleTh:'14. นึกอย่างง่าย ๆ',titleEn:'14. Keep the image simple',scene:'crystal',en:'Imagine it slowly and easily, just as you might think of a football, a tennis ball, or something familiar. Keep it simple and relaxed.',th:'นึกอย่างง่าย ๆ สบาย ๆ คล้ายเวลานึกถึงลูกบอล ลูกเทนนิส หรือสิ่งที่คุ้นเคย ไม่ต้องใช้ความพยายามมาก',readingTh:'อิแมจิน อิท สโลว์ลี แอนด์ อีซิลี จัสท์ แอซ ยู ไมท์ ธิงค์ ออฟ อะ ฟุตบอล อะ เทนนิส บอล ออร์ ซัมธิง ฟะมิลเยอร์ คีพ อิท ซิมเพิล แอนด์ รีแลกซ์ท' },
    { id:'clarity',titleTh:'15. ชัดเท่าที่สบาย',titleEn:'15. Let the image be as it is',scene:'crystal',en:'Be content with however clear or faint the image is. There is no need to sharpen it or hold it tightly.',th:'ภาพชัดแค่ไหนก็เอาแค่นั้น ไม่ต้องเพ่งให้ชัดหรือพยายามยึดภาพไว้',readingTh:'บี คอนเทนท์ วิธ ฮาวเอเวอร์ เคลียร์ ออร์ เฟนท์ ดิ อิมเมจ อิซ แดร์ อิซ โน นีด ทู ชาร์เพิน อิท ออร์ โฮลด์ อิท ไทท์ลี' },
    { id:'hold-ease',titleTh:'16. ประคองอารมณ์สบาย',titleEn:'16. Stay with this gentle ease',scene:'center',en:'Rest with this comfortable, relaxed feeling for a little while. Let your attention stay soft and steady.',th:'ประคองใจและอารมณ์สบายอย่างนี้ต่อไปสักครู่ ให้ใจนุ่มนวลและสม่ำเสมอ',readingTh:'เรสท์ วิธ ดิส คัมฟ์เทอะเบิล รีแลกซ์ท ฟีลิง ฟอร์ อะ ลิทเทิล ไวล์ เล็ท ยัวร์ อะเทนเชิน สเตย์ ซอฟท์ แอนด์ สเทดี',pause:true },
    { id:'continue-gently',titleTh:'17. รักษาความนุ่มนวล',titleEn:'17. Continue gently',scene:'center',en:'Continue with a still mind, gently and consistently. If thoughts arise, let them pass and return to your resting point without strain.',th:'รักษาใจให้นิ่ง นุ่ม และต่อเนื่อง หากมีความคิด ให้ผ่านไปแล้วกลับมาพักใจโดยไม่ฝืน',readingTh:'คอนทินิว วิธ อะ สทิล ไมนด์ เจนท์ลี แอนด์ คอนซิสเทินท์ลี อิฟ ธอทส์ อะไรซ์ เล็ท เด็ม พาส แอนด์ รีเทิร์น ทู ยัวร์ เรสทิง พอยน์ท วิธเอาท์ สเทรน' },
    { id:'inner-stillness',titleTh:'18. พักอยู่กับความสงบภายใน',titleEn:'18. Rest in inner stillness',scene:'center',en:'Allow your attention to settle at the center of your body. Let the feeling of calm and clarity develop naturally, without trying to make anything happen.',th:'ให้ใจค่อย ๆ สงบอยู่ที่ศูนย์กลางกาย ปล่อยความสงบและความผ่องใสเป็นไปตามธรรมชาติ ไม่เร่งให้เกิดสิ่งใด',readingTh:'อะลาว ยัวร์ อะเทนเชิน ทู เซ็ทเทิล แอท เดอะ เซ็นเทอร์ ออฟ ยัวร์ บอดี เล็ท เดอะ ฟีลิง ออฟ คาล์ม แอนด์ แคลริที ดีเวลลัพ แนเชอเริลลี วิธเอาท์ ทรายอิง ทู เมค เอนีธิง แฮพเพิน' },
    { id:'silence',titleTh:'19. นั่งเงียบต่อ',titleEn:'19. Continue in silence',scene:'center',en:'Let us continue resting in this stillness until the end of the meditation session. Please continue to meditate in silence.',th:'ขอให้พักอยู่กับความสงบนิ่งนี้ต่อไปจนถึงเวลาอันสมควร ให้ทุกท่านนั่งกันเงียบ ๆ นะครับ',readingTh:'เล็ท อัส คอนทินิว เรสทิง อิน ดิส สทิลเนส อันทิล ดิ เอนด์ ออฟ เดอะ เมดิเทเชิน เซสเชิน พลีซ คอนทินิว ทู เมดิเทท อิน ไซเลินซ์',pause:true },
  ],
}

export const nisitGuidingScripts: GuidingScript[] = [basic, relaxation]
