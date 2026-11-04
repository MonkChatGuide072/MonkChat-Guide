export interface ReviewedQuestion {
  id: string
  question: string
  shortAnswer: string
  detailedAnswer: string | null
}

function normalized(value: string, language: 'th' | 'en'): string {
  return value.normalize('NFKC').toLocaleLowerCase(language).replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim()
}

const ignored = {
  th: new Set(['อะไร', 'อย่างไร', 'ทำไม', 'ควร', 'หรือ', 'และ', 'ที่', 'คือ', 'ถ้า', 'เมื่อ', 'เป็น', 'ของ', 'ได้', 'การ']),
  en: new Set(['what', 'why', 'how', 'when', 'is', 'are', 'the', 'and', 'for', 'does', 'should', 'with', 'can', 'you', 'your']),
}

function terms(value: string, language: 'th' | 'en'): Set<string> {
  const clean = normalized(value, language)
  if (!clean) return new Set()
  const segmenter = new Intl.Segmenter(language, { granularity: 'word' })
  return new Set([...segmenter.segment(clean)]
    .filter(part => part.isWordLike)
    .map(part => part.segment)
    .filter(part => part.length > 1 && !ignored[language].has(part)))
}

/** Match only the reviewed question text. Ambiguous or weak matches get no answer. */
export function matchReviewedQuestion(
  input: string,
  questions: ReviewedQuestion[],
  language: 'th' | 'en',
): ReviewedQuestion | null {
  const query = normalized(input, language)
  if (query.length < 3) return null

  const exact = questions.find(item => normalized(item.question, language) === query)
  if (exact) return exact

  const queryTerms = terms(input, language)
  if (queryTerms.size < 2) return null
  const ranked = questions.map(item => {
    const candidateTerms = terms(item.question, language)
    const shared = [...queryTerms].filter(term => candidateTerms.has(term)).length
    return { item, coverage: shared / queryTerms.size, candidateCoverage: shared / Math.max(1, candidateTerms.size), shared }
  }).filter(result => result.shared >= 2 && result.coverage === 1 && result.candidateCoverage === 1)
    .sort((a, b) => b.coverage - a.coverage || b.shared - a.shared)

  if (ranked.length !== 1 && ranked[0]?.coverage === ranked[1]?.coverage && ranked[0]?.shared === ranked[1]?.shared) return null
  return ranked[0]?.item ?? null
}
