/**
 * MonkChat Guide - Content Models & TypeScript Definitions
 * Aligned with DATABASE_SCHEMA.md (language-scalable pattern).
 *
 * Rules:
 * - Language-scalable schema: core records separated from language translations.
 * - No fixed language columns (e.g. no title_th, title_en).
 * - Stable string IDs suitable for Supabase UUID replacement.
 * - Anonymous usage events without personal identifiable data.
 * - Strict separation of content workflow status ('draft' | 'published' | 'archived')
 *   and Q&A verification status ('unverified' | 'verified').
 */

export type ContentStatus = 'draft' | 'published' | 'archived'
export type VerificationStatus = 'unverified' | 'verified'
export type UserRole = 'owner' | 'team_member'
export type UsageEventType = 'audio_play' | 'audio_complete' | 'bio_link_click'

/**
 * Supported Languages
 */
export interface Language {
  code: string // e.g. 'th', 'en'
  native_name: string
  is_active: boolean
  is_default?: boolean
}

/**
 * Team Profile (Internal only)
 */
export interface Profile {
  id: string
  display_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

/**
 * Core Meditation Track (Language Independent)
 */
export interface MeditationTrack {
  id: string
  audio_storage_path: string | null
  source_language_code: string
  speaker_name: string | null
  duration_seconds: number
  content_status: ContentStatus
  is_published: boolean
  archived_at: string | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

/**
 * Meditation Track Translation
 */
export interface MeditationTrackTranslation {
  id: string
  track_id: string
  language_code: string
  title: string
  description: string
  transcript: string | null
  subtitle_vtt_storage_path: string | null
}

/**
 * Synchronized Subtitle Cue Structure
 */
export interface SubtitleCue {
  id: string
  track_id: string
  language_code: string
  start_time: number // in seconds
  end_time: number   // in seconds
  text: string
}

/**
 * Transcript Record Structure
 */
export interface TranscriptRecord {
  id: string
  track_id: string
  language_code: string
  content: string
  is_placeholder: boolean
}

/**
 * Core Q&A Item (Language Independent)
 *
 * Explicit Status Separation:
 * - `content_status`: 'draft' | 'published' | 'archived'
 * - `verification_status`: 'unverified' | 'verified'
 */
export interface QAItem {
  id: string
  category: string
  source_reference: string | null
  content_status: ContentStatus
  verification_status: VerificationStatus
  verified_by: string | null
  verified_at: string | null
  is_published: boolean
  archived_at: string | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

/**
 * Q&A Translation
 */
export interface QATranslation {
  id: string
  qa_item_id: string
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

/**
 * Core DCI Center (Language Independent)
 */
export interface DCICenter {
  id: string
  country_code: string
  city: string
  address: string
  map_url: string | null
  website_url: string | null
  contact_url: string | null
  content_status: ContentStatus
  is_published: boolean
  archived_at: string | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

/**
 * DCI Center Translation
 */
export interface DCICenterTranslation {
  id: string
  center_id: string
  language_code: string
  name: string
  description: string
}

/**
 * Core BioPage Link (Language Independent)
 */
export interface BioLink {
  id: string
  url: string
  display_order: number
  content_status: ContentStatus
  is_published: boolean
  archived_at: string | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

/**
 * BioPage Link Translation
 */
export interface BioLinkTranslation {
  id: string
  bio_link_id: string
  language_code: string
  title: string
}

/**
 * Anonymous Usage Event
 * Never records IP, user IDs, device IDs, or emails.
 */
export interface UsageEvent {
  id: string
  event_type: UsageEventType
  resource_type: 'meditation_track' | 'bio_link'
  resource_id: string
  created_at: string
}
