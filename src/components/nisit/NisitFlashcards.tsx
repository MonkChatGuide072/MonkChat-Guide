import { useCallback, useEffect, useState } from 'react'
import { supabaseClient } from '../../lib/supabase'
import { GuideIcon } from '../GuideIcon'

interface QATranslationRow {
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

interface QAItemRow {
  id: string
  category: string
  qa_translations: QATranslationRow[]
}

const MASTERED_STORAGE_KEY = 'monkchat_nisit_qa_mastered_v1'

/** Verified Q&A flashcard drill so student monks build confidence answering visitor questions. */
export function NisitFlashcards({ isEnglish }: { isEnglish: boolean }) {
  const [items, setItems] = useState<QAItemRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MASTERED_STORAGE_KEY) || '[]') as string[]
    } catch {
      return []
    }
  })

  const fetchVerifiedQA = useCallback(async () => {
    if (!supabaseClient) {
      setError(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(false)
    try {
      const { data, error: dbError } = await supabaseClient
        .from('qa_items')
        .select('id, category, qa_translations(language_code, question, short_answer, detailed_answer)')
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      setItems((data as QAItemRow[]) ?? [])
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchVerifiedQA()
  }, [fetchVerifiedQA])

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))]
  const filtered = selectedCategory === 'All' ? items : items.filter((i) => i.category === selectedCategory)
  const boundedIndex = filtered.length > 0 ? Math.min(cardIndex, filtered.length - 1) : 0
  const current = filtered[boundedIndex]

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage quota issues.
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div role="status" className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-muted">
        {isEnglish ? 'Loading verified Q&A flashcards...' : 'กำลังโหลดคลังคำถามที่ผ่านการตรวจรับรอง...'}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
        <p>{isEnglish ? 'Unable to load Q&A flashcards right now.' : 'ไม่สามารถโหลดคลังคำถามฝึกตอบได้ในขณะนี้'}</p>
        <button
          type="button"
          onClick={() => void fetchVerifiedQA()}
          className="mt-3 min-h-11 cursor-pointer rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-900 hover:bg-red-100"
        >
          {isEnglish ? 'Retry' : 'ลองใหม่'}
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-muted">
        {isEnglish
          ? 'No verified published Q&A items are available yet.'
          : 'ยังไม่มีรายการถาม–ตอบที่ผ่านการรับรองและเผยแพร่ในระบบ'}
      </div>
    )
  }

  const enRow = current?.qa_translations.find((tr) => tr.language_code === 'en')
  const thRow = current?.qa_translations.find((tr) => tr.language_code === 'th')
  const isMastered = current ? masteredIds.includes(current.id) : false

  return (
    <div className="space-y-5">
      {/* Category & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={isEnglish ? 'Question categories' : 'หมวดหมู่คำถาม'}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => {
                setSelectedCategory(cat)
                setCardIndex(0)
                setRevealed(false)
              }}
              className={`min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-medium transition-colors duration-150 ${
                selectedCategory === cat
                  ? 'border-brand-terracotta bg-brand-terracotta text-white'
                  : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              {cat === 'All' ? (isEnglish ? 'All topics' : 'ทุกหมวด') : cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-brand-muted tabular-nums">
          {isEnglish ? 'Practiced:' : 'ฝึกคล่องแล้ว:'}{' '}
          <strong className="font-medium text-brand-maroon">
            {masteredIds.filter((id) => items.some((i) => i.id === id)).length} / {items.length}
          </strong>
        </p>
      </div>

      {/* Flashcard Stage */}
      {current && (
        <article className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-4">
            <span className="text-xs font-medium text-brand-terracotta">
              {current.category || (isEnglish ? 'General question' : 'คำถามทั่วไป')}
            </span>
            <span className="text-sm text-brand-muted tabular-nums">
              {isEnglish ? `Card ${boundedIndex + 1} of ${filtered.length}` : `ข้อที่ ${boundedIndex + 1} จาก ${filtered.length}`}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-medium text-brand-muted">
              {isEnglish ? 'Visitor question (try answering aloud first)' : 'คำถามจากผู้มาเยือน (ลองนึกหรือฝึกพูดตอบเป็นภาษาอังกฤษก่อนเปิดเฉลย)'}
            </p>
            {enRow && (
              <h3 className="font-serif text-xl font-semibold leading-snug text-brand-maroon sm:text-2xl">
                {enRow.question}
              </h3>
            )}
            {thRow && (
              <p className="text-sm leading-6 text-brand-muted">
                คำแปลไทย: {thRow.question}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-expanded={revealed}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
            >
              <GuideIcon name="question" />
              <span>{revealed ? (isEnglish ? 'Hide answer' : 'ซ่อนคำตอบ') : (isEnglish ? 'Reveal verified answer' : 'ดูแนวคำตอบที่รับรองแล้ว')}</span>
            </button>

            <button
              type="button"
              aria-pressed={isMastered}
              onClick={() => toggleMastered(current.id)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors duration-150 ${
                isMastered
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              <GuideIcon name="check" />
              <span>{isMastered ? (isEnglish ? 'Marked confident' : 'ฝึกตอบคล่องแล้ว') : (isEnglish ? 'Mark confident' : 'ทำเครื่องหมายว่าคล่องแล้ว')}</span>
            </button>
          </div>

          {revealed && (
            <div className="mt-6 space-y-4 rounded-xl border border-brand-border bg-[#FAF2E6]/70 p-5">
              {enRow && (
                <div>
                  <p className="text-xs font-medium text-brand-terracotta">English Response</p>
                  <p className="mt-1 text-base leading-7 text-brand-text">{enRow.short_answer}</p>
                  {enRow.detailed_answer && (
                    <p className="mt-2 border-l-2 border-brand-border-dark pl-3 text-sm leading-6 text-brand-muted">
                      {enRow.detailed_answer}
                    </p>
                  )}
                </div>
              )}
              {thRow && (
                <div className={enRow ? 'border-t border-brand-border pt-4' : ''}>
                  <p className="text-xs font-medium text-brand-maroon">ความหมายภาษาไทย</p>
                  <p className="mt-1 text-sm leading-6 text-brand-text">{thRow.short_answer}</p>
                  {thRow.detailed_answer && (
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{thRow.detailed_answer}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Prev / Next Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-brand-border pt-4">
            <button
              type="button"
              disabled={boundedIndex === 0}
              onClick={() => {
                setCardIndex((i) => Math.max(0, i - 1))
                setRevealed(false)
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GuideIcon name="arrow" className="h-[18px] w-[18px] rotate-180" />
              <span>{isEnglish ? 'Previous' : 'ข้อก่อนหน้า'}</span>
            </button>

            <button
              type="button"
              disabled={boundedIndex >= filtered.length - 1}
              onClick={() => {
                setCardIndex((i) => Math.min(filtered.length - 1, i + 1))
                setRevealed(false)
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{isEnglish ? 'Next' : 'ข้อถัดไป'}</span>
              <GuideIcon name="arrow" />
            </button>
          </div>
        </article>
      )}
    </div>
  )
}

