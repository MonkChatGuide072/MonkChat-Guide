import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { MemoryRouter, useNavigate } from 'react-router'
import th from '../locales/th/common.json'
import en from '../locales/en/common.json'
import { MeditationPage } from './MeditationPage'
import { QAPage } from './QAPage'
import { ChatbotServiceCard } from '../components/ChatbotServiceCard'
import { CentersPage } from './CentersPage'
import { ActivitiesPage } from './ActivitiesPage'

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
vi.mock('../lib/auth', () => ({ useAuth: () => ({ session: null, profile: null, isLoading: false }) }))

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
    expect(screen.queryByText(/Gently close your eyes, if that feels comfortable/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View Full Transcript →' }))
    expect(screen.getByText('Track A transcript', { selector: 'p' })).toBeVisible()
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

  it('supports bounded card navigation and keeps the current preparation card when changing language', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=a')
    const carousel = screen.getByRole('group', { name: 'Swipe cards or use arrow keys' })
    expect(screen.getByRole('button', { name: 'Previous card' })).toBeDisabled()
    fireEvent.keyDown(carousel, { key: 'End' })
    expect(screen.getByRole('heading', { name: 'Imagine a clear crystal ball' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next card' })).toBeDisabled()
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { name: 'Imagine a clear crystal ball' })).toBeInTheDocument()
    fireEvent.keyDown(carousel, { key: 'Home' })
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { name: 'Close your eyes gently' })).toBeInTheDocument()
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { name: 'Breathe slowly' })).toBeInTheDocument()
    expect(screen.getByText('Take a gentle, deep breath in. Slowly breathe out. Repeat a few times.')).toBeInTheDocument()
    expect(within(screen.getByRole('tabpanel')).getByRole('status')).toHaveTextContent('Card 3 of 6')
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'หายใจเข้า–ออกช้า ๆ' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /ก่อนนั่ง/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps seven-base detail optional before audio and preserves transcript access', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=a')
    const guide = screen.getByRole('heading', { name: 'Your meditation guide' })
    const audio = screen.getByRole('heading', { name: 'Meditation audio' })
    expect(guide.compareDocumentPosition(audio) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Back to [Vv]isitor/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Rim of the nostril' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Explore the seven bases' }))
    expect(screen.getByRole('link', { name: 'Read the full guide' })).toHaveAttribute('href', 'https://en.dhammakaya.net/meditation-wisdom/lets-practice/')
    fireEvent.click(screen.getByRole('button', { name: 'Go to base 7' }))
    expect(screen.getByRole('heading', { name: 'The seventh base' })).toBeInTheDocument()
    expect(screen.getByText('Two finger breadths above base 6, inside the abdomen.')).toBeInTheDocument()
    expect(await screen.findByLabelText('Meditation Audio Player: Track A')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View Full Transcript →' }))
    expect(screen.getByText('Track A transcript', { selector: 'p' })).toBeVisible()
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'ศูนย์กลางกายฐานที่ 7' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'อ่านฉบับเต็ม' })).toHaveAttribute('href', 'https://dhammakaya.com/4442')
    fireEvent.click(screen.getByRole('button', { name: 'ซ่อนรายละเอียดฐานทั้ง 7' }))
    expect(screen.queryByRole('heading', { name: 'ศูนย์กลางกายฐานที่ 7' })).not.toBeInTheDocument()
  })

  it('offers a single quiet meditation image and descriptive reflections without interrupting audio', async () => {
    openPage(<MeditationPage />, '/meditation?trackId=a')
    const player = await screen.findByLabelText('Meditation Audio Player: Track A')
    fireEvent.keyDown(screen.getByRole('tab', { name: /Before/ }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /Meditation time/ })).toHaveFocus()
    expect(screen.getByRole('tab', { name: /Meditation time/ })).toHaveAttribute('aria-selected', 'true')
    const during = screen.getByRole('tabpanel')
    expect(within(during).getAllByRole('img')).toHaveLength(1)
    expect(within(during).queryByRole('button', { name: 'Next card' })).not.toBeInTheDocument()
    expect(within(during).getByRole('link', { name: 'Play guided meditation' })).toHaveAttribute('href', '#meditation-audio')
    fireEvent.click(screen.getByRole('tab', { name: /After/ }))
    expect(screen.getByRole('heading', { name: 'How did it feel?' })).toBeInTheDocument()
    expect(screen.getByText(/These are examples, not things you must see or a score of success/)).toBeInTheDocument()
    const titles = ['My mind wandered', 'I tried too hard', 'I felt light and relaxed', 'I pictured a clear ball', 'I felt small', 'I pictured a Buddha within', 'I noticed light', 'Something else, or not sure']
    for (let index = 0; index < titles.length; index++) {
      expect(screen.getByRole('heading', { name: titles[index] })).toBeInTheDocument()
      if (index < titles.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Next card' }))
    }
    expect(screen.getByRole('button', { name: 'Next card' })).toBeDisabled()
    expect(screen.getByLabelText('Meditation Audio Player: Track A')).toBe(player)
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'อย่างอื่น หรือยังไม่แน่ใจ' })).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('tab', { name: /หลังนั่ง/ }), { key: 'Home' })
    expect(screen.getByRole('tab', { name: /ก่อนนั่ง/ })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'นั่งให้สบาย' })).toBeInTheDocument()
  })

})

describe('reviewed chatbot and centers', () => {
  it('limits activity listings to project sessions without an invented end time', async () => {
    openPage(<ActivitiesPage />, '/activities')
    expect(screen.getByRole('heading', { name: 'Monk Chat at Wat Mahathat' })).toBeInTheDocument()
    expect(screen.queryByText(/15:30|Friday Evening Chanting|Heritage Walk|First Sunday/)).not.toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'สนทนาธรรม Monk Chat ณ วัดมหาธาตุ' })).toBeInTheDocument()
    expect(screen.queryByText(/15:30|สวดมนต์ทำวัตรเย็นวันศุกร์|พิธีบุญประจำวันอาทิตย์/)).not.toBeInTheDocument()
  })

  it('keeps the searchable Q&A page and offers a separate service card', async () => {
    mocks.rows.qa_items = [{ id: 'qa-1', category: 'Meditation', source_reference: 'Reviewed guide', qa_translations: [
      { language_code: 'en', question: 'What is meditation?', short_answer: 'A practice of attention.', detailed_answer: null },
      { language_code: 'th', question: 'สมาธิคืออะไร', short_answer: 'การฝึกใจให้ตั้งมั่น', detailed_answer: null },
    ] }]
    openPage(<><QAPage /><ChatbotServiceCard /></>, '/qa')
    expect(await screen.findByRole('heading', { name: 'Meditation & Buddhism Q&A' })).toBeInTheDocument()
    expect(screen.queryByText('Reviewed')).not.toBeInTheDocument()
    expect(mocks.selects.some(value => value.includes('source_reference'))).toBe(false)
    expect(screen.queryByText('Reviewed guide')).not.toBeInTheDocument()
    expect(screen.queryByText(/A simple way to start meditation is to focus on your breath/)).not.toBeInTheDocument()
    const questionToggle = await screen.findByRole('button', { name: /What is meditation/ })
    fireEvent.click(questionToggle)
    await waitFor(() => expect(questionToggle).toHaveAttribute('aria-expanded', 'false'))
    fireEvent.click(questionToggle)
    const search = screen.getByRole('textbox', { name: 'Search questions...' })
    fireEvent.change(search, { target: { value: 'missing phrase' } })
    expect(screen.getByRole('heading', { name: 'No questions matched your search term.' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByRole('heading', { name: 'What is meditation?' })).toBeInTheDocument()
    fireEvent.submit(screen.getByRole('search'))
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Etiquette' }))
    expect(screen.getByRole('heading', { name: 'No questions matched your search term.' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show all questions' }))
    expect(screen.getByRole('heading', { name: 'What is meditation?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask the chatbot' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ask the chatbot' }))
    expect(await screen.findByRole('heading', { name: 'Ask the chatbot' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close chatbot' }))
    expect(screen.getByRole('heading', { name: 'Meditation & Buddhism Q&A' })).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'คำถาม-คำตอบธรรมะและสมาธิ' })).toBeInTheDocument()
    expect(screen.queryByText('ผ่านการตรวจแล้ว')).not.toBeInTheDocument()
    expect(screen.queryByText('ผ่านการตรวจรับรอง')).not.toBeInTheDocument()
    expect(screen.queryByText('ตรวจทานโดยพระอาจารย์และอาจารย์ผู้ทรงคุณวุฒิ')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'สมาธิคืออะไร' })).toBeInTheDocument()
  })

  it('answers from reviewed published Q&A without sign-in and declines unknown questions', async () => {
    const network = vi.spyOn(globalThis, 'fetch')
    mocks.rows.qa_items = [{ id: 'qa-1', category: 'Meditation', source_reference: 'Reviewed guide', qa_translations: [
      { language_code: 'en', question: 'What is meditation?', short_answer: 'A practice of attention.', detailed_answer: null },
      { language_code: 'th', question: 'สมาธิคืออะไร', short_answer: 'การฝึกใจให้ตั้งมั่น', detailed_answer: null },
    ] }]
    openPage(<ChatbotServiceCard />, '/qa')
    fireEvent.click(screen.getByRole('button', { name: 'Ask the chatbot' }))
    expect(screen.queryByText(/does not generate new answers with AI/)).not.toBeInTheDocument()
    expect(mocks.from).toHaveBeenCalledWith('qa_items')
    expect(mocks.filters).toContainEqual(['qa_items', 'content_status', 'published'])
    expect(mocks.filters).toContainEqual(['qa_items', 'verification_status', 'verified'])
    expect(mocks.filters).toContainEqual(['qa_items', 'is_published', true])
    fireEvent.click(await screen.findByRole('button', { name: 'What is meditation?' }))
    expect(screen.getByText('A practice of attention.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Answer' })).toBeInTheDocument()
    expect(screen.queryByText(/Reviewed guide/)).not.toBeInTheDocument()
    expect(mocks.selects.some(value => value.includes('source_reference'))).toBe(false)
    fireEvent.change(screen.getByLabelText('Type your question'), { target: { value: 'What is the weather tomorrow?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send question' }))
    expect(screen.getByText(/There is no answer for this question yet/)).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage('th') })
    expect(screen.getByRole('heading', { name: 'แชทบอทช่วยตอบ' })).toBeInTheDocument()
    expect(screen.queryByText(/ไม่สร้างคำตอบใหม่ด้วย AI/)).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'สมาธิคืออะไร' })).toBeInTheDocument()
    expect(screen.queryByText('A practice of attention.')).not.toBeInTheDocument()
    expect(network.mock.calls.some(([input]) => String(input).includes('/api/monk-assistant'))).toBe(false)
    network.mockRestore()
  })

  it('matches an exact city and restores all centers after an empty search', async () => {
    mocks.rows.dci_centers = [
      { id: 'york', country_code: 'GB', city: 'York', address: 'York address', map_url: null, website_url: null, contact_url: null, dci_center_translations: [{ language_code: 'en', name: 'York Center', description: 'York fixture' }] },
      { id: 'new-york', country_code: 'US', city: 'New York', address: 'New York address', map_url: null, website_url: null, contact_url: null, dci_center_translations: [{ language_code: 'en', name: 'New York Center', description: 'New York fixture' }] },
    ]
    openPage(<CentersPage />, '/centers')
    await screen.findByRole('heading', { name: 'York Center' })
    expect(screen.getByRole('heading', { name: 'Continue your practice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit center website/ })).toHaveAttribute('href', 'https://ayothayameditation.com/')
    expect(screen.getByRole('link', { name: /View temple contact details/ })).toHaveAttribute('href', 'https://en.dhammakaya.net/contact/')
    expect(screen.getByRole('link', { name: /Explore branch centers/ })).toHaveAttribute('href', 'https://en.dhammakaya.net/branches/')
    const destinations = screen.getByRole('region', { name: 'Places you can explore' })
    expect(destinations.compareDocumentPosition(screen.getByRole('search')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(within(screen.getByRole('region', { name: 'Region filters' })).getByRole('button', { name: 'York' }))
    expect(screen.getByRole('heading', { name: 'York Center' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'New York Center' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search centers' }), { target: { value: 'no matching place' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(screen.getByRole('heading', { name: 'Meditation centers' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'No centers match your search' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show all centers' }))
    expect(screen.getByRole('heading', { name: 'York Center' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'New York Center' })).toBeInTheDocument()
  })

  it('keeps center details when Bio Links fail and omits unsafe contact URLs', async () => {
    mocks.rows.dci_centers = [{ id: 'center-1', country_code: 'TH', city: 'Example city', address: 'Example address', map_url: 'https://example.org/map', website_url: 'javascript:alert(1)', contact_url: 'data:text/html,example', dci_center_translations: [{ language_code: 'en', name: 'Example center', description: 'Test fixture' }] }]
    mocks.failures.add('bio_links')
    openPage(<CentersPage />, '/centers')
    expect((await screen.findAllByText('Example center')).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute('href', 'https://example.org/map')
    expect(screen.getByText('1 center')).toBeInTheDocument()
    expect(screen.queryByText('4 centers')).not.toBeInTheDocument()
    expect(screen.queryByText('🌱 Beginner-friendly')).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Region filters' })).getByRole('button', { name: /Example city/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Website' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load links')
    expect(screen.queryByRole('link', { name: 'Back to visitor home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Visit Monk Chat/ })).toHaveAttribute('href', '/activities')
    mocks.failures.clear()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })
})
