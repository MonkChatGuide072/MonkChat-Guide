import { useCallback, useEffect, useRef, useState } from 'react'
import { supabaseClient } from '../../lib/supabase'
import { formatMediaTime, parseWebVTT, type SubtitleCue } from '../../lib/subtitles'
import { GuideIcon } from '../GuideIcon'

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
  source_language_code: string
  meditation_track_translations: TrackTranslationRow[]
}

/** Synchronized guided-meditation audio + clickable cue script runner for student monks. */
export function NisitAudioTeleprompter({ isEnglish }: { isEnglish: boolean }) {
  const [tracks, setTracks] = useState<TrackRow[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string>('')
  const [scriptLang, setScriptLang] = useState<'en' | 'th'>('en')
  const [loadingTracks, setLoadingTracks] = useState(true)
  const [tracksError, setTracksError] = useState(false)

  const fetchTracks = useCallback(async () => {
    if (!supabaseClient) {
      setTracksError(true)
      setLoadingTracks(false)
      return
    }
    setLoadingTracks(true)
    setTracksError(false)
    try {
      const { data, error } = await supabaseClient
        .from('meditation_tracks')
        .select(
          'id, audio_storage_path, speaker_name, duration_seconds, source_language_code, meditation_track_translations(language_code, title, description, transcript, subtitle_vtt_storage_path)',
        )
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      const loaded = (data as TrackRow[]) ?? []
      setTracks(loaded)
      if (loaded.length > 0) {
        const preferred =
          loaded.find((item) => item.meditation_track_translations.some((tr) => tr.language_code === 'en')) ?? loaded[0]
        setSelectedTrackId((prev) => prev || preferred.id)
      }
    } catch {
      setTracksError(true)
    } finally {
      setLoadingTracks(false)
    }
  }, [])

  useEffect(() => {
    void fetchTracks()
  }, [fetchTracks])

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? tracks[0]
  const activeTranslation =
    selectedTrack?.meditation_track_translations.find((tr) => tr.language_code === scriptLang)
    ?? selectedTrack?.meditation_track_translations[0]

  if (loadingTracks) {
    return (
      <div role="status" className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-muted">
        {isEnglish ? 'Loading published meditation tracks...' : 'กำลังโหลดคลิปเสียงและบทนำสมาธิที่เผยแพร่...'}
      </div>
    )
  }

  if (tracksError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
        <p>{isEnglish ? 'Unable to load published tracks right now.' : 'ไม่สามารถโหลดคลังเสียงนำสมาธิได้ในขณะนี้'}</p>
        <button
          type="button"
          onClick={() => void fetchTracks()}
          className="mt-3 min-h-11 cursor-pointer rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-900 hover:bg-red-100"
        >
          {isEnglish ? 'Retry' : 'ลองใหม่'}
        </button>
      </div>
    )
  }

  if (!selectedTrack || !activeTranslation) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-muted">
        {isEnglish ? 'No published meditation tracks available yet.' : 'ยังไม่มีรายการเสียงนำสมาธิที่เผยแพร่ในระบบ'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Track & Script Language Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-brand-maroon">
            {isEnglish ? 'Track:' : 'เลือกรายการฝึก:'}
          </span>
          {tracks.map((track) => {
            const label =
              track.meditation_track_translations.find((tr) => tr.language_code === scriptLang)?.title
              ?? track.meditation_track_translations[0]?.title
              ?? track.id
            const selected = track.id === selectedTrack.id
            return (
              <button
                key={track.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedTrackId(track.id)}
                className={`min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-medium transition-colors duration-150 ${
                  selected
                    ? 'border-brand-terracotta bg-brand-terracotta text-white'
                    : 'border-brand-border bg-brand-cream text-brand-maroon hover:bg-brand-gold-soft'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2" role="group" aria-label={isEnglish ? 'Script language' : 'ภาษาบทอ่าน'}>
          <span className="text-xs text-brand-muted">{isEnglish ? 'Script:' : 'บทอ่าน:'}</span>
          {(['en', 'th'] as const).map((lang) => {
            const hasLang = selectedTrack.meditation_track_translations.some((tr) => tr.language_code === lang)
            const active = activeTranslation.language_code === lang
            return (
              <button
                key={lang}
                type="button"
                disabled={!hasLang}
                aria-pressed={active}
                onClick={() => setScriptLang(lang)}
                className={`min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-brand-maroon bg-brand-maroon text-white'
                    : 'border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                }`}
              >
                {lang === 'en' ? 'EN Script' : 'คำแปล TH'}
              </button>
            )
          })}
        </div>
      </div>

      <SyncedScriptPlayer
        key={`${selectedTrack.id}-${activeTranslation.language_code}`}
        track={selectedTrack}
        translation={activeTranslation}
        isEnglish={isEnglish}
      />
    </div>
  )
}

function SyncedScriptPlayer({
  track,
  translation,
  isEnglish,
}: {
  track: TrackRow
  translation: TrackTranslationRow
  isEnglish: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>(
    track.audio_storage_path ? 'loading' : 'missing',
  )
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [cueStatus, setCueStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>(
    translation.subtitle_vtt_storage_path ? 'loading' : 'missing',
  )
  const [currentTime, setCurrentTime] = useState(0)
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  useEffect(() => {
    let active = true
    if (!track.audio_storage_path) return
    const loadAudio = async () => {
      try {
        if (!supabaseClient) throw new Error('No client')
        const { data, error } = await supabaseClient.storage
          .from('meditation-audio')
          .createSignedUrl(track.audio_storage_path!, 3600)
        if (error || !data?.signedUrl) throw error ?? new Error('Missing URL')
        if (active) {
          setAudioUrl(data.signedUrl)
          setAudioStatus('ready')
        }
      } catch {
        if (active) setAudioStatus('error')
      }
    }
    void loadAudio()
    return () => {
      active = false
    }
  }, [track.audio_storage_path])

  useEffect(() => {
    let active = true
    if (!translation.subtitle_vtt_storage_path) return
    const loadVtt = async () => {
      try {
        if (!supabaseClient) throw new Error('No client')
        const { data, error } = await supabaseClient.storage
          .from('meditation-subtitles')
          .download(translation.subtitle_vtt_storage_path!)
        if (error || !data) throw error ?? new Error('Missing VTT')
        const parsed = parseWebVTT(await data.text())
        if (!parsed.length) throw new Error('Empty cues')
        if (active) {
          setCues(parsed)
          setCueStatus('ready')
        }
      } catch {
        if (active) setCueStatus('error')
      }
    }
    void loadVtt()
    return () => {
      active = false
    }
  }, [translation.subtitle_vtt_storage_path])

  const activeCueIndex = cues.findIndex((cue) => currentTime >= cue.start && currentTime < cue.end)
  const activeCue = activeCueIndex >= 0 ? cues[activeCueIndex] : null

  const jumpToCue = (seconds: number) => {
    const audioEl = audioRef.current
    if (!audioEl) return
    audioEl.currentTime = seconds
    setCurrentTime(seconds)
    void audioEl.play().catch(() => {
      // Ignore autoplay blocks; user still sought cleanly to cue start.
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-maroon">{translation.title}</h2>
            <p className="mt-1 text-xs text-brand-muted tabular-nums">
              {isEnglish ? 'Language:' : 'ภาษาต้นฉบับ:'} {track.source_language_code.toUpperCase()} ·{' '}
              {Math.max(1, Math.round(track.duration_seconds / 60))} {isEnglish ? 'min' : 'นาที'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-terracotta tabular-nums">
            <GuideIcon name="clock" />
            <span>{formatMediaTime(currentTime)}</span>
          </span>
        </div>

        <div className="mt-4">
          {audioStatus === 'loading' && (
            <p role="status" className="text-sm text-brand-muted">
              {isEnglish ? 'Loading audio player...' : 'กำลังโหลดเครื่องเล่นเสียง...'}
            </p>
          )}
          {audioStatus === 'missing' && (
            <p className="text-sm text-brand-muted">
              {isEnglish ? 'No audio file uploaded for this track.' : 'รายการนี้ยังไม่มีไฟล์เสียง'}
            </p>
          )}
          {audioStatus === 'error' && (
            <p role="alert" className="text-sm text-red-800">
              {isEnglish ? 'Failed to load meditation audio.' : 'ไม่สามารถโหลดไฟล์เสียงนำสมาธิได้'}
            </p>
          )}
          {audioStatus === 'ready' && audioUrl && (
            <audio
              ref={audioRef}
              controls
              preload="none"
              src={audioUrl}
              aria-label={`Student audio player: ${translation.title}`}
              className="block w-full accent-brand-terracotta"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onSeeked={(e) => setCurrentTime(e.currentTarget.currentTime)}
            />
          )}
        </div>

        {/* Live Highlighted Spoken Line (Teleprompter) */}
        <div
          aria-live="polite"
          aria-label={isEnglish ? 'Active spoken script cue' : 'บทพูดนำสมาธิท่อนปัจจุบัน'}
          className="mt-5 rounded-xl border-l-3 border-brand-terracotta bg-brand-gold-soft p-5"
        >
          <div className="flex items-center justify-between text-xs font-medium text-brand-terracotta tabular-nums">
            <span>{isEnglish ? 'Active spoken line' : 'ข้อความที่กำลังพูดอยู่ในคลิป'}</span>
            {activeCue && (
              <span>
                {formatMediaTime(activeCue.start)} – {formatMediaTime(activeCue.end)}
              </span>
            )}
          </div>
          <p className="mt-2 min-h-14 text-lg font-medium leading-8 text-brand-maroon sm:text-xl">
            {cueStatus === 'ready'
              ? activeCue?.text ?? (isEnglish ? 'Press play or select any timestamped cue below to practice speaking.' : 'กดเล่นเสียง หรือแตะท่อนข้อความด้านล่างเพื่อข้ามไปฝึกออกเสียงตามท่อนนั้น')
              : cueStatus === 'loading'
                ? isEnglish ? 'Loading synchronized captions...' : 'กำลังโหลดคำบรรยายซิงก์ตามเวลา...'
                : isEnglish ? 'Synchronized captions are unavailable for this track.' : 'ยังไม่มีไฟล์ซับไตเติล VTT สำหรับรายการนี้'}
          </p>
        </div>
      </section>

      {/* Clickable Cue-by-Cue Practice List */}
      {cueStatus === 'ready' && cues.length > 0 && (
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-base font-medium text-brand-maroon">
                {isEnglish ? 'Click any line to jump & repeat' : 'แตะที่แต่ละท่อนเพื่อกระโดดเสียงไปฝึกพูดซ้ำ'}
              </h3>
              <p className="mt-1 text-xs text-brand-muted">
                {isEnglish
                  ? `${cues.length} synchronized segments`
                  : `ทั้งหมด ${cues.length} ท่อนตามเวลาคลิป`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullTranscript((v) => !v)}
              className="min-h-11 cursor-pointer rounded-xl border border-brand-border px-3 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
            >
              {showFullTranscript
                ? (isEnglish ? 'Hide full transcript' : 'ซ่อนบทอ่านฉบับเต็ม')
                : (isEnglish ? 'Show full transcript' : 'ดูบทอ่านฉบับเต็ม')}
            </button>
          </div>

          <ol className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {cues.map((cue, index) => {
              const isCurrent = index === activeCueIndex
              return (
                <li key={cue.id}>
                  <button
                    type="button"
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => jumpToCue(cue.start)}
                    className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors duration-150 ${
                      isCurrent
                        ? 'border-brand-terracotta bg-brand-gold-soft font-medium text-brand-maroon'
                        : 'border-brand-border bg-brand-cream/40 text-brand-text hover:bg-brand-gold-soft'
                    }`}
                  >
                    <span className="shrink-0 pt-0.5 text-xs font-medium text-brand-terracotta tabular-nums">
                      {formatMediaTime(cue.start)}
                    </span>
                    <span className="flex-1 leading-6">{cue.text}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          {showFullTranscript && (
            <div className="mt-4 rounded-xl border border-brand-border bg-brand-cream p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-brand-text">
                {translation.transcript || cues.map((c) => c.text).join('\n\n')}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

