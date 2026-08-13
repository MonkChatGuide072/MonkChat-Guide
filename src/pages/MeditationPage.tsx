import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { getTranslation } from '../utils/translation'

interface TrackTranslationRow {
  language_code: string
  title: string
  description: string
  transcript: string | null
  subtitle_vtt_storage_path: string | null
}

interface TrackRow {
  id: string
  audio_storage_path: string | null
  speaker_name: string | null
  duration_seconds: number
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  meditation_track_translations: TrackTranslationRow[]
}

interface Cue {
  id: string
  start_time: number
  end_time: number
  text: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function parseWebVTT(vttText: string): Cue[] {
  const cues: Cue[] = []
  const normalized = vttText.replace(/\r\n/g, '\n')
  const blocks = normalized.split('\n\n')

  let cueIndex = 0
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 1) continue

    if (lines[0].startsWith('WEBVTT')) {
      continue
    }

    let timeLine = lines[0]
    let textLines = lines.slice(1)

    if (!timeLine.includes('-->') && lines[1] && lines[1].includes('-->')) {
      timeLine = lines[1]
      textLines = lines.slice(2)
    }

    if (!timeLine.includes('-->')) continue

    const parts = timeLine.split('-->')
    if (parts.length < 2) continue

    const startStr = parts[0].trim()
    const endStr = parts[1].trim().split(' ')[0]

    const startTime = parseVttTimestamp(startStr)
    const endTime = parseVttTimestamp(endStr)
    const text = textLines.join(' ').replace(/<[^>]+>/g, '').trim()

    if (text) {
      cues.push({
        id: `cue-${cueIndex++}`,
        start_time: startTime,
        end_time: endTime,
        text,
      })
    }
  }
  return cues
}

function parseVttTimestamp(timestamp: string): number {
  const parts = timestamp.split(':')
  if (parts.length === 2) {
    const [m, s] = parts
    return parseInt(m, 10) * 60 + parseFloat(s)
  } else if (parts.length === 3) {
    const [h, m, s] = parts
    return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s)
  }
  return 0
}

export function MeditationPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tracks, setTracks] = useState<TrackRow[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // Selected Track Resources State
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [cues, setCues] = useState<Cue[]>([])
  const [audioError, setAudioError] = useState<string | null>(null)

  // ── Fetch Tracks ───────────────────────────────────────────────────────────

  const fetchTracks = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('meditation.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabaseClient
        .from('meditation_tracks')
        .select(`
          id,
          audio_storage_path,
          speaker_name,
          duration_seconds,
          content_status,
          is_published,
          meditation_track_translations (
            language_code,
            title,
            description,
            transcript,
            subtitle_vtt_storage_path
          )
        `)
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (dbError) throw dbError

      const fetchedTracks = (data as TrackRow[]) ?? []
      setTracks(fetchedTracks)
      if (fetchedTracks.length > 0) {
        setSelectedTrackId(fetchedTracks[0].id)
      }
      setIsLoading(false)
    } catch {
      setError(t('meditation.errorLoadTracks'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  // Resolve active track
  const currentTrack = tracks.find((t) => t.id === selectedTrackId)
  const trackTranslation = currentTrack
    ? getTranslation(currentTrack.meditation_track_translations, currentLang, 'th')
    : undefined

  // ── Load Signed Storage URLs & Subtitles ───────────────────────────────────

  useEffect(() => {
    let active = true

    const loadResources = async () => {
      if (!supabaseClient || !currentTrack) return

      setAudioUrl(null)
      setSubtitleUrl(null)
      setCues([])
      setAudioError(null)

      try {
        // 1. Get signed audio URL
        if (currentTrack.audio_storage_path) {
          const { data: audioData, error: audioErr } = await supabaseClient.storage
            .from('meditation-audio')
            .createSignedUrl(currentTrack.audio_storage_path, 3600)

          if (audioErr) throw audioErr
          if (active && audioData) {
            setAudioUrl(audioData.signedUrl)
          }
        }

        // 2. Get signed VTT URL & download static cues
        if (trackTranslation?.subtitle_vtt_storage_path) {
          const { data: subData, error: subErr } = await supabaseClient.storage
            .from('meditation-subtitles')
            .createSignedUrl(trackTranslation.subtitle_vtt_storage_path, 3600)

          if (subErr) throw subErr
          if (active && subData) {
            setSubtitleUrl(subData.signedUrl)
          }

          const { data: blob, error: dlErr } = await supabaseClient.storage
            .from('meditation-subtitles')
            .download(trackTranslation.subtitle_vtt_storage_path)

          if (dlErr) throw dlErr
          if (active && blob) {
            const text = await blob.text()
            const parsedCues = parseWebVTT(text)
            setCues(parsedCues)
          }
        }
      } catch {
        console.error('Failed to load subtitles')
        if (active) {
          setAudioError('Error loading resources')
        }
      }
    }

    loadResources()

    return () => {
      active = false
    }
  }, [currentTrack, trackTranslation, currentLang])

  return (
    <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 max-w-6xl mx-auto">
      {/* Header Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              {t('meditation.heroTag')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('meditation.title')}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          {t('meditation.subtitle')}
        </p>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('meditation.errorTitle')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchTracks}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
          >
            {t('meditation.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && tracks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-3xl">
            🎧
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('meditation.emptyTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('meditation.emptyDesc')}
          </p>
        </div>
      )}

      {/* Main Grid */}
      {!isLoading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Track Selection List */}
          <section className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🎧</span>
              <span>{t('meditation.selectTrackTitle')}</span>
            </h2>

            <div className="space-y-3" role="tablist" aria-label={t('meditation.selectTrackTitle')}>
              {tracks.map((track) => {
                const translation = getTranslation(track.meditation_track_translations, currentLang, 'th')
                const isSelected = track.id === selectedTrackId

                return (
                  <button
                    key={track.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 motion-reduce:transition-none min-h-[48px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 text-slate-900 shadow-2xs font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm sm:text-base leading-snug">
                        {translation?.title || track.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono flex-shrink-0">
                        {Math.round(track.duration_seconds / 60)} {t('meditation.minutes')}
                      </span>
                    </div>
                    {translation?.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {translation.description}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Selected Track Audio Player, Transcript & Subtitles */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  {t('meditation.duration')}: {Math.round((currentTrack?.duration_seconds || 0) / 60)} {t('meditation.minutes')} ({currentTrack?.duration_seconds}s)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {trackTranslation?.title || currentTrack?.id}
                </h2>
                {trackTranslation?.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {trackTranslation.description}
                  </p>
                )}
                {currentTrack?.speaker_name && (
                  <p className="text-xs text-slate-500 italic">
                    {t('meditation.speaker')}: {currentTrack.speaker_name}
                  </p>
                )}
              </div>

              {/* Audio Player Box */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t('meditation.audioPlayerTitle')}
                  </span>
                  {!audioUrl && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60">
                      {t('meditation.audioStatusUnavailable')}
                    </span>
                  )}
                </div>

                {audioError && (
                  <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-200">
                    ⚠️ {audioError}
                  </div>
                )}

                {audioUrl ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <audio controls className="w-full focus:outline-hidden" src={audioUrl}>
                      {subtitleUrl && (
                        <track
                          kind="subtitles"
                          src={subtitleUrl}
                          srcLang={currentLang}
                          label={currentLang === 'th' ? 'ภาษาไทย' : 'English'}
                          default
                        />
                      )}
                    </audio>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-white p-3.5 rounded-lg border border-slate-200 opacity-75">
                    <button
                      type="button"
                      disabled
                      className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed flex-shrink-0"
                    >
                      ▶
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-300 w-0"></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>00:00</span>
                        <span>{formatTime(currentTrack?.duration_seconds || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!audioUrl && (
                  <p className="text-xs text-slate-500 italic leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200/50 text-amber-900">
                    ℹ️ {t('meditation.audioUnavailableNotice')}
                  </p>
                )}
              </div>
            </section>

            {/* Subtitles Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>💬</span>
                  <span>{t('meditation.subtitlesTitle')}</span>
                </span>
              </h3>

              {cues.length > 0 ? (
                <div className="space-y-3">
                  {cues.map((cue) => (
                    <div
                      key={cue.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm"
                    >
                      <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-amber-100/80 text-amber-800 self-start sm:self-center flex-shrink-0">
                        {formatTime(cue.start_time)} - {formatTime(cue.end_time)}
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {cue.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <p className="text-sm text-slate-500 italic">
                    {t('meditation.noSubtitles')}
                  </p>
                </div>
              )}
            </section>

            {/* Transcript Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>📄</span>
                <span>{t('meditation.transcriptTitle')}</span>
              </h3>

              {trackTranslation?.transcript ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {trackTranslation.transcript}
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <p className="text-sm text-slate-500 italic">
                    {t('meditation.noTranscript')}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
