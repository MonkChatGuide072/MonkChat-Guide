import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface CenterTranslationRow {
  language_code: string
  name: string
  description: string
}

interface CenterRow {
  id: string
  country_code: string
  city: string
  address: string
  map_url: string | null
  website_url: string | null
  contact_url: string | null
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
  dci_center_translations: CenterTranslationRow[]
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function resolveName(translations: CenterTranslationRow[], currentLang: string): string {
  const preferred = translations.find((tr) => tr.language_code === currentLang)
  const fallback = translations.find((tr) => tr.language_code === 'th')
  return preferred?.name || fallback?.name || translations[0]?.name || '—'
}

export function AdminCentersPage() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const isOwner = profile?.role === 'owner'

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<CenterRow[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  // ── Fetch DCI Centers ──────────────────────────────────────────────────────

  const fetchCenters = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('admin.centers.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabaseClient
        .from('dci_centers')
        .select(`
          id,
          country_code,
          city,
          address,
          map_url,
          website_url,
          contact_url,
          content_status,
          is_published,
          archived_at,
          created_at,
          updated_at,
          dci_center_translations (
            language_code,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (dbError) {
        setError(dbError.message)
        setIsLoading(false)
        return
      }

      setItems((data as CenterRow[]) ?? [])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.centers.errorGeneric'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  // ── Action Handlers ────────────────────────────────────────────────────────

  type CenterAction = 'publish' | 'unpublish' | 'archive' | 'restore'

  const handleAction = async (item: CenterRow, action: CenterAction) => {
    const messages: Record<CenterAction, string> = {
      publish: t('admin.centers.actions.publishConfirm'),
      unpublish: t('admin.centers.actions.unpublishConfirm'),
      archive: t('admin.centers.actions.archiveConfirm'),
      restore: t('admin.centers.actions.restoreConfirm'),
    }

    const confirmMsg = messages[action]
    if (!confirmMsg) {
      setError(t('admin.centers.actions.errorUpdate'))
      return
    }

    if (!window.confirm(confirmMsg)) return

    setActionLoadingId(item.id)
    setError(null)
    setActionSuccessMsg(null)

    try {
      if (!supabaseClient) throw new Error(t('admin.centers.errorNoClient'))

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) throw new Error(t('admin.centers.create.errorNoUser'))

      let updates: Record<string, any> = { updated_by: session.user.id, updated_at: new Date().toISOString() }

      switch (action) {
        case 'publish':
          updates = { ...updates, content_status: 'published', is_published: true }
          break
        case 'unpublish':
          updates = { ...updates, content_status: 'draft', is_published: false }
          break
        case 'archive':
          updates = { ...updates, content_status: 'archived', is_published: false, archived_at: new Date().toISOString() }
          break
        case 'restore':
          updates = {
            ...updates,
            content_status: 'draft',
            is_published: false,
            archived_at: null,
          }
          break
        default:
          throw new Error(t('admin.centers.actions.errorUpdate'))
      }

      const { error: updateError } = await supabaseClient
        .from('dci_centers')
        .update(updates)
        .eq('id', item.id)

      if (updateError) throw new Error(t('admin.centers.actions.errorUpdate'))

      setActionSuccessMsg(t('admin.centers.actions.successMsg'))
      await fetchCenters()
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.centers.actions.errorUpdate'))
    } finally {
      setActionLoadingId(null)
    }
  }

  // ── Render Helpers ─────────────────────────────────────────────────────────

  const renderBadges = (item: CenterRow) => {
    const statusMap: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-300',
      published: 'bg-green-100 text-green-800 border-green-300',
      archived: 'bg-red-100 text-red-700 border-red-300',
    }

    const statusCls = statusMap[item.content_status] ?? 'bg-slate-100 text-slate-700 border-slate-300'

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusCls}`}>
          {t(`admin.centers.status.${item.content_status}`, item.content_status)}
        </span>
      </div>
    )
  }

  const renderActionButtons = (item: CenterRow) => {
    const isArchived = item.content_status === 'archived'
    const isPublished = item.is_published
    const isProcessing = actionLoadingId === item.id || isLoading

    const canEdit = !isArchived && !isProcessing
    const canPublish = !isArchived && !isPublished && !isProcessing
    const canUnpublish = !isArchived && isPublished && !isProcessing
    const canArchive = !isArchived && !isProcessing
    const canRestore = isOwner && isArchived && !isProcessing

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to={`/admin/centers/${item.id}/edit`}
          onClick={(e) => { if (!canEdit) e.preventDefault() }}
          className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
            canEdit
              ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
              : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
          }`}
        >
          {t('admin.centers.actions.edit')}
        </Link>

        {canPublish && (
          <button
            type="button"
            disabled={!canPublish}
            onClick={() => handleAction(item, 'publish')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.centers.actions.publish')}
          </button>
        )}

        {canUnpublish && (
          <button
            type="button"
            disabled={!canUnpublish}
            onClick={() => handleAction(item, 'unpublish')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.centers.actions.unpublish')}
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            disabled={!canArchive}
            onClick={() => handleAction(item, 'archive')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.centers.actions.archive')}
          </button>
        )}

        {isOwner && isArchived && (
          <button
            type="button"
            disabled={!canRestore}
            onClick={() => handleAction(item, 'restore')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.centers.actions.restore')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('admin.modules.centers.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.centers.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchCenters}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t('admin.centers.refresh')}
            </button>
            <Link
              to="/admin/centers/new"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {t('admin.centers.addCenter')}
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('admin.centers.errorHeader')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchCenters}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            {t('admin.centers.refresh')}
          </button>
        </div>
      )}

      {/* Success Alert State */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 flex items-center justify-between">
          <p className="font-semibold">✓ {actionSuccessMsg}</p>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-3xl">
            🏛️
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('admin.centers.emptyTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('admin.centers.emptyDesc')}
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && !error && items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">
              {t('admin.centers.centerCount', { count: items.length })}
            </p>
          </div>

          {/* Mobile view (cards) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {items.map((item) => {
              const name = resolveName(item.dci_center_translations, currentLang)
              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-900 leading-tight">
                      {name}
                    </span>
                    {renderBadges(item)}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>{t('admin.centers.city')}:</strong> {item.city} ({item.country_code})
                    </p>
                    <p>
                      <strong>{t('admin.centers.address')}:</strong> {item.address}
                    </p>
                    {item.map_url && (
                      <p>
                        <a href={item.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {t('admin.centers.mapUrl')}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('admin.centers.updatedAt')}: {formatDate(item.updated_at, currentLang)}
                  </div>
                  <div className="pt-2">
                    {renderActionButtons(item)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop view (table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase">
                  <th className="px-6 py-3">{t('admin.centers.colName')}</th>
                  <th className="px-6 py-3">{t('admin.centers.colLocation')}</th>
                  <th className="px-6 py-3">{t('admin.centers.colLinks')}</th>
                  <th className="px-6 py-3">{t('admin.centers.colStatus')}</th>
                  <th className="px-6 py-3">{t('admin.centers.colUpdated')}</th>
                  <th className="px-6 py-3 text-right">{t('admin.centers.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => {
                  const name = resolveName(item.dci_center_translations, currentLang)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{name}</td>
                      <td className="px-6 py-4 space-y-0.5 text-xs">
                        <p className="font-semibold">{item.city} ({item.country_code})</p>
                        <p className="text-slate-500 line-clamp-1">{item.address}</p>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-1">
                        {item.map_url && (
                          <p>
                            <a href={item.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              🗺️ {t('admin.centers.mapUrl')}
                            </a>
                          </p>
                        )}
                        {item.website_url && (
                          <p>
                            <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              🌐 {t('admin.centers.websiteUrl')}
                            </a>
                          </p>
                        )}
                        {item.contact_url && (
                          <p>
                            <a href={item.contact_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              ✉️ {t('admin.centers.contactUrl')}
                            </a>
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">{renderBadges(item)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{formatDate(item.updated_at, currentLang)}</td>
                      <td className="px-6 py-4 text-right">{renderActionButtons(item)}</td>
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
