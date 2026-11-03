import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminAssistantPage } from './AdminAssistantPage'

const state = vi.hoisted(() => ({ language: 'th' }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: state.language, language: state.language } }) }))
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ session: { access_token: 'test-token', user: { id: 'monk-1' } } }) }))

const view = () => <MemoryRouter><AdminAssistantPage /></MemoryRouter>
const ask = (question = 'สมาธิคืออะไร') => {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: question } })
  fireEvent.click(screen.getByRole('button', { name: 'ถาม AI' }))
}

describe('monk AI assistant', () => {
  beforeEach(() => { state.language = 'th' })
  afterEach(() => vi.unstubAllGlobals())

  it('sends the team token and labels an answer without approved context', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ answer: 'ร่างคำตอบสำหรับตรวจทาน', sources: [], hasApprovedContext: false }))
    vi.stubGlobal('fetch', fetcher)
    render(view())
    ask()
    expect(await screen.findByText('ร่างคำตอบสำหรับตรวจทาน')).toBeInTheDocument()
    expect(screen.getByText(/ไม่พบ Q&A ที่รับรองแล้ว/)).toBeInTheDocument()
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token')
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ question: 'สมาธิคืออะไร', language: 'th' })
  })

  it('keeps the question for retry and explains expired authentication', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'unauthorized' }, { status: 401 })))
    render(view())
    ask()
    expect(await screen.findByRole('alert')).toHaveTextContent('เซสชันหมดอายุ')
    expect(screen.getByRole('textbox')).toHaveValue('สมาธิคืออะไร')
    expect(screen.getByRole('button', { name: 'ถาม AI' })).toBeEnabled()
  })

  it('bounds prior replies so a long answer does not break the next question', async () => {
    const answer = 'ก'.repeat(1500)
    const fetcher = vi.fn().mockImplementation(async () => Response.json({ answer, sources: [] }))
    vi.stubGlobal('fetch', fetcher)
    render(view())
    ask()
    await screen.findByText(answer)
    ask('ผู้เริ่มต้นควรฝึกอย่างไร')
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    const sent = JSON.parse(fetcher.mock.calls[1][1].body)
    expect(sent.history[1]).toMatchObject({ role: 'assistant', content: answer.slice(0, 1000) })
  })

  it('discards a pending Thai reply when the interface switches to English', async () => {
    let resolve!: (response: Response) => void
    const fetcher = vi.fn().mockImplementation(() => new Promise<Response>(done => { resolve = done }))
    vi.stubGlobal('fetch', fetcher)
    const rendered = render(view())
    ask()
    await waitFor(() => expect(fetcher).toHaveBeenCalled())
    state.language = 'en'
    rendered.rerender(view())
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
    await act(async () => { resolve(Response.json({ answer: 'คำตอบเก่าภาษาไทย', sources: [] })) })
    expect(screen.queryByText('คำตอบเก่าภาษาไทย')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'What is meditation?' } })
    expect(screen.getByRole('button', { name: 'Ask AI' })).toBeEnabled()
  })
})
