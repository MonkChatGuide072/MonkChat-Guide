import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NisitFieldCockpit } from './NisitFieldCockpit'

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

describe('NisitFieldCockpit Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      },
      configurable: true,
      writable: true,
    })
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('play'))
      return Promise.resolve()
    })
    window.HTMLMediaElement.prototype.pause = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('pause'))
    })
    window.HTMLMediaElement.prototype.load = vi.fn()
    vi.restoreAllMocks()
  })

  it('renders one-tap meditation player and emergency Vinaya phrases', () => {
    render(<NisitFieldCockpit isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    expect(screen.getByText(/โหมดหน้างานจริง ณ โต๊ะสนทนา/i)).toBeInTheDocument()
    expect(screen.getByText(/เปิดเสียงนำสมาธิสากล 5 นาทีทันใจ/i)).toBeInTheDocument()
    expect(screen.getByText(/คลังประโยคช่วยชีวิตและข้อปฏิบัติพระวินัยหน้างาน/i)).toBeInTheDocument()
    expect(screen.getByText(/In our Theravada monastic tradition/i)).toBeInTheDocument()
  })

  it('filters phrases when category pill is clicked', () => {
    render(<NisitFieldCockpit isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    // Click 'ชวนนั่งสมาธิ'
    const medBtn = screen.getByRole('button', { name: /ชวนนั่งสมาธิ/i })
    fireEvent.click(medBtn)

    expect(screen.getByText(/Would you like to experience 5 minutes of peaceful meditation/i)).toBeInTheDocument()
    expect(screen.queryByText(/monks do not have physical contact with women/i)).not.toBeInTheDocument()
  })

  it('toggles 5-minute meditation audio playback', () => {
    render(<NisitFieldCockpit isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    const playBtn = screen.getByRole('button', { name: /กดเปิดเสียงนำสมาธิ/i })
    fireEvent.click(playBtn)

    expect(screen.getByText(/กำลังเปิดเสียงนำสมาธิภาษาอังกฤษ/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /หยุดเสียงชั่วคราว/i })).toBeInTheDocument()

    // Pause audio
    fireEvent.click(screen.getByRole('button', { name: /หยุดเสียงชั่วคราว/i }))
    expect(screen.getByRole('button', { name: /กดเปิดเสียงนำสมาธิ/i })).toBeInTheDocument()
  })

  it('allows logging an unhandled question to CMS', () => {
    render(<NisitFieldCockpit isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    // Open log form
    const logBtn = screen.getByRole('button', { name: /\+ จดคำถามส่งเข้า CMS/i })
    fireEvent.click(logBtn)

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/เช่น เยอรมนี/i), { target: { value: 'เยอรมนี' } })
    fireEvent.change(screen.getByPlaceholderText(/เช่น What does Buddhism teach/i), {
      target: { value: 'What is the Buddhist perspective on artificial intelligence?' },
    })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /บันทึกคำถามส่งเข้า CMS/i })
    fireEvent.click(submitBtn)

    // Success message
    expect(screen.getByText(/ส่งเข้าคิวระบบ CMS/i)).toBeInTheDocument()
    // Appears in table
    expect(screen.getByText(/เยอรมนี/i)).toBeInTheDocument()
    expect(screen.getByText(/What is the Buddhist perspective on artificial intelligence\?/i)).toBeInTheDocument()
  })

  it('opens and closes full-screen card modal to show visitor across table', () => {
    render(<NisitFieldCockpit isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    const showVisitorBtns = screen.getAllByTitle(/ขยายตัวหนังสือเต็มจอเพื่อยื่นให้โยมดู/i)
    fireEvent.click(showVisitorBtns[0])

    // Dialog appears
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/Ayutthaya Monk Chat · Card for Tourist/i)).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /ปิดหน้าต่าง/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
