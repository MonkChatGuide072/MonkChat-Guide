import type { MeditationTrack } from '../../types/content'

/**
 * Mock Meditation Tracks
 * 3 demonstration records with null audio references while real files are pending.
 */
export const mockMeditationTracks: MeditationTrack[] = [
  {
    id: 'track-demo-001',
    audio_storage_path: null,
    source_language_code: 'th',
    speaker_name: 'พระอาจารย์ผู้สอน (Demonstration)',
    duration_seconds: 300, // 5 minutes
    content_status: 'published',
    is_published: true,
    archived_at: null,
    created_by: 'owner-001',
    updated_by: 'owner-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'track-demo-002',
    audio_storage_path: null,
    source_language_code: 'th',
    speaker_name: 'พระอาจารย์ผู้สอน (Demonstration)',
    duration_seconds: 600, // 10 minutes
    content_status: 'published',
    is_published: true,
    archived_at: null,
    created_by: 'owner-001',
    updated_by: 'owner-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'track-demo-003',
    audio_storage_path: null,
    source_language_code: 'th',
    speaker_name: 'พระอาจารย์ผู้สอน (Demonstration)',
    duration_seconds: 900, // 15 minutes
    content_status: 'published',
    is_published: true,
    archived_at: null,
    created_by: 'owner-001',
    updated_by: 'owner-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
]
