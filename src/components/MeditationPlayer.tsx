import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { trackUsageEvent } from '../lib/analytics'
import { formatMediaTime, parseWebVTT, type SubtitleCue } from '../lib/subtitles'

interface Props {
  trackId: string
  title: string
  audioPath: string | null
  subtitlePath: string | null
  tone?: 'light' | 'dark'
}

// The parent keys this component by track/language so media cannot leak between selections.
export function MeditationPlayer({ trackId, title, audioPath, subtitlePath, tone = 'light' }: Props) {
  const { t } = useTranslation()
  const isDark = tone === 'dark'
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<'loading' | 'ready' | 'missing' | 'error'>(audioPath ? 'loading' : 'missing')
  const [subtitleState, setSubtitleState] = useState<'loading' | 'ready' | 'missing' | 'error'>(subtitlePath ? 'loading' : 'missing')
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [time, setTime] = useState(0)
  const [audioAttempt, setAudioAttempt] = useState(0)
  const [subtitleAttempt, setSubtitleAttempt] = useState(0)

  useEffect(() => {
    let active = true
    if (!audioPath) return
    const load = async () => {
      setAudioState('loading')
      setAudioUrl(null)
      setTime(0)
      try {
        if (!supabaseClient) throw new Error('Unavailable')
        const { data, error } = await supabaseClient.storage.from('meditation-audio').createSignedUrl(audioPath, 3600)
        if (error || !data?.signedUrl) throw error ?? new Error('No URL')
        if (active) {
          setAudioUrl(data.signedUrl)
          setAudioState('ready')
        }
      } catch {
        if (active) setAudioState('error')
      }
    }
    void load()
    return () => { active = false }
  }, [audioPath, audioAttempt])

  useEffect(() => {
    let active = true
    if (!subtitlePath) return
    const load = async () => {
      setSubtitleState('loading')
      setCues([])
      try {
        if (!supabaseClient) throw new Error('Unavailable')
        const { data, error } = await supabaseClient.storage.from('meditation-subtitles').download(subtitlePath)
        if (error || !data) throw error ?? new Error('No captions')
        const parsed = parseWebVTT(await data.text())
        if (!parsed.length) throw new Error('Invalid captions')
        if (active) {
          setCues(parsed)
          setSubtitleState('ready')
        }
      } catch {
        if (active) setSubtitleState('error')
      }
    }
    void load()
    return () => { active = false }
  }, [subtitlePath, subtitleAttempt])

  const activeCues = cues.filter(cue => time >= cue.start && time < cue.end)
  const record = (eventType: 'audio_play' | 'audio_complete') => {
    void trackUsageEvent({ eventType, resourceType: 'meditation_track', resourceId: trackId }).catch(() => {
      // Analytics failures must not interrupt playback.
    })
  }

  return (
    <div className="min-w-0 space-y-4">
      <section className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/15 bg-black/12 text-[#fff4df] backdrop-blur-sm' : 'border-slate-200 bg-white'}`} aria-label={t('meditation.audioPlayerTitle')}>
        <h3 className={`mb-4 font-bold ${isDark ? 'text-[#fff4df]' : 'text-[#11223C]'}`}>{t('meditation.audioPlayerTitle')}</h3>
        {audioState === 'loading' && <p role="status" className={`text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{t('meditation.loadingAudio')}</p>}
        {audioState === 'missing' && <p className={`text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{t('meditation.audioUnavailableNotice')}</p>}
        {audioState === 'error' && (
          <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <p>{t('meditation.playbackError')}</p>
            <button type="button" className="min-h-11 rounded-lg border border-red-300 px-4 font-semibold" onClick={() => setAudioAttempt(value => value + 1)}>{t('meditation.retry')}</button>
          </div>
        )}
        {audioUrl && audioState === 'ready' && (
          <audio
            key={audioUrl}
            aria-label={`${t('meditation.audioPlayerTitle')}: ${title}`}
            controls
            preload="none"
            className="block w-full min-w-0 max-w-full"
            src={audioUrl}
            onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
            onSeeked={event => setTime(event.currentTarget.currentTime)}
            onPlay={() => record('audio_play')}
            onEnded={event => { setTime(event.currentTarget.currentTime); record('audio_complete') }}
            onError={() => setAudioState('error')}
          />
        )}
      </section>

      <section className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/12 bg-white/8 text-[#fff4df]' : 'border-slate-200 bg-white'}`} aria-label={t('meditation.subtitlesTitle')}>
        <h3 className={`mb-4 font-bold ${isDark ? 'text-[#fff4df]' : 'text-[#11223C]'}`}>{t('meditation.subtitlesTitle')}</h3>
        {subtitleState === 'loading' && <p role="status" className={`text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{t('meditation.loadingSubtitles')}</p>}
        {subtitleState === 'missing' && <p className={`text-sm ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{t('meditation.noSubtitles')}</p>}
        {subtitleState === 'error' && (
          <div role="alert" className="space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p>{t('meditation.subtitleError')}</p>
            <button type="button" className="min-h-11 rounded-lg border border-amber-300 px-4 font-semibold" onClick={() => setSubtitleAttempt(value => value + 1)}>{t('meditation.retry')}</button>
          </div>
        )}
        {subtitleState === 'ready' && (
          <>
            <div aria-label={t('meditation.currentCaption')} className={`min-h-24 rounded-xl p-5 text-center text-base leading-7 whitespace-pre-wrap ${isDark ? 'border-l-2 border-[#efd070] bg-white/8 text-[#fff4df]' : 'bg-[#11223C] text-white'}`}>
              {activeCues.length ? activeCues.map(cue => cue.text).join('\n') : t('meditation.captionWaiting')}
            </div>
            <details className="mt-4">
              <summary className={`cursor-pointer py-3 text-sm font-semibold ${isDark ? 'text-[#efd070]' : 'text-[#A86100]'}`}>{t('meditation.allCaptions')}</summary>
              <ol className="max-h-80 space-y-2 overflow-y-auto">
                {cues.map(cue => (
                  <li key={cue.id} aria-current={time >= cue.start && time < cue.end ? 'true' : undefined} className={`rounded-lg border p-3 text-sm ${isDark ? (time >= cue.start && time < cue.end ? 'border-[#efd070]/50 bg-white/14' : 'border-white/10 bg-white/5') : (time >= cue.start && time < cue.end ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50')}`}>
                    <span className={`text-xs font-semibold ${isDark ? 'text-[#efd070]' : 'text-[#A86100]'}`}>{formatMediaTime(cue.start)} – {formatMediaTime(cue.end)}</span>
                    <p className="mt-1 whitespace-pre-wrap">{cue.text}</p>
                  </li>
                ))}
              </ol>
            </details>
          </>
        )}
      </section>
    </div>
  )
}
