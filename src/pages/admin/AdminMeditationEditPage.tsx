import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface TrackData {
  id: string
  duration_seconds: number
  audio_storage_path: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  created_at: string
  updated_at: string
}

interface TranslationData {
  id?: string
  track_id: string
  language_code: string
  title: string
  description: string
}

export function AdminMeditationEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { trackId } = useParams<{ trackId: string }>()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [trackData, setTrackData] = useState<TrackData | null>(null)

  const [thTitle, setThTitle] = useState('')
  const [thDesc, setThDesc] = useState('')
  const [enTitle, setEnTitle] = useState('')
  const [enDesc, setEnDesc] = useState('')
  const [initialEnTitle, setInitialEnTitle] = useState('')
  const [hadEnTranslation, setHadEnTranslation] = useState(false)

  const [minutes, setMinutes] = useState('0')
  const [seconds, setSeconds] = useState('0')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Load Track & Translations ─────────────────────────────────────────────

  const fetchTrackDetails = useCallback(async () => {
    if (!trackId) {
      setLoadError(t('admin.meditation.edit.notFoundTitle'))
      setIsLoading(false)
      return
    }

    if (!supabaseClient) {
      setLoadError(t('admin.meditation.edit.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      // 1. Fetch core track row
      const { data: trackRow, error: trackErr } = await supabaseClient
        .from('meditation_tracks')
        .select('id, duration_seconds, audio_storage_path, content_status, is_published, created_at, updated_at')
        .eq('id', trackId)
        .single()

      if (trackErr || !trackRow) {
        setLoadError(trackErr?.message || t('admin.meditation.edit.notFoundTitle'))
        setIsLoading(false)
        return
      }

      setTrackData(trackRow as TrackData)
      setMinutes(Math.floor(trackRow.duration_seconds / 60).toString())
      setSeconds((trackRow.duration_seconds % 60).toString())

      // 2. Fetch translations belonging ONLY to this track
      const { data: transRows, error: transErr } = await supabaseClient
        .from('meditation_track_translations')
        .select('id, track_id, language_code, title, description')
        .eq('track_id', trackId)
        .in('language_code', ['th', 'en'])

      if (transErr) {
        setLoadError(transErr.message)
        setIsLoading(false)
        return
      }

      const translations = (transRows as TranslationData[]) || []
      const thTrans = translations.find((tr) => tr.language_code === 'th')
      const enTrans = translations.find((tr) => tr.language_code === 'en')

      setThTitle(thTrans?.title || '')
      setThDesc(thTrans?.description || '')

      if (enTrans) {
        setEnTitle(enTrans.title || '')
        setInitialEnTitle(enTrans.title || '')
        setEnDesc(enTrans.description || '')
        setHadEnTranslation(true)
      } else {
        setEnTitle('')
        setInitialEnTitle('')
        setEnDesc('')
        setHadEnTranslation(false)
      }

      setIsLoading(false)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('admin.meditation.edit.errorGeneric'))
      setIsLoading(false)
    }
  }, [trackId, t])

  useEffect(() => {
    fetchTrackDetails()
  }, [fetchTrackDetails])

  // ── Submit Edit ───────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !trackData || !trackId) return

    setFormError(null)

    const trimmedThTitle = thTitle.trim()
    const trimmedThDesc = thDesc.trim()
    const trimmedEnTitle = enTitle.trim()
    const trimmedEnDesc = enDesc.trim()

    // Validation 1: Thai title is required
    if (!trimmedThTitle) {
      setFormError(t('admin.meditation.edit.errorThTitleRequired'))
      return
    }

    // Validation 2: Duration parsing
    const mins = parseInt(minutes, 10)
    const secs = parseInt(seconds, 10)

    if (isNaN(mins) || mins < 0) {
      setFormError(t('admin.meditation.edit.errorInvalidMinutes'))
      return
    }

    if (isNaN(secs) || secs < 0 || secs > 59) {
      setFormError(t('admin.meditation.edit.errorInvalidSeconds'))
      return
    }

    const totalSeconds = mins * 60 + secs
    if (totalSeconds <= 0) {
      setFormError(t('admin.meditation.edit.errorZeroDuration'))
      return
    }

    if (!user) {
      setFormError(t('admin.meditation.edit.errorNoUser'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.meditation.edit.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      const originalDuration = trackData.duration_seconds

      // Step 1: Update Core Track Row (duration_seconds, updated_by)
      const { error: coreUpdateErr } = await supabaseClient
        .from('meditation_tracks')
        .update({
          duration_seconds: totalSeconds,
          updated_by: user.id,
        })
        .eq('id', trackId)

      if (coreUpdateErr) {
        setFormError(coreUpdateErr.message)
        setIsSubmitting(false)
        return
      }

      // Step 2: Prepare Translation Rows to Upsert
      const translationsToUpsert = [
        {
          track_id: trackId,
          language_code: 'th',
          title: trimmedThTitle,
          description: trimmedThDesc,
        },
      ]

      let enTitleToUse = trimmedEnTitle
      if (hadEnTranslation && !enTitleToUse) {
        enTitleToUse = initialEnTitle // preserve existing English title if cleared
      }

      if (enTitleToUse) {
        translationsToUpsert.push({
          track_id: trackId,
          language_code: 'en',
          title: enTitleToUse,
          description: trimmedEnDesc,
        })
      }

      // Step 3: Upsert Translations
      const { error: transUpsertErr } = await supabaseClient
        .from('meditation_track_translations')
        .upsert(translationsToUpsert, { onConflict: 'track_id, language_code' })

      if (transUpsertErr) {
        // Attempt rollback of core duration back to originalDuration
        const { error: rollbackErr } = await supabaseClient
          .from('meditation_tracks')
          .update({
            duration_seconds: originalDuration,
            updated_by: user.id,
          })
          .eq('id', trackId)

        if (rollbackErr) {
          setFormError(
            t('admin.meditation.edit.errorPartialSaveUnrolled', { error: transUpsertErr.message })
          )
        } else {
          setFormError(
            t('admin.meditation.edit.errorPartialSaveRolledBack', { error: transUpsertErr.message })
          )
        }
        setIsSubmitting(false)
        return
      }

      // Step 4: Success - Navigate back to track list
      navigate('/admin/meditation', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.edit.errorGeneric')
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
          {t('admin.meditation.edit.notFoundTitle')}
        </h1>
        <p className="text-sm text-slate-500">
          {loadError || t('admin.meditation.edit.notFoundDesc')}
        </p>
        <Link
          to="/admin/meditation"
          className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          {t('admin.meditation.edit.backToList')}
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
            {t('admin.meditation.edit.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.meditation.edit.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/meditation"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {t('admin.meditation.edit.cancel')}
        </Link>
      </div>

      {/* Read-Only Status Banner */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
        <p className="font-semibold text-slate-800 text-sm">
          ℹ️ {t('admin.meditation.edit.readOnlySection')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <span className="text-slate-400 block">{t('admin.meditation.edit.fieldStatus')}</span>
            <span className="font-medium text-slate-700">
              {t(`admin.meditation.status.${trackData.content_status}`, trackData.content_status)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{t('admin.meditation.edit.fieldPublish')}</span>
            <span className="font-medium text-slate-700">
              {trackData.is_published ? t('admin.meditation.published') : t('admin.meditation.unpublished')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">{t('admin.meditation.edit.fieldAudio')}</span>
            <span className={trackData.audio_storage_path ? 'font-medium text-emerald-600' : 'font-medium text-amber-600'}>
              {trackData.audio_storage_path ? `✓ ${t('admin.meditation.audioExists')}` : `⚠ ${t('admin.meditation.audioMissing')}`}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.meditation.edit.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Thai Section */}
        <div className="space-y-4 pt-2 border-b border-slate-100 pb-6">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t('admin.meditation.edit.sectionThai')}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.edit.fieldThTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={thTitle}
              onChange={(e) => setThTitle(e.target.value)}
              placeholder={t('admin.meditation.new.placeholderThTitle')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.edit.fieldThDesc')}
            </label>
            <textarea
              rows={3}
              value={thDesc}
              onChange={(e) => setThDesc(e.target.value)}
              placeholder={t('admin.meditation.new.placeholderThDesc')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* English Section */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            {t('admin.meditation.edit.sectionEnglish')}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.edit.fieldEnTitle')}
            </label>
            <input
              type="text"
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder={t('admin.meditation.new.placeholderEnTitle')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {hadEnTranslation && !enTitle.trim() && (
              <p className="text-xs text-amber-700 mt-1 italic">
                ℹ️ {t('admin.meditation.edit.enPreserveNotice')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.edit.fieldEnDesc')}
            </label>
            <textarea
              rows={3}
              value={enDesc}
              onChange={(e) => setEnDesc(e.target.value)}
              placeholder={t('admin.meditation.new.placeholderEnDesc')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Duration Section */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h2 className="text-base font-semibold text-slate-900">
            {t('admin.meditation.edit.sectionDuration')} <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('admin.meditation.edit.fieldMinutes')}
              </label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('admin.meditation.edit.fieldSeconds')}
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/admin/meditation"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('admin.meditation.edit.cancel')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.meditation.edit.saving')
              : t('admin.meditation.edit.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
