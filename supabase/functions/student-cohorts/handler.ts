import {
  generateCohortInviteCode,
  generateRandomPassword,
  normalizeInviteCode,
  sha256Hex,
} from '../_shared/studentAuth.ts'

export interface CohortInviteRecord {
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

export type AccessStatus = 'pending' | 'active' | 'suspended' | 'needs_review'

export interface StudentRecord {
  student_access_status?: AccessStatus
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

export interface StudentCohortContext {
  actor: { id: string; display_name: string; role: 'owner' | 'team_member' | 'student'; is_active: boolean }
  accessManagementReady?(): Promise<boolean>
  setStudentAccess?(id: string, expected: AccessStatus, status: 'active' | 'suspended', reason: string | null): Promise<StudentRecord | null>
  editStudent?(id: string, display_name: string, dharma_name: string | null): Promise<StudentRecord>
  studentAccessHistory?(id: string): Promise<unknown[]>
  studentSecurityVersion(): Promise<number | null>
  listData(): Promise<{
    invites: CohortInviteRecord[]
    students: StudentRecord[]
    access_management_ready?: boolean
    admission_mode?: 'auto_approve' | 'admin_approval'
  }>
  createInvite(payload: {
    cohort_year: number
    label: string
    invite_code_hash: string
    code_hint: string
    max_uses: number
    expires_at: string | null
    created_by: string
  }): Promise<CohortInviteRecord>
  toggleInvite(id: string, is_active: boolean): Promise<CohortInviteRecord>
  updateStudent(id: string, display_name: string, dharma_name: string | null, is_active: boolean): Promise<StudentRecord>
  hasStudent(id: string): Promise<boolean>
  resetStudentPassword(id: string, password: string): Promise<void>
  getAdmissionMode?(): Promise<'auto_approve' | 'admin_approval'>
  setAdmissionMode?(mode: 'auto_approve' | 'admin_approval'): Promise<'auto_approve' | 'admin_approval'>
}

export interface StudentCohortDependencies {
  allowedOrigins: string[]
  authorize(token: string): Promise<StudentCohortContext | null>
}

const UUID_PATTERN = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

/** Owner-only API for managing cohort invite codes and student monk accounts. */
export async function handleStudentCohortRequest(
  request: Request,
  dependencies: StudentCohortDependencies,
): Promise<Response> {
  const origin = request.headers.get('Origin')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers })

  if (origin && !dependencies.allowedOrigins.includes(origin)) return reply(403, { code: 'forbidden' })
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return reply(405, { code: 'method' })

  const bearer = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)
  if (!bearer) return reply(401, { code: 'unauthorized' })

  try {
    const context = await dependencies.authorize(bearer[1])
    if (!context) return reply(401, { code: 'unauthorized' })
    if (!context.actor.is_active || context.actor.role !== 'owner') return reply(403, { code: 'forbidden' })
    if ((await context.studentSecurityVersion()) !== 2) return reply(503, { code: 'serviceUnavailable' })

    const raw = await request.text()
    if (raw.length > 8192) return reply(413, { code: 'invalid' })
    let input: Record<string, unknown>
    try {
      input = JSON.parse(raw)
    } catch {
      return reply(400, { code: 'invalid' })
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { code: 'invalid' })

    if (input.action === 'list') {
      const data = await context.listData()
      return reply(200, data)
    }

    if (input.action === 'set_student_access' || input.action === 'student_access_history' || input.action === 'edit_student') {
      if (!context.accessManagementReady || !(await context.accessManagementReady())) return reply(503, { code: 'serviceUnavailable' })
      if (typeof input.id !== 'string' || !UUID_PATTERN.test(input.id) || input.id === context.actor.id || 'role' in input || 'student_code' in input) return reply(400, { code: 'invalid' })
      if (!(await context.hasStudent(input.id))) return reply(404, { code: 'notFound' })
      if (input.action === 'student_access_history') {
        if (!context.studentAccessHistory) return reply(503, { code: 'serviceUnavailable' })
        return reply(200, { events: await context.studentAccessHistory(input.id) })
      }
      if (input.action === 'edit_student') {
        const name = typeof input.display_name === 'string' ? input.display_name.trim() : ''
        const dharma = typeof input.dharma_name === 'string' ? input.dharma_name.trim() : ''
        if (!name || name.length > 80 || dharma.length > 80 || 'is_active' in input || 'student_access_status' in input) return reply(400, { code: 'invalid' })
        if (!context.editStudent) return reply(503, { code: 'serviceUnavailable' })
        return reply(200, { student: await context.editStudent(input.id, name, dharma || null) })
      }
      const expected = input.expected_status
      const target = input.status
      const reason = typeof input.reason === 'string' ? input.reason.trim() : ''
      const states = ['pending', 'active', 'suspended', 'needs_review']
      if (typeof expected !== 'string' || !states.includes(expected) || expected === target
        || (target !== 'active' && target !== 'suspended') || reason.length > 500
        || (target === 'active' && input.verified_identity !== true)
        || (target === 'suspended' && reason.length < 3)) return reply(400, { code: 'invalid' })
      if (!context.setStudentAccess) return reply(503, { code: 'serviceUnavailable' })
      const student = await context.setStudentAccess(input.id, expected as AccessStatus, target, reason || null)
      return student ? reply(200, { student }) : reply(409, { code: 'staleState' })
    }

    if (input.action === 'create_invite') {
      const cohortYear = Number(input.cohort_year)
      const label = typeof input.label === 'string' ? input.label.trim() : ''
      const maxUses = input.max_uses == null ? 60 : Number(input.max_uses)
      const customCode = normalizeInviteCode(input.custom_code)
      const expiresAt = typeof input.expires_at === 'string' && input.expires_at.trim()
        ? input.expires_at.trim()
        : null

      if (
        !Number.isInteger(cohortYear)
        || cohortYear < 40
        || cohortYear > 69
        || !label
        || label.length > 80
        || !Number.isInteger(maxUses)
        || maxUses < 1
        || maxUses > 200
      ) {
        return reply(400, { code: 'invalid' })
      }
      if (customCode && (customCode.length < 6 || customCode.length > 40)) {
        return reply(400, { code: 'invalid' })
      }
      if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
        return reply(400, { code: 'invalid' })
      }

      const plainCode = customCode || generateCohortInviteCode(cohortYear)
      const inviteCodeHash = await sha256Hex(plainCode)
      const codeHint = `${plainCode.slice(0, 6)}***`

      try {
        const invite = await context.createInvite({
          cohort_year: cohortYear,
          label,
          invite_code_hash: inviteCodeHash,
          code_hint: codeHint,
          max_uses: maxUses,
          expires_at: expiresAt,
          created_by: context.actor.id,
        })
        return reply(201, { invite, invite_code: plainCode })
      } catch {
        return reply(409, { code: 'createFailed' })
      }
    }

    if (input.action === 'toggle_invite') {
      if (typeof input.id !== 'string' || !UUID_PATTERN.test(input.id) || typeof input.is_active !== 'boolean') {
        return reply(400, { code: 'invalid' })
      }
      const invite = await context.toggleInvite(input.id, input.is_active)
      return reply(200, { invite })
    }

    if (input.action === 'update_student') {
      const displayName = typeof input.display_name === 'string' ? input.display_name.trim() : ''
      const dharmaNameRaw = typeof input.dharma_name === 'string' ? input.dharma_name.trim() : ''
      const dharmaName = dharmaNameRaw ? dharmaNameRaw.slice(0, 80) : null
      if (
        typeof input.id !== 'string'
        || !UUID_PATTERN.test(input.id)
        || input.id === context.actor.id
        || !displayName
        || displayName.length > 80
        || typeof input.is_active !== 'boolean'
        || 'role' in input
        || 'student_code' in input
      ) {
        return reply(400, { code: 'invalid' })
      }
      const student = await context.updateStudent(input.id, displayName, dharmaName, input.is_active)
      return reply(200, { student })
    }

    if (input.action === 'reset_student_password') {
      if (typeof input.id !== 'string' || !UUID_PATTERN.test(input.id) || input.id === context.actor.id) {
        return reply(400, { code: 'invalid' })
      }
      if (!(await context.hasStudent(input.id))) {
        return reply(404, { code: 'notFound' })
      }
      const temporaryPassword = generateRandomPassword(14)
      await context.resetStudentPassword(input.id, temporaryPassword)
      return reply(200, { reset: true, temporary_password: temporaryPassword })
    }

    if (input.action === 'get_admission_mode') {
      if (!context.getAdmissionMode) return reply(503, { code: 'serviceUnavailable' })
      const mode = await context.getAdmissionMode()
      return reply(200, { admission_mode: mode })
    }

    if (input.action === 'set_admission_mode') {
      if (input.mode !== 'admin_approval' && input.mode !== 'auto_approve') return reply(400, { code: 'invalid' })
      if (!context.setAdmissionMode) return reply(503, { code: 'serviceUnavailable' })
      const updated = await context.setAdmissionMode(input.mode)
      return reply(200, { admission_mode: updated })
    }

    return reply(400, { code: 'invalid' })
  } catch {
    return reply(503, { code: 'serviceUnavailable' })
  }
}

