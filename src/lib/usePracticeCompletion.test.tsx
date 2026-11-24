import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePracticeCompletion } from './usePracticeCompletion'
const api = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }))
vi.mock('./studentPractice', () => ({ fetchStudentCompletedKeys: api.load, setStudentItemCompleted: api.save }))
const props = { storageKey: 'student:a', studentId: 'a', moduleType: 'vocab_lesson' as const, english: true }
describe('acknowledged practice progress', () => {
  beforeEach(() => {
    vi.clearAllMocks(); api.load.mockResolvedValue([]); api.save.mockResolvedValue(true)
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: vi.fn((key: string, value: string) => values.set(key,value)) })
  })
  afterEach(() => vi.unstubAllGlobals())
  it('keeps completion unchanged on a failed account save and supports retry', async () => {
    api.save.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const { result } = renderHook(() => usePracticeCompletion(props))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    await act(() => result.current.toggle('lesson-1'))
    expect(result.current.completedIds).toEqual([])
    expect(result.current.error).toContain('not saved to your account')
    expect(localStorage.getItem('student:a')).toBe('[]')
    await act(() => result.current.toggle('lesson-1'))
    expect(result.current.completedIds).toEqual(['lesson-1'])
    expect(result.current.notice).toContain('saved to your account')
  })
  it('does not show success before acknowledgement or allow duplicate writes', async () => {
    let resolve!: (saved: boolean) => void
    api.save.mockImplementation(() => new Promise<boolean>(r => { resolve = r }))
    const { result } = renderHook(() => usePracticeCompletion(props))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    let pending!: Promise<void>
    act(() => { pending = result.current.toggle('lesson-1') })
    expect(result.current.busy).toBe(true); expect(result.current.completedIds).toEqual([])
    await act(() => result.current.toggle('lesson-1'))
    expect(api.save).toHaveBeenCalledOnce()
    await act(async () => { resolve(true); await pending })
    expect(result.current.completedIds).toEqual(['lesson-1'])
  })
  it('blocks writes when loading fails and allows a reload', async () => {
    api.load.mockResolvedValueOnce(null).mockResolvedValueOnce(['lesson-1'])
    const { result } = renderHook(() => usePracticeCompletion(props))
    await waitFor(() => expect(result.current.error).toContain('Could not load'))
    await act(() => result.current.toggle('lesson-2')); expect(api.save).not.toHaveBeenCalled()
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.completedIds).toEqual(['lesson-1'])
  })
  it('does not put an old account acknowledgement into the new account', async () => {
    let resolve!: (saved: boolean) => void
    api.save.mockImplementation(() => new Promise<boolean>(r => { resolve = r }))
    const { result, rerender } = renderHook(({ id }) => usePracticeCompletion({ ...props, storageKey: `student:${id}`, studentId: id }), { initialProps: { id: 'a' } })
    await waitFor(() => expect(result.current.isReady).toBe(true))
    let pending!: Promise<void>
    act(() => { pending = result.current.toggle('lesson-1') })
    rerender({ id: 'b' }); await waitFor(() => expect(result.current.isReady).toBe(true))
    await act(async () => { resolve(true); await pending })
    expect(result.current.completedIds).toEqual([])
    expect(localStorage.getItem('student:b')).toBe('[]')
  })
  it('reports guest storage failure without showing an unsaved completion', async () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('quota') })
    const { result } = renderHook(() => usePracticeCompletion({ ...props, studentId: undefined, storageKey: 'guest' }))
    await act(() => result.current.toggle('lesson-1'))
    expect(result.current.completedIds).toEqual([])
    expect(result.current.error).toContain('Could not save on this device')
    expect(api.save).not.toHaveBeenCalled()
  })
})
