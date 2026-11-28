import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { NisitGuidingLibrary } from './NisitGuidingLibrary'
import { MeditationGuideVisual } from '../MeditationGuideVisual'
import { nisitMeditationLessons } from '../../content/nisitPractice'
import { nisitGuidingScripts } from '../../content/nisitGuidingScripts'
import { preparationCards } from '../../content/meditationGuide'

describe('Owner-requested meditation guiding library', () => {
  beforeEach(() => { localStorage.clear() })

  it('aligns bases 3–7 vertically while retaining the two face positions and different heights', () => {
    const {container} = render(<MeditationGuideVisual base={7} label="Seven bases" />)
    const circles = Array.from(container.querySelectorAll('[data-meditation-base]'))
    expect(circles).toHaveLength(7)
    const xs = circles.map(circle => circle.getAttribute('cx'))
    expect(new Set(xs.slice(2)).size).toBe(1)
    expect(xs[0]).not.toBe(xs[6]); expect(xs[1]).not.toBe(xs[6])
    expect(new Set(circles.slice(2).map(circle => circle.getAttribute('cy'))).size).toBe(5)
  })

  it('places the new stillness stage before opening the eyes and adds it to the visitor cards in both languages', () => {
    const hold = nisitMeditationLessons.findIndex(lesson => lesson.id === 'lesson-stillness')
    const opening = nisitMeditationLessons.findIndex(lesson => lesson.id === 'lesson-open')
    expect(hold).toBeGreaterThan(0); expect(opening).toBe(hold + 1)
    expect(nisitMeditationLessons).toHaveLength(8)
    expect(preparationCards.th).toHaveLength(7); expect(preparationCards.en).toHaveLength(7)
    expect(preparationCards.th.at(-1)?.title).toBe('ประคองความสบายสักครู่')
    expect(preparationCards.en.at(-1)?.body).toContain('for a little while')
  })

  it('offers two scripts and retains practice marking on the basic cards', () => {
    render(<NisitGuidingLibrary isEnglish />)
    expect(within(screen.getByRole('group',{name:'Choose a meditation script'})).getAllByRole('button')).toHaveLength(2)
    const buttons = screen.getAllByRole('button',{name:'Mark practiced'})
    expect(buttons).toHaveLength(8)
    fireEvent.click(buttons[0])
    expect(screen.getByText('1 / 8')).toBeInTheDocument()
  })

  it('shows the whole selected script on one page and toggles all Thai reading cues', () => {
    const {container} = render(<NisitGuidingLibrary isEnglish />)
    expect(container.querySelectorAll('[data-reading]')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button',{name:'Full script on one page'}))
    const full = screen.getByRole('article',{name:'Complete meditation script'})
    for (const paragraph of nisitGuidingScripts[0].paragraphs) expect(within(full).getByText(paragraph.en)).toBeInTheDocument()
    const toggle = screen.getByRole('switch',{name:'Show Thai reading cues'})
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked','true')
    expect(container.querySelectorAll('[data-reading]')).toHaveLength(8)
    fireEvent.click(toggle)
    expect(container.querySelectorAll('[data-reading]')).toHaveLength(0)
  })

  it('reads the supplied alternative in both full and card formats without changing scripts', () => {
    render(<NisitGuidingLibrary isEnglish />)
    fireEvent.click(screen.getByRole('button',{name:/Relaxation and the crystal: continuing in silence/}))
    expect(screen.getAllByRole('article')).toHaveLength(nisitGuidingScripts[1].paragraphs.length)
    fireEvent.click(screen.getByRole('button',{name:'Full script on one page'}))
    const full = screen.getByRole('article',{name:'Complete meditation script'})
    expect(within(full).getByText('May I invite you all to meditate together?')).toBeInTheDocument()
    expect(within(full).getByText(/Please continue to meditate in silence\./)).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Mark practiced'})).not.toBeInTheDocument()
    for (const paragraph of nisitGuidingScripts[1].paragraphs) {
      expect(paragraph.readingTh.trim()).not.toBe(''); expect(within(full).getByText(paragraph.en)).toBeInTheDocument()
    }
  })

  it('uses Thai controls by default and exposes the hold instruction in the full basic script', () => {
    render(<NisitGuidingLibrary isEnglish={false} />)
    fireEvent.click(screen.getByRole('button',{name:'บทเต็มในหน้าเดียว'}))
    expect(screen.getByRole('switch',{name:'แสดงคำอ่านไทย'})).toHaveAttribute('aria-checked','false')
    expect(screen.getByText('ให้ประคองใจและอารมณ์สบายอย่างนี้ต่อไปสักครู่หนึ่งนะครับ')).toBeInTheDocument()
  })
})
