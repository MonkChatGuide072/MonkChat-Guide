import type { QAItem } from '../../types/content'

/**
 * Mock Q&A Items (Language Independent Core)
 *
 * Safety & Verification Requirements:
 * - Content workflow status is strictly draft (`content_status: 'draft'`).
 * - Verification status is strictly unverified (`verification_status: 'unverified'`).
 * - Publication status is strictly false (`is_published: false`).
 * - `verified_by`, `verified_at`, and `source_reference` remain null.
 * - Real Buddhist teachings must only be added after explicit Owner verification.
 */
export const mockQAItems: QAItem[] = [
  {
    id: 'qa-demo-001',
    category: 'meditation_basics',
    source_reference: null,
    content_status: 'draft',
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    is_published: false,
    archived_at: null,
    created_by: 'team-001',
    updated_by: 'team-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'qa-demo-002',
    category: 'meditation_basics',
    source_reference: null,
    content_status: 'draft',
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    is_published: false,
    archived_at: null,
    created_by: 'team-001',
    updated_by: 'team-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'qa-demo-003',
    category: 'daily_life',
    source_reference: null,
    content_status: 'draft',
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    is_published: false,
    archived_at: null,
    created_by: 'team-001',
    updated_by: 'team-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'qa-demo-004',
    category: 'buddhist_concepts',
    source_reference: null,
    content_status: 'draft',
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    is_published: false,
    archived_at: null,
    created_by: 'team-001',
    updated_by: 'team-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
  {
    id: 'qa-demo-005',
    category: 'monk_chat_activity',
    source_reference: null,
    content_status: 'draft',
    verification_status: 'unverified',
    verified_by: null,
    verified_at: null,
    is_published: false,
    archived_at: null,
    created_by: 'team-001',
    updated_by: 'team-001',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
  },
]
