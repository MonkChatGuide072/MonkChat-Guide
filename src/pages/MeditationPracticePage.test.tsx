import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { MeditationPracticePage } from './MeditationPracticePage'

const language = vi.hoisted(() => ({ value: 'th' }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: language.value } }) }))
vi.mock('../components/BreathingPacer', () => ({ BreathingPacer: () => <div>Existing preparation</div> }))
vi.mock('./MeditationPage', () => ({ MeditationPage: () => <div>Existing audio and captions</div> }))
let now = 0
beforeEach(() => {
  language.value = 'th'; now = 0; vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.open = false } })
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
function open() { return render(<MemoryRouter initialEntries={['/meditation/now']}><MeditationPracticePage /></MemoryRouter>) }

describe('public crystal meditation flow', () => {
  it('keeps preparation out of the clock and presents a body-level result dialog with exact time', () => {
    open()
    expect(screen.queryByText('Existing preparation')).not.toBeInTheDocument()
    now = 40000
    fireEvent.click(screen.getByRole('button', { name: 'แตะดวงแก้วเพื่อเริ่ม' }))
    now = 48000
    fireEvent.click(screen.getByRole('button', { name: 'แตะดวงแก้วเพื่อพัก' }))
    now = 90000
    fireEvent.click(screen.getByRole('button', { name: 'ทำต่อ' }))
    now = 95000
    fireEvent.click(screen.getByRole('button', { name: 'แตะดวงแก้วเพื่อพัก' }))
    fireEvent.click(screen.getByRole('button', { name: 'จบรอบนี้' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(900))
    const dialog = screen.getByRole('dialog', { name: 'ช่วงเวลาดี ๆ ที่คุณให้ตัวเอง' })
    expect(dialog.parentElement).toBe(document.body)
    expect(within(dialog).getByText('00:13')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    expect(within(dialog).getByRole('button', { name: 'นั่งอีกรอบ' })).toHaveFocus()
    fireEvent.click(within(dialog).getByRole('button', { name: 'นั่งอีกรอบ' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'แตะดวงแก้วเพื่อเริ่ม' })).toBeEnabled()
    expect(document.body.style.overflow).toBe('')
  })
  it('offers the original audio only in guided mode and does not require a login', () => {
    language.value = 'en'
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Listen to guided meditation' }))
    expect(screen.getByText('Existing audio and captions')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /password/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tap the crystal to begin' })).toBeEnabled()
  })
})
