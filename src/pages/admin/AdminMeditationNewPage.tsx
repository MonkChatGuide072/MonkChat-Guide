import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

export function AdminMeditationNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [thTitle, setThTitle] = useState('')
  const [thDesc, setThDesc] = useState('')
  const [enTitle, setEnTitle] = useState('')
  const [enDesc, setEnDesc] = useState('')
  const [minutes, setMinutes] = useState('5')
  const [seconds, setSeconds] = useState('0')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setFormError(null)

    const trimmedThTitle = thTitle.trim()
    const trimmedThDesc = thDesc.trim()
    const trimmedEnTitle = enTitle.trim()
    const trimmedEnDesc = enDesc.trim()

    // Validation 1: Thai title is required
    if (!trimmedThTitle) {
      setFormError(t('admin.meditation.new.errorThTitleRequired'))
      return
    }

    // Validation 2: Duration parsing
    const mins = parseInt(minutes, 10)
    const secs = parseInt(seconds, 10)

    if (isNaN(mins) || mins < 0) {
      setFormError(t('admin.meditation.new.errorInvalidMinutes'))
      return
    }

    if (isNaN(secs) || secs < 0 || secs > 59) {
      setFormError(t('admin.meditation.new.errorInvalidSeconds'))
      return
    }

    const totalSeconds = mins * 60 + secs
    if (totalSeconds <= 0) {
      setFormError(t('admin.meditation.new.errorZeroDuration'))
      return
    }

    if (!user) {
      setFormError(t('admin.meditation.new.errorNoUser'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.meditation.new.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Insert Core Track Row
      const { data: trackRow, error: trackErr } = await supabaseClient
        .from('meditation_tracks')
        .insert({
          source_language_code: 'th',
          duration_seconds: totalSeconds,
          audio_storage_path: null,
          content_status: 'draft',
          is_published: false,
          created_by: user.id,
          updated_by: user.id,
        })
        .select('id')
        .single()

      if (trackErr || !trackRow) {
        setFormError(trackErr?.message || t('admin.meditation.new.errorCoreInsert'))
        setIsSubmitting(false)
        return
      }

      // Step 2: Prepare Translation Rows
      const translationsToInsert = [
        {
          track_id: trackRow.id,
          language_code: 'th',
          title: trimmedThTitle,
          description: trimmedThDesc,
        },
      ]

      if (trimmedEnTitle) {
        translationsToInsert.push({
          track_id: trackRow.id,
          language_code: 'en',
          title: trimmedEnTitle,
          description: trimmedEnDesc,
        })
      }

      // Step 3: Insert Translations
      const { error: transErr } = await supabaseClient
        .from('meditation_track_translations')
        .insert(translationsToInsert)

      if (transErr) {
        // Partial-save safety: mark the core track as archived to avoid orphaned active draft
        await supabaseClient
          .from('meditation_tracks')
          .update({
            content_status: 'archived',
            archived_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', trackRow.id)

        setFormError(
          t('admin.meditation.new.errorPartialSave', { error: transErr.message })
        )
        setIsSubmitting(false)
        return
      }

      // Step 4: Success - Navigate back to track list
      navigate('/admin/meditation', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.new.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.meditation.new.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.meditation.new.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/meditation"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {t('admin.meditation.new.cancel')}
        </Link>
      </div>

      {/* Workflow notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200/80 p-4 text-sm text-amber-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5">
          <span>ℹ️</span> {t('admin.meditation.new.noticeTitle')}
        </p>
        <p className="text-xs text-amber-700">
          {t('admin.meditation.new.noticeDesc')}
        </p>
      </div>

      {/* Error alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.meditation.new.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono">{formError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Thai Section */}
        <div className="space-y-4 pt-2 border-b border-slate-100 pb-6">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t('admin.meditation.new.sectionThai')}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.new.fieldThTitle')} <span className="text-red-500">*</span>
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
              {t('admin.meditation.new.fieldThDesc')}
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
            {t('admin.meditation.new.sectionEnglish')}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.new.fieldEnTitle')}
            </label>
            <input
              type="text"
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder={t('admin.meditation.new.placeholderEnTitle')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('admin.meditation.new.fieldEnDesc')}
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
            {t('admin.meditation.new.sectionDuration')} <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('admin.meditation.new.fieldMinutes')}
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
                {t('admin.meditation.new.fieldSeconds')}
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
            {t('admin.meditation.new.cancel')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.meditation.new.saving')
              : t('admin.meditation.new.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
