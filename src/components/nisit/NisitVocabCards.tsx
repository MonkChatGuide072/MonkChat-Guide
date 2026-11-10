import { useState } from 'react'
import { nisitMeditationLessons } from '../../content/nisitPractice'
import { MeditationGuideVisual } from '../MeditationGuideVisual'
import { GuideIcon } from '../GuideIcon'

const VOCAB_PROGRESS_KEY = 'monkchat_nisit_vocab_done_v1'

/** Meditation guiding cards paired with essential English vocabulary & Thai pronunciation cues. */
export function NisitVocabCards({ isEnglish }: { isEnglish: boolean }) {
  const [practicedIds, setPracticedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(VOCAB_PROGRESS_KEY) || '[]') as string[]
    } catch {
      return []
    }
  })

  const togglePracticed = (id: string) => {
    setPracticedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage errors.
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5">
        <div>
          <h3 className="font-serif text-lg font-semibold text-brand-maroon">
            {isEnglish ? 'Meditation Guiding Cards & Essential Vocabulary' : 'การ์ดนำนั่งสมาธิและคำศัพท์ภาษาอังกฤษที่จำเป็น'}
          </h3>
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
              className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6"
            >
              <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                <div className="aspect-[16/11] w-full overflow-hidden rounded-xl border border-brand-border bg-[#FAF2E6] lg:aspect-auto lg:h-full">
                  <MeditationGuideVisual
                    scene={lesson.scene}
                    still
                    label={isEnglish ? lesson.stageEn : lesson.stageTh}
                    breathLabels={isEnglish ? ['Breathe in', 'Breathe out'] : ['หายใจเข้า', 'หายใจออก']}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-brand-terracotta">
                        {isEnglish ? lesson.stageEn : lesson.stageTh}
                      </p>
                      <p className="mt-2 border-l-3 border-brand-terracotta pl-3 font-serif text-lg font-medium leading-7 text-brand-maroon">
                        &ldquo;{lesson.spokenPromptEn}&rdquo;
                      </p>
                      <p className="mt-2 text-sm leading-6 text-brand-muted">{lesson.meaningTh}</p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() => togglePracticed(lesson.id)}
                      className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors duration-150 ${
                        done
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                          : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
                      }`}
                    >
                      <GuideIcon name="check" />
                      <span>{done ? (isEnglish ? 'Practiced' : 'ฝึกคล่องแล้ว') : (isEnglish ? 'Mark practiced' : 'ทำเครื่องหมายฝึกแล้ว')}</span>
                    </button>
                  </div>

                  {/* Key Vocabulary Grid */}
                  <div className="grid gap-2 sm:grid-cols-3">
                    {lesson.terms.map((term) => (
                      <div key={term.word} className="rounded-xl border border-brand-border bg-brand-cream/60 p-3">
                        <p className="font-sans text-sm font-semibold text-brand-maroon">{term.word}</p>
                        <p className="mt-0.5 text-xs text-brand-terracotta">{term.readingTh}</p>
                        <p className="mt-1 text-xs leading-5 text-brand-muted">{term.meaningTh}</p>
                      </div>
                    ))}
                  </div>

                  <p className="rounded-lg bg-[#FAF2E6]/70 px-3 py-2 text-xs leading-5 text-brand-muted">
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

