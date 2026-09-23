import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { MemoryRouter, useNavigate } from 'react-router'
import th from '../locales/th/common.json'
import en from '../locales/en/common.json'
import { MeditationPage } from './MeditationPage'
import { QAPage } from './QAPage'
import { CentersPage } from './CentersPage'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  signed: vi.fn(),
  download: vi.fn(),
  analytics: vi.fn(async () => {}),
  filters: [] as Array<[string, string, unknown]>,
  selects: [] as string[],
  rows: {} as Record<string, unknown[]>,
  failures: new Set<string>(),
}))
vi.mock('../lib/supabase', () => ({
  supabaseClient: {
    from: mocks.from,
    storage: { from: () => ({ createSignedUrl: mocks.signed, download: mocks.download }) },
  },
}))
vi.mock('../lib/analytics', () => ({ trackUsageEvent: mocks.analytics }))
vi.mock('../lib/bioLinkImages', () => ({ getBioLinkImageUrl: () => null }))

const i18n = createInstance()
await i18n.use(initReactI18next).init({ lng: 'en', fallbackLng: 'th', resources: { th: { translation: th }, en: { translation: en } }, interpolation: { escapeValue: false } })

function HistoryControls() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>Browser back</button>
}

function openPage(page: React.ReactNode, path: string) {
  return render(<I18nextProvider i18n={i18n}><MemoryRouter initialEntries={[path]}><HistoryControls />{page}</MemoryRouter></I18nextProvider>)
}

const translation = (language_code: string, title: string, subtitle_vtt_storage_path: string | null = 'captions.vtt') => ({
  language_code, title, description: `${title} description`, transcript: `${title} transcript`, subtitle_vtt_storage_path,
})

beforeEach(async () => {
  vi.clearAllMocks()
  await i18n.changeLanguage('en')
  mocks.rows = {}
  mocks.filters = []
  mocks.selects = []
  mocks.failures.clear()
  mocks.from.mockImplementation((table: string) => {
    const builder = {
      select: (columns: string) => { mocks.selects.push(columns); return builder },
      eq: (column: string, value: unknown) => { mocks.filters.push([table, column, value]); return builder },
      order: async () => ({ data: mocks.rows[table] ?? [], error: mocks.failures.has(table) ? new Error('Unavailable') : null }),
    }
    return builder
  })
  mocks.signed.mockImplementation(async (path: string) => ({ data: { signedUrl: `https://example.org/${path}` }, error: null }))
  mocks.download.mockResolvedValue({ data: { text: async () => 'WEBVTT\n\n00:01.000 --> 00:03.000\nFirst caption\n\n00:03.000 --> 00:06.000\nSecond caption' }, error: null })
})
afterEach(cleanup)

describe('Meditation flow', () => {
  beforeEach(() => {
    mocks.rows.meditation_tracks = [
      { id: 'a', audio_storage_path: 'a.mp3', duration_seconds: 120, source_language_code: 'en', meditation_track_translations: [translation('en', 'Track A'), translation('th', 'เสียง ก')] },
      { id: 'b', audio_storage_path: 'b.mp3', duration_seconds: 180, source_language_code: 'th', meditation_track_translations: [translation('en', 'Track B')] },
    ]
  })

  it('opens the linked track, changes tracks and restores selection on browser back', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=b')
    const audioB = await screen.findByLabelText('Meditation Audio Player: Track B')
    expect(audioB).toHaveAttribute('src', 'https://example.org/b.mp3')
    expect(mocks.selects.some(value => value.includes('source_language_code'))).toBe(true)
    expect(mocks.filters).toContainEqual(['meditation_tracks', 'content_status', 'published'])
    expect(mocks.filters).toContainEqual(['meditation_tracks', 'is_published', true])
    fireEvent.click(screen.getByRole('button', { name: /Track A/ }))
    expect(await screen.findByLabelText('Meditation Audio Player: Track A')).toHaveAttribute('src', 'https://example.org/a.mp3')
    fireEvent.click(screen.getByRole('button', { name: 'Browser back' }))
    expect(await screen.findByLabelText('Meditation Audio Player: Track B')).toHaveAttribute('src', 'https://example.org/b.mp3')
  })

  it('updates captions on playback and seeking, then clears old language content', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=a')
    const audio = await screen.findByLabelText('Meditation Audio Player: Track A')
    await screen.findByText('View all captions with timestamps')
    fireEvent.timeUpdate(audio, { target: { currentTime: 2 } })
    expect(screen.getByLabelText('Current caption')).toHaveTextContent('First caption')
    fireEvent.seeked(audio, { target: { currentTime: 4 } })
    expect(screen.getByLabelText('Current caption')).toHaveTextContent('Second caption')
    fireEvent.seeked(audio, { target: { currentTime: 8 } })
    expect(screen.getByLabelText('Current caption')).toHaveTextContent('Captions will appear')
    await act(async () => { await i18n.changeLanguage('th') })
    expect(await screen.findByLabelText('ตัวเล่นเสียงนำสมาธิ: เสียง ก')).toBeInTheDocument()
    expect(screen.queryByText('Track A transcript')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Track B/ })).not.toBeInTheDocument()
  })

  it('keeps audio available when subtitles fail and allows a subtitle-only retry', async () => {
    mocks.download.mockResolvedValueOnce({ data: null, error: new Error('Unavailable') })
    openPage(<MeditationPage />, '/meditation?trackId=a')
    expect(await screen.findByLabelText('Meditation Audio Player: Track A')).toBeInTheDocument()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Captions could not be loaded')
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    await screen.findByText('View all captions with timestamps')
    expect(mocks.signed).toHaveBeenCalledTimes(1)
  })

  it('reports playback errors and retries the signed audio URL without losing transcript', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=a')
    fireEvent.error(await screen.findByLabelText('Meditation Audio Player: Track A'))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Failed to load audio')
    expect(screen.getByText('Track A transcript')).toBeInTheDocument()
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByLabelText('Meditation Audio Player: Track A')).toBeInTheDocument()
    expect(mocks.signed).toHaveBeenCalledTimes(2)
  })

  it('does not reuse late audio responses after switching tracks', async () => {
    let finishFirst!: (value: unknown) => void
    mocks.signed.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve }))
    openPage(<MeditationPage />, '/meditation?trackId=a')
    fireEvent.click(await screen.findByRole('button', { name: /Track B/ }))
    expect(await screen.findByLabelText('Meditation Audio Player: Track B')).toHaveAttribute('src', 'https://example.org/b.mp3')
    await act(async () => { finishFirst({ data: { signedUrl: 'https://example.org/a.mp3' }, error: null }) })
    expect(screen.getByLabelText('Meditation Audio Player: Track B')).toHaveAttribute('src', 'https://example.org/b.mp3')
  })
})

describe('Q&A and centers', () => {
  it('queries only verified published Q&A and searches the selected translation', async () => {
    mocks.rows.qa_items = [
      { id: 'qa-1', category: 'Example', source_reference: 'Test fixture', qa_translations: [{ language_code: 'en', question: 'Sample question', short_answer: 'Sample answer', detailed_answer: 'Extended explanation' }, { language_code: 'th', question: 'คำถามตัวอย่าง', short_answer: 'คำตอบตัวอย่าง' }] },
      { id: 'qa-2', category: 'Example', qa_translations: [{ language_code: 'th', question: 'เฉพาะภาษาไทย', short_answer: 'ตัวอย่าง' }] },
    ]
    openPage(<QAPage />, '/qa')
    expect(await screen.findByText('Sample question')).toBeInTheDocument()
    expect(mocks.filters).toEqual(expect.arrayContaining([
      ['qa_items', 'content_status', 'published'], ['qa_items', 'verification_status', 'verified'], ['qa_items', 'is_published', true],
    ]))
    expect(screen.queryByText('เฉพาะภาษาไทย')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Search questions...'), { target: { value: 'no match' } })
    expect(screen.getByText('No questions matched your search term.')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear search' })[0])
    expect(screen.getByText('Sample question')).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('th') })
    expect(await screen.findByText('คำถามตัวอย่าง')).toBeInTheDocument()
    expect(screen.queryByText('Sample question')).not.toBeInTheDocument()
  })

  it('keeps center details when Bio Links fail and omits unsafe contact URLs', async () => {
    mocks.rows.dci_centers = [{ id: 'center-1', country_code: 'TH', city: 'Example city', address: 'Example address', map_url: 'https://example.org/map', website_url: 'javascript:alert(1)', contact_url: 'data:text/html,example', dci_center_translations: [{ language_code: 'en', name: 'Example center', description: 'Test fixture' }] }]
    mocks.failures.add('bio_links')
    openPage(<CentersPage />, '/centers')
    expect(await screen.findByText('Example center')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute('href', 'https://example.org/map')
    expect(screen.queryByRole('link', { name: 'Website' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load links')
    expect(screen.getByRole('link', { name: 'Back to visitor home' })).toHaveAttribute('href', '/visit')
    mocks.failures.clear()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
