import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react'
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
  title: string
}

const MAX_FILE_SIZE_BYTES = 26214400 // 25 MB
const ALLOWED_MIME_TYPES = new Set(['audio/mpeg', 'audio/mp3', 'audio/x-mp3', ''])

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2)
}

function isValidStoragePath(path: string, trackId: string): boolean {
  if (!path.startsWith(`${trackId}/`)) return false
  if (!path.toLowerCase().endsWith('.mp3')) return false
  if (path.includes('..')) return false
  return true
}

export function AdminMeditationAudioPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { trackId } = useParams<{ trackId: string }>()
  const { user } = useAuth()

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [trackData, setTrackData] = useState<TrackData | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingUploadedPath, setPendingUploadedPath] = useState<string | null>(null)

  // ── Fetch Track Details ────────────────────────────────────────────────────

  const fetchTrackDetails = useCallback(async () => {
    if (!trackId) {
      setLoadError(t('admin.meditation.audio.notFoundTitle'))
      setIsLoading(false)
      return
    }

    if (!supabaseClient) {
      setLoadError(t('admin.meditation.audio.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const { data: trackRow, error: trackErr } = await supabaseClient
        .from('meditation_tracks')
        .select(`
          id,
          duration_seconds,
          audio_storage_path,
          content_status,
          is_published,
          meditation_track_translations (
            language_code,
            title
          )
        `)
        .eq('id', trackId)
        .single()

      if (trackErr || !trackRow) {
        setLoadError(trackErr?.message || t('admin.meditation.audio.notFoundTitle'))
        setIsLoading(false)
        return
      }

      const translations = (trackRow.meditation_track_translations as { language_code: string; title: string }[]) || []
      const preferred = translations.find((tr) => tr.language_code === currentLang)
      const fallback = translations.find((tr) => tr.language_code === 'th')
      const resolvedTitle = preferred?.title || fallback?.title || translations[0]?.title || '—'

      setTrackData({
        id: trackRow.id,
        duration_seconds: trackRow.duration_seconds,
        audio_storage_path: trackRow.audio_storage_path,
        content_status: trackRow.content_status as 'draft' | 'published' | 'archived',
        is_published: trackRow.is_published,
        title: resolvedTitle,
      })

      setIsLoading(false)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('admin.meditation.audio.errorGeneric'))
      setIsLoading(false)
    }
  }, [trackId, currentLang, t])

  useEffect(() => {
    fetchTrackDetails()
  }, [fetchTrackDetails])

  // ── File Input Validation ──────────────────────────────────────────────────

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setFormError(null)
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const nameLower = file.name.toLowerCase()
    const isMp3Extension = nameLower.endsWith('.mp3')
    const isAcceptedMime = ALLOWED_MIME_TYPES.has(file.type)

    if (!isMp3Extension || !isAcceptedMime) {
      setFormError(t('admin.meditation.audio.errorNotMp3'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    if (file.size <= 0) {
      setFormError(t('admin.meditation.audio.errorEmptyFile'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormError(t('admin.meditation.audio.errorTooLarge'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  // ── Retry DB Save Only ─────────────────────────────────────────────────────

  const handleRetryDbSave = async () => {
    if (!pendingUploadedPath || !trackId || !user || !supabaseClient || isSubmitting) return

    setIsSubmitting(true)
    setFormError(null)

    try {
      const { error: dbErr } = await supabaseClient
        .from('meditation_tracks')
        .update({
          audio_storage_path: pendingUploadedPath,
          updated_by: user.id,
        })
        .eq('id', trackId)

      if (dbErr) {
        setFormError(t('admin.meditation.audio.errorUploadDbFailed', { error: dbErr.message }))
        setIsSubmitting(false)
        return
      }

      // Success
      setPendingUploadedPath(null)
      navigate('/admin/meditation', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.audio.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  // ── Upload Handler ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !trackData || !trackId) return

    setFormError(null)

    if (!selectedFile) {
      setFormError(t('admin.meditation.audio.errorNoFile'))
      return
    }

    const isReplacement = Boolean(trackData.audio_storage_path)

    if (isReplacement) {
      if (!confirmReplace) {
        setFormError(t('admin.meditation.audio.errorRequireConfirmReplace'))
        return
      }

      // Existing Storage path security validation
      if (!isValidStoragePath(trackData.audio_storage_path!, trackId)) {
        setFormError(t('admin.meditation.audio.errorInvalidStoragePath'))
        return
      }
    }

    if (!user) {
      setFormError(t('admin.meditation.audio.errorNoUser'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.meditation.audio.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      // Deterministic safe storage path: <trackId>/audio.mp3
      const targetPath = trackData.audio_storage_path || `${trackId}/audio.mp3`

      // Step 1: Storage Upload (audio/mpeg)
      const { error: uploadErr } = await supabaseClient.storage
        .from('meditation-audio')
        .upload(targetPath, selectedFile, {
          contentType: 'audio/mpeg',
          upsert: isReplacement,
        })

      if (uploadErr) {
        setFormError(uploadErr.message)
        setIsSubmitting(false)
        return
      }

      // Mark file as uploaded in storage
      setPendingUploadedPath(targetPath)

      // Step 2: Database Metadata Update (audio_storage_path, updated_by)
      const { error: dbErr } = await supabaseClient
        .from('meditation_tracks')
        .update({
          audio_storage_path: targetPath,
          updated_by: user.id,
        })
        .eq('id', trackId)

      if (dbErr) {
        setFormError(
          isReplacement
            ? t('admin.meditation.audio.errorReplaceDbFailed', { error: dbErr.message })
            : t('admin.meditation.audio.errorUploadDbFailed', { error: dbErr.message })
        )
        setIsSubmitting(false)
        return
      }

      // Step 3: Success - Navigate back to track list
      setPendingUploadedPath(null)
      navigate('/admin/meditation', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.audio.errorGeneric')
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
          {t('admin.meditation.audio.notFoundTitle')}
        </h1>
        <p className="text-sm text-slate-500">
          {loadError || t('admin.meditation.audio.notFoundDesc')}
        </p>
        <Link
          to="/admin/meditation"
          className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          {t('admin.meditation.audio.backToList')}
        </Link>
      </div>
    )
  }

  const isReplacement = Boolean(trackData.audio_storage_path)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.meditation.audio.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.meditation.audio.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/meditation"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          {t('admin.meditation.audio.cancel')}
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

        {/* Current Audio Status */}
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

        {trackData.audio_storage_path && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono break-all text-slate-600">
            <span className="font-sans text-slate-400 font-medium block mb-1">
              {t('admin.meditation.audio.storagePath')}
            </span>
            {trackData.audio_storage_path}
          </div>
        )}
      </div>

      {/* Replacement Warning (if audio already exists) */}
      {isReplacement && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-2 text-xs text-amber-800">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            <span>⚠️</span> {t('admin.meditation.audio.replaceNoticeTitle')}
          </p>
          <p className="text-amber-700">
            {t('admin.meditation.audio.replaceNoticeDesc')}
          </p>
          <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-amber-900">
            <input
              type="checkbox"
              checked={confirmReplace}
              onChange={(e) => setConfirmReplace(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 border-amber-300 focus:ring-amber-500"
            />
            {t('admin.meditation.audio.confirmReplaceCheckbox')}
          </label>
        </div>
      )}

      {/* Pending Upload Retry Banner */}
      {pendingUploadedPath && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2 text-xs text-amber-900">
          <p className="font-semibold text-sm">
            ℹ️ {t('admin.meditation.audio.pendingUploadNotice')}
          </p>
          <p className="font-mono text-xs text-amber-800 break-all">
            {pendingUploadedPath}
          </p>
          <button
            type="button"
            onClick={handleRetryDbSave}
            disabled={isSubmitting}
            className="mt-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {t('admin.meditation.audio.retryDbSaveButton')}
          </button>
        </div>
      )}

      {/* Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-2">
          <p className="font-semibold">{t('admin.meditation.audio.errorHeader')}</p>
          <p className="text-xs font-mono break-all">{formError}</p>
          {pendingUploadedPath && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleRetryDbSave}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('admin.meditation.audio.retryDbSaveButton')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">
            {t('admin.meditation.audio.selectFileLabel')} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            {t('admin.meditation.audio.fileRequirements')}
          </p>

          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleFileSelect}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
          />

          {selectedFile && (
            <p className="text-xs text-emerald-700 font-medium mt-2">
              ✓ {t('admin.meditation.audio.selectedFile', { name: selectedFile.name, size: formatMb(selectedFile.size) })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
          <Link
            to="/admin/meditation"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('admin.meditation.audio.cancel')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !selectedFile || (isReplacement && !confirmReplace)}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.meditation.audio.uploading')
              : isReplacement
                ? t('admin.meditation.audio.replaceButton')
                : t('admin.meditation.audio.uploadButton')}
          </button>
        </div>
      </form>
    </div>
  )
}
