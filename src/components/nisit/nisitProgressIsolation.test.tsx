import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { NisitVocabCards } from './NisitVocabCards'
import { NisitFlashcards } from './NisitFlashcards'

vi.mock('../../lib/supabase', () => ({ supabaseClient: null }))
vi.mock('../../lib/studentPractice', () => ({
  fetchStudentCompletedKeys: vi.fn(async () => null),
  setStudentItemCompleted: vi.fn(async () => false),
}))

beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } })
})
afterEach(cleanup)

it('keeps vocabulary progress separate when participants share a browser', () => {
  const view = render(<NisitVocabCards key="one" isEnglish progressScope="6611018" />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Mark practiced' })[0])
  expect(screen.getByRole('button', { name: 'Practiced' })).toHaveAttribute('aria-pressed', 'true')
  view.rerender(<NisitVocabCards key="two" isEnglish progressScope="6611019" />)
  expect(screen.getAllByRole('button', { name: 'Mark practiced' })[0]).toHaveAttribute('aria-pressed', 'false')
  view.rerender(<NisitVocabCards key="one" isEnglish progressScope="6611018" />)
  expect(screen.getByRole('button', { name: 'Practiced' })).toHaveAttribute('aria-pressed', 'true')
})

it('keeps Q&A completion separate when participants share a browser', async () => {
  const view = render(<NisitFlashcards key="one" isEnglish progressScope="6611018" />)
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark confident' })).toBeEnabled())
  fireEvent.click(screen.getByRole('button', { name: 'Mark confident' }))
  expect(screen.getByRole('button', { name: 'Marked confident' })).toHaveAttribute('aria-pressed', 'true')
  view.rerender(<NisitFlashcards key="two" isEnglish progressScope="6611019" />)
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark confident' })).toHaveAttribute('aria-pressed', 'false'))
  view.rerender(<NisitFlashcards key="one" isEnglish progressScope="6611018" />)
  await waitFor(() => expect(screen.getByRole('button', { name: 'Marked confident' })).toHaveAttribute('aria-pressed', 'true'))
})
