import { useState, useMemo, useEffect } from 'react'
import {
  DRILL_CATEGORIES,
  SCENARIO_DRILLS,
  type DrillCategory,
  type ScenarioDrill,
} from '../../content/nisitDrills'
import {
  saveDrillRecord,
  getDrillRecords,
  computeAggregatedStats,
  type DrillRecord,
} from '../../lib/nisitDrillAnalytics'
import { GuideIcon } from '../GuideIcon'

interface NisitInteractiveDrillProps {
  isEnglish: boolean
  studentCode?: string
  studentName?: string
}

export function NisitInteractiveDrill({
  isEnglish,
  studentCode = 'AYT-MONK',
  studentName = 'พระนิสิตผู้ปฏิบัติหน้าที่',
}: NisitInteractiveDrillProps) {
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [mindfulnessLotuses, setMindfulnessLotuses] = useState(3)

  // Interactive state for current question
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [scramblePlacedTokens, setScramblePlacedTokens] = useState<string[]>([])
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false)
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0)
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Completion & Analytics view
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [showResearchModal, setShowResearchModal] = useState(false)
  const [drillRecords, setDrillRecords] = useState<DrillRecord[]>([])

  useEffect(() => {
    setDrillRecords(getDrillRecords())
  }, [isSessionComplete])

  const categoryQuestions = useMemo(() => {
    if (!selectedCategory) return []
    return SCENARIO_DRILLS.filter((q) => q.category === selectedCategory)
  }, [selectedCategory])

  const currentQuestion: ScenarioDrill | undefined = categoryQuestions[currentQuestionIndex]

  // Scramble word bank (all correct tokens + distractors)
  const availableScrambleTokens = useMemo(() => {
    if (!currentQuestion || currentQuestion.type !== 'scramble') return []
    const all = [
      ...(currentQuestion.scrambleCorrectTokens || []),
      ...(currentQuestion.scrambleDistractorTokens || []),
    ]
    const remaining = [...all]
    for (const placed of scramblePlacedTokens) {
      const idx = remaining.indexOf(placed)
      if (idx !== -1) {
        remaining.splice(idx, 1)
      }
    }
    return remaining
  }, [currentQuestion, scramblePlacedTokens])

  const stats = useMemo(() => computeAggregatedStats(drillRecords), [drillRecords])

  const startCategoryDrill = (cat: DrillCategory) => {
    setSelectedCategory(cat)
    setCurrentQuestionIndex(0)
    setMindfulnessLotuses(3)
    setSelectedOptionId(null)
    setScramblePlacedTokens([])
    setIsAnswerChecked(false)
    setIsCurrentCorrect(false)
    setSessionCorrectCount(0)
    setWrongQuestionIds([])
    setStartTime(Date.now())
    setIsSessionComplete(false)
  }

  const exitDrill = () => {
    setSelectedCategory(null)
    setIsSessionComplete(false)
  }

  // Audio Speech Synthesis for question pronunciation
  const playVisitorAudio = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.92
        window.speechSynthesis.speak(utterance)
      }
    } catch {
      // Ignore if speech API is unavailable
    }
  }

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (!currentQuestion) return

    let correct = false
    if (currentQuestion.type === 'choice') {
      const opt = currentQuestion.options?.find((o) => o.id === selectedOptionId)
      correct = Boolean(opt?.isCorrect)
    } else if (currentQuestion.type === 'scramble') {
      const correctTokens = currentQuestion.scrambleCorrectTokens || []
      correct =
        scramblePlacedTokens.length === correctTokens.length &&
        scramblePlacedTokens.every((token, i) => token === correctTokens[i])
    }

    setIsCurrentCorrect(correct)
    setIsAnswerChecked(true)

    if (correct) {
      setSessionCorrectCount((prev) => prev + 1)
    } else {
      setMindfulnessLotuses((prev) => Math.max(0, prev - 1))
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id])
    }
  }

  // Next Question Handler
  const handleNextQuestion = () => {
    if (!selectedCategory) return

    if (currentQuestionIndex + 1 < categoryQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOptionId(null)
      setScramblePlacedTokens([])
      setIsAnswerChecked(false)
      setIsCurrentCorrect(false)
    } else {
      // Completed drill session!
      const finalCorrect = sessionCorrectCount
      const totalQ = categoryQuestions.length
      const scorePct = Math.round((finalCorrect / totalQ) * 100)
      const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000))

      const categoryInfo = DRILL_CATEGORIES.find((c) => c.id === selectedCategory)

      saveDrillRecord({
        studentCode,
        studentName,
        category: selectedCategory,
        categoryTitle: categoryInfo?.titleTh || selectedCategory,
        totalQuestions: totalQ,
        correctCount: finalCorrect,
        scorePercent: scorePct,
        timeSpentSeconds: durationSec,
        wrongQuestionIds,
      })

      setIsSessionComplete(true)
    }
  }

  // ==========================================
  // VIEW 1: Research Analytics Modal (For Thesis Chapter 4)
  // ==========================================
  if (showResearchModal) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold">
              <GuideIcon name="book" className="h-4 w-4" />
              <span>{isEnglish ? 'Senior Project Research Data' : 'ข้อมูลสถิติสำหรับรายงานภาคนิพนธ์ (บทที่ 4)'}</span>
            </div>
            <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-brand-maroon">
              {isEnglish ? 'Monk Chat Practice Empirical Evidence' : 'สถิติการฝึกฝนทักษะการสนทนาธรรมของพระนิสิต'}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {isEnglish
                ? 'Empirical trial metrics recorded from interactive drill sessions. Ready to cite in Chapter 4.'
                : 'บันทึกข้อมูลเชิงประจักษ์จากการทดลองฝึกทักษะจริง เพื่อนำไปจัดทำตารางและกราฟวิเคราะห์ในบทที่ 4'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResearchModal(false)}
            className="rounded-xl border border-brand-border bg-stone-50 px-4 py-2 text-sm font-medium text-brand-maroon hover:bg-stone-100 cursor-pointer transition-colors"
          >
            {isEnglish ? 'Back to Practice' : '← กลับสู่ห้องฝึกซ้อม'}
          </button>
        </div>

        {/* Aggregated Research Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-brand-border bg-stone-50/60 p-3 text-center">
            <span className="text-xs text-brand-muted">{isEnglish ? 'Total Sessions' : 'จำนวนรอบการฝึก'}</span>
            <p className="text-xl sm:text-2xl font-bold text-brand-maroon tabular-nums mt-1">{stats.totalSessions}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-stone-50/60 p-3 text-center">
            <span className="text-xs text-brand-muted">{isEnglish ? 'Avg Accuracy' : 'ความแม่นยำเฉลี่ย'}</span>
            <p className="text-xl sm:text-2xl font-bold text-brand-maroon tabular-nums mt-1">{stats.averageScorePercent}%</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-stone-50/60 p-3 text-center">
            <span className="text-xs text-brand-muted">{isEnglish ? 'Questions Answered' : 'ข้อที่ผ่านการตอบ'}</span>
            <p className="text-xl sm:text-2xl font-bold text-brand-maroon tabular-nums mt-1">{stats.totalQuestionsAttempted}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-stone-50/60 p-3 text-center">
            <span className="text-xs text-brand-muted">{isEnglish ? 'Readiness Status' : 'ความพร้อมหน้างาน'}</span>
            <p className="text-xs sm:text-sm font-semibold text-brand-maroon mt-1 leading-snug">{stats.readinessLabelTh}</p>
          </div>
        </div>

        {/* Research Table */}
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-white shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-brand-maroon border-b border-brand-border">
              <tr>
                <th className="p-3 font-semibold">วัน-เวลา</th>
                <th className="p-3 font-semibold">รหัสพระนิสิต</th>
                <th className="p-3 font-semibold">หมวดการฝึก</th>
                <th className="p-3 font-semibold text-center">จำนวนข้อ</th>
                <th className="p-3 font-semibold text-center">ตอบถูก</th>
                <th className="p-3 font-semibold text-center">คะแนน (%)</th>
                <th className="p-3 font-semibold text-center">เวลาที่ใช้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60 text-brand-text">
              {drillRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-brand-muted">
                    {isEnglish ? 'No practice sessions recorded yet. Complete a drill to generate thesis data!' : 'ยังไม่มีประวัติการฝึกซ้อม ลองฝึกตอบคำถามอย่างน้อย 1 หมวดเพื่อบันทึกข้อมูลวิจัย'}
                  </td>
                </tr>
              ) : (
                drillRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3 tabular-nums text-brand-muted">{rec.dateFormatted}</td>
                    <td className="p-3 font-medium text-brand-maroon">{rec.studentCode}</td>
                    <td className="p-3">{rec.categoryTitle}</td>
                    <td className="p-3 text-center tabular-nums">{rec.totalQuestions}</td>
                    <td className="p-3 text-center tabular-nums text-brand-maroon font-semibold">{rec.correctCount}</td>
                    <td className="p-3 text-center tabular-nums font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        rec.scorePercent >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {rec.scorePercent}%
                      </span>
                    </td>
                    <td className="p-3 text-center tabular-nums text-brand-muted">{rec.timeSpentSeconds} วินาที</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: Session Completed Screen
  // ==========================================
  if (isSessionComplete && selectedCategory) {
    const finalScore = Math.round((sessionCorrectCount / categoryQuestions.length) * 100)
    const isHighPassing = finalScore >= 80

    return (
      <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 text-center space-y-6 shadow-xs max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-brand-gold-soft border border-brand-gold/40 mx-auto flex items-center justify-center text-brand-gold">
          <GuideIcon name="lotus" className="h-7 w-7" />
        </div>

        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
            isHighPassing ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-stone-100 border-stone-300 text-stone-800'
          }`}>
            {isHighPassing
              ? (isEnglish ? 'Monk Chat Ready' : 'ผ่านการทดสอบ: พร้อมปฏิบัติหน้าที่จริง')
              : (isEnglish ? 'Review Recommended' : 'ควรฝึกซ้อมทบทวนเพิ่มเติม')}
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-brand-maroon">
            {isHighPassing ? 'ยอดเยี่ยมมากครับ พระคุณเจ้า' : 'การฝึกซ้อมเสร็จสิ้น'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {isEnglish
              ? `Session completed with ${sessionCorrectCount} of ${categoryQuestions.length} correct (${finalScore}%).`
              : `จบการฝึกซ้อม ตอบถูกต้อง ${sessionCorrectCount} จาก ${categoryQuestions.length} ข้อ (ความแม่นยำ ${finalScore}%)`}
          </p>
        </div>

        {/* Score Ring Summary */}
        <div className="p-4 rounded-xl bg-stone-50 border border-brand-border flex items-center justify-around">
          <div>
            <span className="text-xs text-brand-muted block">คะแนนความแม่นยำ</span>
            <span className="text-2xl font-bold text-brand-maroon tabular-nums">{finalScore}%</span>
          </div>
          <div className="h-8 w-px bg-brand-border"></div>
          <div>
            <span className="text-xs text-brand-muted block">ระดับสติที่เหลือ</span>
            <span className="text-2xl font-bold text-brand-gold tabular-nums">{mindfulnessLotuses}/3</span>
          </div>
          <div className="h-8 w-px bg-brand-border"></div>
          <div>
            <span className="text-xs text-brand-muted block">บันทึกข้อมูลวิจัย</span>
            <span className="text-xs font-semibold text-emerald-800 mt-1 block">✓ บันทึกแล้ว</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => startCategoryDrill(selectedCategory)}
            className="w-full sm:w-auto min-h-11 rounded-xl bg-brand-maroon px-6 py-2 text-sm font-medium text-white hover:bg-brand-maroon/90 transition-colors cursor-pointer"
          >
            {isEnglish ? 'Practice Category Again' : 'ฝึกหมวดนี้ซ้ำอีกรอบ'}
          </button>
          <button
            type="button"
            onClick={exitDrill}
            className="w-full sm:w-auto min-h-11 rounded-xl border border-brand-border bg-stone-50 px-6 py-2 text-sm font-medium text-brand-maroon hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {isEnglish ? 'Choose Another Category' : 'เลือกหมวดการฝึกอื่น'}
          </button>
          <button
            type="button"
            onClick={() => setShowResearchModal(true)}
            className="w-full sm:w-auto min-h-11 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-muted hover:text-brand-maroon hover:border-brand-maroon transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <GuideIcon name="book" className="h-4 w-4 text-brand-gold" />
            <span>{isEnglish ? 'View Thesis Logs' : 'ดูตารางวิจัย (บทที่ 4)'}</span>
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 3: Active Question Drill
  // ==========================================
  if (selectedCategory && currentQuestion) {
    const isScramble = currentQuestion.type === 'scramble'
    const canCheckAnswer = isScramble
      ? scramblePlacedTokens.length >= 2
      : Boolean(selectedOptionId)

    return (
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Top Progress & Mindfulness Lotus Header */}
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-brand-maroon">
          <button
            type="button"
            onClick={exitDrill}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-maroon transition-colors cursor-pointer"
          >
            <GuideIcon name="chevronLeft" className="h-4 w-4" />
            <span>{isEnglish ? 'Exit' : 'ออก'}</span>
          </button>

          <div className="flex-1 max-w-xs mx-2">
            <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / categoryQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-brand-maroon font-semibold tabular-nums">
            <GuideIcon name="lotus" className="h-4 w-4 text-brand-gold" />
            <span className="px-1.5 py-0.5 rounded bg-brand-gold-soft border border-brand-gold/30">
              {mindfulnessLotuses}/3
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-brand-muted font-mono">
          ข้อ {currentQuestionIndex + 1} จาก {categoryQuestions.length}
        </div>

        {/* Visitor Question Scenario Card */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-brand-gold-soft border border-brand-gold/40 flex items-center justify-center text-xs font-bold text-brand-maroon shadow-2xs">
            {currentQuestion.visitor.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 bg-white border border-brand-border rounded-2xl rounded-tl-sm p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-brand-maroon">
                {currentQuestion.visitor.name} ({isEnglish ? currentQuestion.visitor.countryEn : currentQuestion.visitor.countryTh})
              </span>
              <button
                type="button"
                onClick={() => playVisitorAudio(currentQuestion.visitor.questionEn)}
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                title="ฟังเสียงอ่านภาษาอังกฤษ"
              >
                <GuideIcon name="play" className="h-3 w-3 text-brand-maroon" />
                <span>{isEnglish ? 'Listen' : 'ฟังเสียง'}</span>
              </button>
            </div>

            <p className="font-serif text-base sm:text-lg font-semibold text-brand-maroon leading-snug">
              “{currentQuestion.visitor.questionEn}”
            </p>
            <p className="text-xs text-brand-muted pt-1 border-t border-brand-border/60">
              ({currentQuestion.visitor.questionTh})
            </p>
          </div>
        </div>

        {/* Prompt Instruction */}
        <div className="pt-1">
          <p className="text-xs sm:text-sm font-medium text-brand-maroon">
            {isScramble
              ? (isEnglish ? 'Arrange the English word tiles to construct a polite Dhamma response:' : 'แตะเรียงคำภาษาอังกฤษด้านล่างให้เป็นประโยคที่ถูกต้องตามพระวินัยและสุภาพ:')
              : (isEnglish ? 'Select the most polite and doctrinally accurate response:' : 'เลือกคำตอบที่ถูกต้องตามพระธรรมวินัยและสุภาพเป็นสากลที่สุด:')}
          </p>
          {isScramble && currentQuestion.scramblePromptTh && (
            <p className="text-xs sm:text-sm font-medium text-brand-maroon mt-1 bg-brand-gold-soft/80 p-3 rounded-xl border border-brand-gold/30">
              {currentQuestion.scramblePromptTh}
            </p>
          )}
        </div>

        {/* Interaction Type 1: Scenario Multiple Choice */}
        {!isScramble && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id
              let borderStyle = 'border-brand-border bg-white hover:border-brand-gold/80 hover:bg-stone-50/50'
              if (isSelected) {
                borderStyle = 'border-brand-maroon bg-stone-50 ring-1 ring-brand-maroon shadow-xs'
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${borderStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-brand-maroon text-white border-brand-maroon' : 'border-stone-200 text-stone-600 bg-stone-50'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-text leading-snug">
                      “{option.textEn}”
                    </p>
                    <p className="text-xs text-brand-muted mt-1">
                      ({option.textTh})
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Interaction Type 2: Sentence Scramble / Builder */}
        {isScramble && (
          <div className="space-y-4">
            {/* Built Sentence Container (Dropzone) */}
            <div className="min-h-[76px] p-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 flex flex-wrap gap-2 items-center content-start">
              {scramblePlacedTokens.length === 0 ? (
                <span className="text-xs text-brand-muted italic">
                  {isEnglish ? 'Tap word tiles below to build the sentence...' : 'แตะคำด้านล่างเพื่อต่อประโยค...'}
                </span>
              ) : (
                scramblePlacedTokens.map((token, idx) => (
                  <button
                    key={`${token}-${idx}`}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setScramblePlacedTokens((prev) => prev.filter((_, i) => i !== idx))
                      }
                    }}
                    className="bg-white hover:bg-stone-100 text-brand-maroon font-medium text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-brand-border shadow-2xs cursor-pointer transition-all active:scale-95"
                    title="แตะเพื่อนำคำนี้ออก"
                  >
                    <span>{token}</span>
                  </button>
                ))
              )}
            </div>

            {/* Word Bank */}
            <div>
              <div className="flex items-center justify-between text-xs text-brand-muted mb-2">
                <span>{isEnglish ? 'Available Word Tiles:' : 'คลังคำศัพท์ (แตะเพื่อเพิ่มเข้าประโยค):'}</span>
                {scramblePlacedTokens.length > 0 && !isAnswerChecked && (
                  <button
                    type="button"
                    onClick={() => setScramblePlacedTokens([])}
                    className="text-brand-gold underline hover:text-brand-maroon cursor-pointer text-xs"
                  >
                    {isEnglish ? 'Clear all' : 'ล้างทั้งหมด'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center p-3.5 bg-stone-50 rounded-xl border border-brand-border">
                {availableScrambleTokens.map((token, idx) => (
                  <button
                    key={`avail-${token}-${idx}`}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setScramblePlacedTokens((prev) => [...prev, token])
                      }
                    }}
                    className="bg-white hover:bg-stone-100 text-stone-800 font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-stone-200 hover:border-brand-gold shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Check Answer Button (Before Checked) */}
        {!isAnswerChecked && (
          <div className="pt-2">
            <button
              type="button"
              disabled={!canCheckAnswer}
              onClick={handleCheckAnswer}
              className={`w-full min-h-12 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                canCheckAnswer
                  ? 'bg-brand-maroon text-white hover:bg-brand-maroon/90 shadow-xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isEnglish ? 'Check Answer' : 'ตรวจคำตอบ'}
            </button>
          </div>
        )}

        {/* Feedback Sheet (After Checked) */}
        {isAnswerChecked && (
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
            isCurrentCorrect
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                isCurrentCorrect ? 'bg-emerald-700' : 'bg-amber-700'
              }`}>
                {isCurrentCorrect ? '✓' : '!'}
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  {isCurrentCorrect
                    ? (isEnglish ? 'Correct & Doctrinally Sound!' : 'ถูกต้องตามพระธรรมวินัยและสุภาพสากล')
                    : (isEnglish ? 'Observations & Vinaya Reflection:' : 'ข้อสังเกตและคำอธิบายพระวินัย:')}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed">
              {isEnglish ? currentQuestion.explanationEn : currentQuestion.explanationTh}
            </p>

            {currentQuestion.vinayaFocusTh && (
              <p className="text-xs font-medium text-brand-maroon border-t border-brand-border/60 pt-2 flex items-center gap-1.5">
                <GuideIcon name="book" className="h-3.5 w-3.5 text-brand-gold" />
                <span>{isEnglish ? 'Vinaya Context: ' : 'หลักธรรมวินัยที่เกี่ยวข้อง: '} {currentQuestion.vinayaFocusTh}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleNextQuestion}
              className={`w-full min-h-11 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer ${
                isCurrentCorrect
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-amber-900 hover:bg-amber-950'
              }`}
            >
              {currentQuestionIndex + 1 < categoryQuestions.length
                ? (isEnglish ? 'Next Question ➔' : 'ข้อถัดไป ➔')
                : (isEnglish ? 'View Final Results ➔' : 'ดูสรุปผลการฝึกซ้อม ➔')}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // VIEW 4: Category Selection Lobby (Default)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Lobby Banner */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold">
            <GuideIcon name="lotus" className="h-4 w-4" />
            <span>{isEnglish ? 'Duolingo-style Monk Chat Simulation' : 'ระบบจำลองสถานการณ์การสนทนาจริง (Interactive Drills)'}</span>
          </div>
          <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-brand-maroon">
            {isEnglish ? 'Scenario-Based Training Hub' : 'ห้องซ้อมรับมือนักท่องเที่ยวจำลอง'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-brand-muted max-w-xl leading-relaxed">
            {isEnglish
              ? 'Prepare for real on-site Monk Chat encounters at Wat Mahathat. Practice difficult visitor questions, Vinaya boundaries, and meditation guiding scripts with instant feedback.'
              : 'ซักซ้อมบทสนทนาจริงก่อนลงพื้นที่วัดมหาธาตุ อยุธยา จำลองคำถามยากเรื่องพระวินัย การอธิบายสมาธิ และการแก้ปัญหาเฉพาะหน้า พร้อมคำแนะนำตามพระธรรมวินัย'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResearchModal(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-border bg-stone-50 hover:bg-stone-100 px-4 text-xs sm:text-sm font-medium text-brand-maroon cursor-pointer transition-colors"
        >
          <GuideIcon name="book" className="h-4 w-4 text-brand-gold" />
          <span>{isEnglish ? 'Thesis Empirical Stats' : 'สถิติสำหรับเล่มภาคนิพนธ์ (บทที่ 4)'}</span>
        </button>
      </div>

      {/* 4 Category Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DRILL_CATEGORIES.map((cat) => {
          const catQuestions = SCENARIO_DRILLS.filter((q) => q.category === cat.id)
          const catStat = stats.categoryStats[cat.id]

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-brand-border bg-white p-5 hover:border-brand-gold/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-brand-gold-soft flex items-center justify-center text-brand-gold border border-brand-border/60">
                    <GuideIcon
                      name={
                        cat.id === 'meditation'
                          ? 'lotus'
                          : cat.id === 'vinaya-life'
                            ? 'book'
                            : cat.id === 'dhamma-wisdom'
                              ? 'compass'
                              : 'chat'
                      }
                      className="h-5 w-5"
                    />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {catQuestions.length} {isEnglish ? 'Scenarios' : 'สถานการณ์จำลอง'}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-brand-maroon">
                    {isEnglish ? cat.titleEn : cat.titleTh}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {isEnglish ? cat.subtitleEn : cat.subtitleTh}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <span className="text-xs text-brand-muted">
                  {catStat.sessions > 0
                    ? `ฝึกแล้ว ${catStat.sessions} รอบ (เฉลี่ย ${catStat.avgScore}%)`
                    : 'ยังไม่เคยฝึก'}
                </span>

                <button
                  type="button"
                  onClick={() => startCategoryDrill(cat.id)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon/90 text-white px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>{isEnglish ? 'Start Drill' : 'เริ่มฝึกซ้อม'}</span>
                  <GuideIcon name="arrow" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
