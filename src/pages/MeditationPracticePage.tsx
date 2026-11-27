import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { MeditationNavigation } from '../components/MeditationNavigation'
import { MeditationPage } from './MeditationPage'
import { formatSessionTime, useMeditationSession } from '../lib/useMeditationSession'
import { meditationSessionCopy } from '../content/meditationSessionCopy'
import '../components/MeditationSession.css'

export function MeditationPracticePage() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const english = language === 'en'
  const copy = meditationSessionCopy[language]
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'quiet' | 'guided'>(params.has('trackId') ? 'guided' : 'quiet')
  const [playbackError, setPlaybackError] = useState(false)
  const session = useMeditationSession()
  const navigate = useNavigate()
  const crystalRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const againRef = useRef<HTMLButtonElement>(null)
  const final = session.status === 'finishing' || session.status === 'completed'
  const started = session.status !== 'ready'
  const selection = `${language}:${params.get('trackId') ?? ''}`
  const previousSelection = useRef(selection)
  useEffect(() => {
    if (previousSelection.current !== selection) session.pause()
    previousSelection.current = selection
  }, [selection, session.pause])
  const begin = useCallback(() => { setPlaybackError(false); session.resume() }, [session.resume])
  const onAudioError = useCallback(() => { session.pause(); setPlaybackError(true) }, [session.pause])
  const control = { playing: session.status === 'running', locked: started, onPlay: begin, onPause: session.pause, onError: onAudioError }

  useEffect(() => {
    if (session.status !== 'completed') return
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (dialog && !dialog.open) dialog.showModal()
    againRef.current?.focus()
    return () => {
      if (dialog?.open) dialog.close()
      document.body.style.overflow = previousOverflow
      crystalRef.current?.focus()
    }
  }, [session.status])

  // The session is deliberately per-visit. Confirm internal links before discarding it.
  useEffect(() => {
    if (!started || final) return
    const leave = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const next = new URL(anchor.href)
      if (next.origin !== location.origin || (next.pathname === location.pathname && next.search === location.search)) return
      session.pause()
      if (!window.confirm(copy.exit)) { event.preventDefault(); event.stopPropagation() }
    }
    document.addEventListener('click', leave, true)
    return () => document.removeEventListener('click', leave, true)
  }, [started, final, copy.exit, session.pause])

  const reset = () => { session.reset(); setPlaybackError(false) }
  const tickLabel = session.status === 'running' ? copy.tapPause : session.status === 'paused' ? copy.tapResume : copy.tapStart

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <MeditationNavigation english={english} />
    <section className={`meditation-session ${session.status === 'running' ? 'is-running' : ''} ${final ? 'is-finishing' : ''}`} aria-label={english ? 'Meditation session' : 'รอบนั่งสมาธิ'}>
      <header className="text-center"><p className="text-xs font-semibold tracking-widest text-brand-gold">A MOMENT OF STILLNESS</p><h1 className="mt-3 font-serif text-3xl font-semibold leading-snug text-brand-maroon">{copy.crystalTitle}</h1><p className="mt-3 text-sm text-brand-muted">{copy.crystalIntro}</p></header>
      <div className="session-crystal-scene" style={{ '--session-minute': `${(session.elapsedMs % 60000) / 60000 * 360}deg` } as CSSProperties}>
        <div className="session-crystal-aura" aria-hidden="true" /><div className="session-crystal-shadow" aria-hidden="true" /><div className="session-minute-ring" aria-hidden="true" />
        <button ref={crystalRef} type="button" className="session-crystal" aria-label={tickLabel} disabled={final} onClick={() => session.status === 'running' ? session.pause() : begin()} />
        <span className="session-ripple" aria-hidden="true" /><span className="session-ripple session-ripple-delayed" aria-hidden="true" />
      </div>
      <p role="status" aria-live="polite" className="text-center text-sm text-brand-gold">{final ? copy.finish : session.status === 'running' ? copy.running : session.status === 'paused' ? copy.paused : copy.tapStart}</p>
      {session.status === 'paused' && <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" className="session-button" onClick={begin}>{copy.resume}</button><button type="button" className="session-button session-primary" onClick={session.finish}>{copy.end}</button></div>}
      <details className="mx-auto mt-5 max-w-xs text-center text-sm text-brand-muted"><summary className="min-h-11 cursor-pointer py-3">{copy.showTime}</summary><p role="timer" className="text-2xl tabular-nums text-brand-maroon">{formatSessionTime(session.elapsedMs)}</p></details>
      <p className="mt-3 text-center text-xs leading-5 text-brand-muted">{copy.localOnly}</p>
      {!started && <div className="mt-5 flex flex-wrap justify-center gap-2">{(['quiet', 'guided'] as const).map(item => <button type="button" key={item} aria-pressed={mode === item} className={`session-button ${mode === item ? 'session-primary' : ''}`} onClick={() => setMode(item)}>{item === 'quiet' ? copy.silent : copy.guided}</button>)}</div>}
      {mode === 'quiet' && <p className="mt-3 text-center text-xs text-brand-muted">{copy.noDrop}</p>}
      {playbackError && <div role="alert" className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p>{copy.audioError}</p><button type="button" className="session-button mt-3" onClick={() => { session.pause(); setMode('quiet'); setPlaybackError(false) }}>{copy.silent}</button></div>}
      {mode === 'guided' && <div className="mt-8"><MeditationPage audioOnly playbackControl={control} /></div>}
    </section>
    {session.status === 'completed' && createPortal(<dialog ref={dialogRef} className="session-result-dialog" aria-labelledby="session-result-title" aria-describedby="session-result-time" onCancel={event => { event.preventDefault(); reset() }}>
      <div className="session-result-card"><div className="session-result-mark" aria-hidden="true" /><p className="text-xs font-semibold tracking-widest text-brand-gold">A MOMENT FOR YOURSELF</p><h2 id="session-result-title" className="mt-4 font-serif text-2xl font-semibold leading-relaxed text-brand-maroon">{copy.resultTitle}</h2><p className="mt-5 text-sm text-brand-muted">{copy.resultLabel}</p><p id="session-result-time" className="mt-3 text-5xl tabular-nums text-brand-maroon">{formatSessionTime(session.elapsedMs)}</p><p className="mt-4 text-sm text-brand-muted">{copy.finish}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button ref={againRef} type="button" className="session-button session-primary" onClick={reset}>{copy.again}</button><button type="button" className="session-button" onClick={() => { session.reset(); navigate('/meditation') }}>{copy.home}</button></div><p className="mt-5 text-xs leading-5 text-brand-muted">{copy.localOnly}</p></div>
    </dialog>, document.body)}
  </div>
}
