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
  const mode = payload.admission_mode ?? getNisitAdmissionMode()
  if (!supabaseClient) {
    return {
      student_code: payload.student_code,
      cohort_year: Number(payload.student_code.slice(0, 2)),
      display_name: payload.display_name,
      is_active: mode === 'auto_approve',
    }
  }

  const { data, error } = await supabaseClient.functions.invoke('student-register', {
    body: {
      ...payload,
      admission_mode: mode,
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
  if (!data?.registered) throw new Error(data?.code || 'serviceUnavailable')
  return {
    student_code: data.student_code,
    cohort_year: data.cohort_year,
    display_name: data.display_name,
    is_active: typeof data.is_active === 'boolean' ? data.is_active : mode === 'auto_approve',
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
      const { error } = await supabaseClient
        .from('student_practice_progress')
        .upsert(
          { student_id: studentId, module_type: moduleType, item_key: itemKey },
          { onConflict: 'student_id,module_type,item_key' },
        )
      return !error
    }
    const { error } = await supabaseClient
      .from('student_practice_progress')
      .delete()
      .eq('student_id', studentId)
      .eq('module_type', moduleType)
      .eq('item_key', itemKey)
    return !error
  } catch {
    return false
  }
}

