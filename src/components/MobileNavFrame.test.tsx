import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MobileNavFrame } from './MobileNavFrame'

describe('Reading without obstructing navigation', () => {
  it('can tuck away shortcuts and recover them without changing the page', () => {
    render(<MobileNavFrame isEnglish={false}><nav>เมนูเดิม</nav></MobileNavFrame>)
    fireEvent.click(screen.getByRole('button', {name:'ซ่อนเมนู'}))
    expect(screen.getByRole('button', {name:'แสดงเมนู'})).toHaveAttribute('aria-expanded','false')
    expect(screen.getByText('เมนูเดิม').parentElement).toHaveAttribute('inert')
    fireEvent.click(screen.getByRole('button', {name:'แสดงเมนู'}))
    expect(screen.getByText('เมนูเดิม').parentElement).not.toHaveAttribute('inert')
  })
  it('hides on a downward reading scroll and returns on an upward scroll', () => {
    Object.defineProperty(window, 'scrollY', {configurable:true,value:0})
    render(<MobileNavFrame isEnglish><nav>Shortcuts</nav></MobileNavFrame>)
    Object.defineProperty(window, 'scrollY', {configurable:true,value:300})
    fireEvent.scroll(window)
    expect(screen.getByRole('button', {name:'Show menu'})).toBeInTheDocument()
    Object.defineProperty(window, 'scrollY', {configurable:true,value:260})
    fireEvent.scroll(window)
    expect(screen.getByRole('button', {name:'Hide menu'})).toBeInTheDocument()
    Object.defineProperty(window, 'scrollY', {configurable:true,value:0})
  })
})
