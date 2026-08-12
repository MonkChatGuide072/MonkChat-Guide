import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  mockMeditationTracks,
  mockMeditationTrackTranslations,
  mockTranscripts,
  mockSubtitles,
} from '../data/mock'
import { getTranslation } from '../utils/translation'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function MeditationPage() {
  const { t, i18n } = useTranslation()

  // Filter only published tracks
  const publishedTracks = mockMeditationTracks.filter((track) => track.is_published)

  // Track selection state (default to first track)
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    publishedTracks[0]?.id || 'track-demo-001'
  )

  const currentTrack = publishedTracks.find((track) => track.id === selectedTrackId) || publishedTracks[0]

  // Resolve current track translation using language-scalable helper with Thai fallback
  const trackTranslation = currentTrack
    ? getTranslation(
        mockMeditationTrackTranslations.filter((tr) => tr.track_id === currentTrack.id),
        i18n.language,
        'th'
      )
    : undefined

  // Find transcript for current track
  const transcriptRecord = currentTrack
    ? getTranslation(
        mockTranscripts.filter((tr) => tr.track_id === currentTrack.id),
        i18n.language,
        'th'
      )
    : undefined

  // Filter subtitle cues for current track
  const rawSubtitles = currentTrack
    ? mockSubtitles.filter((sub) => sub.track_id === currentTrack.id)
    : []

  // Resolve subtitles for selected language with Thai fallback
  const currentLanguageSubtitles = rawSubtitles.filter((sub) => sub.language_code === i18n.language)
  const fallbackSubtitles = rawSubtitles.filter((sub) => sub.language_code === 'th')
  const activeSubtitles = currentLanguageSubtitles.length > 0 ? currentLanguageSubtitles : fallbackSubtitles

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t('meditation.demoBadge')}
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          {t('meditation.subtitle')}
        </p>
      </section>

      {/* Main Grid: Track List (Left/Top) + Detail & Player (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Track Selection List (4 cols on lg) */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🎧</span>
            <span>{t('meditation.selectTrackTitle')}</span>
          </h2>

          <div className="space-y-3" role="tablist" aria-label={t('meditation.selectTrackTitle')}>
            {publishedTracks.map((track) => {
              const translation = getTranslation(
                mockMeditationTrackTranslations.filter((tr) => tr.track_id === track.id),
                i18n.language,
                'th'
              )
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

        {/* Selected Track Audio Player, Transcript & Subtitles (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Track Detail & Honest Disabled Player */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                {t('meditation.duration')}: {Math.round((currentTrack?.duration_seconds || 300) / 60)} {t('meditation.minutes')} ({currentTrack?.duration_seconds}s)
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

            {/* Audio Player Box (Honest Disabled State) */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  {t('meditation.audioPlayerTitle')}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60">
                  {t('meditation.audioStatusUnavailable')}
                </span>
              </div>

              {/* Disabled Control Bar */}
              <div className="flex items-center gap-4 bg-white p-3.5 rounded-lg border border-slate-200 opacity-75">
                <button
                  type="button"
                  disabled
                  aria-label={t('meditation.audioStatusUnavailable')}
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

              {/* Honest Notice Explanation */}
              <p className="text-xs text-slate-500 italic leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200/50 text-amber-900">
                ℹ️ {t('meditation.audioUnavailableNotice')}
              </p>
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

            {activeSubtitles.length > 0 ? (
              <div className="space-y-3">
                {activeSubtitles.map((cue) => (
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
                <p className="text-xs text-slate-500 italic pt-1">
                  {t('meditation.subtitleNotice')}
                </p>
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

            {transcriptRecord ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {transcriptRecord.content}
                </p>
                {transcriptRecord.is_placeholder && (
                  <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                    Demo Placeholder Transcript
                  </span>
                )}
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

      {/* Footer Disclaimer Notice */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 italic">
          * {t('meditation.placeholderDisclaimer')}
        </p>
      </div>
    </div>
  )
}
