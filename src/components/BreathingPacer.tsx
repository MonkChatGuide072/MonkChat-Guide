import { useEffect, useState } from 'react'
import { GuideIcon } from './GuideIcon'

interface BreathingPacerProps {
  language: 'en' | 'th'
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

const PHASE_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 4,
  exhale: 4,
  rest: 4,
}

const PHASE_TEXTS = {
  en: {
    inhale: 'Breathe in gentle peace...',
    hold: 'Hold awareness softly...',
    exhale: 'Slowly breathe out all tension...',
    rest: 'Rest quietly at the center...',
    title: '1-Minute Calming Breath Pacer',
    subtitle: 'Relax your body and settle your thoughts before pressing play on the audio tracks.',
    start: 'Start Breathing Pacer',
    pause: 'Pause Pacer',
    reset: 'Reset',
    cycleLabel: 'Cycle',
    centerCue: 'Feel your awareness naturally settling 2 finger-breadths above the navel.',
  },
  th: {
    inhale: 'หายใจเข้าช้า ๆ อย่างสบาย...',
    hold: 'หยุดใจนิ่งสงบเบา ๆ...',
    exhale: 'ค่อย ๆ ผ่อนลมหายใจออก คลายความกังวล...',
    rest: 'วางใจนิ่งพักที่ศูนย์กลางกาย...',
    title: 'ตัวช่วยปรับลมหายใจ 1 นาทีเพื่อความผ่อนคลาย',
    subtitle: 'ผ่อนคลายกล้ามเนื้อทั่วร่างกายและทำใจให้สบาย ก่อนเริ่มเปิดฟังเสียงนำสมาธิ',
    start: 'เริ่มตัวช่วยปรับลมหายใจ',
    pause: 'หยุดชั่วคราว',
    reset: 'เริ่มใหม่',
    cycleLabel: 'รอบที่',
    centerCue: 'น้อมใจมาพักเบา ๆ ที่ศูนย์กลางกายฐานที่ 7 เหนือระดับสะดือ 2 นิ้วมือ',
  },
}

export function BreathingPacer({ language }: BreathingPacerProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const copy = PHASE_TEXTS[language]

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1

        // Transition to next phase
        if (phase === 'inhale') {
          setPhase('hold')
          return PHASE_DURATIONS.hold
        } else if (phase === 'hold') {
          setPhase('exhale')
          return PHASE_DURATIONS.exhale
        } else if (phase === 'exhale') {
          setPhase('rest')
          return PHASE_DURATIONS.rest
        } else {
          setPhase('inhale')
          setCyclesCompleted((c) => c + 1)
          return PHASE_DURATIONS.inhale
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, phase])

  const handleToggle = () => {
    setIsActive(!isActive)
  }

  const handleReset = () => {
    setIsActive(false)
    setPhase('inhale')
    setSecondsLeft(4)
    setCyclesCompleted(0)
  }

  // Animation scaling for circle
  const getScaleClass = () => {
    if (!isActive) return 'scale-100 opacity-80'
    if (phase === 'inhale') return 'scale-125 opacity-100 bg-amber-400/25 ring-8 ring-amber-400/20'
    if (phase === 'hold') return 'scale-125 opacity-90 bg-amber-400/30 ring-8 ring-amber-400/25'
    if (phase === 'exhale') return 'scale-95 opacity-70 bg-amber-200/20 ring-4 ring-amber-300/15'
    return 'scale-90 opacity-80 bg-amber-100/20 ring-2 ring-amber-200/20'
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-b from-white via-[#FDFBF7] to-[#F7F2EB] p-6 sm:p-8 shadow-[0_4px_20px_rgba(43,24,16,0.03)]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Instructions and description */}
        <div className="max-w-md text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-800/15 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
            <GuideIcon name="lotus" className="h-3.5 w-3.5 text-amber-700" />
            <span>{copy.title}</span>
          </div>

          <h3 className="mt-3 font-serif text-xl sm:text-2xl font-semibold text-brand-maroon leading-snug">
            {copy.subtitle}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
            {copy.centerCue}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={handleToggle}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
                isActive
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-brand-maroon text-white hover:bg-brand-terracotta hover:shadow-md'
              }`}
            >
              <GuideIcon name={isActive ? 'close' : 'play'} className="h-4 w-4" />
              <span>{isActive ? copy.pause : copy.start}</span>
            </button>

            {(isActive || cyclesCompleted > 0) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {copy.reset}
              </button>
            )}

            {cyclesCompleted > 0 && (
              <span className="text-xs font-medium text-stone-500">
                {copy.cycleLabel}: {cyclesCompleted}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Visual Breathing Circle */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center">
            {/* Ambient Background Aura */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${getScaleClass()}`}
            />

            {/* Inner Glowing Center */}
            <div className="relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 flex-col items-center justify-center rounded-full border border-amber-300/80 bg-white shadow-[0_4px_24px_rgba(217,119,6,0.15)] text-center p-3">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums text-amber-800">
                {secondsLeft}s
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                {phase}
              </span>
            </div>
          </div>

          <p className="mt-3 text-center text-sm font-medium text-stone-700 min-h-[1.5rem]">
            {isActive ? copy[phase] : (language === 'en' ? 'Click start to begin breathing...' : 'กดปุ่มเริ่มเพื่อปรับจังหวะลมหายใจ...')}
          </p>
        </div>
      </div>
    </div>
  )
}
