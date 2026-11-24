import type { StudentAccessStatus } from './studentAccess'
import { supabaseClient } from './supabase'

export type ProgressModuleType = 'vocab_lesson' | 'qa_flashcard' | 'audio_track'

export type NisitAdmissionMode = 'auto_approve' | 'admin_approval'

export const ADMISSION_MODE_STORAGE_KEY = 'monkchat_nisit_admission_mode'

/**
 * Returns current admission policy:
 * - 'auto_approve' (default): New student registrations receive immediate access ("เปิดให้คนเข้าได้เลยช่วงนี้").
 * - 'admin_approval': Registrations require admin confirmation in /admin/students before access is granted.
 */
export function getNisitAdmissionMode(): NisitAdmissionMode {
  try {
    const val = localStorage.getItem(ADMISSION_MODE_STORAGE_KEY)
    if (val === 'admin_approval' || val === 'auto_approve') return val
  } catch {
    // LocalStorage fallback
  }
  return 'auto_approve'
}

export function setNisitAdmissionMode(mode: NisitAdmissionMode): void {
  try {
    localStorage.setItem(ADMISSION_MODE_STORAGE_KEY, mode)
  } catch {
    // LocalStorage fallback
  }
}

/** Public display only; registration always enforces the policy on the server. */
export async function fetchStudentAdmissionPolicy(): Promise<NisitAdmissionMode | null> {
  if (!supabaseClient) return null
  try {
    const { data, error } = await supabaseClient.functions.invoke('student-register', { method: 'GET' })
    if (error || !['auto_approve', 'admin_approval'].includes(data?.admission_mode)) return null
    return data.admission_mode
  } catch { return null }
}

/** Converts a 7-digit student code into the reserved non-routable internal domain email. */
export function toStudentInternalEmail(studentCode: string): string {
  return `${studentCode.trim()}@student.monkchat.invalid`
}

/** Rejects short passwords and predictable ID=Password or monkchat+ID defaults. */
export function isAcceptableStudentPassword(password: string, studentCode: string): boolean {
  if (password.length < 12 || password.length > 128) return false
  const lower = password.trim().toLowerCase()
  const lowerId = studentCode.trim().toLowerCase()
  if (lower === lowerId) return false
  if (lower === `monkchat${lowerId}` || lower === `${lowerId}monkchat`) return false
  return true
}

export interface StudentRegisterPayload {
  student_code: string
  display_name: string
  dharma_name?: string
  password: string
  invite_code?: string
  admission_mode?: NisitAdmissionMode
}

export interface StudentRegisterResult {
  student_code: string
  cohort_year: number
  display_name: string
  is_active: boolean
}

export async function invokeStudentRegister(
  payload: StudentRegisterPayload,
): Promise<StudentRegisterResult> {
  if (!supabaseClient) throw new Error('serviceUnavailable')
  const { data, error } = await supabaseClient.functions.invoke('student-register', {
    body: {
      student_code: payload.student_code,
      display_name: payload.display_name,
      dharma_name: payload.dharma_name,
      password: payload.password,
      invite_code: payload.invite_code,
    },
  })
  if (error) {
    let code = 'serviceUnavailable'
    if ('context' in error && error.context instanceof Response) {
      try {
        const body = await error.context.json()
        if (typeof body?.code === 'string') code = body.code
      } catch {
        // Keep fallback error code.
      }
    }
    throw new Error(code)
  }
  if (!data?.registered || typeof data.is_active !== 'boolean') throw new Error(data?.code || 'serviceUnavailable')
  return {
    student_code: data.student_code,
    cohort_year: data.cohort_year,
    display_name: data.display_name,
    is_active: data.is_active,
  }
}

export interface CohortInviteSummary {
  id: string
  cohort_year: number
  label: string
  code_hint: string
  is_active: boolean
  max_uses: number
  used_count: number
  expires_at: string | null
  created_at: string
}

export interface StudentRosterItem {
  student_access_status?: StudentAccessStatus | null
  student_access_note?: string | null
  student_access_updated_at?: string | null
  id: string
  display_name: string
  dharma_name: string | null
  student_code: string | null
  cohort_year: number | null
  role: 'student'
  is_active: boolean
  vocab_count?: number
  qa_count?: number
}

export async function invokeStudentCohorts<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  if (!supabaseClient) throw new Error('serviceUnavailable')
  const { data, error } = await supabaseClient.functions.invoke('student-cohorts', { body })
  if (error) {
    let code = 'serviceUnavailable'
    if ('context' in error && error.context instanceof Response) {
      try {
        const resBody = await error.context.json()
        if (typeof resBody?.code === 'string') code = resBody.code
      } catch {
        // Keep generic error code.
      }
    }
    throw new Error(code)
  }
  if (!data || data.code) throw new Error(data?.code || 'serviceUnavailable')
  return data as T
}

export async function fetchStudentCompletedKeys(
  studentId: string,
  moduleType: ProgressModuleType,
): Promise<string[] | null> {
  if (!supabaseClient) return null
  try {
    const { data, error } = await supabaseClient
      .from('student_practice_progress')
      .select('item_key')
      .eq('student_id', studentId)
      .eq('module_type', moduleType)
    if (error || !Array.isArray(data)) return null
    return data.map((row) => String((row as { item_key: string }).item_key))
  } catch {
    return null
  }
}

export async function setStudentItemCompleted(
  studentId: string,
  moduleType: ProgressModuleType,
  itemKey: string,
  completed: boolean,
): Promise<boolean> {
  if (!supabaseClient) return false
  try {
    if (completed) {
      const { data, error } = await supabaseClient
        .from('student_practice_progress')
        .upsert(
          { student_id: studentId, module_type: moduleType, item_key: itemKey },
          { onConflict: 'student_id,module_type,item_key' },
        )
        .select('item_key').maybeSingle()
      return !error && data?.item_key === itemKey
    }
    const { data, error } = await supabaseClient
      .from('student_practice_progress')
      .delete()
      .eq('student_id', studentId)
      .eq('module_type', moduleType)
      .eq('item_key', itemKey).select('item_key')
    return !error && Array.isArray(data) && data.some(row => row.item_key === itemKey)
  } catch {
    return false
  }
}

