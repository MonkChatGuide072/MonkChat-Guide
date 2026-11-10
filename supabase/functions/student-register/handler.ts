import {
  isAcceptableStudentPassword,
  normalizeInviteCode,
  parseStudentCode,
  sha256Hex,
  toStudentInternalEmail,
} from '../_shared/studentAuth.ts'

export interface InviteLookup {
  id: string
  cohort_year: number
  is_active: boolean
  max_uses: number
  used_count: number
  expires_at: string | null
}

export interface StudentRegisterDependencies {
  allowedOrigins: string[]
  findInviteByHash(codeHash: string): Promise<InviteLookup | null>
  hasExistingStudentCode(studentCode: string): Promise<boolean>
  createAuthUser(email: string, password: string): Promise<string>
  claimInviteSlot(codeHash: string, cohortYear: number): Promise<string | null>
  insertStudentProfile(profile: {
    id: string
    display_name: string
    dharma_name: string | null
    student_code: string
    cohort_year: number
  }): Promise<void>
}

/** Handles cohort invite registration for role='student' without manual admin keying. */
export async function handleStudentRegister(
  request: Request,
  dependencies: StudentRegisterDependencies,
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

  if (origin && !dependencies.allowedOrigins.includes(origin)) {
    return reply(403, { code: 'forbidden' })
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return reply(405, { code: 'method' })

  try {
    const raw = await request.text()
    if (raw.length > 8192) return reply(413, { code: 'invalid' })
    let input: Record<string, unknown>
    try {
      input = JSON.parse(raw)
    } catch {
      return reply(400, { code: 'invalid' })
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return reply(400, { code: 'invalid' })
    }

    const parsedId = parseStudentCode(input.student_code)
    const inviteCode = normalizeInviteCode(input.invite_code)
    const displayName = typeof input.display_name === 'string' ? input.display_name.trim() : ''
    const rawDharma = typeof input.dharma_name === 'string' ? input.dharma_name.trim() : ''
    const dharmaName = rawDharma ? rawDharma.slice(0, 80) : null

    if (!parsedId || inviteCode.length < 6 || inviteCode.length > 40 || !displayName || displayName.length > 80) {
      return reply(400, { code: 'invalid' })
    }
    if (!isAcceptableStudentPassword(input.password, parsedId.code)) {
      return reply(400, { code: 'weakPassword' })
    }

    const codeHash = await sha256Hex(inviteCode)
    const invite = await dependencies.findInviteByHash(codeHash)
    const isExpired = invite?.expires_at ? new Date(invite.expires_at).getTime() <= Date.now() : false
    if (
      !invite
      || !invite.is_active
      || isExpired
      || invite.cohort_year !== parsedId.thaiYear
      || invite.used_count >= invite.max_uses
    ) {
      return reply(403, { code: 'invalidInvite' })
    }

    if (await dependencies.hasExistingStudentCode(parsedId.code)) {
      return reply(409, { code: 'duplicateStudent' })
    }

    const internalEmail = toStudentInternalEmail(parsedId.code)
    let userId: string
    try {
      userId = await dependencies.createAuthUser(internalEmail, input.password)
    } catch {
      return reply(409, { code: 'duplicateStudent' })
    }

    const claimedId = await dependencies.claimInviteSlot(codeHash, parsedId.thaiYear)
    if (!claimedId) {
      return reply(409, { code: 'invalidInvite' })
    }

    try {
      await dependencies.insertStudentProfile({
        id: userId,
        display_name: displayName,
        dharma_name: dharmaName,
        student_code: parsedId.code,
        cohort_year: parsedId.thaiYear,
      })
    } catch {
      // Preserve auth account unprivileged without a profile; never delete in error recovery.
      return reply(409, { code: 'partialCreate' })
    }

    return reply(201, {
      registered: true,
      student_code: parsedId.code,
      cohort_year: parsedId.thaiYear,
      display_name: displayName,
    })
  } catch {
    return reply(503, { code: 'serviceUnavailable' })
  }
}

