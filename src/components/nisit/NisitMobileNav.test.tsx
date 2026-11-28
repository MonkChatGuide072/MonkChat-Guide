import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NisitMobileNav } from './NisitMobileNav'

describe('Five practice destinations', () => {
  it('uses the requested order with direct tools and learning access', () => {
    const select = vi.fn().mockReturnValue(true)
    render(<NisitMobileNav activeTab="drills" isEnglish={false} onSelect={select} />)
    expect(screen.getByRole('navigation').querySelectorAll('button').length).toBe(5)
    expect(Array.from(screen.getByRole('navigation').querySelectorAll('button')).map(button => button.getAttribute('aria-label'))).toEqual([
      'เปิดคำศัพท์', 'เปิดเกมฝึก', 'เปิดชุดประโยคและเครื่องมือ', 'เปิดวิดีโอและแหล่งเรียนรู้', 'เปิดการ์ดขอบคุณ',
    ])
    expect(screen.getByRole('button', {name:'เปิดเกมฝึก'})).toHaveAttribute('aria-pressed','true')
    fireEvent.click(screen.getByRole('button', {name:'เปิดชุดประโยคและเครื่องมือ'}))
    expect(select).toHaveBeenCalledWith('cockpit')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('keeps the active destination when a guarded selection is declined', () => {
    const select = vi.fn().mockReturnValue(false)
    render(<NisitMobileNav activeTab="drills" isEnglish onSelect={select} />)
    fireEvent.click(screen.getByRole('button', {name:'Open Thank-you Card'}))
    expect(select).toHaveBeenCalledWith('cards')
    expect(screen.getByRole('button', {name:'Open Practice Games'})).toHaveAttribute('aria-pressed','true')
  })
})
