import { useCallback, useEffect, useState } from 'react'
import { supabaseClient } from '../../lib/supabase'
import { usePracticeCompletion } from '../../lib/usePracticeCompletion'
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
  progressScope,
}: {
  isEnglish: boolean
  studentProfileId?: string
  progressScope?: string
}) {
  const storageKey = MASTERED_STORAGE_KEY + ':' + (studentProfileId ?? progressScope ?? 'guest')
  const [items, setItems] = useState<QAItemRow[]>(NISIT_MASTER_QA_ITEMS)
  const [isLoading, setIsLoading] = useState(false)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)
  const completion = usePracticeCompletion({ storageKey, studentId: studentProfileId, moduleType: 'qa_flashcard', english: isEnglish })
  const masteredIds = completion.completedIds

  const playSpeech = (key: string, text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      setSpeakingKey(key)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onend = () => setSpeakingKey(null)
      utterance.onerror = () => setSpeakingKey(null)
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeakingKey(null)
    }
  }

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
        const overrides = new Map(loaded.filter(item => NISIT_MASTER_QA_ITEMS.some(master => master.id === item.id)).map(item => [item.id,item]))
        setItems(NISIT_MASTER_QA_ITEMS.map(master => overrides.get(master.id) ?? master))
        setIsUsingFallback(overrides.size === 0)
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



  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))]
  const filtered = selectedCategory === 'All' ? items : items.filter((i) => i.category === selectedCategory)
  const boundedIndex = filtered.length > 0 ? Math.min(cardIndex, filtered.length - 1) : 0
  const current = filtered[boundedIndex]



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
    <div className="space-y-5">
      {completion.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{completion.error}</p>{!completion.isReady && <button type="button" onClick={completion.reload} className="mt-2 min-h-11 rounded-lg border border-red-300 px-4">{isEnglish ? 'Reload progress' : 'โหลดผลฝึกอีกครั้ง'}</button>}</div>}
      {completion.notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{completion.notice}</p>}
      {completion.busy && <p role="status" className="text-sm text-brand-muted">{isEnglish ? 'Saving progress…' : 'กำลังบันทึกผลฝึก…'}</p>}

      {/* Category & Progress Bar */}
      <div className="training-qa-filter flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label={isEnglish ? 'Question categories' : 'หมวดหมู่คำถาม'}>
          {categories.map((cat) => {
            const label = CATEGORY_LABELS[cat]
            const text = label ? (isEnglish ? label.en : label.th) : cat
            const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length
            return (
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
                {text} <span className="text-xs opacity-80 tabular-nums">({count})</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUsingFallback && (
            <span className="rounded-full border border-brand-border bg-brand-gold-soft px-2.5 py-1 text-xs font-medium text-brand-maroon">
              {isEnglish ? 'Starter practice deck' : 'คลังคำถามชุดฝึกมาตรฐาน'}
            </span>
          )}
          <p className="text-sm text-brand-muted tabular-nums">
            {isEnglish ? 'Practiced:' : 'ฝึกคล่องแล้ว:'}{' '}
            <strong className="font-medium text-brand-maroon">
              {masteredIds.filter((id) => items.some((i) => i.id === id)).length} / {items.length}
            </strong>
          </p>
        </div>
      </div>

      {/* Flashcard Stage */}
      {current && (
        <article className="training-qa-card rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-4">
            <span className="text-xs font-medium text-brand-terracotta">
              {current.category || (isEnglish ? 'General question' : 'คำถามทั่วไป')}
            </span>
            <span className="text-sm text-brand-muted tabular-nums">
              {isEnglish ? `Card ${boundedIndex + 1} of ${filtered.length}` : `ข้อที่ ${boundedIndex + 1} จาก ${filtered.length}`}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              {isEnglish ? 'Visitor question (try answering aloud first)' : 'คำถามจากผู้มาเยือน (ลองนึกหรือฝึกพูดตอบเป็นภาษาอังกฤษก่อนเปิดเฉลย)'}
            </p>
            {enRow && (
              <div className="training-qa-question-row flex items-start justify-between gap-3">
                <h2 className="training-qa-question font-serif text-xl font-bold leading-snug text-brand-maroon sm:text-2xl">
                  {enRow.question}
                </h2>
                <button
                  type="button"
                  onClick={() => playSpeech(`q-${current.id}`, enRow.question)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-soft hover:bg-brand-gold/30 text-brand-maroon border border-brand-gold/40 transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                  title="ฟังเสียงอ่านคำถาม"
                >
                  <GuideIcon name="play" className="h-3 w-3 text-brand-maroon" />
                  <span>{speakingKey === `q-${current.id}` ? (isEnglish ? 'Reading...' : 'กำลังอ่าน...') : (isEnglish ? 'Listen' : 'ฟังคำถาม')}</span>
                </button>
              </div>
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
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-all active:scale-95 hover:bg-brand-terracotta-dark shadow-2xs"
            >
              <GuideIcon name="question" />
              <span>{revealed ? (isEnglish ? 'Hide answer' : 'ซ่อนคำตอบ') : (isEnglish ? 'Reveal verified answer' : 'ดูแนวคำตอบที่รับรองแล้ว')}</span>
            </button>

            <button
              type="button"
              aria-pressed={isMastered}
              disabled={!completion.isReady || completion.busy} onClick={() => void completion.toggle(current.id)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all active:scale-95 ${
                isMastered
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-2xs'
                  : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              <GuideIcon name="check" />
              <span>{isMastered ? (isEnglish ? 'Marked confident' : 'ฝึกตอบคล่องแล้ว') : (isEnglish ? 'Mark confident' : 'ทำเครื่องหมายว่าคล่องแล้ว')}</span>
            </button>
          </div>

          {revealed && (
            <div className="training-qa-answer mt-6 space-y-4 rounded-2xl border border-brand-border bg-brand-gold-soft/70 p-5 shadow-2xs">
              {enRow && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider">English Response</p>
                    <button
                      type="button"
                      onClick={() => playSpeech(`a-${current.id}`, enRow.short_answer)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white text-brand-maroon border border-brand-gold/40 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title="ฟังเสียงอ่านคำตอบ"
                    >
                      <GuideIcon name="play" className="h-2.5 w-2.5 text-brand-maroon" />
                      <span>{speakingKey === `a-${current.id}` ? (isEnglish ? 'Reading...' : 'กำลังอ่าน...') : (isEnglish ? 'Listen' : 'ฟังคำตอบ')}</span>
                    </button>
                  </div>
                  <p className="mt-1 text-base leading-7 text-brand-text font-serif">{enRow.short_answer}</p>
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
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

            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <span>{isEnglish ? 'Jump to:' : 'ไปยังข้อ:'}</span>
              <select
                value={boundedIndex}
                onChange={(e) => {
                  setCardIndex(Number(e.target.value))
                  setRevealed(false)
                }}
                aria-label={isEnglish ? 'Select question number' : 'เลือกหมายเลขข้อ'}
                className="min-h-11 max-w-[200px] sm:max-w-[320px] rounded-lg border border-brand-border bg-white px-2 py-1 text-sm font-medium text-brand-maroon truncate tabular-nums"
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
              <span>/ {filtered.length}</span>
            </div>

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

