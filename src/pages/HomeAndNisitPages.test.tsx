import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import th from '../locales/th/common.json'
import en from '../locales/en/common.json'
import { HomeOverviewPage } from './HomeOverviewPage'
import { VisitPage } from './VisitPage'
import { NisitPracticePage } from './NisitPracticePage'
import { parseNisitStudentId, parseSafeYouTubeEmbedUrl } from '../content/nisitPractice'
import { VISITOR_LANGUAGE_SESSION_KEY } from '../lib/language'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  signed: vi.fn(),
  download: vi.fn(),
  filters: [] as Array<[string, string, unknown]>,
  rows: {} as Record<string, unknown[]>,
}))

vi.mock('../lib/supabase', () => ({
  supabaseClient: {
    from: mocks.from,
    storage: {
      from: () => ({
        createSignedUrl: mocks.signed,
        download: mocks.download,
      }),
    },
  },
}))

vi.mock('../lib/analytics', () => ({ trackUsageEvent: vi.fn(async () => {}) }))
vi.mock('../lib/bioLinkImages', () => ({ getBioLinkImageUrl: () => null }))

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'th',
  resources: { th: { translation: th }, en: { translation: en } },
  interpolation: { escapeValue: false },
})

function renderWithRouter(ui: React.ReactNode) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{ui}</MemoryRouter>
    </I18nextProvider>,
  )
}

describe('nisitPractice helpers', () => {
  it('validates 7-digit student monk IDs between 4011001 and 6911060', () => {
    expect(parseNisitStudentId('6611018')).toEqual({
      valid: true,
      code: '6611018',
      thaiYear: '66',
      statusCode: '110',
      seatNumber: 18,
    })
    expect(parseNisitStudentId('4011001')?.valid).toBe(true)
    expect(parseNisitStudentId('6911060')?.valid).toBe(true)

    expect(parseNisitStudentId('661018')).toBeNull()
    expect(parseNisitStudentId('6611061')).toBeNull()
    expect(parseNisitStudentId('6611000')).toBeNull()
    expect(parseNisitStudentId('7011001')).toBeNull()
    expect(parseNisitStudentId('6612018')).toBeNull()
  })

  it('allows only HTTPS YouTube URLs for class video embedding', () => {
    expect(parseSafeYouTubeEmbedUrl('https://www.youtube.com/watch?v=F-0V8aYV1rQ')).toBe(
      'https://www.youtube-nocookie.com/embed/F-0V8aYV1rQ',
    )
    expect(parseSafeYouTubeEmbedUrl('https://youtu.be/F-0V8aYV1rQ')).toBe(
      'https://www.youtube-nocookie.com/embed/F-0V8aYV1rQ',
    )
    expect(parseSafeYouTubeEmbedUrl('http://youtube.com/watch?v=F-0V8aYV1rQ')).toBeNull()
    expect(parseSafeYouTubeEmbedUrl('javascript:alert(1)')).toBeNull()
    expect(parseSafeYouTubeEmbedUrl('https://evil.example/F-0V8aYV1rQ')).toBeNull()
  })
})

describe('Phase 1 Home, Visit and Nisit routes', () => {
  const createMemoryStorage = () => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, String(value))
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size
      },
    }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', createMemoryStorage())
    sessionStorage.clear()
    await i18n.changeLanguage('en')
    mocks.rows = {
      meditation_tracks: [
        {
          id: 'track-1',
          audio_storage_path: 'guided.mp3',
          speaker_name: 'MCU Instructor',
          duration_seconds: 326,
          source_language_code: 'en',
          meditation_track_translations: [
            {
              language_code: 'en',
              title: '5-Minute Guided Meditation',
              description: 'Introductory English track',
              transcript: 'It is time to take a mental coffee break.',
              subtitle_vtt_storage_path: 'en.vtt',
            },
          ],
        },
      ],
      bio_links: [],
      qa_items: [
        {
          id: 'qa-1',
          category: 'Meditation',
          qa_translations: [
            {
              language_code: 'en',
              question: 'Why do monks close their eyes gently?',
              short_answer: 'Closing the eyes softly helps rest visual distraction without strain.',
              detailed_answer: null,
            },
            {
              language_code: 'th',
              question: 'ทำไมจึงแนะนำให้หลับตาเบา ๆ',
              short_answer: 'เพื่อพักการรับรู้ทางสายตาและให้ใจรวมอย่างสบายไม่ตึงเครียด',
              detailed_answer: null,
            },
          ],
        },
      ],
    }
    mocks.filters = []
    mocks.from.mockImplementation((table: string) => {
      const builder = {
        select: () => builder,
        eq: (column: string, value: unknown) => {
          mocks.filters.push([table, column, value])
          return builder
        },
        order: async () => ({ data: mocks.rows[table] ?? [], error: null }),
      }
      return builder
    })
    mocks.signed.mockResolvedValue({ data: { signedUrl: 'https://example.org/guided.mp3' }, error: null })
    mocks.download.mockResolvedValue({
      data: {
        text: async () =>
          'WEBVTT\n\n00:00.000 --> 00:08.000\nIt is time to take a mental coffee break.\n\n00:08.000 --> 00:15.000\nLet us adjust sitting posture.',
      },
      error: null,
    })
  })

  afterEach(cleanup)

  it('HomeOverviewPage displays language gate first, then clear /visit and /nisit gateways', async () => {
    renderWithRouter(<HomeOverviewPage />)
    expect(screen.getByRole('heading', { name: /เลือกภาษา \/ Choose language/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(await screen.findByRole('heading', { name: 'Choose your space' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Enter Visitor Guide/i })).toHaveAttribute('href', '/visit')
    expect(screen.getByRole('link', { name: /Open Student Training/i })).toHaveAttribute('href', '/nisit')
  })

  it('VisitPage renders visitor atmosphere, 3 gentle meditation cards and verified practice places', async () => {
    sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, 'en')
    renderWithRouter(<VisitPage />)

    expect(await screen.findByRole('heading', { name: 'Atmosphere & surroundings' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How to start in three gentle steps' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sit comfortably' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Close your eyes gently' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Breathe slowly' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit center website/i })).toHaveAttribute(
      'href',
      'https://ayothayameditation.com/',
    )
  })

  it('NisitPracticePage supports student profile validation and all 5 learning modules', async () => {
    renderWithRouter(<NisitPracticePage />)
    expect(screen.getByRole('heading', { name: 'Ayutthaya Monk Chat Practice Hub' })).toBeInTheDocument()

    // Student ID validation
    fireEvent.click(screen.getByRole('button', { name: 'Enter ID & Name' }))
    fireEvent.change(screen.getByLabelText(/7-digit Student ID/i), { target: { value: '661018' } })
    fireEvent.change(screen.getByLabelText(/Name & Dharma Name/i), { target: { value: 'Phra Somchai' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save on this device' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/4011001–6911060/)

    fireEvent.change(screen.getByLabelText(/7-digit Student ID/i), { target: { value: '6611018' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save on this device' }))
    expect(screen.getByText(/Cohort Year 66 · Code 110 · Seat 18/)).toBeInTheDocument()

    // Tab 1: Vocab cards
    const practiceBtns = screen.getAllByRole('button', { name: 'Mark practiced' })
    fireEvent.click(practiceBtns[0])
    expect(screen.getByText('1 / 7')).toBeInTheDocument()

    // Tab 2: Synchronized Audio & Live Script
    fireEvent.click(screen.getByRole('tab', { name: /Audio & Script/i }))
    expect(await screen.findByLabelText('Student audio player: 5-Minute Guided Meditation')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Let us adjust sitting posture.')).toBeInTheDocument())

    // Tab 3: Listening Videos with safe YouTube check
    fireEvent.click(screen.getByRole('tab', { name: /Listening Videos/i }))
    fireEvent.change(screen.getByLabelText('YouTube video URL'), { target: { value: 'https://evil.example/video' } })
    fireEvent.click(screen.getByRole('button', { name: 'Load video' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/valid https:\/\/youtube\.com/i)
    fireEvent.change(screen.getByLabelText('YouTube video URL'), {
      target: { value: 'https://www.youtube.com/watch?v=F-0V8aYV1rQ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load video' }))
    expect(screen.getByTitle('Student meditation listening practice video')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/F-0V8aYV1rQ',
    )

    // Tab 4: Verified Q&A Flashcards
    fireEvent.click(screen.getByRole('tab', { name: /Q&A Flashcards/i }))
    expect(await screen.findByRole('heading', { name: 'Why do monks close their eyes gently?' })).toBeInTheDocument()
    expect(mocks.filters).toContainEqual(['qa_items', 'verification_status', 'verified'])
    expect(mocks.filters).toContainEqual(['qa_items', 'is_published', true])
    fireEvent.click(screen.getByRole('button', { name: 'Reveal verified answer' }))
    expect(
      screen.getByText('Closing the eyes softly helps rest visual distraction without strain.'),
    ).toBeInTheDocument()

    // Tab 5: Local Visitor Notes & Thank-You Card (Zero DB writes)
    fireEvent.click(screen.getByRole('tab', { name: /Notes & Card/i }))
    fireEvent.change(screen.getByLabelText('Visitor name'), { target: { value: 'Elena' } })
    fireEvent.change(screen.getByLabelText(/Country or conversation note/i), { target: { value: 'Spain' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add to local list' }))
    expect(screen.getByText('Today’s notes (1)')).toBeInTheDocument()
    expect(screen.getByLabelText('Thank-You Card preview')).toHaveTextContent('Elena')
    expect(screen.getByLabelText('Thank-You Card preview')).toHaveTextContent('Guided by Phra Somchai (6611018)')

    fireEvent.click(screen.getByRole('button', { name: 'Clear device notes' }))
    expect(screen.getByText('Today’s notes (0)')).toBeInTheDocument()
  })
})
