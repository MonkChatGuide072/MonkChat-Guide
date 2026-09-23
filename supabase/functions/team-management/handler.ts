export interface ManagedProfile {
  id: string
  display_name: string
  role: 'owner' | 'team_member'
  is_active: boolean
}

export interface TeamContext {
  actor: ManagedProfile
  securityVersion(): Promise<number | null>
  list(): Promise<ManagedProfile[]>
  createAccount(email: string, password: string): Promise<string>
  addProfile(profile: ManagedProfile): Promise<ManagedProfile>
  updateMember(id: string, name: string, active: boolean): Promise<ManagedProfile>
}

export interface TeamDependencies {
  allowedOrigins: string[]
  authorize(token: string): Promise<TeamContext | null>
}

/** No admin credentials, user metadata authorization or raw error messages leave this handler. */
export async function handleTeamRequest(request: Request, dependencies: TeamDependencies): Promise<Response> {
  const origin = request.headers.get('Origin')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
  }
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers })
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
    if (await context.securityVersion() !== 1) return reply(503, { code: 'serviceUnavailable' })
    const raw = await request.text()
    if (raw.length > 8192) return reply(413, { code: 'invalid' })
    let input: Record<string, unknown>
    try { input = JSON.parse(raw) } catch { return reply(400, { code: 'invalid' }) }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { code: 'invalid' })
    if (input.action === 'list') return reply(200, { profiles: await context.list() })
    const name = typeof input.display_name === 'string' ? input.display_name.trim() : ''
    if (!name || name.length > 80 || 'role' in input) return reply(400, { code: 'invalid' })
    if (input.action === 'create') {
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
      const password = typeof input.password === 'string' ? input.password : ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 12 || password.length > 128) return reply(400, { code: 'invalid' })
      let id: string
      try { id = await context.createAccount(email, password) } catch { return reply(409, { code: 'createFailed' }) }
      try {
        const profile = await context.addProfile({ id, display_name: name, role: 'team_member', is_active: true })
        return reply(201, { profile })
      } catch {
        // Keep the unprivileged Auth account for administrator recovery; never delete
        // an account in error recovery. No profile means no CMS permissions.
        return reply(409, { code: 'partialCreate' })
      }
    }
    if (input.action === 'update') {
      if (typeof input.id !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(input.id) || typeof input.is_active !== 'boolean' || input.id === context.actor.id) return reply(400, { code: 'invalid' })
      const profile = await context.updateMember(input.id, name, input.is_active)
      return reply(200, { profile })
    }
    return reply(400, { code: 'invalid' })
  } catch {
    return reply(503, { code: 'serviceUnavailable' })
  }
}
