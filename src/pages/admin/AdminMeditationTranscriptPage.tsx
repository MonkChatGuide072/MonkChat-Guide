import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../../lib/supabase'

interface TrackData {
  id: string
  duration_seconds: number
  audio_storage_path: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  title: string
}

interface TranslationRow {
  id?: string
  track_id: string
  language_code: string
  title: string
  description: string
  transcript: string | null
  subtitle_vtt_storage_path?: string | null
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AdminMeditationTranscriptPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { trackId } = useParams<{ trackId: string }>()

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [trackData, setTrackData] = useState<TrackData | null>(null)

  const [thTrans, setThTrans] = useState<TranslationRow | null>(null)
  const [enTrans, setEnTrans] = useState<TranslationRow | null>(null)

  const [thTranscript, setThTranscript] = useState('')
  const [enTranscript, setEnTranscript] = useState('')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Fetch Track & Translation Details ────────────────────────────────────

  const fetchTrackDetails = useCallback(async () => {
    if (!trackId) {
      setLoadError(t('admin.meditation.transcript.notFoundTitle'))
      setIsLoading(false)
      return
    }

    if (!supabaseClient) {
      setLoadError(t('admin.meditation.transcript.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      // 1. Fetch core track row
      const { data: trackRow, error: trackErr } = await supabaseClient
        .from('meditation_tracks')
        .select(`
          id,
          duration_seconds,
          audio_storage_path,
          content_status,
          is_published,
          meditation_track_translations (
            id,
            track_id,
            language_code,
            title,
            description,
            transcript,
            subtitle_vtt_storage_path
          )
        `)
        .eq('id', trackId)
        .single()

      if (trackErr || !trackRow) {
        setLoadError(trackErr?.message || t('admin.meditation.transcript.notFoundTitle'))
        setIsLoading(false)
        return
      }

      const translations = (trackRow.meditation_track_translations as TranslationRow[]) || []
      const preferred = translations.find((tr) => tr.language_code === currentLang)
      const fallback = translations.find((tr) => tr.language_code === 'th')
      const resolvedTitle = preferred?.title || fallback?.title || translations[0]?.title || '—'

      const thaiRow = translations.find((tr) => tr.language_code === 'th') || null
      const englishRow = translations.find((tr) => tr.language_code === 'en') || null

      setTrackData({
        id: trackRow.id,
        duration_seconds: trackRow.duration_seconds,
        audio_storage_path: trackRow.audio_storage_path,
        content_status: trackRow.content_status as 'draft' | 'published' | 'archived',
        is_published: trackRow.is_published,
        title: resolvedTitle,
      })

      setThTrans(thaiRow)
      setEnTrans(englishRow)

      setThTranscript(thaiRow?.transcript || '')
      setEnTranscript(englishRow?.transcript || '')

      setIsLoading(false)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('admin.meditation.transcript.errorGeneric'))
      setIsLoading(false)
    }
  }, [trackId, currentLang, t])

  useEffect(() => {
    fetchTrackDetails()
  }, [fetchTrackDetails])

  // ── Save Transcripts ───────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !trackData || !trackId) return

    setFormError(null)

    // Guard: Thai translation row must already exist
    if (!thTrans) {
      setFormError(t('admin.meditation.transcript.errorMissingThaiRow'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.meditation.transcript.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      const trimmedTh = thTranscript.trim()
      const trimmedEn = enTranscript.trim()

      // Build rowsToUpsert using ONLY rows that already exist in the database.
      // Never create a new translation row with an invented title.
      const rowsToUpsert: TranslationRow[] = []

      // 1. Thai row — always included (existence already verified above)
      rowsToUpsert.push({
        track_id: trackId,
        language_code: 'th',
        title: thTrans.title,
        description: thTrans.description,
        transcript: trimmedTh || null,
        subtitle_vtt_storage_path: thTrans.subtitle_vtt_storage_path ?? null,
      })

      // 2. English row — only included when the row already exists
      if (enTrans) {
        rowsToUpsert.push({
          track_id: trackId,
          language_code: 'en',
          title: enTrans.title,
          description: enTrans.description,
          transcript: trimmedEn || null,
          subtitle_vtt_storage_path: enTrans.subtitle_vtt_storage_path ?? null,
        })
      }

      // Single atomic batch upsert
      const { error: upsertErr } = await supabaseClient
        .from('meditation_track_translations')
        .upsert(rowsToUpsert, { onConflict: 'track_id, language_code' })

      if (upsertErr) {
        setFormError(upsertErr.message)
        setIsSubmitting(false)
        return
      }

      // Success - Navigate back to track list
      navigate('/admin/meditation', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.transcript.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  // ── Render States ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (loadError || !trackData) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl text-red-600">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {t('admin.meditation.transcript.notFoundTitle')}
        </h1>
        <p className="text-sm text-slate-500">
          {loadError || t('admin.meditation.transcript.notFoundDesc')}
        </p>
        <Link
          to="/admin/meditation"
          className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          {t('admin.meditation.transcript.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.meditation.transcript.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.meditation.transcript.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/meditation"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {t('admin.meditation.transcript.cancel')}
        </Link>
      </div>

      {/* Target Track Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {t('admin.meditation.colTitle')}
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {trackData.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('admin.meditation.duration')}: {formatDuration(trackData.duration_seconds)}
          </p>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">{t('admin.meditation.audio.currentAudioStatus')}</span>
            <span className={trackData.audio_storage_path ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
              {trackData.audio_storage_path
                ? `✓ ${t('admin.meditation.audio.audioExists')}`
                : `⚠ ${t('admin.meditation.audio.audioMissing')}`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">{t('admin.meditation.edit.fieldStatus')}</span>
            <span className="font-semibold text-slate-700">
              {t(`admin.meditation.status.${trackData.content_status}`, trackData.content_status)}
              {trackData.is_published ? ` (${t('admin.meditation.published')})` : ` (${t('admin.meditation.unpublished')})`}
            </span>
          </div>
        </div>
      </div>

      {/* Draft/Unpublished Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-sm">
          <span>ℹ️</span> {t('admin.meditation.transcript.draftNoticeTitle')}
        </p>
        <p className="text-amber-700">
          {t('admin.meditation.transcript.draftNoticeDesc')}
        </p>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.meditation.transcript.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Transcript Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Thai Section */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t('admin.meditation.transcript.sectionThai')}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.transcript.fieldThTranscript')}
            </label>
            <textarea
              rows={6}
              value={thTranscript}
              onChange={(e) => setThTranscript(e.target.value)}
              placeholder={t('admin.meditation.transcript.placeholderThTranscript')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* English Section */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            {t('admin.meditation.transcript.sectionEnglish')}
          </h2>

          {enTrans ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('admin.meditation.transcript.fieldEnTranscript')}
              </label>
              <textarea
                rows={6}
                value={enTranscript}
                onChange={(e) => setEnTranscript(e.target.value)}
                placeholder={t('admin.meditation.transcript.placeholderEnTranscript')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-sans"
              />
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
              <p className="text-xs font-medium text-slate-500">
                {t('admin.meditation.transcript.enUnavailable')}
              </p>
              <p className="text-xs text-slate-400">
                {t('admin.meditation.transcript.enUnavailableHint')}
              </p>
            </div>
          )}
        </div>

        {/* Subtitle / VTT Section (Disabled - Step 4B) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span>💬</span> {t('admin.meditation.transcript.vttSectionTitle')}
            </h3>
            <button
              type="button"
              disabled
              title={t('admin.meditation.transcript.vttStep4BHint')}
              className="px-3 py-1 text-xs rounded border border-slate-200 text-slate-400 bg-white cursor-not-allowed"
            >
              {t('admin.meditation.transcript.vttButtonLabel')}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {t('admin.meditation.transcript.vttSectionNotice')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/admin/meditation"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('admin.meditation.transcript.cancel')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !thTrans}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.meditation.transcript.saving')
              : t('admin.meditation.transcript.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
