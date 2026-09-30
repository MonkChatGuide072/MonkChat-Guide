import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { MeditationPlayer } from '../components/MeditationPlayer'
import { MeditationMark } from '../components/MeditationMark'
import { VisitorBackLink } from '../components/VisitorBackLink'

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
  is_recommended: boolean
  source_language_code: string
  meditation_track_translations: TrackTranslationRow[]
}

export function MeditationPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTrackId = searchParams.get('trackId')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTracks, setTracks] = useState<TrackRow[]>([])
  const tracks = allTracks.filter(track => track.meditation_track_translations.some(translation => translation.language_code === currentLang))

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
          is_recommended,
          source_language_code,
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
      setTracks((data as TrackRow[]) ?? [])
    } catch {
      setError(t('meditation.errorLoadTracks'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchTracks()
  }, [fetchTracks])

  const currentTrack = tracks.find(track => track.id === initialTrackId) ?? tracks[0]
  const selectedTrackId = currentTrack?.id
  const trackTranslation = currentTrack?.meditation_track_translations.find(translation => translation.language_code === currentLang)

  return (
    <div className="space-y-6 break-words [overflow-wrap:anywhere]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-[#a34e39]">{t('meditation.heroTag')}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#30342d] sm:text-5xl">{t('meditation.title')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625b50]">{t('meditation.subtitle')}</p>
        </div>
        <VisitorBackLink />
      </header>

      {isLoading && (
        <div role="status" aria-label={t('meditation.loadingAudio')} className="flex min-h-72 items-center justify-center rounded-[1.5rem] border border-white/35 bg-white/24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#a94732]/20 border-t-[#a94732]" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[1.5rem] border border-red-900/15 bg-[#f2d9cf]/80 p-7 text-center">
          <p className="font-semibold text-[#812e24]">{t('meditation.errorTitle')}</p>
          <p className="mt-2 text-sm text-[#812e24]/75">{error}</p>
          <button type="button" onClick={() => void fetchTracks()} className="mt-4 min-h-11 rounded-full bg-[#a94732] px-5 text-sm font-bold text-white">{t('meditation.retry')}</button>
        </div>
      )}

      {!isLoading && !error && tracks.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/40 bg-white/28 p-10 text-center backdrop-blur-sm">
          <h2 className="text-lg font-bold text-[#30342d]">{t('meditation.emptyTitle')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#625b50]">{t('meditation.emptyDesc')}</p>
        </div>
      )}

      {!isLoading && !error && currentTrack && trackTranslation && (
        <div className="grid items-start gap-5 lg:grid-cols-[1.34fr_.74fr]">
          <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#303a2f] p-5 text-[#fff4df] shadow-[0_24px_60px_rgba(49,55,43,.18)] sm:p-7">
            <MeditationMark className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[25rem] -translate-x-1/2 -translate-y-1/2 text-white/18 sm:w-[31rem]" />
            <div className="relative z-10">
              <div className="max-w-2xl">
                <p className="text-[.66rem] font-bold uppercase tracking-[.14em] text-[#efd070]">
                  {currentTrack.is_recommended ? t('meditation.recommended') : t('meditation.heroTag')}
                </p>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-[1.12] tracking-[-.025em] sm:text-4xl">{trackTranslation.title}</h2>
                {trackTranslation.description && <p className="mt-3 max-w-xl text-sm leading-6 text-[#fff4df]/72">{trackTranslation.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2 text-[.68rem] font-semibold text-[#fff4df]/72">
                  <span className="rounded-full border border-white/14 bg-white/7 px-3 py-1.5">{Math.max(1, Math.round(currentTrack.duration_seconds / 60))} {t('meditation.minutes')}</span>
                  <span className="rounded-full border border-white/14 bg-white/7 px-3 py-1.5">{t('meditation.audioLanguage')}: {currentTrack.source_language_code.toUpperCase()}</span>
                  {currentTrack.speaker_name && <span className="rounded-full border border-white/14 bg-white/7 px-3 py-1.5">{t('meditation.speaker')}: {currentTrack.speaker_name}</span>}
                </div>
              </div>

              <div className="mt-7">
                <MeditationPlayer
                  key={JSON.stringify([currentTrack.id, currentLang, currentTrack.audio_storage_path, trackTranslation.subtitle_vtt_storage_path])}
                  trackId={currentTrack.id}
                  title={trackTranslation.title}
                  audioPath={currentTrack.audio_storage_path}
                  subtitlePath={trackTranslation.subtitle_vtt_storage_path}
                  tone="dark"
                />
              </div>
            </div>
          </section>

          <div className="grid gap-5">
            <section className="rounded-[1.5rem] border border-white/45 bg-[#eadbc1]/86 p-5 shadow-[0_16px_42px_rgba(73,61,45,.08)] backdrop-blur-md sm:p-6">
              <div className="flex items-end justify-between gap-3 border-b border-[#6b5c48]/15 pb-4">
                <h2 className="font-serif text-xl font-bold text-[#30342d]">{t('meditation.selectTrackTitle')}</h2>
                <span className="text-[.65rem] text-[#6b6255]">{tracks.length} {t('qa.itemCount', { count: tracks.length })}</span>
              </div>
              <div className="divide-y divide-[#6b5c48]/14" role="group" aria-label={t('meditation.selectTrackTitle')}>
                {tracks.map((track, index) => {
                  const translation = track.meditation_track_translations.find(item => item.language_code === currentLang)
                  const isSelected = track.id === selectedTrackId
                  return (
                    <button key={track.id} type="button" aria-pressed={isSelected} onClick={() => setSearchParams({ trackId: track.id })} className={`grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 py-4 text-left transition-colors ${isSelected ? 'text-[#8e3d2d]' : 'text-[#30342d] hover:text-[#8e3d2d]'}`}>
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-[.65rem] font-bold ${isSelected ? 'bg-[#a94732] text-white' : 'bg-[#d7c5a6] text-[#5d5448]'}`}>0{index + 1}</span>
                      <span className="min-w-0"><strong className="block truncate text-sm">{translation?.title || t('meditation.untitledTrack')}</strong><small className="mt-1 block text-[.65rem] text-[#6b6255]">{Math.max(1, Math.round(track.duration_seconds / 60))} {t('meditation.minutes')}</small></span>
                      <span aria-hidden="true">›</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/45 bg-white/28 p-5 backdrop-blur-sm sm:p-6">
              <h3 className="font-serif text-xl font-bold text-[#30342d]">{t('meditation.transcriptTitle')}</h3>
              {trackTranslation.transcript ? (
                <p className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap border-l-2 border-[#a94732] pl-4 text-sm leading-7 text-[#514b42]">{trackTranslation.transcript}</p>
              ) : (
                <p className="mt-4 text-sm text-[#6b6255]">{t('meditation.noTranscript')}</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
