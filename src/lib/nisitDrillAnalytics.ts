import type { DrillCategory } from '../content/nisitDrills'

export interface DrillRecord {
  id: string
  timestamp: string // ISO string
  dateFormatted: string // e.g. "17/11/2569 00:35"
  studentCode: string
  studentName: string
  category: DrillCategory
  categoryTitle: string
  totalQuestions: number
  correctCount: number
  scorePercent: number
  timeSpentSeconds: number
  wrongQuestionIds: string[]
}

export interface DrillAggregatedStats {
  totalSessions: number
  averageScorePercent: number
  totalQuestionsAttempted: number
  totalCorrect: number
  categoryStats: Record<DrillCategory, { sessions: number; avgScore: number; totalQuestions: number }>
  readinessRating: 'mastered' | 'ready' | 'needs_practice'
  readinessLabelTh: string
  readinessLabelEn: string
}

export const DRILL_STORAGE_KEY = 'monkchat_nisit_drill_records_v1'

export function saveDrillRecord(record: Omit<DrillRecord, 'id' | 'timestamp' | 'dateFormatted'>): DrillRecord | null {
  const now = new Date()
  const fullRecord: DrillRecord = {
    ...record,
    id: `drill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }

  try {
    const existing = getDrillRecords()
    const updated = [fullRecord, ...existing] // Preserve trial records until explicitly cleared.
    localStorage.setItem(DRILL_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    return null // Report quota/private-mode failures to the caller.
  }

  return fullRecord
}

export function getDrillRecords(studentCode?: string): DrillRecord[] {
  try {
    const raw = localStorage.getItem(DRILL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const records = Array.isArray(parsed) ? parsed.filter(isDrillRecord) : []
    return studentCode ? records.filter(record => record.studentCode === studentCode) : records
  } catch {
    return []
  }
}

export function clearDrillRecords(): void {
  try {
    localStorage.removeItem(DRILL_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export function computeAggregatedStats(records: DrillRecord[]): DrillAggregatedStats {
  if (records.length === 0) {
    return {
      totalSessions: 0,
      averageScorePercent: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      categoryStats: {
        'vinaya-life': { sessions: 0, avgScore: 0, totalQuestions: 0 },
        meditation: { sessions: 0, avgScore: 0, totalQuestions: 0 },
        'dhamma-wisdom': { sessions: 0, avgScore: 0, totalQuestions: 0 },
        'culture-greeting': { sessions: 0, avgScore: 0, totalQuestions: 0 },
      },
      readinessRating: 'needs_practice',
      readinessLabelTh: 'ยังไม่มีประวัติการฝึกซ้อม',
      readinessLabelEn: 'No practice records yet',
    }
  }

  let sumScore = 0
  let totalQuestions = 0
  let totalCorrect = 0

  const catMap: Record<DrillCategory, { sessions: number; sumScore: number; questions: number }> = {
    'vinaya-life': { sessions: 0, sumScore: 0, questions: 0 },
    meditation: { sessions: 0, sumScore: 0, questions: 0 },
    'dhamma-wisdom': { sessions: 0, sumScore: 0, questions: 0 },
    'culture-greeting': { sessions: 0, sumScore: 0, questions: 0 },
  }

  for (const r of records) {
    sumScore += r.scorePercent
    totalQuestions += r.totalQuestions
    totalCorrect += r.correctCount
    if (catMap[r.category]) {
      catMap[r.category].sessions += 1
      catMap[r.category].sumScore += r.scorePercent
      catMap[r.category].questions += r.totalQuestions
    }
  }

  const avg = Math.round(sumScore / records.length)

  let readinessRating: 'mastered' | 'ready' | 'needs_practice' = 'needs_practice'
  let readinessLabelTh = 'ทบทวนคำตอบและลองฝึกซ้ำได้'
  let readinessLabelEn = 'Review the answers and try another practice session'

  if (avg >= 85 && records.length >= 3) {
    readinessRating = 'mastered'
    readinessLabelTh = 'ทำแบบฝึกได้ดีต่อเนื่องอย่างน้อย 3 รอบ'
    readinessLabelEn = 'Consistently high practice scores across at least 3 sessions'
  } else if (avg >= 70) {
    readinessRating = 'ready'
    readinessLabelTh = 'คะแนนแบบฝึกเฉลี่ยตั้งแต่ 70% ขึ้นไป'
    readinessLabelEn = 'Average practice score of at least 70%'
  }

  return {
    totalSessions: records.length,
    averageScorePercent: avg,
    totalQuestionsAttempted: totalQuestions,
    totalCorrect,
    categoryStats: {
      'vinaya-life': {
        sessions: catMap['vinaya-life'].sessions,
        avgScore: catMap['vinaya-life'].sessions > 0 ? Math.round(catMap['vinaya-life'].sumScore / catMap['vinaya-life'].sessions) : 0,
        totalQuestions: catMap['vinaya-life'].questions,
      },
      meditation: {
        sessions: catMap.meditation.sessions,
        avgScore: catMap.meditation.sessions > 0 ? Math.round(catMap.meditation.sumScore / catMap.meditation.sessions) : 0,
        totalQuestions: catMap.meditation.questions,
      },
      'dhamma-wisdom': {
        sessions: catMap['dhamma-wisdom'].sessions,
        avgScore: catMap['dhamma-wisdom'].sessions > 0 ? Math.round(catMap['dhamma-wisdom'].sumScore / catMap['dhamma-wisdom'].sessions) : 0,
        totalQuestions: catMap['dhamma-wisdom'].questions,
      },
      'culture-greeting': {
        sessions: catMap['culture-greeting'].sessions,
        avgScore: catMap['culture-greeting'].sessions > 0 ? Math.round(catMap['culture-greeting'].sumScore / catMap['culture-greeting'].sessions) : 0,
        totalQuestions: catMap['culture-greeting'].questions,
      },
    },
    readinessRating,
    readinessLabelTh,
    readinessLabelEn,
  }
}

function isDrillRecord(value: unknown): value is DrillRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as Partial<DrillRecord>
  return typeof r.id === 'string' && typeof r.timestamp === 'string'
    && typeof r.studentCode === 'string' && typeof r.studentName === 'string'
    && typeof r.categoryTitle === 'string'
    && ['vinaya-life', 'meditation', 'dhamma-wisdom', 'culture-greeting'].includes(String(r.category))
    && Number.isInteger(r.totalQuestions) && Number(r.totalQuestions) > 0
    && Number.isInteger(r.correctCount) && Number(r.correctCount) >= 0 && Number(r.correctCount) <= Number(r.totalQuestions)
    && Number.isFinite(r.scorePercent) && Number(r.scorePercent) >= 0 && Number(r.scorePercent) <= 100
    && Number.isFinite(r.timeSpentSeconds) && Number(r.timeSpentSeconds) >= 0
    && Array.isArray(r.wrongQuestionIds)
}

/** Export raw practice attempts. Scores are practice results, not field competency ratings. */
export function drillRecordsToCsv(records: DrillRecord[]): string {
  const cell = (value: string | number) => {
    let text = String(value)
    if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = "'" + text
    return '"' + text.replaceAll('"', '""') + '"'
  }
  const rows = records.map(r => [r.id, r.timestamp, r.studentCode, r.category, r.totalQuestions,
    r.correctCount, r.scorePercent, r.timeSpentSeconds, r.wrongQuestionIds.join('|')])
  return '\ufeff' + [['attempt_id', 'timestamp_utc', 'participant_code', 'category', 'total_questions',
    'correct_count', 'score_percent', 'time_seconds', 'wrong_question_ids'], ...rows]
    .map(row => row.map(cell).join(',')).join('\r\n')
}
