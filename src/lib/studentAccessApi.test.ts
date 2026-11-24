// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { handleStudentCohortRequest, type StudentCohortContext } from '../../supabase/functions/student-cohorts/handler.ts'
import { handleStudentRegister, type StudentRegisterDependencies } from '../../supabase/functions/student-register/handler.ts'
const id = '11111111-1111-4111-8111-111111111111'
const owner = '99999999-9999-4999-8999-999999999999'
function context(): StudentCohortContext {
  return {
    actor: { id: owner, display_name: 'Owner', role: 'owner', is_active: true },
    studentSecurityVersion: async () => 2, accessManagementReady: async () => true,
    listData: async () => ({ invites: [], students: [] }),
    createInvite: vi.fn(), toggleInvite: vi.fn(), updateStudent: vi.fn(),
    hasStudent: async target => target === id, resetStudentPassword: vi.fn(),
    setStudentAccess: vi.fn(async () => null), editStudent: vi.fn(), studentAccessHistory: vi.fn(async () => []),
  }
}
function request(ctx: StudentCohortContext | null, body: unknown, token = true) {
  return handleStudentCohortRequest(new Request('https://example.invalid', {
    method: 'POST', headers: token ? { Authorization: 'Bearer test' } : {}, body: JSON.stringify(body),
  }), { allowedOrigins: [], authorize: async () => ctx })
}
const approval = { action: 'set_student_access', id, expected_status: 'pending', status: 'active', verified_identity: true }
describe('owner account lifecycle API', () => {
  it('blocks guests, students, team members and inactive owners on every new action', async () => {
    for (const action of ['set_student_access', 'edit_student', 'student_access_history']) {
      expect((await request(null, { ...approval, action }, false)).status).toBe(401)
      for (const role of ['student', 'team_member', 'owner'] as const) {
        const ctx = context(); ctx.actor.role = role; ctx.actor.is_active = role !== 'owner'
        expect((await request(ctx, { ...approval, action })).status).toBe(403)
        expect(ctx.setStudentAccess).not.toHaveBeenCalled()
      }
    }
  })
  it('requires verification, a suspension reason, valid transitions and immutable identity', async () => {
    const ctx = context()
    for (const body of [ { ...approval, verified_identity: false }, { ...approval, status: 'suspended', reason: '' }, { ...approval, expected_status: 'active' }, { ...approval, role: 'owner' }, { ...approval, expected_status: 'unknown' }, { ...approval, id: owner } ]) {
      expect((await request(ctx, body)).status).toBe(400)
    }
    expect(ctx.setStudentAccess).not.toHaveBeenCalled()
  })
  it('returns a conflict for a stale expected state and success only for a returned database row', async () => {
    const ctx = context()
    const stale = await request(ctx, approval)
    expect(stale.status).toBe(409); expect(await stale.json()).toEqual({ code: 'staleState' })
    vi.mocked(ctx.setStudentAccess!).mockResolvedValue({ id, display_name: 'Student', dharma_name: null, student_code: '6611018', cohort_year: 66, role: 'student', is_active: true, student_access_status: 'active' })
    expect((await request(ctx, approval)).status).toBe(200)
    expect(ctx.setStudentAccess).toHaveBeenLastCalledWith(id, 'pending', 'active', null)
  })
  it('fails closed before migration readiness and never edits access through a name change', async () => {
    const ctx = context(); ctx.accessManagementReady = async () => false
    expect((await request(ctx, approval)).status).toBe(503)
    ctx.accessManagementReady = async () => true
    expect((await request(ctx, { action: 'edit_student', id, display_name: 'Changed', is_active: true })).status).toBe(400)
    expect(ctx.editStudent).not.toHaveBeenCalled()
  })
  it('returns only the admission policy on the public GET endpoint, with no account creation', async () => {
    const deps = { allowedOrigins: ['https://monkchat-guide.pages.dev'], getAdmissionPolicy: vi.fn(async () => 'admin_approval'), createAuthUser: vi.fn() } as unknown as StudentRegisterDependencies
    const result = await handleStudentRegister(new Request('https://example.invalid', { method: 'GET' }), deps)
    expect(result.status).toBe(200); expect(await result.json()).toEqual({ admission_mode: 'admin_approval' })
    expect(deps.createAuthUser).not.toHaveBeenCalled()
    const forbidden = await handleStudentRegister(new Request('https://example.invalid', { headers: { Origin: 'https://evil.invalid' } }), deps)
    expect(forbidden.status).toBe(403)
  })
})
