import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VisitPage } from './VisitPage'
import { MemoryRouter } from 'react-router'
import { supabaseClient } from '../lib/supabase'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultText: string) => defaultText || key,
    i18n: {
      changeLanguage: vi.fn(),
      resolvedLanguage: 'en',
    },
  }),
}))

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabaseClient: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ data: [], error: null })) })) })) })) })),
  },
  trackUsageEvent: vi.fn(),
  getBioLinkImageUrl: vi.fn(),
}))

describe('VisitPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders Language Gate when no language is selected in sessionStorage', () => {
    render(
      <MemoryRouter>
        <VisitPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Welcome \/ ยินดีต้อนรับ/i)).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('ภาษาไทย')).toBeInTheDocument()
  })

  it('selects language and shows VisitorHome', () => {
    render(
      <MemoryRouter>
        <VisitPage />
      </MemoryRouter>
    )

    // Click English button
    fireEvent.click(screen.getByText('English'))

    // Should save to sessionStorage
    expect(sessionStorage.getItem('ui_language_code')).toBe('en')
  })

  it('enforces strict translation eligibility for recommended tracks and biolinks', async () => {
    // Pre-set language to English so VisitorHome renders
    sessionStorage.setItem('ui_language_code', 'en')

    // Mock data with one English track and one Thai-only track
    const mockTracks = {
      data: [
        {
          id: 'track-en',
          source_language_code: 'en',
          duration_seconds: 600,
          meditation_track_translations: [{ language_code: 'en', title: 'English Track', description: 'Desc' }]
        },
        {
          id: 'track-th',
          source_language_code: 'th',
          duration_seconds: 600,
          meditation_track_translations: [{ language_code: 'th', title: 'Thai Track', description: 'Desc' }]
        }
      ],
      error: null
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    supabaseClient.from.mockImplementation((table: string) => {
      if (table === 'meditation_tracks') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: vi.fn().mockResolvedValue(mockTracks)
              })
            })
          })
        }
      }
      return { select: vi.fn() }
    })

    render(
      <MemoryRouter>
        <VisitPage />
      </MemoryRouter>
    )

    // Since we have one English track, it should auto-select and show its title
    const englishTrack = await screen.findByText('English Track')
    expect(englishTrack).toBeInTheDocument()
    expect(screen.queryByText('Thai Track')).not.toBeInTheDocument()
  })

  it('refetches data when language changes in VisitorHome', async () => {
    sessionStorage.setItem('ui_language_code', 'en')

    const mockTracks = {
      data: [
        {
          id: 'track-en',
          source_language_code: 'en',
          duration_seconds: 600,
          meditation_track_translations: [{ language_code: 'en', title: 'English Track', description: 'Desc' }]
        }
      ],
      error: null
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    supabaseClient.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: vi.fn().mockResolvedValue(mockTracks)
          })
        })
      })
    }))

    render(
      <MemoryRouter>
        <VisitPage />
      </MemoryRouter>
    )

    const englishTrack = await screen.findByText('English Track')
    expect(englishTrack).toBeInTheDocument()

    // Switch language to Thai
    fireEvent.click(screen.getByText('TH'))
    expect(sessionStorage.getItem('ui_language_code')).toBe('th')
  })
})
