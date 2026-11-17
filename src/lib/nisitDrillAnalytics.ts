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

export function saveDrillRecord(record: Omit<DrillRecord, 'id' | 'timestamp' | 'dateFormatted'>): DrillRecord {
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
    const updated = [fullRecord, ...existing].slice(0, 50) // keep last 50 sessions
    localStorage.setItem(DRILL_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors in test or private environments
  }

  return fullRecord
}

export function getDrillRecords(): DrillRecord[] {
  try {
    const raw = localStorage.getItem(DRILL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
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
  let readinessLabelTh = 'ควรฝึกซ้อมทบทวนเพิ่มเติมก่อนลงสนามจริง'
  let readinessLabelEn = 'More practice recommended before field deployment'

  if (avg >= 85 && records.length >= 3) {
    readinessRating = 'mastered'
    readinessLabelTh = 'มีความพร้อมระดับดีเยี่ยม (พร้อมปฏิบัติหน้าที่และแนะนำสมาธิ)'
    readinessLabelEn = 'Mastered readiness: fully prepared for on-site Monk Chat duty'
  } else if (avg >= 70) {
    readinessRating = 'ready'
    readinessLabelTh = 'มีความพร้อมระดับพื้นฐาน (พร้อมสนทนากับชาวต่างชาติ)'
    readinessLabelEn = 'Basic readiness: ready for conversational encounters'
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
