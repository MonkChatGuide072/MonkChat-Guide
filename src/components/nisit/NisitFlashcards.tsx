import { useCallback, useEffect, useState } from 'react'
import { supabaseClient } from '../../lib/supabase'
import { fetchStudentCompletedKeys, setStudentItemCompleted } from '../../lib/studentPractice'
import { NISIT_MASTER_QA_ITEMS, type QAItemRow } from '../../content/nisitQAData'
import { GuideIcon } from '../GuideIcon'

const MASTERED_STORAGE_KEY = 'monkchat_nisit_qa_mastered_v1'

const CATEGORY_LABELS: Record<string, { th: string; en: string }> = {
  All: { th: 'ทุกหมวด', en: 'All topics' },
  Meditation: { th: 'สมาธิ & จิตตภาวนา', en: 'Meditation' },
  'Monastic Life': { th: 'วิถีชีวิตสมณะ', en: 'Monastic Life' },
  Dhammakaya: { th: 'วัดพระธรรมกาย', en: 'Dhammakaya' },
  'Buddhism & Life': { th: 'วัฒนธรรม & ร่วมสมัย', en: 'Buddhism & Life' },
}

/** Verified Q&A flashcard drill so student monks build confidence answering visitor questions. */
export function NisitFlashcards({
  isEnglish,
  studentProfileId,
}: {
  isEnglish: boolean
  studentProfileId?: string
}) {
  const [items, setItems] = useState<QAItemRow[]>(NISIT_MASTER_QA_ITEMS)
  const [isLoading, setIsLoading] = useState(false)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
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
      setItems(NISIT_MASTER_QA_ITEMS)
      setIsUsingFallback(true)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const { data, error: dbError } = await supabaseClient
        .from('qa_items')
        .select('id, category, qa_translations(language_code, question, short_answer, detailed_answer)')
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      const loaded = (data as QAItemRow[]) ?? []
      if (loaded.length > 0) {
        // Keep DB items while guaranteeing all 200 master questions are present
        const loadedIds = new Set(loaded.map((item) => item.id))
        const masterRemaining = NISIT_MASTER_QA_ITEMS.filter((item) => !loadedIds.has(item.id))
        setItems([...loaded, ...masterRemaining])
        setIsUsingFallback(false)
      } else {
        setItems(NISIT_MASTER_QA_ITEMS)
        setIsUsingFallback(true)
      }
    } catch {
      setItems(NISIT_MASTER_QA_ITEMS)
      setIsUsingFallback(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchVerifiedQA()
  }, [fetchVerifiedQA])

  useEffect(() => {
    if (!studentProfileId) return
    let active = true
    fetchStudentCompletedKeys(studentProfileId, 'qa_flashcard').then((keys) => {
      if (active && keys !== null) {
        setMasteredIds(keys)
      }
    })
    return () => {
      active = false
    }
  }, [studentProfileId])

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))]
  const filtered = selectedCategory === 'All' ? items : items.filter((i) => i.category === selectedCategory)
  const boundedIndex = filtered.length > 0 ? Math.min(cardIndex, filtered.length - 1) : 0
  const current = filtered[boundedIndex]

  const toggleMastered = (id: string) => {
    const wasMastered = masteredIds.includes(id)
    const next = wasMastered ? masteredIds.filter((item) => item !== id) : [...masteredIds, id]
    setMasteredIds(next)
    try {
      localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage quota issues.
    }
    if (studentProfileId) {
      void setStudentItemCompleted(studentProfileId, 'qa_flashcard', id, !wasMastered)
    }
  }

  if (isLoading) {
    return (
      <div role="status" className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-muted">
        {isEnglish ? 'Loading verified Q&A flashcards...' : 'กำลังโหลดคลังคำถามที่ผ่านการตรวจรับรอง...'}
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
    <div className="space-y-6">
      {/* Category & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap gap-2" role="group" aria-label={isEnglish ? 'Question categories' : 'หมวดหมู่คำถาม'}>
          {categories.map((cat) => {
            const label = CATEGORY_LABELS[cat]
            const text = label ? (isEnglish ? label.en : label.th) : cat
            const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedCategory(cat)
                  setCardIndex(0)
                  setRevealed(false)
                }}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-terracotta bg-brand-terracotta text-white shadow-xs'
                    : 'border-brand-border/80 bg-brand-cream/80 text-brand-maroon hover:border-brand-gold hover:bg-brand-gold-soft'
                }`}
              >
                <span>{text}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-normal tabular-nums ${
                    isSelected ? 'bg-black/15 text-white' : 'bg-white/80 text-brand-muted border border-brand-border/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isUsingFallback && (
            <span className="rounded-full border border-brand-gold/60 bg-brand-gold-soft px-3 py-1 text-xs font-medium text-brand-maroon">
              {isEnglish ? 'Master 200 Deck' : 'คลังคำถาม 200 ข้อ'}
            </span>
          )}
          <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-cream/70 px-3.5 py-1.5 text-xs font-medium text-brand-muted tabular-nums sm:text-sm">
            <span>{isEnglish ? 'Practiced:' : 'ฝึกคล่องแล้ว:'}</span>
            <strong className="font-semibold text-emerald-800">
              {masteredIds.filter((id) => items.some((i) => i.id === id)).length}
            </strong>
            <span>/ {items.length}</span>
          </p>
        </div>
      </div>

      {/* Flashcard Stage */}
      {current && (
        <article className="rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-10 shadow-[0_4px_24px_rgba(43,24,16,0.06)] relative overflow-hidden transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-cream px-3 py-1 text-xs font-medium text-brand-terracotta">
              <span className="h-2 w-2 rounded-full bg-brand-terracotta" />
              <span>{current.category || (isEnglish ? 'General question' : 'คำถามทั่วไป')}</span>
            </div>
            <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-muted tabular-nums border border-brand-border/60">
              {isEnglish ? `Card ${boundedIndex + 1} of ${filtered.length}` : `ข้อที่ ${boundedIndex + 1} จาก ${filtered.length}`}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">
              {isEnglish ? 'Visitor Question (Practice speaking aloud first)' : 'คำถามจากผู้มาเยือน (ลองฝึกพูดตอบเป็นภาษาอังกฤษก่อนกดดูเฉลย)'}
            </p>
            {enRow && (
              <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold leading-relaxed text-brand-maroon [text-wrap:balance]">
                {enRow.question}
              </h2>
            )}
            {thRow && (
              <p className="rounded-xl border border-brand-border/60 bg-brand-cream/40 p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed text-brand-text/90">
                <span className="font-medium text-brand-terracotta">{isEnglish ? 'Thai translation: ' : 'คำแปลภาษาไทย: '}</span>
                {thRow.question}
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-expanded={revealed}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-brand-terracotta px-6 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-brand-terracotta-dark hover:shadow-sm active:scale-[0.99]"
            >
              <GuideIcon name="question" />
              <span>{revealed ? (isEnglish ? 'Hide answer' : 'ซ่อนคำตอบ') : (isEnglish ? 'Reveal verified answer' : 'ดูแนวคำตอบที่รับรองแล้ว')}</span>
            </button>

            <button
              type="button"
              aria-pressed={isMastered}
              onClick={() => toggleMastered(current.id)}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-5 text-sm font-medium shadow-2xs transition-all duration-200 hover:shadow-xs active:scale-[0.99] ${
                isMastered
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                  : 'border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              <GuideIcon name="check" />
              <span>{isMastered ? (isEnglish ? 'Marked confident' : 'ฝึกตอบคล่องแล้ว') : (isEnglish ? 'Mark confident' : 'ทำเครื่องหมายว่าคล่องแล้ว')}</span>
            </button>
          </div>

          {revealed && (
            <div className="mt-7 space-y-5 rounded-2xl border border-brand-gold/40 bg-[#FAF7F2] p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
              {enRow && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-terracotta">
                    <GuideIcon name="chat" className="h-3.5 w-3.5" />
                    <span>English Spoken Response</span>
                  </div>
                  <blockquote className="border-l-3 border-brand-terracotta pl-4 text-base sm:text-lg leading-relaxed text-brand-text italic">
                    <span>{enRow.short_answer}</span>
                  </blockquote>
                  {enRow.detailed_answer && (
                    <p className="mt-2 text-xs sm:text-sm leading-6 text-brand-muted pl-4">
                      {enRow.detailed_answer}
                    </p>
                  )}
                </div>
              )}
              {thRow && (
                <div className={enRow ? 'border-t border-brand-border/60 pt-5 space-y-2' : 'space-y-2'}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-maroon">
                    <GuideIcon name="book" className="h-3.5 w-3.5" />
                    <span>แนวทางการตอบเชิงวาทะศิลป์ (สไตล์หลวงพ่อทัตตชีโว)</span>
                  </div>
                  <div className="rounded-xl border border-brand-border/60 bg-white/80 p-4 sm:p-5 shadow-2xs">
                    <p className="text-sm sm:text-base leading-relaxed text-brand-text font-sans">
                      {thRow.short_answer}
                    </p>
                  </div>
                  {thRow.detailed_answer && (
                    <p className="rounded-lg bg-brand-gold-soft/50 border border-brand-gold/30 px-3.5 py-2 text-xs text-brand-muted leading-5">
                      <strong className="font-medium text-brand-maroon">คำแนะนำ: </strong>
                      {thRow.detailed_answer}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Prev / Next Navigation */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/80 pt-5">
            <button
              type="button"
              disabled={boundedIndex === 0}
              onClick={() => {
                setCardIndex((i) => Math.max(0, i - 1))
                setRevealed(false)
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 sm:px-5 text-sm font-medium text-brand-maroon shadow-2xs transition-all duration-150 hover:bg-brand-gold-soft hover:border-brand-terracotta disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GuideIcon name="arrow" className="h-[18px] w-[18px] rotate-180" />
              <span>{isEnglish ? 'Previous' : 'ข้อก่อนหน้า'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <span className="font-medium">{isEnglish ? 'Jump to:' : 'ไปยังข้อ:'}</span>
              <select
                value={boundedIndex}
                onChange={(e) => {
                  setCardIndex(Number(e.target.value))
                  setRevealed(false)
                }}
                aria-label={isEnglish ? 'Select question number' : 'เลือกหมายเลขข้อ'}
                className="min-h-11 max-w-[200px] sm:max-w-[320px] rounded-xl border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-brand-maroon shadow-2xs truncate tabular-nums focus:border-brand-terracotta focus:ring-2 focus:ring-brand-terracotta/20"
              >
                {filtered.map((item, idx) => {
                  const thQ = item.qa_translations.find((t) => t.language_code === 'th')?.question
                  const enQ = item.qa_translations.find((t) => t.language_code === 'en')?.question
                  const preview = isEnglish ? (enQ || thQ) : (thQ || enQ)
                  const short = preview && preview.length > 36 ? `${preview.slice(0, 36)}…` : preview
                  return (
                    <option key={item.id} value={idx}>
                      {idx + 1}. {short}
                    </option>
                  )
                })}
              </select>
              <span className="tabular-nums">/ {filtered.length}</span>
            </div>

            <button
              type="button"
              disabled={boundedIndex >= filtered.length - 1}
              onClick={() => {
                setCardIndex((i) => Math.min(filtered.length - 1, i + 1))
                setRevealed(false)
              }}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-terracotta px-4 sm:px-5 text-sm font-medium text-white shadow-xs transition-all duration-150 hover:bg-brand-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40"
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

