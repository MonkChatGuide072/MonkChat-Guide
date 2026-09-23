import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { VisitPage } from './VisitPage'
import { VISITOR_LANGUAGE_SESSION_KEY } from '../lib/language'

type LanguageListener = (language: string) => void

const languageListeners = vi.hoisted(() => new Set<LanguageListener>())
const fakeI18n = vi.hoisted(() => ({
  language: 'en',
  resolvedLanguage: 'en',
  changeLanguage: vi.fn(async (language: string) => {
    fakeI18n.language = language
    fakeI18n.resolvedLanguage = language
    Array.from(languageListeners).forEach((listener) => listener(language))
  }),
  on: vi.fn((event: string, listener: LanguageListener) => {
    if (event === 'languageChanged') languageListeners.add(listener)
  }),
  off: vi.fn((event: string, listener: LanguageListener) => {
    if (event === 'languageChanged') languageListeners.delete(listener)
  }),
}))
const translate = vi.hoisted(() => vi.fn((key: string, fallback?: string) => fallback ?? key))

const queryResults = vi.hoisted(() => ({
  tracks: { data: [] as unknown[], error: null as Error | null },
  links: { data: [] as unknown[], error: null as Error | null },
}))

const fromMock = vi.hoisted(() => vi.fn((table: string) => {
  if (table === 'meditation_tracks') {
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve(queryResults.tracks),
          }),
        }),
      }),
    }
  }

  if (table === 'bio_links') {
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => Promise.resolve(queryResults.links),
          }),
        }),
      }),
    }
  }

  throw new Error(`Unexpected table: ${table}`)
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: translate,
    i18n: fakeI18n,
  }),
}))

vi.mock('../lib/supabase', () => ({
  supabaseClient: { from: fromMock },
}))

vi.mock('../lib/analytics', () => ({
  trackUsageEvent: vi.fn(),
}))

vi.mock('../lib/bioLinkImages', () => ({
  getBioLinkImageUrl: vi.fn(() => null),
}))

function renderVisitPage() {
  return render(
    <MemoryRouter>
      <VisitPage />
    </MemoryRouter>,
  )
}

describe('VisitPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    languageListeners.clear()
    sessionStorage.clear()
    fakeI18n.language = 'en'
    fakeI18n.resolvedLanguage = 'en'
    queryResults.tracks = { data: [], error: null }
    queryResults.links = { data: [], error: null }
  })

  it('shows the language gate before a visitor chooses a language', () => {
    renderVisitPage()

    expect(screen.getByRole('heading', { name: /เลือกภาษา \/ Choose language/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ภาษาไทย' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('saves the session choice and changes the shared i18n language', async () => {
    renderVisitPage()

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY)).toBe('en')
    expect(fakeI18n.changeLanguage).toHaveBeenCalledWith('en')
    expect(await screen.findByText('visitor.title')).toBeInTheDocument()
  })

  it('shows only tracks and Bio Links that are safe and translated for the active language', async () => {
    sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, 'en')
    queryResults.tracks = {
      data: [
        {
          id: 'track-en',
          source_language_code: 'en',
          duration_seconds: 600,
          meditation_track_translations: [
            { language_code: 'en', title: 'English Track', description: 'Description' },
          ],
        },
        {
          id: 'track-th',
          source_language_code: 'th',
          duration_seconds: 600,
          meditation_track_translations: [
            { language_code: 'th', title: 'Thai Track', description: 'คำอธิบาย' },
          ],
        },
      ],
      error: null,
    }
    queryResults.links = {
      data: [
        {
          id: 'link-en',
          url: 'https://example.com/english',
          display_order: 1,
          image_storage_path: null,
          bio_link_translations: [{ language_code: 'en', title: 'English Link' }],
        },
        {
          id: 'link-th',
          url: 'https://example.com/thai',
          display_order: 2,
          image_storage_path: null,
          bio_link_translations: [{ language_code: 'th', title: 'Thai Link' }],
        },
        {
          id: 'link-unsafe',
          url: 'javascript:alert(1)',
          display_order: 3,
          image_storage_path: null,
          bio_link_translations: [{ language_code: 'en', title: 'Unsafe Link' }],
        },
      ],
      error: null,
    }

    renderVisitPage()

    expect(await screen.findByText('English Track')).toBeInTheDocument()
    expect(screen.queryByText('Thai Track')).not.toBeInTheDocument()
    const englishLink = await screen.findByRole('link', { name: /English Link/i })
    expect(englishLink).toHaveAttribute('href', 'https://example.com/english')
    expect(screen.queryByText('Thai Link')).not.toBeInTheDocument()
    expect(screen.queryByText('Unsafe Link')).not.toBeInTheDocument()
  })

  it('refetches visitor content when the shared language changes', async () => {
    sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, 'en')
    queryResults.tracks = {
      data: [{
        id: 'track-en',
        source_language_code: 'en',
        duration_seconds: 600,
        meditation_track_translations: [
          { language_code: 'en', title: 'English Track', description: 'Description' },
        ],
      }],
      error: null,
    }

    renderVisitPage()
    expect(await screen.findByText('English Track')).toBeInTheDocument()

    queryResults.tracks = {
      data: [{
        id: 'track-th',
        source_language_code: 'th',
        duration_seconds: 480,
        meditation_track_translations: [
          { language_code: 'th', title: 'เสียงภาษาไทย', description: 'คำอธิบาย' },
        ],
      }],
      error: null,
    }

    await act(async () => {
      await fakeI18n.changeLanguage('th')
    })

    expect(await screen.findByText('เสียงภาษาไทย')).toBeInTheDocument()
    expect(screen.queryByText('English Track')).not.toBeInTheDocument()
    expect(fromMock).toHaveBeenCalledWith('bio_links')
  })
})
