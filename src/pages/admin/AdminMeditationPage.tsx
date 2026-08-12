/**
 * AdminMeditationPage — Read-only Supabase meditation track list.
 *
 * Fetches meditation_tracks with the translated title in the current interface
 * language (Thai fallback). No mutations, uploads, or signed URLs are created.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../../lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrackTranslation {
  language_code: string
  title: string
}

interface MeditationTrackRow {
  id: string
  duration_seconds: number
  audio_storage_path: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  created_at: string
  updated_at: string
  meditation_track_translations: TrackTranslation[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Return the best title for the row given the current UI language, falling back to Thai. */
function resolveTitle(
  translations: TrackTranslation[],
  currentLang: string,
  fallbackLang = 'th'
): string {
  const lang = currentLang.startsWith('en') ? 'en' : 'th'
  const preferred = translations.find((t) => t.language_code === lang)
  if (preferred) return preferred.title
  const fallback = translations.find((t) => t.language_code === fallbackLang)
  if (fallback) return fallback.title
  return translations[0]?.title ?? '—'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminMeditationPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [tracks, setTracks] = useState<MeditationTrackRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTracks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (!supabaseClient) {
      setError(t('admin.meditation.errorNoClient'))
      setIsLoading(false)
      return
    }

    const { data, error: dbError } = await supabaseClient
      .from('meditation_tracks')
      .select(`
        id,
        duration_seconds,
        audio_storage_path,
        content_status,
        is_published,
        created_at,
        updated_at,
        meditation_track_translations (
          language_code,
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (dbError) {
      setError(dbError.message)
      setIsLoading(false)
      return
    }

    setTracks((data as MeditationTrackRow[]) ?? [])
    setIsLoading(false)
  }, [t])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  // ── Status badge ───────────────────────────────────────────────────────────

  const statusBadge = (status: string, isPublished: boolean) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-300',
      published: 'bg-green-100 text-green-800 border-green-300',
      archived: 'bg-red-100 text-red-700 border-red-300',
    }
    const cls = map[status] ?? 'bg-slate-100 text-slate-700 border-slate-300'
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${cls}`}>
          {t(`admin.meditation.status.${status}`, status)}
        </span>
        {isPublished ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-emerald-100 text-emerald-800 border-emerald-300">
            {t('admin.meditation.published')}
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-amber-50 text-amber-700 border-amber-300">
            {t('admin.meditation.unpublished')}
          </span>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('admin.modules.meditation.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.meditation.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Refresh button */}
            <button
              onClick={fetchTracks}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('admin.meditation.refresh')}
            </button>

            {/* Add track button */}
            <Link
              to="/admin/meditation/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('admin.meditation.addTrack')}
            </Link>
          </div>
        </div>
      </div>

      {/* Coming-soon banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        ℹ️ {t('admin.meditation.readOnlyNotice')}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('admin.meditation.errorTitle')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            onClick={fetchTracks}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            {t('admin.meditation.retry')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && tracks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-3xl">
            🎧
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('admin.meditation.emptyTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('admin.meditation.emptyDesc')}
          </p>
          <p className="text-xs text-slate-400 italic">
            {t('admin.meditation.emptyHint')}
          </p>
        </div>
      )}

      {/* Results table */}
      {!isLoading && !error && tracks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {t('admin.meditation.trackCount', { count: tracks.length })}
            </p>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {tracks.map((track) => {
              const title = resolveTitle(track.meditation_track_translations, currentLang)
              return (
                <div key={track.id} className="p-4 space-y-3">
                  <div className="font-semibold text-slate-900 truncate">{title}</div>
                  {statusBadge(track.content_status, track.is_published)}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{t('admin.meditation.duration')}: {formatDuration(track.duration_seconds)}</span>
                    <span className={track.audio_storage_path ? 'text-emerald-600' : 'text-amber-600'}>
                      {track.audio_storage_path ? `✓ ${t('admin.meditation.audioExists')}` : `⚠ ${t('admin.meditation.audioMissing')}`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('admin.meditation.updatedAt')}: {formatDate(track.updated_at, currentLang)}
                  </div>
                  {/* Per-row action buttons */}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <Link
                      to={`/admin/meditation/${track.id}/edit`}
                      className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      {t('admin.meditation.editTrack')}
                    </Link>
                    {[
                      { key: 'uploadAudio' },
                      { key: 'manageTranscript' },
                    ].map(({ key }) => (
                      <button
                        key={key}
                        disabled
                        title={t('admin.meditation.comingSoon')}
                        className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                      >
                        {t(`admin.meditation.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[
                    'admin.meditation.colTitle',
                    'admin.meditation.colDuration',
                    'admin.meditation.colStatus',
                    'admin.meditation.colAudio',
                    'admin.meditation.colUpdated',
                    'admin.meditation.colActions',
                  ].map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tracks.map((track) => {
                  const title = resolveTitle(track.meditation_track_translations, currentLang)
                  return (
                    <tr key={track.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                        {title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDuration(track.duration_seconds)}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(track.content_status, track.is_published)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={track.audio_storage_path ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                          {track.audio_storage_path
                            ? `✓ ${t('admin.meditation.audioExists')}`
                            : `⚠ ${t('admin.meditation.audioMissing')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(track.updated_at, currentLang)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            to={`/admin/meditation/${track.id}/edit`}
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors whitespace-nowrap"
                          >
                            {t('admin.meditation.editTrack')}
                          </Link>
                          {[
                            { key: 'uploadAudio' },
                            { key: 'manageTranscript' },
                          ].map(({ key }) => (
                            <button
                              key={key}
                              disabled
                              title={t('admin.meditation.comingSoon')}
                              className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed whitespace-nowrap"
                            >
                              {t(`admin.meditation.${key}`)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
