// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleTeamRequest, type TeamContext, type TeamDependencies } from '../../supabase/functions/team-management/handler'

const ownerId = '11111111-1111-4111-8111-111111111111'
const memberId = '22222222-2222-4222-8222-222222222222'
const origin = 'https://monkchat-guide.pages.dev'
let context: TeamContext
let dependencies: TeamDependencies
const create = { action: 'create', display_name: 'New member', email: 'member@example.com', password: 'example-password-123' }
function request(body: unknown, token = 'owner-token', requestOrigin = origin) {
  return handleTeamRequest(new Request(`${origin}/team-management`, {
    method: 'POST', headers: { Origin: requestOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  }), dependencies)
}

describe('team management authorization and mutations', () => {
  beforeEach(() => {
    context = {
      actor: { id: ownerId, display_name: 'Owner', role: 'owner', is_active: true },
      securityVersion: vi.fn(async () => 1), list: vi.fn(async () => []),
      createAccount: vi.fn(async () => memberId), addProfile: vi.fn(async profile => profile),
      updateMember: vi.fn(async (id, display_name, is_active) => ({ id, display_name, is_active, role: 'team_member' as const })),
    }
    dependencies = { allowedOrigins: [origin], authorize: vi.fn(async () => context) }
  })

  it('rejects missing or invalid authentication without creating an account', async () => {
    expect((await request(create, '')).status).toBe(401)
    expect(dependencies.authorize).not.toHaveBeenCalled()
    dependencies.authorize = vi.fn(async () => null)
    expect((await request(create)).status).toBe(401)
    expect(context.createAccount).not.toHaveBeenCalled()
  })

  it.each(['team_member', 'inactive_owner'] as const)('rejects %s before any privileged operation', async role => {
    if (role === 'team_member') context.actor.role = role
    else context.actor.is_active = false
    expect((await request(create)).status).toBe(403)
    expect(context.securityVersion).not.toHaveBeenCalled()
    expect(context.createAccount).not.toHaveBeenCalled()
  })

  it('requires the database security migration before enabling the service', async () => {
    context.securityVersion = vi.fn(async () => null)
    expect((await request(create)).status).toBe(503)
    expect(context.createAccount).not.toHaveBeenCalled()
  })

  it('supports preflight only for explicitly allowed origins', async () => {
    const response = await handleTeamRequest(new Request(origin, { method: 'OPTIONS', headers: { Origin: origin } }), dependencies)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect((await request(create, 'token', 'https://unknown.example')).status).toBe(403)
    expect(dependencies.authorize).not.toHaveBeenCalled()
  })

  it('creates only an active team member and returns no password or email', async () => {
    const response = await request({ ...create, email: ' Member@Example.com ', display_name: ' New member ' })
    expect(response.status).toBe(201)
    expect(context.createAccount).toHaveBeenCalledWith('member@example.com', create.password)
    expect(context.addProfile).toHaveBeenCalledWith({ id: memberId, display_name: 'New member', role: 'team_member', is_active: true })
    const body = await response.text()
    expect(body).not.toContain(create.password)
    expect(body).not.toContain('member@example.com')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('rejects role escalation and invalid passwords without writes', async () => {
    expect((await request({ ...create, role: 'owner' })).status).toBe(400)
    expect((await request({ ...create, password: 'short' })).status).toBe(400)
    expect(context.createAccount).not.toHaveBeenCalled()
  })

  it('reports partial creation without exposing secrets or attempting deletion', async () => {
    context.addProfile = vi.fn(async () => { throw new Error('private database diagnostic') })
    const response = await request(create)
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ code: 'partialCreate' })
    expect(context.createAccount).toHaveBeenCalledTimes(1)
  })

  it('does not attempt a profile write after a failed Auth creation', async () => {
    context.createAccount = vi.fn(async () => { throw new Error('duplicate email') })
    expect(await (await request(create)).json()).toEqual({ code: 'createFailed' })
    expect(context.addProfile).not.toHaveBeenCalled()
  })

  it('updates a member and rejects self-suspension', async () => {
    const body = { action: 'update', id: memberId, display_name: 'Updated', is_active: false }
    expect((await request(body)).status).toBe(200)
    expect(context.updateMember).toHaveBeenCalledWith(memberId, 'Updated', false)
    expect((await request({ ...body, id: ownerId })).status).toBe(400)
    expect(context.updateMember).toHaveBeenCalledTimes(1)
  })
})
