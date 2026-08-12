import type { SubtitleCue } from '../../types/content'

/**
 * Mock Subtitles
 * Minimal demonstration subtitle cues with structurally valid timestamps.
 * Does not claim synchronization with unreleased real audio.
 */
export const mockSubtitles: SubtitleCue[] = [
  // Demo Track 1 - Thai
  {
    id: 'sub-001-th-1',
    track_id: 'track-demo-001',
    language_code: 'th',
    start_time: 0,
    end_time: 5,
    text: 'ยินดีต้อนรับสู่การปฏิบัติสมาธิเบื้องต้น (ตัวอย่าง)',
  },
  {
    id: 'sub-001-th-2',
    track_id: 'track-demo-001',
    language_code: 'th',
    start_time: 5,
    end_time: 10,
    text: 'ผ่อนคลายร่างกายและจิตใจอย่างสบายๆ (ตัวอย่าง)',
  },
  // Demo Track 1 - English
  {
    id: 'sub-001-en-1',
    track_id: 'track-demo-001',
    language_code: 'en',
    start_time: 0,
    end_time: 5,
    text: 'Welcome to introductory meditation guidance (Demo).',
  },
  {
    id: 'sub-001-en-2',
    track_id: 'track-demo-001',
    language_code: 'en',
    start_time: 5,
    end_time: 10,
    text: 'Relax your body and mind comfortably (Demo).',
  },
]
