import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ThankYouPostcard } from './ThankYouPostcard'
import { wrapPostcardText } from '../../content/thankYouPostcard'

afterEach(cleanup)

describe('Postcard text and personalized artwork', () => {
  it('keeps long unbroken names complete and within the requested line limit', () => {
    const name = 'W'.repeat(60)
    const lines = wrapPostcardText(name, 30)
    expect(lines.join('')).toBe(name)
    expect(lines.every((line) => Array.from(line).length <= 30)).toBe(true)
  })
  it('preserves Thai text while wrapping without relying on spaces', () => {
    const text = 'ขออนุโมทนาและขอบคุณที่มาร่วมกิจกรรมและแบ่งปันช่วงเวลาแห่งความสงบ'
    const lines = wrapPostcardText(text, 24)
    expect(lines.join('')).toBe(text)
    expect(lines.every((line) => Array.from(line).length <= 24)).toBe(true)
  })
  it('renders personalized markup literally instead of creating executable elements', () => {
    const { container } = render(<ThankYouPostcard visitor={'<script>alert(1)</script>'} monk={'A & B'} date="2026-11-23"
      message="Thank you for joining us." palette="garden" />)
    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toContain('<script>alert(1)</script>')
    expect(container.textContent).toContain('Guided by A & B')
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 1200 1500')
  })
})
