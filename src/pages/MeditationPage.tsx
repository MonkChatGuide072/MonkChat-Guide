import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { MeditationPlayer } from '../components/MeditationPlayer'
import { VisitorBackLink } from '../components/VisitorBackLink'
import { MeditationBeginnerGuide } from '../components/MeditationBeginnerGuide'
import { MeditationSupplementary } from '../components/MeditationSupplementary'

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
        setShareFeedback(isEnglish ? 'Saved to your favorites!' : 'บันทึกในรายการโปรดแล้ว!')
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
      setShareFeedback(isEnglish ? 'Link copied to clipboard!' : 'คัดลอกลิงก์เรียบร้อยแล้ว!')
      setTimeout(() => setShareFeedback(null), 2500)
    } catch {
      setShareFeedback(url)
    }
  }

  return (
    <div className="space-y-10 break-words [overflow-wrap:anywhere]">
      {/* 1. HERO BANNER */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#EADCC6] bg-[#FFF8EE] shadow-[0_16px_40px_rgba(104,27,22,0.12)]">
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/home/monkchat-meditation-hero.webp"
            alt="Monk in meditation"
            className="h-full w-full object-cover object-[center_30%] opacity-100"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,248,238,0.96)_0%,rgba(255,248,238,0.84)_50%,rgba(255,248,238,0.3)_100%)]"
        />

        <div className="relative z-10 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B77A24]/20 text-[#A43D1D] ring-1 ring-[#EFD070]/30">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>

          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#A43D1D]">
            {t('meditation.heroTag')}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#681B16] drop-shadow-sm sm:text-5xl">
            {t('meditation.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#4A3B32] sm:text-lg sm:leading-7">
            {t('meditation.subtitle')}
          </p>

          {/* 3 Value Pills below title */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#681B16] backdrop-blur-xs">
              <span>🧘</span> {isEnglish ? 'Calm Your Mind' : 'สงบใจ'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#681B16] backdrop-blur-xs">
              <span>🪷</span> {isEnglish ? 'Build Awareness' : 'สร้างสติรู้ตัว'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#681B16] backdrop-blur-xs">
              <span>🏛️</span> {isEnglish ? 'Find Inner Peace' : 'ค้นพบความสงบภายใน'}
            </span>
          </div>

          {/* Back link & Navigation pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-white/15 pt-5">
            <VisitorBackLink />
            <nav aria-label={t('meditation.heroTag')} className="flex flex-wrap items-center gap-2">
              <a
                href="#meditation-audio"
                className="rounded-full border border-white/20 bg-[#FFFDF7]/90 px-3.5 py-1 text-xs font-bold text-[#681B16] transition hover:bg-[#FFFDF7]"
              >
                {t('meditation.flowNav.step2')}
              </a>
              <a
                href="#meditation-guide"
                className="rounded-full border border-white/20 bg-[#FFFDF7]/90 px-3.5 py-1 text-xs font-bold text-[#681B16] transition hover:bg-[#FFFDF7]"
              >
                {t('meditation.flowNav.step1')}
              </a>
              <a
                href="#meditation-transcript"
                className="rounded-full border border-white/20 bg-[#FFFDF7]/90 px-3.5 py-1 text-xs font-bold text-[#681B16] transition hover:bg-[#FFFDF7]"
              >
                {t('meditation.flowNav.step3')}
              </a>
              <a
                href="#meditation-supplementary"
                className="rounded-full border border-white/20 bg-[#FFFDF7]/90 px-3.5 py-1 text-xs font-bold text-[#681B16] transition hover:bg-[#FFFDF7]"
              >
                {t('meditation.flowNav.step4')}
              </a>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. AUDIO PLAYER SECTION (STEP 2) */}
      <div id="meditation-audio" className="scroll-mt-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A43D1D] text-xs font-bold text-white shadow-2xs">
            2
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
            {t('meditation.flowNav.step2')}
          </h2>
        </div>

        {isLoading && (
          <div role="status" aria-label={t('meditation.loadingAudio')} className="flex min-h-64 items-center justify-center rounded-2xl border border-[#EADCC6] bg-[#FFFDF7]">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#A43D1D]/20 border-t-[#A43D1D]" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-900">{t('meditation.errorTitle')}</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void fetchTracks()}
              className="mt-3 min-h-10 rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white"
            >
              {t('meditation.retry')}
            </button>
          </div>
        )}

        {!isLoading && !error && tracks.length === 0 && (
          <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center">
            <h2 className="text-lg font-bold text-[#681B16]">{t('meditation.emptyTitle')}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#7D6B5D]">{t('meditation.emptyDesc')}</p>
          </div>
        )}

        {!isLoading && !error && currentTrack && trackTranslation && (
          <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Main Featured Player Card */}
            <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-7">
              {/* Header with Lotus Thumbnail, Title, and Save/Share actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#EADCC6] bg-[#FAF2E6]">
                    <img
                      src="/images/home/monkchat-meditation-hero.webp"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#A43D1D]">
                      {currentTrack.is_recommended ? t('meditation.recommended') : 'GUIDED MEDITATION'}
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-bold text-[#681B16] sm:text-2xl">
                      {trackTranslation.title}
                    </h3>
                    {trackTranslation.description && (
                      <p className="mt-1 text-xs text-[#5A4B40] sm:text-sm">
                        {trackTranslation.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[0.68rem] font-semibold text-[#7D6B5D]">
                      <span className="rounded-md border border-[#EADCC6] bg-[#FDF4E3] px-2.5 py-0.5 text-[#681B16]">
                        ⏱️ {Math.max(1, Math.round(currentTrack.duration_seconds / 60))} {t('meditation.minutes')}
                      </span>
                      <span className="rounded-md border border-[#EADCC6] bg-[#FDF4E3] px-2.5 py-0.5 text-[#681B16]">
                        🌐 {t('meditation.audioLanguage')}: {currentTrack.source_language_code.toUpperCase()}
                      </span>
                      {currentTrack.speaker_name && (
                        <span className="rounded-md border border-[#EADCC6] bg-[#FDF4E3] px-2.5 py-0.5 text-[#681B16]">
                          👤 {currentTrack.speaker_name}
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
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isSaved
                        ? 'border-[#A43D1D] bg-[#A43D1D] text-white'
                        : 'border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] hover:bg-[#FDF4E3]'
                    }`}
                  >
                    <span>{isSaved ? '★' : '☆'}</span>
                    <span>{isEnglish ? 'Save' : 'บันทึก'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share meditation link"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#EADCC6] bg-[#FFFDF7] px-3 py-1.5 text-xs font-bold text-[#681B16] transition hover:bg-[#FDF4E3] cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{isEnglish ? 'Share' : 'แชร์'}</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback for Save/Share */}
              {shareFeedback && (
                <div role="status" className="mt-3 rounded-lg bg-[#FDF4E3] p-2 text-center text-xs font-semibold text-[#A43D1D] border border-[#EADCC6]">
                  {shareFeedback}
                </div>
              )}

              {/* Player and Synchronized Captions */}
              <div className="mt-6 border-t border-[#EADCC6]/80 pt-5">
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
            <section className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EADCC6] pb-3">
                <h3 className="font-serif text-base font-bold text-[#681B16]">
                  {t('meditation.selectTrackTitle')}
                </h3>
                <span className="text-xs text-[#7D6B5D]">
                  {tracks.length} {t('qa.itemCount', { count: tracks.length })}
                </span>
              </div>
              <div className="divide-y divide-[#EADCC6]/60" role="group" aria-label={t('meditation.selectTrackTitle')}>
                {tracks.map((track, index) => {
                  const translation = track.meditation_track_translations.find(item => item.language_code === currentLang)
                  const isSelected = track.id === selectedTrackId
                  return (
                    <button
                      key={track.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSearchParams({ trackId: track.id })}
                      className={`grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 text-left transition cursor-pointer ${
                        isSelected ? 'text-[#A43D1D]' : 'text-[#30251E] hover:text-[#A43D1D]'
                      }`}
                    >
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-[#A43D1D] text-white' : 'bg-[#FDF4E3] text-[#681B16]'
                      }`}>
                        0{index + 1}
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-xs sm:text-sm">
                          {translation?.title || t('meditation.untitledTrack')}
                        </strong>
                        <small className="block text-[0.68rem] text-[#7D6B5D]">
                          {Math.max(1, Math.round(track.duration_seconds / 60))} {t('meditation.minutes')}
                        </small>
                      </span>
                      <span className="text-sm font-bold text-[#D5BD94]">›</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 3. STEP 1: BEGINNER GUIDE & 5 PRACTICE STEPS */}
      <MeditationBeginnerGuide />

      {/* 4. STEP 3: TRANSCRIPT SECTION */}
      {!isLoading && !error && currentTrack && trackTranslation && (
        <section
          id="meditation-transcript"
          className="scroll-mt-8 space-y-4 rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A43D1D] text-xs font-bold text-white shadow-2xs">
              3
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
              {t('meditation.transcriptTitle')}
            </h2>
          </div>

          {/* Excerpt Card as shown in mockup */}
          <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B77A24]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isEnglish ? 'Meditation Transcript (Excerpt)' : 'ข้อความถอดเสียงนำสมาธิ (สังเขป)'}</span>
            </div>

            <blockquote className="mt-3 border-l-3 border-[#A43D1D] pl-4 text-xs italic leading-6 text-[#5A4B40] sm:text-sm">
              {trackTranslation.transcript
                ? <>&ldquo;{trackTranslation.transcript.slice(0, 240)}{trackTranslation.transcript.length > 240 ? '…' : ''}&rdquo;</>
                : t('meditation.noTranscript')}
            </blockquote>

            <div className="mt-4 flex items-center justify-between border-t border-[#EADCC6]/80 pt-3">
              <span className="text-xs font-semibold text-[#681B16]">
                {trackTranslation.title}
              </span>
              <button
                type="button"
                onClick={() => setIsFullTranscriptOpen(!isFullTranscriptOpen)}
                aria-expanded={isFullTranscriptOpen}
                aria-controls="full-meditation-transcript"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A43D1D] hover:underline cursor-pointer"
              >
                <span>{isFullTranscriptOpen ? (isEnglish ? 'Hide Full Transcript' : 'ซ่อนข้อความเต็ม') : (isEnglish ? 'View Full Transcript →' : 'ดูข้อความถอดเสียงเต็ม →')}</span>
              </button>
            </div>
          </div>

          {/* Full Transcript Expandable Section */}
          {isFullTranscriptOpen && (
            <div id="full-meditation-transcript" className="mt-4 rounded-xl border border-[#EADCC6] bg-[#FFF8EE] p-5">
              <h3 className="font-serif text-sm font-bold text-[#681B16]">
                {trackTranslation.title}
              </h3>
              {trackTranslation.transcript ? (
                <p className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap border-l-3 border-[#A43D1D] pl-4 text-xs leading-6 text-[#4A3B32] sm:text-sm">
                  {trackTranslation.transcript}
                </p>
              ) : (
                <p className="mt-3 text-xs text-[#7D6B5D]">{t('meditation.noTranscript')}</p>
              )}
            </div>
          )}

        </section>
      )}

      {/* 5. STEP 4: SUPPLEMENTARY PRACTICE TIPS & SIMPLE MEDITATION WITH MONKS */}
      <MeditationSupplementary />
    </div>
  )
}
