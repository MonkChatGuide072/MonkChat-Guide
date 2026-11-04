import { describe, expect, it } from 'vitest'
import { matchReviewedQuestion, type ReviewedQuestion } from './qaMatch'

const item = (id: string, question: string): ReviewedQuestion => ({
  id, question, shortAnswer: 'Reviewed response', detailedAnswer: null,
})

describe('reviewed question matching', () => {
  it('keeps Thai marks and matches the same reviewed question', () => {
    const reviewed = item('one', 'สมาธิคืออะไร')
    expect(matchReviewedQuestion('  สมาธิคืออะไร? ', [reviewed], 'th')).toEqual(reviewed)
  })

  it('does not answer unrelated or ambiguous questions', () => {
    const questions = [item('one', 'What is meditation?'), item('two', 'What is mindfulness?')]
    expect(matchReviewedQuestion('What is the weather?', questions, 'en')).toBeNull()
    expect(matchReviewedQuestion('What is?', questions, 'en')).toBeNull()
    expect(matchReviewedQuestion('What is meditation not?', questions, 'en')).toBeNull()
  })

  it('accepts reordered words only when all meaningful words still match', () => {
    const reviewed = item('one', 'Meditation for beginners')
    expect(matchReviewedQuestion('Beginners meditation', [reviewed], 'en')).toEqual(reviewed)
    expect(matchReviewedQuestion('Meditation for advanced beginners', [reviewed], 'en')).toBeNull()
  })
})
