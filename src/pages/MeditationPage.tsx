import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { MeditationPlayer } from '../components/MeditationPlayer'
import { MeditationBeginnerGuide } from '../components/MeditationBeginnerGuide'
import { GuideIcon } from '../components/GuideIcon'

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
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const currentLang = isEnglish ? 'en' : 'th'
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTrackId = searchParams.get('trackId')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTracks, setTracks] = useState<TrackRow[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [isFullTranscriptOpen, setIsFullTranscriptOpen] = useState(false)

  const tracks = allTracks.filter(track =>
    track.meditation_track_translations.some(translation => translation.language_code === currentLang)
  )

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
  const trackTranslation = currentTrack?.meditation_track_translations.find(
    translation => translation.language_code === currentLang
  )

  // Check saved state in localStorage
  useEffect(() => {
    if (selectedTrackId) {
      try {
        const savedTracks = JSON.parse(localStorage.getItem('monkchat_saved_tracks') || '[]')
        setIsSaved(savedTracks.includes(selectedTrackId))
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [selectedTrackId])

  const handleToggleSave = () => {
    if (!selectedTrackId) return
    try {
      const savedTracks: string[] = JSON.parse(localStorage.getItem('monkchat_saved_tracks') || '[]')
      let updated: string[]
      if (savedTracks.includes(selectedTrackId)) {
        updated = savedTracks.filter(id => id !== selectedTrackId)
        setIsSaved(false)
        setShareFeedback(isEnglish ? 'Removed from saved' : 'ลบออกจากรายการบันทึกแล้ว')
      } else {
        updated = [...savedTracks, selectedTrackId]
        setIsSaved(true)
        setShareFeedback(isEnglish ? 'Saved to your favorites' : 'บันทึกในรายการโปรดแล้ว')
      }
      localStorage.setItem('monkchat_saved_tracks', JSON.stringify(updated))
      setTimeout(() => setShareFeedback(null), 2500)
    } catch {
      // Ignore
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: trackTranslation?.title || 'MonkChat Guided Meditation',
          text: trackTranslation?.description || 'Guided meditation with monks in Ayutthaya',
          url,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareFeedback(isEnglish ? 'Link copied to clipboard' : 'คัดลอกลิงก์เรียบร้อยแล้ว')
      setTimeout(() => setShareFeedback(null), 2500)
    } catch {
      setShareFeedback(url)
    }
  }

  return (
    <div className="space-y-6 bg-brand-cream pb-8 text-brand-text break-words [overflow-wrap:anywhere]">
      <header>
        <h1 className="font-serif text-[1.75rem] font-semibold leading-snug text-brand-maroon sm:text-4xl">{isEnglish ? 'Dhammakaya meditation' : 'นั่งสมาธิแบบธรรมกาย'}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">{isEnglish ? 'Get ready, then listen to the monk.' : 'ดูภาพก่อนเริ่ม แล้วฟังพระนำสมาธิ'}</p>
      </header>
      <MeditationBeginnerGuide />

      {/* 2. AUDIO PLAYER SECTION (STEP 2) */}
      <div id="meditation-audio" className="scroll-mt-24 space-y-5">
        <div className="flex items-center gap-2.5">

          <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
            {isEnglish ? 'Meditation audio' : 'ฟังเสียงสมาธิ'}
          </h2>
        </div>

        {isLoading && (
          <div role="status" aria-label={t('meditation.loadingAudio')} className="flex min-h-64 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-terracotta/20 border-t-brand-terracotta" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-900">{t('meditation.errorTitle')}</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void fetchTracks()}
              className="mt-3 min-h-11 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white"
            >
              {t('meditation.retry')}
            </button>
          </div>
        )}

        {!isLoading && !error && tracks.length === 0 && (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-brand-maroon">{t('meditation.emptyTitle')}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">{t('meditation.emptyDesc')}</p>
          </div>
        )}

        {!isLoading && !error && currentTrack && trackTranslation && (
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Main Featured Player Card */}
            <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
              {/* Header with Lotus Thumbnail, Title, and Save/Share actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-brand-gold-soft sm:block">
                    <img
                      src="/images/home/monkchat-meditation-hero.webp"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-brand-terracotta">
                      {currentTrack.is_recommended ? t('meditation.recommended') : (isEnglish ? 'Guided meditation' : 'เสียงนำสมาธิ')}
                    </span>
                    <h3 className="mt-1 font-sans text-xl font-medium text-brand-maroon sm:text-2xl">
                      {trackTranslation.title}
                    </h3>
                    {trackTranslation.description && (
                      <p className="mt-1 text-sm text-brand-muted sm:text-sm">
                        {trackTranslation.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-brand-muted">
                      <span className="inline-flex items-center gap-2 text-brand-muted">
                        <GuideIcon name="clock" /> {Math.max(1, Math.round(currentTrack.duration_seconds / 60))} {t('meditation.minutes')}
                      </span>
                      <span className="inline-flex items-center gap-2 text-brand-muted">
                        <GuideIcon name="globe" /> {t('meditation.audioLanguage')}: {currentTrack.source_language_code.toUpperCase()}
                      </span>
                      {currentTrack.speaker_name && (
                        <span className="inline-flex items-center gap-2 text-brand-muted">
                          <GuideIcon name="user" /> {currentTrack.speaker_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save and Share Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    aria-label={isSaved ? 'Saved to favorites' : 'Save meditation'}
                    aria-pressed={isSaved}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                      isSaved
                        ? 'border-brand-terracotta bg-brand-terracotta text-white'
                        : 'border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'
                    }`}
                  >
                    <GuideIcon name="bookmark" />
                    <span>{isEnglish ? 'Save' : 'บันทึก'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share meditation link"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft cursor-pointer"
                  >
                    <GuideIcon name="share" />
                    <span>{isEnglish ? 'Share' : 'แชร์'}</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback for Save/Share */}
              {shareFeedback && (
                <div role="status" className="mt-3 rounded-lg bg-brand-gold-soft p-2 text-center text-sm font-semibold text-brand-terracotta border border-brand-border">
                  {shareFeedback}
                </div>
              )}

              {/* Player and Synchronized Captions */}
              <div className="mt-6 border-t border-brand-border/80 pt-5">
                <MeditationPlayer
                  key={JSON.stringify([currentTrack.id, currentLang, currentTrack.audio_storage_path, trackTranslation.subtitle_vtt_storage_path])}
                  trackId={currentTrack.id}
                  title={trackTranslation.title}
                  audioPath={currentTrack.audio_storage_path}
                  subtitlePath={trackTranslation.subtitle_vtt_storage_path}
                  tone="light"
                />
              </div>
            </section>

            {/* Track Switcher Sidebar */}
            <section className="rounded-2xl border border-brand-border bg-brand-surface p-5">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="font-sans text-base font-medium text-brand-maroon">
                  {t('meditation.selectTrackTitle')}
                </h3>
                <span className="text-sm text-brand-muted">
                  {tracks.length} {t('qa.itemCount', { count: tracks.length })}
                </span>
              </div>
              <div className="divide-y divide-brand-border/60" role="group" aria-label={t('meditation.selectTrackTitle')}>
                {tracks.map((track, index) => {
                  const translation = track.meditation_track_translations.find(item => item.language_code === currentLang)
                  const isSelected = track.id === selectedTrackId
                  return (
                    <button
                      key={track.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSearchParams({ trackId: track.id })}
                      className={`grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 text-left transition-colors duration-150 cursor-pointer ${
                        isSelected ? 'text-brand-terracotta' : 'text-brand-text hover:text-brand-terracotta'
                      }`}
                    >
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-medium ${
                        isSelected ? 'bg-brand-terracotta text-white' : 'bg-brand-gold-soft text-brand-maroon'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-sm font-medium leading-6">
                          {translation?.title || t('meditation.untitledTrack')}
                        </strong>
                        <small className="block text-xs text-brand-muted">
                          {Math.max(1, Math.round(track.duration_seconds / 60))} {t('meditation.minutes')}
                        </small>
                      </span>
                      <span className="text-sm font-medium text-brand-border-dark">›</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 4. STEP 3: TRANSCRIPT SECTION */}
      {!isLoading && !error && currentTrack && trackTranslation && (
        <section
          id="meditation-transcript"
          className="scroll-mt-24 space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6"
        >
          <div className="flex items-center gap-2.5">

            <h2 className="font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl">
              {t('meditation.transcriptTitle')}
            </h2>
          </div>

          {/* Excerpt Card as shown in mockup */}
          <div className="rounded-xl border border-brand-border bg-brand-gold-soft/60 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isEnglish ? 'Meditation Transcript (Excerpt)' : 'ข้อความถอดเสียงนำสมาธิ (สังเขป)'}</span>
            </div>

            <blockquote className="mt-3 border-l-3 border-brand-terracotta pl-4 text-sm leading-6 text-brand-muted sm:text-sm">
              {trackTranslation.transcript
                ? <>&ldquo;{trackTranslation.transcript.slice(0, 240)}{trackTranslation.transcript.length > 240 ? '…' : ''}&rdquo;</>
                : t('meditation.noTranscript')}
            </blockquote>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border/80 pt-3">
              <span className="text-sm font-semibold text-brand-maroon">
                {trackTranslation.title}
              </span>
              <button
                type="button"
                onClick={() => setIsFullTranscriptOpen(!isFullTranscriptOpen)}
                aria-expanded={isFullTranscriptOpen}
                aria-controls="full-meditation-transcript"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-terracotta hover:underline cursor-pointer"
              >
                <span>{isFullTranscriptOpen ? (isEnglish ? 'Hide Full Transcript' : 'ซ่อนข้อความเต็ม') : (isEnglish ? 'View Full Transcript →' : 'ดูข้อความถอดเสียงเต็ม →')}</span>
              </button>
            </div>
          </div>

          {/* Full Transcript Expandable Section */}
          {isFullTranscriptOpen && (
            <div id="full-meditation-transcript" className="mt-4 rounded-xl border border-brand-border bg-brand-cream p-5">
              <h3 className="font-sans text-sm font-medium text-brand-maroon">
                {trackTranslation.title}
              </h3>
              {trackTranslation.transcript ? (
                <p className="mt-3 whitespace-pre-wrap border-l-3 border-brand-terracotta pl-4 text-sm leading-6 text-brand-text sm:text-sm">
                  {trackTranslation.transcript}
                </p>
              ) : (
                <p className="mt-3 text-sm text-brand-muted">{t('meditation.noTranscript')}</p>
              )}
            </div>
          )}

        </section>
      )}
    </div>
  )
}
