import { useState } from 'react'
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

function LocalDraft(){const auth=useAuth();const [text,setText]=useState('original');return <input aria-label="Draft" disabled={auth.isRefreshing} value={text} onChange={e=>setText(e.target.value)}/>}
function GuardedDraft(){const auth=useAuth();if(auth.isLoading)return <p>guard loading</p>;if(!auth.profile?.is_active)return <p>guard denied</p>;return <LocalDraft/>}
describe('background account checks preserve unsaved edits',()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.getSession.mockResolvedValue({data:{session},error:null});mocks.single.mockResolvedValue({data:owner,error:null})})
 it('keeps form state through focus revalidation and blocks editing until it finishes',async()=>{
  render(<AuthProvider><GuardedDraft/></AuthProvider>);const input=await screen.findByLabelText('Draft')
  fireEvent.change(input,{target:{value:'unsaved image and text selection'}})
  const refresh=deferred<{data:typeof owner;error:null}>();mocks.single.mockReturnValue(refresh.promise)
  fireEvent(window,new Event('focus'))
  expect(screen.getByLabelText('Draft')).toHaveValue('unsaved image and text selection')
  expect(screen.getByLabelText('Draft')).toBeDisabled()
  await act(async()=>refresh.resolve({data:owner,error:null}))
  expect(screen.getByLabelText('Draft')).toHaveValue('unsaved image and text selection')
  expect(screen.getByLabelText('Draft')).toBeEnabled()
 })
 it('keeps the same user draft on token refresh but removes access after suspension',async()=>{
  render(<AuthProvider><GuardedDraft/></AuthProvider>);const input=await screen.findByLabelText('Draft')
  fireEvent.change(input,{target:{value:'draft survives token refresh'}})
  const refresh=deferred<{data:typeof owner;error:null}>();mocks.single.mockReturnValue(refresh.promise)
  await act(async()=>mocks.listener?.('TOKEN_REFRESHED',session))
  expect(screen.getByLabelText('Draft')).toHaveValue('draft survives token refresh')
  await act(async()=>refresh.resolve({data:{...owner,is_active:false},error:null}))
  expect(screen.getByText('guard denied')).toBeInTheDocument()
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument()
 })
 it('does not retain a previous user form when the account changes',async()=>{
  render(<AuthProvider><GuardedDraft/></AuthProvider>);const input=await screen.findByLabelText('Draft')
  fireEvent.change(input,{target:{value:'private unsaved text'}})
  const refresh=deferred<{data:typeof owner;error:null}>();mocks.single.mockReturnValue(refresh.promise)
  await act(async()=>mocks.listener?.('SIGNED_IN',{user:{id:'other-owner'}} as Session))
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument()
  await act(async()=>refresh.resolve({data:{...owner,id:'other-owner'},error:null}))
  expect(screen.getByLabelText('Draft')).toHaveValue('original')
 })
})
