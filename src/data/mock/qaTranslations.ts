import type { QATranslation } from '../../types/content'

/**
 * Mock Q&A Translations
 *
 * Safety & Respect Rules:
 * - Does not include real or unverified doctrinal answers.
 * - Placeholder wording explicitly indicates that verified answers are pending.
 */
export const mockQATranslations: QATranslation[] = [
  // Item 1 - Thai
  {
    id: 'qat-001-th',
    qa_item_id: 'qa-demo-001',
    language_code: 'th',
    question: '[คำถามตัวอย่าง 1] เริ่มต้นฝึกสมาธิอย่างไรให้ใจสงบ?',
    short_answer: 'รอเนื้อหาที่ผ่านการตรวจสอบจากพระอาจารย์',
    detailed_answer: 'เนื้อหาคำตอบฉบับสมบูรณ์อยู่ระหว่างการตรวจสอบและรับรองความถูกต้องโดยพระอาจารย์ผู้ทรงคุณวุฒิ',
  },
  // Item 1 - English
  {
    id: 'qat-001-en',
    qa_item_id: 'qa-demo-001',
    language_code: 'en',
    question: '[Demo Question 1] How to start meditation practice peacefully?',
    short_answer: 'Awaiting verified content from the teaching monk.',
    detailed_answer: 'The complete answer is currently awaiting official verification and approval by qualified teaching monks.',
  },
  // Item 2 - Thai
  {
    id: 'qat-002-th',
    qa_item_id: 'qa-demo-002',
    language_code: 'th',
    question: '[คำถามตัวอย่าง 2] ทำอย่างไรเมื่อมีความคิดฟุ้งซ่านขณะนั่งสมาธิ?',
    short_answer: 'รอเนื้อหาที่ผ่านการตรวจสอบจากพระอาจารย์',
    detailed_answer: 'เนื้อหาคำตอบฉบับสมบูรณ์อยู่ระหว่างการตรวจสอบและรับรองความถูกต้องโดยพระอาจารย์ผู้ทรงคุณวุฒิ',
  },
  // Item 2 - English
  {
    id: 'qat-002-en',
    qa_item_id: 'qa-demo-002',
    language_code: 'en',
    question: '[Demo Question 2] What should I do if wandering thoughts occur during meditation?',
    short_answer: 'Awaiting verified content from the teaching monk.',
    detailed_answer: 'The complete answer is currently awaiting official verification and approval by qualified teaching monks.',
  },
  // Item 3 - Thai
  {
    id: 'qat-003-th',
    qa_item_id: 'qa-demo-003',
    language_code: 'th',
    question: '[คำถามตัวอย่าง 3] ประโยชน์ของการฝึกสมาธิในชีวิตประจำวันมีอะไรบ้าง?',
    short_answer: 'รอเนื้อหาที่ผ่านการตรวจสอบจากพระอาจารย์',
    detailed_answer: 'เนื้อหาคำตอบฉบับสมบูรณ์อยู่ระหว่างการตรวจสอบและรับรองความถูกต้องโดยพระอาจารย์ผู้ทรงคุณวุฒิ',
  },
  // Item 3 - English
  {
    id: 'qat-003-en',
    qa_item_id: 'qa-demo-003',
    language_code: 'en',
    question: '[Demo Question 3] What are the benefits of daily meditation practice?',
    short_answer: 'Awaiting verified content from the teaching monk.',
    detailed_answer: 'The complete answer is currently awaiting official verification and approval by qualified teaching monks.',
  },
  // Item 4 - Thai
  {
    id: 'qat-004-th',
    qa_item_id: 'qa-demo-004',
    language_code: 'th',
    question: '[คำถามตัวอย่าง 4] หลักการฝึกสติเบื้องต้นในพระพุทธศาสนาคืออะไร?',
    short_answer: 'รอเนื้อหาที่ผ่านการตรวจสอบจากพระอาจารย์',
    detailed_answer: 'เนื้อหาคำตอบฉบับสมบูรณ์อยู่ระหว่างการตรวจสอบและรับรองความถูกต้องโดยพระอาจารย์ผู้ทรงคุณวุฒิ',
  },
  // Item 4 - English
  {
    id: 'qat-004-en',
    qa_item_id: 'qa-demo-004',
    language_code: 'en',
    question: '[Demo Question 4] What is the basic principle of mindfulness in Buddhism?',
    short_answer: 'Awaiting verified content from the teaching monk.',
    detailed_answer: 'The complete answer is currently awaiting official verification and approval by qualified teaching monks.',
  },
  // Item 5 - Thai
  {
    id: 'qat-005-th',
    qa_item_id: 'qa-demo-005',
    language_code: 'th',
    question: '[คำถามตัวอย่าง 5] กิจกรรม Monk Chat มีขั้นตอนการเข้าร่วมอย่างไร?',
    short_answer: 'รอเนื้อหาที่ผ่านการตรวจสอบจากทีมงาน',
    detailed_answer: 'เนื้อหาคำแนะนำการเข้าร่วมกิจกรรมอยู่ระหว่างการจัดเตรียมและตรวจสอบโดยทีมงาน Monk Chat',
  },
  // Item 5 - English
  {
    id: 'qat-005-en',
    qa_item_id: 'qa-demo-005',
    language_code: 'en',
    question: '[Demo Question 5] How can visitors participate in Monk Chat activities?',
    short_answer: 'Awaiting verified content from the team.',
    detailed_answer: 'Activity participation details are currently being finalized and verified by the Monk Chat team.',
  },
]
