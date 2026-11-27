import { useCallback, useEffect, useRef, useState } from 'react'

export type MeditationSessionStatus = 'ready' | 'running' | 'paused' | 'finishing' | 'completed'

/** Display ticks may be throttled; elapsed time always comes from the monotonic clock. */
export function useMeditationSession() {
  const [status, setStatus] = useState<MeditationSessionStatus>('ready')
  const [elapsedMs, setElapsedMs] = useState(0)
  const state = useRef<MeditationSessionStatus>('ready')
  const accumulated = useRef(0)
  const since = useRef(0)
  const finishTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const measure = useCallback(() => accumulated.current + (state.current === 'running' ? Math.max(0, performance.now() - since.current) : 0), [])

  const resume = useCallback(() => {
    if (state.current !== 'ready' && state.current !== 'paused') return
    since.current = performance.now()
    state.current = 'running'
    setStatus('running')
  }, [])
  const pause = useCallback(() => {
    if (state.current !== 'running') return
    accumulated.current = measure()
    state.current = 'paused'
    setElapsedMs(accumulated.current)
    setStatus('paused')
  }, [measure])
  const finish = useCallback(() => {
    if (state.current !== 'running' && state.current !== 'paused') return
    accumulated.current = measure()
    state.current = 'finishing'
    setElapsedMs(accumulated.current)
    setStatus('finishing')
    finishTimeout.current = setTimeout(() => {
      state.current = 'completed'
      setStatus('completed')
    }, 900)
  }, [measure])
  const reset = useCallback(() => {
    if (finishTimeout.current) clearTimeout(finishTimeout.current)
    accumulated.current = 0
    state.current = 'ready'
    setElapsedMs(0)
    setStatus('ready')
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const timer = setInterval(() => setElapsedMs(measure()), 200)
    return () => clearInterval(timer)
  }, [status, measure])
  useEffect(() => {
    const hidden = () => { if (document.hidden) pause() }
    const leave = (event: BeforeUnloadEvent) => {
      if (state.current === 'running' || state.current === 'paused') {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    document.addEventListener('visibilitychange', hidden)
    window.addEventListener('pagehide', pause)
    window.addEventListener('beforeunload', leave)
    return () => {
      document.removeEventListener('visibilitychange', hidden)
      window.removeEventListener('pagehide', pause)
      window.removeEventListener('beforeunload', leave)
      if (finishTimeout.current) clearTimeout(finishTimeout.current)
    }
  }, [pause])
  return { status, elapsedMs, resume, pause, finish, reset }
}

export function formatSessionTime(milliseconds: number) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000)
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}
