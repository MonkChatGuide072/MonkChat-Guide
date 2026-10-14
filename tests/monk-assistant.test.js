import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onRequestPost } from '../functions/api/monk-assistant'

const run = vi.fn()
const env = { AI: { run }, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public-key' }
const payload = { question: 'สมาธิคืออะไร', language: 'th', history: [] }
const call = (body = payload, token = 'valid-token') => onRequestPost({
  request: new Request('https://monkchat.example/api/monk-assistant', {
    method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body),
  }), env,
})

describe('monk assistant endpoint', () => {
  afterEach(() => vi.unstubAllGlobals())
  beforeEach(() => {
    vi.restoreAllMocks()
    run.mockReset()
    run.mockResolvedValue({ response: 'คำตอบร่าง' })
    vi.stubGlobal('fetch', vi.fn(async url => {
      const pathname = new URL(url).pathname
      if (pathname === '/auth/v1/user') return Response.json({ id: 'user-1' })
      if (pathname === '/rest/v1/profiles') return Response.json([{ role: 'team_member', is_active: true }])
      if (pathname === '/rest/v1/qa_items') return Response.json([{ id: 'qa-1', source_reference: 'คู่มือที่ตรวจแล้ว',
        qa_translations: [{ language_code: 'th', question: 'สมาธิคืออะไร', short_answer: 'ใจตั้งมั่น', detailed_answer: null }] }])
      throw new Error('Unexpected URL')
    }))
  })

  it('requires authentication before invoking AI or reading Q&A', async () => {
    const response = await call(payload, '')
    expect(response.status).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
    expect(run).not.toHaveBeenCalled()
  })

  it('checks the active server-side role, not just a browser route', async () => {
    vi.mocked(fetch).mockImplementation(async url => {
      if (new URL(url).pathname === '/auth/v1/user') return Response.json({ id: 'user-1' })
      return Response.json([{ role: 'team_member', is_active: false }])
    })
    const response = await call()
    expect(response.status).toBe(403)
    expect(run).not.toHaveBeenCalled()
  })

  it('passes only published, verified Q&A to a real model and labels the answer provisional', async () => {
    const response = await call()
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ answer: 'คำตอบร่าง', provisional: true,
      sources: [{ id: 'qa-1', title: 'สมาธิคืออะไร' }] })
    const qaUrl = vi.mocked(fetch).mock.calls.map(([url]) => String(url)).find(url => url.includes('/qa_items'))
    expect(qaUrl).toContain('verification_status=eq.verified')
    expect(qaUrl).toContain('content_status=eq.published')
    expect(qaUrl).toContain('is_published=eq.true')
    expect(run).toHaveBeenCalledWith('@cf/aisingapore/gemma-sea-lion-v4-27b-it',
      expect.objectContaining({ messages: expect.arrayContaining([expect.objectContaining({ role: 'user', content: payload.question })]) }))
  })

  it('bounds request size and handles an exhausted AI allocation', async () => {
    expect((await call({ ...payload, question: 123 })).status).toBe(400)
    expect((await call({ ...payload, question: 'a'.repeat(601) })).status).toBe(400)
    run.mockRejectedValue(new Error('daily allocation exhausted'))
    const response = await call()
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'service_unavailable' })
  })
})
