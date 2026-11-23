import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DRILL_STORAGE_KEY, drillRecordsToCsv, getDrillRecords, saveDrillRecord } from './nisitDrillAnalytics'

const attempt = (studentCode = '6611018') => ({
  studentCode, studentName: 'Trial participant', category: 'meditation' as const,
  categoryTitle: 'Meditation', totalQuestions: 4, correctCount: 3,
  scorePercent: 75, timeSpentSeconds: 35, wrongQuestionIds: ['med-01'],
})

beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: (key: string) => values.delete(key),
  } })
})

describe('trial practice records', () => {
  it('shows only the selected participant while preserving other participants records', () => {
    saveDrillRecord(attempt())
    saveDrillRecord(attempt('6611019'))
    expect(getDrillRecords('6611018')).toHaveLength(1)
    expect(getDrillRecords('6611018')[0].studentCode).toBe('6611018')
    expect(getDrillRecords()).toHaveLength(2)
  })

  it('preserves more than 50 attempts for later export', () => {
    for (let i = 0; i < 55; i++) saveDrillRecord(attempt())
    expect(getDrillRecords()).toHaveLength(55)
  })

  it('reports a failed write rather than returning a saved record', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(saveDrillRecord(attempt())).toBeNull()
  })

  it('ignores malformed stored rows without crashing the practice summary', () => {
    localStorage.setItem(DRILL_STORAGE_KEY, JSON.stringify([null, { scorePercent: 95 }]))
    expect(getDrillRecords()).toEqual([])
  })

  it('exports one raw row per attempt without participant names, with spreadsheet-safe cells', () => {
    const record = saveDrillRecord(attempt('=1+1'))!
    const csv = drillRecordsToCsv([record])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(csv).toContain('"\'=1+1"')
    expect(csv).toContain('"4","3","75","35"')
    expect(csv).not.toContain('Trial participant')
  })
})
