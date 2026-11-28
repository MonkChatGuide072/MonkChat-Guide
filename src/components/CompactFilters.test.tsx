import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CompactFilters } from './CompactFilters'

describe('Compact category picker', () => {
  it('opens filters on demand and closes after choosing on mobile without losing focus', () => {
    vi.stubGlobal('matchMedia', () => ({matches:true}))
    const select = vi.fn()
    render(<CompactFilters label="เลือกหมวด" selected="ทั้งหมด"><button onClick={select}>สมาธิ</button></CompactFilters>)
    const toggle=screen.getByRole('button', {name:'เลือกหมวด: ทั้งหมด'})
    expect(toggle).toHaveAttribute('aria-expanded','false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded','true')
    fireEvent.click(screen.getByRole('button', {name:'สมาธิ'}))
    expect(select).toHaveBeenCalledOnce()
    expect(toggle).toHaveAttribute('aria-expanded','false')
    expect(toggle).toHaveFocus()
    fireEvent.click(toggle)
    fireEvent.keyDown(screen.getByRole('button', {name:'สมาธิ'}), {key:'Escape'})
    expect(toggle).toHaveAttribute('aria-expanded','false')
    vi.unstubAllGlobals()
  })
})
