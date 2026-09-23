import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { MeditationPlayer } from '../components/MeditationPlayer'
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
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [searchParams, setSearchParams] = useSearchParams()
  const initialTrackId = searchParams.get('trackId')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTracks, setTracks] = useState<TrackRow[]>([])
  const tracks = allTracks.filter(track =>
    track.meditation_track_translations.some(translation => translation.language_code === currentLang),
  )

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

      const fetchedTracks = (data as TrackRow[]) ?? []

      setTracks(fetchedTracks)
      setIsLoading(false)
    } catch {
      setError(t('meditation.errorLoadTracks'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  // Derive selection from the URL so links and browser back/forward stay in sync.
  const currentTrack = tracks.find(track => track.id === initialTrackId) ?? tracks[0]
  const selectedTrackId = currentTrack?.id
  const trackTranslation = currentTrack?.meditation_track_translations.find(
    translation => translation.language_code === currentLang,
  )

  return (
    <div className="break-words [overflow-wrap:anywhere] space-y-6 sm:space-y-8 pt-2 sm:pt-4 max-w-6xl mx-auto">
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
        <VisitorBackLink />
      </section>

      {/* Loading State */}
      {isLoading && (
        <div role="status" aria-label={t('meditation.loadingAudio')} className="flex justify-center items-center py-20">
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
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#A86100]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 14v-3a8 8 0 0116 0v3M4 13H3v7h4v-7H4zm16 0h1v7h-4v-7h3z" /></svg>
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
          <section className="min-w-0 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#A86100]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 14v-3a8 8 0 0116 0v3M4 13H3v7h4v-7H4zm16 0h1v7h-4v-7h3z" /></svg>
              <span>{t('meditation.selectTrackTitle')}</span>
            </h2>

            <div className="space-y-3" role="group" aria-label={t('meditation.selectTrackTitle')}>
              {tracks.map((track) => {
                const translation = track.meditation_track_translations.find(item => item.language_code === currentLang)
                const isSelected = track.id === selectedTrackId

                return (
                  <button
                    key={track.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSearchParams({ trackId: track.id })
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 motion-reduce:transition-none min-h-[48px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A86100] ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 text-slate-900 shadow-2xs font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm sm:text-base leading-snug">
                        {translation?.title || t('meditation.untitledTrack', 'Untitled Track')}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono flex-shrink-0">
                          {Math.round(track.duration_seconds / 60)} {t('meditation.minutes')}
                        </span>
                        {track.is_recommended && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#A86100]/10 text-[#A86100] font-bold uppercase">
                            {t('meditation.recommended', 'Recommended')}
                          </span>
                        )}
                      </div>
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
          <div className="min-w-0 lg:col-span-8 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  {t('meditation.duration')}: {Math.round((currentTrack?.duration_seconds || 0) / 60)} {t('meditation.minutes')} ({currentTrack?.duration_seconds}s)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {trackTranslation?.title || t('meditation.untitledTrack', 'Untitled Track')}
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
                <div className="pt-2 flex items-center">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[#A86100]/10 text-[#A86100] font-bold uppercase tracking-wider">
                    {t('meditation.audioLanguage', 'Audio Language')}: {currentTrack?.source_language_code || t('meditation.unknownLanguage', 'Unknown')}
                  </span>
                </div>
              </div>

            </section>

            {currentTrack && trackTranslation && (
              <MeditationPlayer
                key={JSON.stringify([currentTrack.id, currentLang, currentTrack.audio_storage_path, trackTranslation.subtitle_vtt_storage_path])}
                trackId={currentTrack.id}
                title={trackTranslation.title}
                audioPath={currentTrack.audio_storage_path}
                subtitlePath={trackTranslation.subtitle_vtt_storage_path}
              />
            )}

            {/* Transcript Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg aria-hidden="true" className="h-5 w-5 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.8" strokeLinecap="round" d="M6 3h8l4 4v14H6V3zm3 7h6m-6 4h6m-6 4h4" /></svg>
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
