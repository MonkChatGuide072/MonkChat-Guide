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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: translate,
    i18n: fakeI18n,
  }),
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
  })

  it('shows the language gate before a visitor chooses a language', () => {
    renderVisitPage()

    expect(screen.getByRole('heading', { name: /เลือกภาษา \/ Choose language/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ภาษาไทย' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('saves the session choice, renders core home sections + official contact banner, and updates on language switch', async () => {
    renderVisitPage()

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY)).toBe('en')
    expect(fakeI18n.changeLanguage).toHaveBeenCalledWith('en')
    expect(await screen.findByRole('heading', { name: 'MonkChat Guide' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Location & map' })).toBeInTheDocument()
    expect(screen.getByAltText(/Real Monk Chat outdoor meeting spot/i)).toHaveAttribute(
      'src',
      '/images/home/monkchat-spot-wat-mahathat.jpg',
    )
    expect(screen.getByTitle('Google Map of Wat Mahathat, Ayutthaya')).toHaveAttribute(
      'src',
      'https://maps.google.com/maps?q=14.3570,100.5675&z=17&output=embed',
    )
    const imgSources = Array.from(document.querySelectorAll('img')).map((img) => img.getAttribute('src') ?? '')
    expect(imgSources.some((src) => /monkchat-meditation-(ruins|hero|field)\.webp/.test(src))).toBe(false)
    expect(imgSources.some((src) => src.includes('/images/activities/'))).toBe(false)
    expect(new Set(imgSources).size).toBe(imgSources.length)
    expect(screen.getByRole('heading', { name: 'What to expect' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Atmosphere & surroundings' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Official Contact & Announcements' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /MonkChat Ayutthaya/ })).toHaveAttribute(
      'href',
      'https://web.facebook.com/MonkChatAyutthaya/',
    )
    expect(screen.queryByRole('heading', { name: /How to start in three gentle steps|Meditation sanctuaries/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Academic background|Zero Budget Policy|research purpose/)).not.toBeInTheDocument()

    await act(async () => {
      await fakeI18n.changeLanguage('th')
    })

    expect(await screen.findByRole('heading', { name: 'สถานที่และแผนที่' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'สิ่งที่จะได้สัมผัสในกิจกรรม' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'บรรยากาศกิจกรรมและสถานที่' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ติดต่อสอบถาม & ติดตามเพจอย่างเป็นทางการ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'คุยกับแชทบอท' })).toBeInTheDocument()
  })
})
