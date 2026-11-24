import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchStudentAdmissionPolicy, invokeStudentRegister } from './studentPractice'
const invoke = vi.hoisted(() => vi.fn())
vi.mock('./supabase', () => ({ supabaseClient: { functions: { invoke } } }))
const payload = { student_code: '6611018', display_name: 'Fixture only', password: 'FixturePasswordOnly!', invite_code: 'DEMO-ONLY' }
describe('registration server acknowledgement', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('never infers account access from a missing server field', async () => {
    invoke.mockResolvedValue({ data: { registered: true, student_code: payload.student_code }, error: null })
    await expect(invokeStudentRegister(payload)).rejects.toThrow('serviceUnavailable')
  })
  it('uses the returned pending status and does not send the browser admission policy', async () => {
    invoke.mockResolvedValue({ data: { registered: true, ...payload, cohort_year: 66, is_active: false }, error: null })
    expect((await invokeStudentRegister({ ...payload, admission_mode: 'auto_approve' })).is_active).toBe(false)
    expect(invoke).toHaveBeenCalledWith('student-register', { body: expect.not.objectContaining({ admission_mode: expect.anything() }) })
  })
  it('returns an unknown public policy when the server is unavailable', async () => {
    invoke.mockResolvedValue({ data: null, error: new Error('offline') })
    expect(await fetchStudentAdmissionPolicy()).toBeNull()
    expect(invoke).toHaveBeenCalledWith('student-register', { method: 'GET' })
  })
})
