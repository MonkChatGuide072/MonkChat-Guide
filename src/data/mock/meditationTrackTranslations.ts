import type { MeditationTrackTranslation } from '../../types/content'

/**
 * Mock Meditation Track Translations
 * Language-scalable structure providing Thai and English translations for 3 demo tracks.
 */
export const mockMeditationTrackTranslations: MeditationTrackTranslation[] = [
  // Track 1 - Thai
  {
    id: 'mtt-001-th',
    track_id: 'track-demo-001',
    language_code: 'th',
    title: 'การทำสมาธิเบื้องต้น 5 นาที (ตัวอย่าง)',
    description: 'คำแนะนำการฝึกวางใจที่ศูนย์กลางกายเบื้องต้นสำหรับผู้เริ่มต้น (เนื้อหาตัวอย่าง)',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
  // Track 1 - English
  {
    id: 'mtt-001-en',
    track_id: 'track-demo-001',
    language_code: 'en',
    title: '5-Minute Beginner Meditation (Demo)',
    description: 'Introductory guidance on placing the mind at the center of the body for beginners (demo content).',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
  // Track 2 - Thai
  {
    id: 'mtt-002-th',
    track_id: 'track-demo-002',
    language_code: 'th',
    title: 'การผ่อนคลายร่างกายและจิตใจ 10 นาที (ตัวอย่าง)',
    description: 'ฝึกผ่อนคลายกล้ามเนื้อทุกส่วนและน้อมใจให้สงบนิ่งเป็นสุข (เนื้อหาตัวอย่าง)',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
  // Track 2 - English
  {
    id: 'mtt-002-en',
    track_id: 'track-demo-002',
    language_code: 'en',
    title: '10-Minute Body & Mind Relaxation (Demo)',
    description: 'Relax all muscles and bring peace and gentle stillness to the mind (demo content).',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
  // Track 3 - Thai
  {
    id: 'mtt-003-th',
    track_id: 'track-demo-003',
    language_code: 'th',
    title: 'สมาธิเพื่อความสงบภายใน 15 นาที (ตัวอย่าง)',
    description: 'การประคองใจอย่างต่อเนื่องเพื่อเข้าถึงความสุขและความสงบภายใน (เนื้อหาตัวอย่าง)',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
  // Track 3 - English
  {
    id: 'mtt-003-en',
    track_id: 'track-demo-003',
    language_code: 'en',
    title: '15-Minute Inner Peace Meditation (Demo)',
    description: 'Continuous gentle mindfulness leading toward deep inner peace and clarity (demo content).',
    transcript: null,
    subtitle_vtt_storage_path: null,
  },
]
