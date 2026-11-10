// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import {
  generateCohortInviteCode,
  generateRandomPassword,
  isAcceptableStudentPassword,
  parseStudentCode,
  sha256Hex,
  toStudentInternalEmail,
} from '../../supabase/functions/_shared/studentAuth.ts'
import {
  handleStudentRegister,
  type StudentRegisterDependencies,
} from '../../supabase/functions/student-register/handler.ts'
import {
  handleStudentCohortRequest,
  type StudentCohortContext,
  type StudentCohortDependencies,
} from '../../supabase/functions/student-cohorts/handler.ts'

const ALLOWED_ORIGIN = 'https://monkchat-guide.pages.dev'
const VALID_UUID = '11111111-1111-4111-8111-111111111111'
const OWNER_UUID = '99999999-9999-4999-8999-999999999999'

describe('shared student auth validators', () => {
  it('validates 7-digit MCU student codes in range 4011001–6911060', () => {
    expect(parseStudentCode('6611018')).toEqual({
      code: '6611018',
      thaiYear: 66,
      statusCode: '110',
      seatNumber: 18,
    })
    expect(parseStudentCode('4011001')?.thaiYear).toBe(40)
    expect(parseStudentCode('6911060')?.seatNumber).toBe(60)
    expect(parseStudentCode('3911001')).toBeNull()
    expect(parseStudentCode('7011001')).toBeNull()
    expect(parseStudentCode('6611000')).toBeNull()
    expect(parseStudentCode('6611061')).toBeNull()
    expect(parseStudentCode('661018')).toBeNull()
  })

  it('maps student codes exclusively to the RFC 2606 .invalid internal domain', () => {
    expect(toStudentInternalEmail('6611018')).toBe('6611018@student.monkchat.invalid')
    expect(toStudentInternalEmail('6611018').endsWith('.monkchat.com')).toBe(false)
  })

  it('rejects short passwords, ID=Password, and monkchat+ID defaults', () => {
    expect(isAcceptableStudentPassword('short123', '6611018')).toBe(false)
    expect(isAcceptableStudentPassword('6611018', '6611018')).toBe(false)
    expect(isAcceptableStudentPassword('monkchat6611018', '6611018')).toBe(false)
    expect(isAcceptableStudentPassword('MONKCHAT6611018', '6611018')).toBe(false)
    expect(isAcceptableStudentPassword('6611018monkchat', '6611018')).toBe(false)
    expect(isAcceptableStudentPassword('DhammaPractice66!', '6611018')).toBe(true)
  })

  it('generates formatted cohort codes and 14+ character random passwords', () => {
    expect(generateCohortInviteCode(66)).toMatch(/^AYT66-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
    const pw = generateRandomPassword(14)
    expect(pw.length).toBe(14)
    expect(isAcceptableStudentPassword(pw, '6611018')).toBe(true)
  })
})

describe('student-register edge handler', () => {
  async function makeDeps(overrides: Partial<StudentRegisterDependencies> = {}): Promise<StudentRegisterDependencies> {
    const validHash = await sha256Hex('AYT66-SAFE-CODE')
    return {
      allowedOrigins: [ALLOWED_ORIGIN],
      findInviteByHash: vi.fn(async (hash) =>
        hash === validHash
          ? {
              id: 'inv-66',
              cohort_year: 66,
              is_active: true,
              max_uses: 60,
              used_count: 5,
              expires_at: null,
            }
          : null,
      ),
      hasExistingStudentCode: vi.fn(async () => false),
      createAuthUser: vi.fn(async () => VALID_UUID),
      claimInviteSlot: vi.fn(async () => 'inv-66'),
      insertStudentProfile: vi.fn(async () => {}),
      ...overrides,
    }
  }

  function postRegister(body: unknown, origin: string | null = ALLOWED_ORIGIN) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (origin) headers.Origin = origin
    return new Request('https://example.supabase.co/functions/v1/student-register', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  it('rejects untrusted origins and invalid methods', async () => {
    const deps = await makeDeps()
    const badOrigin = await handleStudentRegister(postRegister({}, 'https://evil.example'), deps)
    expect(badOrigin.status).toBe(403)

    const badMethod = await handleStudentRegister(
      new Request('https://example.supabase.co/functions/v1/student-register', { method: 'GET' }),
      deps,
    )
    expect(badMethod.status).toBe(405)
  })

  it('rejects ID=Password and monkchat+ID with 400 weakPassword', async () => {
    const deps = await makeDeps()
    const res = await handleStudentRegister(
      postRegister({
        invite_code: 'AYT66-SAFE-CODE',
        student_code: '6611018',
        display_name: 'Phra Somchai',
        password: 'monkchat6611018',
      }),
      deps,
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ code: 'weakPassword' })
    expect(deps.createAuthUser).not.toHaveBeenCalled()
  })

  it('rejects unknown, paused, expired, full, or wrong-cohort invite codes', async () => {
    const depsWrongCohort = await makeDeps()
    const resWrongCohort = await handleStudentRegister(
      postRegister({
        invite_code: 'AYT66-SAFE-CODE',
        student_code: '6711001',
        display_name: 'Phra Somchai',
        password: 'DhammaPractice66!',
      }),
      depsWrongCohort,
    )
    expect(resWrongCohort.status).toBe(403)
    expect(await resWrongCohort.json()).toEqual({ code: 'invalidInvite' })

    const depsExpired = await makeDeps({
      findInviteByHash: vi.fn(async () => ({
        id: 'inv-exp',
        cohort_year: 66,
        is_active: true,
        max_uses: 60,
        used_count: 1,
        expires_at: '2020-01-01T00:00:00.000Z',
      })),
    })
    const resExpired = await handleStudentRegister(
      postRegister({
        invite_code: 'AYT66-SAFE-CODE',
        student_code: '6611018',
        display_name: 'Phra Somchai',
        password: 'DhammaPractice66!',
      }),
      depsExpired,
    )
    expect(resExpired.status).toBe(403)

    const depsFull = await makeDeps({
      findInviteByHash: vi.fn(async () => ({
        id: 'inv-full',
        cohort_year: 66,
        is_active: true,
        max_uses: 60,
        used_count: 60,
        expires_at: null,
      })),
    })
    const resFull = await handleStudentRegister(
      postRegister({
        invite_code: 'AYT66-SAFE-CODE',
        student_code: '6611018',
        display_name: 'Phra Somchai',
        password: 'DhammaPractice66!',
      }),
      depsFull,
    )
    expect(resFull.status).toBe(403)
  })

  it('rejects duplicate student IDs and registers valid cohort students onto .invalid internal email', async () => {
    const depsDup = await makeDeps({ hasExistingStudentCode: vi.fn(async () => true) })
    const resDup = await handleStudentRegister(
      postRegister({
        invite_code: 'AYT66-SAFE-CODE',
        student_code: '6611018',
        display_name: 'Phra Somchai',
        password: 'DhammaPractice66!',
      }),
      depsDup,
    )
    expect(resDup.status).toBe(409)
    expect(await resDup.json()).toEqual({ code: 'duplicateStudent' })

    const depsOk = await makeDeps()
    const resOk = await handleStudentRegister(
      postRegister({
        invite_code: '  ayt66-safe-code  ',
        student_code: '6611018',
        display_name: 'Phra Somchai',
        dharma_name: 'Sutthipanyo',
        password: 'DhammaPractice66!',
      }),
      depsOk,
    )
    expect(resOk.status).toBe(201)
    expect(await resOk.json()).toEqual({
      registered: true,
      student_code: '6611018',
      cohort_year: 66,
      display_name: 'Phra Somchai',
    })
    expect(depsOk.createAuthUser).toHaveBeenCalledWith('6611018@student.monkchat.invalid', 'DhammaPractice66!')
    expect(depsOk.insertStudentProfile).toHaveBeenCalledWith({
      id: VALID_UUID,
      display_name: 'Phra Somchai',
      dharma_name: 'Sutthipanyo',
      student_code: '6611018',
      cohort_year: 66,
    })
  })
})

describe('student-cohorts owner edge handler', () => {
  function makeContext(
    actorOverrides: Partial<StudentCohortContext['actor']> = {},
    securityVersion = 2,
  ): StudentCohortContext {
    return {
      actor: {
        id: OWNER_UUID,
        display_name: 'Project Owner',
        role: 'owner',
        is_active: true,
        ...actorOverrides,
      },
      studentSecurityVersion: vi.fn(async () => securityVersion),
      listData: vi.fn(async () => ({ invites: [], students: [] })),
      createInvite: vi.fn(async (payload) => ({
        id: 'inv-new',
        cohort_year: payload.cohort_year,
        label: payload.label,
        code_hint: payload.code_hint,
        is_active: true,
        max_uses: payload.max_uses,
        used_count: 0,
        expires_at: payload.expires_at,
        created_at: '2026-11-10T00:00:00Z',
      })),
      toggleInvite: vi.fn(async (id, is_active) => ({
        id,
        cohort_year: 66,
        label: 'Cohort 66',
        code_hint: 'AYT66-***',
        is_active,
        max_uses: 60,
        used_count: 1,
        expires_at: null,
        created_at: '2026-11-10T00:00:00Z',
      })),
      updateStudent: vi.fn(async (id, display_name, dharma_name, is_active) => ({
        id,
        display_name,
        dharma_name,
        student_code: '6611018',
        cohort_year: 66,
        role: 'student' as const,
        is_active,
      })),
      hasStudent: vi.fn(async (id) => id === VALID_UUID),
      resetStudentPassword: vi.fn(async () => {}),
    }
  }

  function postCohorts(body: unknown, token: string | null = 'valid-token'): Request {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Origin: ALLOWED_ORIGIN,
    }
    if (token) headers.Authorization = `Bearer ${token}`
    return new Request('https://example.supabase.co/functions/v1/student-cohorts', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  function makeDeps(context: StudentCohortContext | null): StudentCohortDependencies {
    return {
      allowedOrigins: [ALLOWED_ORIGIN],
      authorize: vi.fn(async () => context),
    }
  }

  it('denies missing auth, non-owners, inactive owners, and outdated DB security versions', async () => {
    const noToken = await handleStudentCohortRequest(postCohorts({ action: 'list' }, null), makeDeps(makeContext()))
    expect(noToken.status).toBe(401)

    const memberDenied = await handleStudentCohortRequest(
      postCohorts({ action: 'list' }),
      makeDeps(makeContext({ role: 'team_member' })),
    )
    expect(memberDenied.status).toBe(403)

    const studentDenied = await handleStudentCohortRequest(
      postCohorts({ action: 'list' }),
      makeDeps(makeContext({ role: 'student' })),
    )
    expect(studentDenied.status).toBe(403)

    const inactiveOwner = await handleStudentCohortRequest(
      postCohorts({ action: 'list' }),
      makeDeps(makeContext({ is_active: false })),
    )
    expect(inactiveOwner.status).toBe(403)

    const staleDb = await handleStudentCohortRequest(
      postCohorts({ action: 'list' }),
      makeDeps(makeContext({}, 1)),
    )
    expect(staleDb.status).toBe(503)
  })

  it('creates hashed cohort invites and prevents tampering with role or student_code', async () => {
    const ctx = makeContext()
    const createRes = await handleStudentCohortRequest(
      postCohorts({
        action: 'create_invite',
        cohort_year: 66,
        label: 'รุ่น 66',
        max_uses: 60,
        custom_code: 'AYT66-TERM1-2026',
      }),
      makeDeps(ctx),
    )
    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    expect(createJson.invite_code).toBe('AYT66-TERM1-2026')
    expect(ctx.createInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        cohort_year: 66,
        invite_code_hash: await sha256Hex('AYT66-TERM1-2026'),
        code_hint: 'AYT66-***',
      }),
    )

    const tamperRole = await handleStudentCohortRequest(
      postCohorts({
        action: 'update_student',
        id: VALID_UUID,
        display_name: 'Phra Somchai',
        is_active: true,
        role: 'owner',
      }),
      makeDeps(ctx),
    )
    expect(tamperRole.status).toBe(400)
    expect(ctx.updateStudent).not.toHaveBeenCalled()
  })

  it('allows owner password resets only for confirmed student accounts', async () => {
    const ctx = makeContext()
    const notFound = await handleStudentCohortRequest(
      postCohorts({
        action: 'reset_student_password',
        id: '22222222-2222-4222-8222-222222222222',
      }),
      makeDeps(ctx),
    )
    expect(notFound.status).toBe(404)

    const ok = await handleStudentCohortRequest(
      postCohorts({
        action: 'reset_student_password',
        id: VALID_UUID,
      }),
      makeDeps(ctx),
    )
    expect(ok.status).toBe(200)
    const body = await ok.json()
    expect(body.reset).toBe(true)
    expect(typeof body.temporary_password).toBe('string')
    expect(body.temporary_password.length).toBeGreaterThanOrEqual(12)
    expect(ctx.resetStudentPassword).toHaveBeenCalledWith(VALID_UUID, body.temporary_password)
  })
})
