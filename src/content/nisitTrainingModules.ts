import type { GuideIconName } from '../components/GuideIcon'

export type NisitTab = 'drills' | 'cockpit' | 'vocab' | 'audio' | 'videos' | 'qa' | 'cards'

interface TrainingModule {
  id: NisitTab
  icon: GuideIconName
  th: string
  en: string
  detailTh: string
  detailEn: string
  descriptionTh: string
  descriptionEn: string
  tipTh: string
  tipEn: string
  group: 'practice' | 'tools'
}

/** Navigation copy only; lesson content, permissions and progress stay in their existing modules. */
export const nisitTrainingModules: TrainingModule[] = [
  {
    id: 'vocab', icon: 'book', th: 'คำศัพท์และประโยค', en: 'Vocab & Cards',
    detailTh: '7 ขั้นตอนนำสมาธิ', detailEn: '7 guiding stages',
    descriptionTh: 'เริ่มจากภาพและความหมาย แล้วลองอ่านประโยคภาษาอังกฤษออกเสียงตาม',
    descriptionEn: 'Connect each visual with its meaning, then practice the English phrases aloud.',
    tipTh: 'ลองอ่านประโยคด้วยตนเองก่อนฟังเสียงตัวอย่าง แล้วทบทวนคำที่ยังไม่คุ้นเคย',
    tipEn: 'Try reading aloud first, then listen and revisit unfamiliar words.', group: 'practice',
  },
  {
    id: 'audio', icon: 'play', th: 'ฟังเสียงและฝึกตามบท', en: 'Audio & Script',
    detailTh: 'ฟัง · หยุด · ฝึกซ้ำ', detailEn: 'Listen · pause · repeat',
    descriptionTh: 'ฟังจังหวะการนำสมาธิและทบทวนบทอ่าน สำหรับเตรียมตัวก่อนกิจกรรม',
    descriptionEn: 'Listen to the pacing and rehearse the guiding script before the activity.',
    tipTh: 'แบ่งฝึกเป็นท่อนสั้น ๆ หยุดเสียง แล้วลองพูดด้วยจังหวะของตนเอง',
    tipEn: 'Practice a short section, pause the audio, and repeat at your own pace.', group: 'practice',
  },
  {
    id: 'qa', icon: 'question', th: 'คลังคำถาม–คำตอบ', en: '200 Q&A Flashcards',
    detailTh: '4 หมวดพุทธธรรม', detailEn: '4 Dhamma topics',
    descriptionTh: 'ลองเรียบเรียงคำตอบก่อนเปิดดูแนวทาง พร้อมทบทวนความหมายภาษาไทย',
    descriptionEn: 'Try forming an answer before revealing the response and its Thai meaning.',
    tipTh: 'คำตอบไม่จำเป็นต้องท่องตรงทุกคำ ลองอธิบายสาระด้วยภาษาที่ตนเองเข้าใจ',
    tipEn: 'Focus on the meaning. Try explaining it in words you understand.', group: 'practice',
  },
  {
    id: 'drills', icon: 'chat', th: 'ซ้อมสถานการณ์จำลอง', en: 'Interactive Drills',
    detailTh: '14 โจทย์สนทนา', detailEn: '14 practice questions',
    descriptionTh: 'ฝึกเลือกคำตอบและเรียงประโยคจากสถานการณ์ พร้อมอ่านคำอธิบายหลังตอบ',
    descriptionEn: 'Choose responses and arrange sentences in scenarios, then review the feedback.',
    tipTh: 'หลังตอบแต่ละข้อ ลองพูดคำตอบออกเสียงอีกครั้งก่อนฝึกข้อต่อไป',
    tipEn: 'After each answer, say the response aloud once before continuing.', group: 'practice',
  },
  {
    id: 'videos', icon: 'globe', th: 'วิดีโอและแหล่งเรียนรู้', en: 'Listening Videos',
    detailTh: 'ฝึกฟังและออกเสียง', detailEn: 'Listening & pronunciation',
    descriptionTh: 'เปิดวิดีโอที่ได้รับคำแนะนำ และเลือกแหล่งเรียนรู้เพื่อทบทวนเพิ่มเติม',
    descriptionEn: 'Open a recommended class video or explore resources for further study.',
    tipTh: 'เลือกช่วงสั้น ๆ ที่ฟังเข้าใจ จดคำสำคัญ แล้วลองพูดตามโดยไม่มองบท',
    tipEn: 'Choose a short section, note the key words, then try repeating without the script.', group: 'practice',
  },
  {
    id: 'cockpit', icon: 'compass', th: 'ชุดประโยคและเครื่องมือ', en: 'On-Site Cockpit',
    detailTh: 'เครื่องมือประกอบกิจกรรม', detailEn: 'Activity tools',
    descriptionTh: 'ทบทวนประโยคและเปิดเครื่องมือประกอบกิจกรรมจากพื้นที่เดียว',
    descriptionEn: 'Review useful phrases and access the existing activity tools in one place.',
    tipTh: 'เลือกทบทวนประโยคที่เกี่ยวข้องกับหน้าที่ของตนก่อนเข้าร่วมกิจกรรม',
    tipEn: 'Review the phrases relevant to your role before joining the activity.', group: 'tools',
  },
  {
    id: 'cards', icon: 'clipboard', th: 'บันทึกและการ์ดขอบคุณ', en: 'Notes & Card',
    detailTh: 'จดจำบทสนทนา', detailEn: 'Notes & remembrance',
    descriptionTh: 'จดข้อมูลที่ต้องการทบทวน และจัดทำการ์ดขอบคุณสำหรับผู้มาเยือน',
    descriptionEn: 'Keep notes for review and prepare a thank-you card for visitors.',
    tipTh: 'รายชื่อและบันทึกในส่วนนี้เก็บบนเครื่องที่ใช้ ควรระวังเมื่อใช้อุปกรณ์ร่วมกัน',
    tipEn: 'These notes stay on this device. Take care when using a shared device.', group: 'tools',
  },
]
