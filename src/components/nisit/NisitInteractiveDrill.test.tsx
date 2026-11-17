import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NisitInteractiveDrill } from './NisitInteractiveDrill'

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

describe('NisitInteractiveDrill Component', () => {
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
      },
      configurable: true,
      writable: true,
    })
    vi.restoreAllMocks()
  })

  it('renders all 4 drill categories in the lobby', () => {
    render(<NisitInteractiveDrill isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    expect(screen.getByText(/ระบบจำลองสถานการณ์การสนทนาจริง/i)).toBeInTheDocument()
    expect(screen.getByText('วิถีสงฆ์และพระวินัย')).toBeInTheDocument()
    expect(screen.getByText('การนำนั่งสมาธิและวางใจ')).toBeInTheDocument()
    expect(screen.getByText('ธรรมะสากลเพื่อการดับทุกข์')).toBeInTheDocument()
    expect(screen.getByText('บทสนทนาต้อนรับและมารยาท')).toBeInTheDocument()
  })

  it('allows starting a drill, answering a choice question, and seeing Vinaya feedback', () => {
    render(<NisitInteractiveDrill isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    // Click first "เริ่มฝึกซ้อม" button to enter "วิถีสงฆ์และพระวินัย" drill
    const startButtons = screen.getAllByRole('button', { name: /เริ่มฝึกซ้อม/i })
    fireEvent.click(startButtons[0])

    // In drill session: visitor card should appear
    expect(screen.getByText(/Emma/i)).toBeInTheDocument()
    expect(screen.getByText(/สหราชอาณาจักร/i)).toBeInTheDocument()

    // 3 mindfulness lotuses
    expect(screen.getByText('3/3')).toBeInTheDocument()

    // Select the correct option button
    const correctOptionText = screen.getByText(/การปลงผมเป็นสัญลักษณ์แห่งการสละความหลงในรูปกาย/i)
    const optionBtn = correctOptionText.closest('button')
    expect(optionBtn).not.toBeNull()
    fireEvent.click(optionBtn!)

    // Check answer button
    const checkBtn = screen.getByRole('button', { name: /ตรวจคำตอบ/i })
    expect(checkBtn).not.toBeDisabled()
    fireEvent.click(checkBtn)

    // Feedback drawer appears
    expect(screen.getByText(/ถูกต้องตามพระธรรมวินัยและสุภาพสากล/i)).toBeInTheDocument()
    expect(screen.getByText(/หลักธรรมวินัยที่เกี่ยวข้อง/i)).toBeInTheDocument()

    // Next question button
    const nextBtn = screen.getByRole('button', { name: /ข้อถัดไป/i })
    expect(nextBtn).toBeInTheDocument()
  })

  it('handles sentence scramble token interaction properly', () => {
    render(<NisitInteractiveDrill isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    // Enter "การนำนั่งสมาธิและวางใจ" category (second category)
    const startButtons = screen.getAllByRole('button', { name: /เริ่มฝึกซ้อม/i })
    fireEvent.click(startButtons[1])

    // First question is already the scramble question!
    expect(screen.getByText(/แตะเรียงคำภาษาอังกฤษด้านล่าง/i)).toBeInTheDocument()

    // Click token 'Close your eyes' from word bank
    const tokenBtn = screen.getByRole('button', { name: 'Close your eyes' })
    fireEvent.click(tokenBtn)

    // Placed token area should now display the token with title "แตะเพื่อนำคำนี้ออก"
    const placedToken = screen.getByTitle('แตะเพื่อนำคำนี้ออก')
    expect(placedToken).toBeInTheDocument()
    expect(placedToken).toHaveTextContent('Close your eyes')

    // Click to remove token back to bank
    fireEvent.click(placedToken)
  })

  it('opens and closes the research analytics modal for Chapter 4 data', () => {
    render(<NisitInteractiveDrill isEnglish={false} studentCode="6611018" studentName="พระมหาอมรเทพ" />)

    const researchBtn = screen.getByRole('button', { name: /สถิติสำหรับเล่มภาคนิพนธ์/i })
    fireEvent.click(researchBtn)

    // Modal opens
    expect(screen.getByText(/ข้อมูลสถิติสำหรับรายงานภาคนิพนธ์ \(บทที่ 4\)/i)).toBeInTheDocument()
    expect(screen.getByText(/สถิติการฝึกฝนทักษะการสนทนาธรรมของพระนิสิต/i)).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /กลับสู่ห้องฝึกซ้อม/i }))
    expect(screen.queryByText(/สถิติการฝึกฝนทักษะการสนทนาธรรมของพระนิสิต/i)).not.toBeInTheDocument()
  })
})
