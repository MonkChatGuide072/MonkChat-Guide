import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatSessionTime, useMeditationSession } from './useMeditationSession'

let now = 0
beforeEach(() => { vi.useFakeTimers(); now = 0; vi.spyOn(performance, 'now').mockImplementation(() => now) })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('meditation session timing', () => {
  it('excludes preparation, pauses and the finishing animation, and ignores repeated finish', () => {
    const { result } = renderHook(useMeditationSession)
    now = 10000
    act(() => result.current.resume())
    now = 18400
    act(() => result.current.pause())
    expect(result.current.elapsedMs).toBe(8400)
    now = 90000
    act(() => result.current.resume())
    now = 95000
    act(() => result.current.finish())
    expect(result.current.elapsedMs).toBe(13400)
    act(() => { result.current.finish(); vi.advanceTimersByTime(900) })
    expect(result.current.status).toBe('completed')
    expect(formatSessionTime(result.current.elapsedMs)).toBe('00:13')
    act(() => result.current.reset())
    expect(result.current.status).toBe('ready')
    expect(result.current.elapsedMs).toBe(0)
  })
  it('uses elapsed clock time rather than the number of render ticks', () => {
    const { result } = renderHook(useMeditationSession)
    act(() => result.current.resume())
    now = 125000
    act(() => vi.advanceTimersByTime(200))
    expect(result.current.elapsedMs).toBe(125000)
  })
  it('pauses when hidden, resumes only on explicit input, and cleans up timers', () => {
    const { result, unmount } = renderHook(useMeditationSession)
    act(() => result.current.resume())
    now = 5000
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.status).toBe('paused')
    now = 100000
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.elapsedMs).toBe(5000)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
