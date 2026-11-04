import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AdminQAPage } from './AdminQAPage'

const mocks = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ profile: { role: 'team_member' } }) }))
vi.mock('../../lib/supabase', () => ({ supabaseClient: { from: mocks.from } }))

describe('team Q&A source reference', () => {
  it('keeps the complete reference visible in the protected management list', async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        order: async () => ({
          data: [{
            id: 'qa-1', category: 'Meditation', source_reference: 'Reviewed guide',
            content_status: 'published', verification_status: 'verified',
            verified_by: 'reviewer', verified_at: null, is_published: true,
            created_at: '2026-10-25T00:00:00Z', updated_at: '2026-10-25T00:00:00Z',
            qa_translations: [{ language_code: 'en', question: 'What is meditation?' }],
          }], error: null,
        }),
      }),
    })

    render(<MemoryRouter><AdminQAPage /></MemoryRouter>)
    expect(await screen.findAllByText('Reviewed guide')).toHaveLength(2)
    expect(mocks.from).toHaveBeenCalledWith('qa_items')
  })
})
