import type { UsageEvent } from '../../types/content'

/**
 * Mock Usage Events
 *
 * Privacy & Analytics Rules:
 * - Empty typed initial collection.
 * - Anonymous usage events only (audio_play, audio_complete, bio_link_click).
 * - No user identifiers, names, emails, IP addresses, or device fingerprints.
 */
export const mockUsageEvents: UsageEvent[] = []
