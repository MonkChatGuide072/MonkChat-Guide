import { useState, useEffect, useCallback, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface TranslationRowData {
  language_code: string
  title: string
  description: string
  transcript: string | null
  subtitle_vtt_storage_path: string | null
}

interface TrackData {
  id: string
  duration_seconds: number
  audio_storage_path: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  title: string
  thTrans: TranslationRowData | null
  enTrans: TranslationRowData | null
}

const MAX_FILE_SIZE_BYTES = 1048576 // 1 MB (1024 * 1024)
const ALLOWED_MIME_TYPES = new Set(['text/vtt', ''])

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function isValidVttStoragePath(path: string, trackId: string, lang: string): boolean {
  const expected = `${trackId}/${lang}/subtitles.vtt`
  if (path !== expected) return false
  if (path.includes('..')) return false
  return true
}

function parseVttTimestampSeconds(tsStr: string): number | null {
  const regex = /^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/
  const match = tsStr.trim().match(regex)
  if (!match) return null

  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = parseInt(match[2], 10)
  const seconds = parseInt(match[3], 10)
  const milliseconds = parseInt(match[4], 10)

  if (minutes >= 60 || seconds >= 60 || milliseconds >= 1000) {
    return null
  }

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
}

function isValidWebvttHeader(text: string): boolean {
  let cleanText = text
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1)
  }

  const lines = cleanText.split(/\r?\n/)
  const firstMeaningfulLine = lines.find((line) => line.trim().length > 0)
  if (!firstMeaningfulLine) return false

  return firstMeaningfulLine.trim() === 'WEBVTT'
}

function validateVttCueTimestamps(text: string): { valid: boolean; errorReason?: 'no_cue' | 'invalid_order' } {
  const lines = text.split(/\r?\n/)
  let hasTimingLine = false
  let hasValidOrder = false

  for (const line of lines) {
    if (!line.includes('-->')) continue

    const parts = line.split('-->')
    if (parts.length !== 2) continue

    const startStr = parts[0].trim().split(/\s+/)[0]
    const endStr = parts[1].trim().split(/\s+/)[0]

    const startSec = parseVttTimestampSeconds(startStr)
    const endSec = parseVttTimestampSeconds(endStr)

    if (startSec !== null && endSec !== null) {
      hasTimingLine = true
      if (endSec > startSec) {
        hasValidOrder = true
        break
      }
    }
  }

  if (!hasTimingLine) {
    return { valid: false, errorReason: 'no_cue' }
  }
  if (!hasValidOrder) {
    return { valid: false, errorReason: 'invalid_order' }
  }
  return { valid: true }
}

export function AdminMeditationSubtitlesPage() {
  const { t, i18n } = useTranslation()
  const { trackId } = useParams<{ trackId: string }>()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [trackData, setTrackData] = useState<TrackData | null>(null)

  const [selectedLang, setSelectedLang] = useState<'th' | 'en'>('th')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingUploadedPath, setPendingUploadedPath] = useState<string | null>(null)
  const [pendingLang, setPendingLang] = useState<'th' | 'en' | null>(null)

  // ── Fetch Track Details ────────────────────────────────────────────────────

  const fetchTrackDetails = useCallback(async () => {
    if (!trackId) {
      setLoadError(t('admin.meditation.subtitles.notFoundTitle'))
      setIsLoading(false)
      return
    }

    if (!supabaseClient) {
      setLoadError(t('admin.meditation.subtitles.errorNoClient'))
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
            title,
            description,
            transcript,
            subtitle_vtt_storage_path
          )
        `)
        .eq('id', trackId)
        .single()

      if (trackErr || !trackRow) {
        setLoadError(trackErr?.message || t('admin.meditation.subtitles.notFoundTitle'))
        setIsLoading(false)
        return
      }

      const translations = (trackRow.meditation_track_translations as TranslationRowData[]) || []
      const thRow = translations.find((tr) => tr.language_code === 'th') || null
      const enRow = translations.find((tr) => tr.language_code === 'en') || null
      const preferred = translations.find((tr) => tr.language_code === currentLang)
      const resolvedTitle = preferred?.title || thRow?.title || translations[0]?.title || '—'

      setTrackData({
        id: trackRow.id,
        duration_seconds: trackRow.duration_seconds,
        audio_storage_path: trackRow.audio_storage_path,
        content_status: trackRow.content_status as 'draft' | 'published' | 'archived',
        is_published: trackRow.is_published,
        title: resolvedTitle,
        thTrans: thRow,
        enTrans: enRow,
      })

      setIsLoading(false)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('admin.meditation.subtitles.errorGeneric'))
      setIsLoading(false)
    }
  }, [trackId, currentLang, t])

  useEffect(() => {
    fetchTrackDetails()
  }, [fetchTrackDetails])

  // ── File Input Validation & Content Inspection ─────────────────────────────

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    setFormError(null)
    setSuccessMessage(null)
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const nameLower = file.name.toLowerCase()
    const isVttExtension = nameLower.endsWith('.vtt')
    const isAcceptedMime = ALLOWED_MIME_TYPES.has(file.type)

    if (!isVttExtension || !isAcceptedMime) {
      setFormError(t('admin.meditation.subtitles.errorNotVtt'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    if (file.size <= 0) {
      setFormError(t('admin.meditation.subtitles.errorEmptyFile'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormError(t('admin.meditation.subtitles.errorTooLarge'))
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    // Read and validate VTT content text safely
    try {
      const rawText = await file.text()

      // 1. WEBVTT Header check: first non-empty line must equal EXACTLY "WEBVTT"
      if (!isValidWebvttHeader(rawText)) {
        setFormError(t('admin.meditation.subtitles.errorNoWebvttHeader'))
        setSelectedFile(null)
        e.target.value = ''
        return
      }

      // 2. Cue Timestamps check (valid format and end > start)
      const cueResult = validateVttCueTimestamps(rawText)
      if (!cueResult.valid) {
        if (cueResult.errorReason === 'invalid_order') {
          setFormError(t('admin.meditation.subtitles.errorInvalidTimestampOrder'))
        } else {
          setFormError(t('admin.meditation.subtitles.errorNoCueTimestamp'))
        }
        setSelectedFile(null)
        e.target.value = ''
        return
      }

      // 3. Case-insensitive script detection
      let text = rawText
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }
      const lowerText = text.toLowerCase()
      if (lowerText.includes('<script') || lowerText.includes('javascript:')) {
        setFormError(t('admin.meditation.subtitles.errorScriptDetected'))
        setSelectedFile(null)
        e.target.value = ''
        return
      }

      setSelectedFile(file)
    } catch {
      setFormError(t('admin.meditation.subtitles.errorGeneric'))
      setSelectedFile(null)
      e.target.value = ''
    }
  }

  // ── Retry DB Save Only ─────────────────────────────────────────────────────

  const handleRetryDbSave = async () => {
    if (!pendingUploadedPath || !pendingLang || !trackId || !supabaseClient || isSubmitting) return

    setIsSubmitting(true)
    setFormError(null)
    setSuccessMessage(null)

    try {
      const { error: dbErr } = await supabaseClient
        .from('meditation_track_translations')
        .update({
          subtitle_vtt_storage_path: pendingUploadedPath,
        })
        .eq('track_id', trackId)
        .eq('language_code', pendingLang)

      if (dbErr) {
        setFormError(t('admin.meditation.subtitles.errorUploadDbFailed', { error: dbErr.message }))
        setIsSubmitting(false)
        return
      }

      // Success
      setPendingUploadedPath(null)
      setPendingLang(null)
      setSelectedFile(null)
      setConfirmReplace(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccessMessage(t('admin.meditation.subtitles.successUpload'))
      setIsSubmitting(false)
      await fetchTrackDetails()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.subtitles.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  // ── Upload Handler ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !trackData || !trackId) return

    setFormError(null)
    setSuccessMessage(null)

    if (!selectedFile) {
      setFormError(t('admin.meditation.subtitles.errorNoFile'))
      return
    }

    const currentTransRow = selectedLang === 'th' ? trackData.thTrans : trackData.enTrans
    if (!currentTransRow) {
      setFormError(t('admin.meditation.subtitles.enUnavailable'))
      return
    }

    const existingPath = currentTransRow.subtitle_vtt_storage_path
    const isReplacement = Boolean(existingPath)

    if (isReplacement) {
      if (!confirmReplace) {
        setFormError(t('admin.meditation.subtitles.errorRequireConfirmReplace'))
        return
      }

      if (!existingPath || !isValidVttStoragePath(existingPath, trackId, selectedLang)) {
        setFormError(t('admin.meditation.subtitles.errorInvalidStoragePath'))
        return
      }
    }

    if (!user) {
      setFormError(t('admin.meditation.subtitles.errorNoUser'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.meditation.subtitles.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      const targetPath = `${trackId}/${selectedLang}/subtitles.vtt`

      // Step 1: Storage Upload (text/vtt)
      const { error: uploadErr } = await supabaseClient.storage
        .from('meditation-subtitles')
        .upload(targetPath, selectedFile, {
          contentType: 'text/vtt',
          upsert: isReplacement,
        })

      if (uploadErr) {
        setFormError(uploadErr.message)
        setIsSubmitting(false)
        return
      }

      setPendingUploadedPath(targetPath)
      setPendingLang(selectedLang)

      // Step 2: Database Metadata Update
      const { error: dbErr } = await supabaseClient
        .from('meditation_track_translations')
        .update({
          subtitle_vtt_storage_path: targetPath,
        })
        .eq('track_id', trackId)
        .eq('language_code', selectedLang)

      if (dbErr) {
        setFormError(t('admin.meditation.subtitles.errorUploadDbFailed', { error: dbErr.message }))
        setIsSubmitting(false)
        return
      }

      // Success
      setPendingUploadedPath(null)
      setPendingLang(null)
      setSelectedFile(null)
      setConfirmReplace(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccessMessage(t('admin.meditation.subtitles.successUpload'))
      setIsSubmitting(false)
      await fetchTrackDetails()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.meditation.subtitles.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  // ── Render Guard ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (loadError || !trackData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-red-800 font-semibold">{t('admin.meditation.subtitles.notFoundTitle')}</p>
        <p className="text-red-600 text-sm font-mono break-all">{loadError}</p>
        <Link
          to="/admin/meditation"
          className="inline-block mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors"
        >
          {t('admin.meditation.subtitles.backToList')}
        </Link>
      </div>
    )
  }

  const thVttPath = trackData.thTrans?.subtitle_vtt_storage_path || null
  const enVttPath = trackData.enTrans?.subtitle_vtt_storage_path || null
  const activeTransRow = selectedLang === 'th' ? trackData.thTrans : trackData.enTrans
  const activeVttPath = activeTransRow?.subtitle_vtt_storage_path || null
  const isReplacingCurrent = Boolean(activeVttPath)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation & Title */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/meditation"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors"
        >
          <span>←</span> {t('admin.meditation.subtitles.backToList')}
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{trackData.title}</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">ID: {trackData.id}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              ⏱ {formatDuration(trackData.duration_seconds)}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                trackData.audio_storage_path
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {trackData.audio_storage_path
                ? `✓ ${t('admin.meditation.audioExists')}`
                : `⚠ ${t('admin.meditation.audioMissing')}`}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                trackData.content_status === 'draft'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : trackData.content_status === 'published'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-700 border-red-300'
              }`}
            >
              {t(`admin.meditation.status.${trackData.content_status}`, trackData.content_status)}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                trackData.is_published
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              {trackData.is_published
                ? t('admin.meditation.published')
                : t('admin.meditation.unpublished')}
            </span>
          </div>
        </div>

        {/* Current VTT Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Thai VTT Status */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center justify-between">
              <span>{t('admin.meditation.subtitles.thSubtitleStatus')}</span>
              <span className={thVttPath ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {thVttPath ? `✓ ${t('admin.meditation.subtitles.statusAttached')}` : `⚠ ${t('admin.meditation.subtitles.statusMissing')}`}
              </span>
            </p>
            <p className="text-slate-500 font-mono break-all text-[11px]">
              {t('admin.meditation.subtitles.storedPath')} {thVttPath || '—'}
            </p>
          </div>

          {/* English VTT Status */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center justify-between">
              <span>{t('admin.meditation.subtitles.enSubtitleStatus')}</span>
              {trackData.enTrans ? (
                <span className={enVttPath ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {enVttPath ? `✓ ${t('admin.meditation.subtitles.statusAttached')}` : `⚠ ${t('admin.meditation.subtitles.statusMissing')}`}
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  {t('admin.meditation.subtitles.enUnavailable')}
                </span>
              )}
            </p>
            <p className="text-slate-500 font-mono break-all text-[11px]">
              {t('admin.meditation.subtitles.storedPath')} {enVttPath || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Draft Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-sm">
          <span>ℹ️</span> {t('admin.meditation.subtitles.draftNoticeTitle')}
        </p>
        <p className="text-amber-700">
          {t('admin.meditation.subtitles.draftNoticeDesc')}
        </p>
      </div>

      {/* Success Alert Banner */}
      {successMessage && !formError && !pendingUploadedPath && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 flex items-center justify-between">
          <p className="font-semibold">✓ {successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Partial Failure Warning Banner */}
      {pendingUploadedPath && (
        <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-amber-900 space-y-2">
          <p className="font-semibold text-sm">⚠️ {t('admin.meditation.subtitles.errorHeader')}</p>
          <p className="text-xs font-mono break-all">
            Storage Path: {pendingUploadedPath}
          </p>
          <button
            type="button"
            onClick={handleRetryDbSave}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-700 hover:bg-amber-800 text-white transition-colors cursor-pointer"
          >
            {isSubmitting ? t('admin.meditation.subtitles.uploading') : t('admin.meditation.subtitles.retryDbSave')}
          </button>
        </div>
      )}

      {/* Error Alert */}
      {formError && !pendingUploadedPath && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.meditation.subtitles.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          {t('admin.meditation.subtitles.title')}
        </h2>

        {/* Language Selector Tabs */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">
            {t('admin.meditation.subtitles.selectLanguage')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedLang('th')
                setFormError(null)
                setSuccessMessage(null)
                setSelectedFile(null)
                setConfirmReplace(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                selectedLang === 'th'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t('admin.meditation.subtitles.langThai')}
            </button>

            <button
              type="button"
              disabled={!trackData.enTrans}
              onClick={() => {
                if (trackData.enTrans) {
                  setSelectedLang('en')
                  setFormError(null)
                  setSuccessMessage(null)
                  setSelectedFile(null)
                  setConfirmReplace(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                !trackData.enTrans
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : selectedLang === 'en'
                  ? 'bg-blue-600 text-white border-blue-600 cursor-pointer'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              {t('admin.meditation.subtitles.langEnglish')}
            </button>
          </div>

          {!trackData.enTrans && (
            <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
              ℹ️ {t('admin.meditation.subtitles.enUnavailableHint')}
            </p>
          )}
        </div>

        {/* File Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {t('admin.meditation.subtitles.chooseFile')} ({selectedLang.toUpperCase()})
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".vtt"
            onChange={handleFileSelect}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
          />
          <p className="text-xs text-slate-400 mt-1">
            {t('admin.meditation.subtitles.fileHint')}
          </p>
        </div>

        {/* Replacement Confirmation Checkbox */}
        {isReplacingCurrent && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <label className="flex items-start gap-2 text-xs font-semibold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmReplace}
                onChange={(e) => setConfirmReplace(e.target.checked)}
                className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span>{t('admin.meditation.subtitles.confirmReplace')}</span>
            </label>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/admin/meditation"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('admin.meditation.subtitles.backToList')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !selectedFile || (isReplacingCurrent && !confirmReplace)}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.meditation.subtitles.uploading')
              : t('admin.meditation.subtitles.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
