import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session } from '@supabase/supabase-js'
import { AuthProvider, useAuth } from './auth'

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), single: vi.fn(), signOut: vi.fn(), listener: null as null | ((event: string, session: Session | null) => void) }))
vi.mock('./supabase', () => ({ supabaseClient: {
  auth: {
    getSession: mocks.getSession, signOut: mocks.signOut,
    onAuthStateChange: (listener: typeof mocks.listener) => { mocks.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } } },
  },
  from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }),
} }))
const session = { user: { id: 'owner-id' } } as Session
const owner = { id: 'owner-id', display_name: 'Owner', role: 'owner', is_active: true }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
function Probe() {
  const auth = useAuth()
  return <><p>{auth.isLoading ? 'loading' : auth.profile ? `${auth.profile.role}:${auth.profile.is_active}` : 'signed out'}</p><button onClick={() => void auth.signOut().catch(() => {})}>Sign out</button></>
}
describe('AuthProvider session and profile readiness', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.listener = null; mocks.signOut.mockResolvedValue({ error: null }) })

  it('keeps guards loading until both session and profile have been restored', async () => {
    const initial = deferred<{ data: { session: Session | null }; error: null }>()
    const profile = deferred<{ data: typeof owner; error: null }>()
    mocks.getSession.mockReturnValue(initial.promise)
    mocks.single.mockReturnValue(profile.promise)
    render(<AuthProvider><Probe /></AuthProvider>)
    expect(screen.getByText('loading')).toBeInTheDocument()
    await act(async () => initial.resolve({ data: { session }, error: null }))
    expect(screen.getByText('loading')).toBeInTheDocument()
    await act(async () => profile.resolve({ data: owner, error: null }))
    expect(screen.getByText('owner:true')).toBeInTheDocument()
  })

  it('ignores late session/profile responses after a sign-out event', async () => {
    const initial = deferred<{ data: { session: Session | null }; error: null }>()
    const profile = deferred<{ data: typeof owner; error: null }>()
    mocks.getSession.mockReturnValue(initial.promise)
    mocks.single.mockReturnValue(profile.promise)
    render(<AuthProvider><Probe /></AuthProvider>)
    await act(async () => mocks.listener?.('SIGNED_IN', session))
    await act(async () => mocks.listener?.('SIGNED_OUT', null))
    await act(async () => { initial.resolve({ data: { session }, error: null }); profile.resolve({ data: owner, error: null }) })
    expect(screen.getByText('signed out')).toBeInTheDocument()
  })

  it('rechecks suspension on window focus and preserves session when sign-out fails', async () => {
    mocks.getSession.mockResolvedValue({ data: { session }, error: null })
    mocks.single.mockResolvedValue({ data: owner, error: null })
    render(<AuthProvider><Probe /></AuthProvider>)
    await screen.findByText('owner:true')
    mocks.signOut.mockResolvedValue({ error: new Error('Network failure') })
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled())
    expect(screen.getByText('owner:true')).toBeInTheDocument()
    mocks.single.mockResolvedValue({ data: { ...owner, is_active: false }, error: null })
    fireEvent(window, new Event('focus'))
    await screen.findByText('owner:false')
  })
})
