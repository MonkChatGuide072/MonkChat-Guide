import { useEffect, useState } from 'react'
import { nisitMeditationLessons } from '../../content/nisitPractice'
import { fetchStudentCompletedKeys, setStudentItemCompleted } from '../../lib/studentPractice'
import { MeditationGuideVisual } from '../MeditationGuideVisual'
import { GuideIcon } from '../GuideIcon'

const VOCAB_PROGRESS_KEY = 'monkchat_nisit_vocab_done_v1'

/** Meditation guiding cards paired with essential English vocabulary & Thai pronunciation cues. */
export function NisitVocabCards({
  isEnglish,
  studentProfileId,
  progressScope,
}: {
  isEnglish: boolean
  studentProfileId?: string
  progressScope?: string
}) {
  const storageKey = VOCAB_PROGRESS_KEY + ':' + (studentProfileId ?? progressScope ?? 'guest')
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [practicedIds, setPracticedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]
    } catch {
      return []
    }
  })

  const playSpeech = (id: string, text: string) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      setSpeakingId(id)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onend = () => setSpeakingId(null)
      utterance.onerror = () => setSpeakingId(null)
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeakingId(null)
    }
  }

  useEffect(() => {
    if (!studentProfileId) return
    let active = true
    fetchStudentCompletedKeys(studentProfileId, 'vocab_lesson').then((keys) => {
      if (active && keys !== null) {
        setPracticedIds(keys)
      }
    })
    return () => {
      active = false
    }
  }, [studentProfileId])

  const togglePracticed = (id: string) => {
    const wasDone = practicedIds.includes(id)
    const next = wasDone ? practicedIds.filter((item) => item !== id) : [...practicedIds, id]
    setPracticedIds(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Ignore storage errors.
    }
    if (studentProfileId) {
      void setStudentItemCompleted(studentProfileId, 'vocab_lesson', id, !wasDone)
    }
  }

  return (
    <div className="space-y-5">
      <div className="training-module-intro flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5">
        <div>
          <h2 className="font-serif text-lg font-semibold text-brand-maroon">
            {isEnglish ? 'Meditation Guiding Cards & Essential Vocabulary' : 'การ์ดนำนั่งสมาธิและคำศัพท์ภาษาอังกฤษที่จำเป็น'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {isEnglish
              ? 'Study the visual concept, read the English phrase aloud, and check off stages as you build fluency.'
              : 'ดูภาพประกอบคู่ประโยคนำสมาธิภาษาอังกฤษ พร้อมคำอ่านไทยและคำแนะนำสำหรับสื่อสารกับชาวต่างชาติ'}
          </p>
        </div>
        <p className="text-sm text-brand-muted tabular-nums">
          {isEnglish ? 'Completed:' : 'ฝึกคล่องแล้ว:'}{' '}
          <strong className="font-medium text-brand-maroon">
            {practicedIds.length} / {nisitMeditationLessons.length}
          </strong>
        </p>
      </div>

      <div className="space-y-4">
        {nisitMeditationLessons.map((lesson) => {
          const done = practicedIds.includes(lesson.id)
          return (
            <article
              key={lesson.id}
              className="training-vocab-card overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6"
            >
              <div className="training-vocab-layout grid gap-5 lg:grid-cols-[240px_1fr]">
                <div className="training-vocab-visual aspect-[16/11] w-full overflow-hidden rounded-xl border border-brand-border bg-brand-gold-soft lg:aspect-auto lg:h-full">
                  <MeditationGuideVisual
                    scene={lesson.scene}
                    still
                    label={isEnglish ? lesson.stageEn : lesson.stageTh}
                    breathLabels={isEnglish ? ['Breathe in', 'Breathe out'] : ['หายใจเข้า', 'หายใจออก']}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-brand-terracotta uppercase tracking-wider">
                        {isEnglish ? lesson.stageEn : lesson.stageTh}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="training-vocab-prompt border-l-3 border-brand-terracotta pl-3 font-serif text-lg font-medium leading-7 text-brand-maroon">
                          &ldquo;{lesson.spokenPromptEn}&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => playSpeech(lesson.id, lesson.spokenPromptEn)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all active:scale-95 cursor-pointer shrink-0 ${
                            speakingId === lesson.id
                              ? 'bg-brand-gold text-stone-900 border-brand-gold ring-2 ring-brand-gold/40'
                              : 'bg-brand-gold-soft hover:bg-brand-gold/30 text-brand-maroon border-brand-gold/40'
                          }`}
                          title={isEnglish ? 'Listen to English pronunciation' : 'ฟังเสียงอ่านภาษาอังกฤษ'}
                        >
                          <GuideIcon name="play" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-brand-muted">{lesson.meaningTh}</p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() => togglePracticed(lesson.id)}
                      className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all active:scale-95 ${
                        done
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
                      }`}
                    >
                      <GuideIcon name="check" />
                      <span>{done ? (isEnglish ? 'Practiced' : 'ฝึกคล่องแล้ว') : (isEnglish ? 'Mark practiced' : 'ทำเครื่องหมายฝึกแล้ว')}</span>
                    </button>
                  </div>

                  {/* Key Vocabulary Grid */}
                  <div className="training-vocab-terms grid gap-2 sm:grid-cols-3">
                    {lesson.terms.map((term) => (
                      <button
                        key={term.word}
                        type="button"
                        onClick={() => playSpeech(`${lesson.id}-${term.word}`, term.word)}
                        className={`text-left w-full rounded-xl border p-3 transition-all cursor-pointer active:scale-[0.98] shadow-2xs ${
                          speakingId === `${lesson.id}-${term.word}`
                            ? 'bg-brand-gold-soft/80 border-brand-gold ring-1 ring-brand-gold'
                            : 'border-brand-border bg-brand-cream/60 hover:border-brand-gold/60 hover:bg-brand-gold-soft/30'
                        }`}
                        title={isEnglish ? 'Tap to listen' : 'แตะเพื่อฟังเสียงอ่าน'}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-sans text-sm font-semibold text-brand-maroon">{term.word}</p>
                          <span className="text-xs text-brand-gold" aria-hidden="true">🔊</span>
                        </div>
                        <p className="mt-0.5 text-xs text-brand-terracotta">{term.readingTh}</p>
                        <p className="mt-1 text-xs leading-5 text-brand-muted">{term.meaningTh}</p>
                      </button>
                    ))}
                  </div>

                  <p className="rounded-lg bg-brand-gold-soft/70 px-3 py-2 text-xs leading-5 text-brand-muted">
                    <strong className="font-medium text-brand-maroon">
                      {isEnglish ? 'Tip: ' : 'ข้อแนะนำหน้างาน: '}
                    </strong>
                    {lesson.coachingTipTh}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

