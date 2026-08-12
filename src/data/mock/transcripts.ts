import type { TranscriptRecord } from '../../types/content'

/**
 * Mock Transcripts
 * Minimal demonstration placeholder text. Does not represent final real audio transcripts.
 */
export const mockTranscripts: TranscriptRecord[] = [
  {
    id: 'tr-001-th',
    track_id: 'track-demo-001',
    language_code: 'th',
    content: 'เนื้อหาถอดความตัวอย่างสำหรับการทำสมาธิ 5 นาที (รอไฟล์ถอดความจริงที่ผ่านการรับรอง)',
    is_placeholder: true,
  },
  {
    id: 'tr-001-en',
    track_id: 'track-demo-001',
    language_code: 'en',
    content: 'Demonstration transcript for 5-minute meditation (pending final verified transcript).',
    is_placeholder: true,
  },
]
