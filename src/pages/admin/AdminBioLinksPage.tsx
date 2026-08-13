import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface BioLinkTranslationRow {
  language_code: string
  title: string
}

interface BioLinkRow {
  id: string
  url: string
  display_order: number
  content_status: 'draft' | 'published' | 'archived'
  is_published: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
  bio_link_translations: BioLinkTranslationRow[]
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

function resolveTitle(translations: BioLinkTranslationRow[], currentLang: string): string {
  const preferred = translations.find((tr) => tr.language_code === currentLang)
  const fallback = translations.find((tr) => tr.language_code === 'th')
  return preferred?.title || fallback?.title || translations[0]?.title || '—'
}

export function AdminBioLinksPage() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const isOwner = profile?.role === 'owner'

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<BioLinkRow[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  // Track inline order changes
  const [orderChanges, setOrderChanges] = useState<Record<string, number>>({})

  // ── Fetch BioLinks ─────────────────────────────────────────────────────────

  const fetchBioLinks = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('admin.bioLinks.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabaseClient
        .from('bio_links')
        .select(`
          id,
          url,
          display_order,
          content_status,
          is_published,
          archived_at,
          created_at,
          updated_at,
          bio_link_translations (
            language_code,
            title
          )
        `)
        .order('display_order', { ascending: true })

      if (dbError) {
        setError(dbError.message)
        setIsLoading(false)
        return
      }

      setItems((data as BioLinkRow[]) ?? [])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.bioLinks.errorGeneric'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchBioLinks()
  }, [fetchBioLinks])

  // ── Action Handlers ────────────────────────────────────────────────────────

  type LinkAction = 'publish' | 'unpublish' | 'archive' | 'restore'

  const handleAction = async (item: BioLinkRow, action: LinkAction) => {
    const messages: Record<LinkAction, string> = {
      publish: t('admin.bioLinks.actions.publishConfirm'),
      unpublish: t('admin.bioLinks.actions.unpublishConfirm'),
      archive: t('admin.bioLinks.actions.archiveConfirm'),
      restore: t('admin.bioLinks.actions.restoreConfirm'),
    }

    const confirmMsg = messages[action]
    if (!confirmMsg) {
      setError(t('admin.bioLinks.actions.errorUpdate'))
      return
    }

    if (!window.confirm(confirmMsg)) return

    setActionLoadingId(item.id)
    setError(null)
    setActionSuccessMsg(null)

    try {
      if (!supabaseClient) throw new Error(t('admin.bioLinks.errorNoClient'))

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) throw new Error(t('admin.bioLinks.create.errorNoUser'))

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
          throw new Error(t('admin.bioLinks.actions.errorUpdate'))
      }

      const { error: updateError } = await supabaseClient
        .from('bio_links')
        .update(updates)
        .eq('id', item.id)

      if (updateError) throw new Error(t('admin.bioLinks.actions.errorUpdate'))

      setActionSuccessMsg(t('admin.bioLinks.actions.successMsg'))
      await fetchBioLinks()
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.bioLinks.actions.errorUpdate'))
    } finally {
      setActionLoadingId(null)
    }
  }

  // ── Display Order Inline Update ────────────────────────────────────────────

  const handleOrderChange = (id: string, val: string) => {
    const parsed = parseInt(val, 10)
    if (!isNaN(parsed)) {
      setOrderChanges((prev) => ({ ...prev, [id]: parsed }))
    }
  }

  const saveOrder = async (item: BioLinkRow) => {
    const newOrder = orderChanges[item.id]
    if (newOrder === undefined || newOrder === item.display_order) return

    setActionLoadingId(item.id)
    setError(null)
    setActionSuccessMsg(null)

    try {
      if (!supabaseClient) throw new Error(t('admin.bioLinks.errorNoClient'))

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) throw new Error(t('admin.bioLinks.create.errorNoUser'))

      const { error: updateError } = await supabaseClient
        .from('bio_links')
        .update({
          display_order: newOrder,
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (updateError) throw new Error(t('admin.bioLinks.actions.errorUpdate'))

      setActionSuccessMsg(t('admin.bioLinks.actions.successMsg'))
      // Clear tracking for this item
      setOrderChanges((prev) => {
        const copy = { ...prev }
        delete copy[item.id]
        return copy
      })
      await fetchBioLinks()
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.bioLinks.actions.errorUpdate'))
    } finally {
      setActionLoadingId(null)
    }
  }

  // ── Render Helpers ─────────────────────────────────────────────────────────

  const renderBadges = (item: BioLinkRow) => {
    const statusMap: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-300',
      published: 'bg-green-100 text-green-800 border-green-300',
      archived: 'bg-red-100 text-red-700 border-red-300',
    }

    const statusCls = statusMap[item.content_status] ?? 'bg-slate-100 text-slate-700 border-slate-300'

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusCls}`}>
          {t(`admin.bioLinks.status.${item.content_status}`, item.content_status)}
        </span>
      </div>
    )
  }

  const renderActionButtons = (item: BioLinkRow) => {
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
          to={`/admin/bio-links/${item.id}/edit`}
          onClick={(e) => { if (!canEdit) e.preventDefault() }}
          className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
            canEdit
              ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
              : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
          }`}
        >
          {t('admin.bioLinks.actions.edit')}
        </Link>

        {canPublish && (
          <button
            type="button"
            disabled={!canPublish}
            onClick={() => handleAction(item, 'publish')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.bioLinks.actions.publish')}
          </button>
        )}

        {canUnpublish && (
          <button
            type="button"
            disabled={!canUnpublish}
            onClick={() => handleAction(item, 'unpublish')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.bioLinks.actions.unpublish')}
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            disabled={!canArchive}
            onClick={() => handleAction(item, 'archive')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.bioLinks.actions.archive')}
          </button>
        )}

        {isOwner && isArchived && (
          <button
            type="button"
            disabled={!canRestore}
            onClick={() => handleAction(item, 'restore')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.bioLinks.actions.restore')}
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
              {t('admin.modules.bioLinks.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.bioLinks.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchBioLinks}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t('admin.bioLinks.refresh')}
            </button>
            <Link
              to="/admin/bio-links/new"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {t('admin.bioLinks.addLink')}
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
          <p className="text-red-800 font-semibold">{t('admin.bioLinks.create.errorHeader')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchBioLinks}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            {t('admin.bioLinks.refresh')}
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
            🔗
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('admin.bioLinks.emptyTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('admin.bioLinks.emptyDesc')}
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && !error && items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">
              {t('admin.bioLinks.linkCount', { count: items.length })}
            </p>
          </div>

          {/* Mobile view (cards) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {items.map((item) => {
              const title = resolveTitle(item.bio_link_translations, currentLang)
              const orderVal = orderChanges[item.id] !== undefined ? orderChanges[item.id] : item.display_order
              const hasOrderChanged = orderChanges[item.id] !== undefined && orderChanges[item.id] !== item.display_order
              const isProcessing = actionLoadingId === item.id

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-900 leading-tight">
                      {title}
                    </span>
                    {renderBadges(item)}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="truncate">
                      <strong>URL:</strong>{' '}
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {item.url}
                      </a>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <strong>{t('admin.bioLinks.displayOrder')}:</strong>
                      <input
                        type="number"
                        disabled={isProcessing}
                        value={orderVal}
                        onChange={(e) => handleOrderChange(item.id, e.target.value)}
                        className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center focus:outline-emerald-600"
                      />
                      {hasOrderChanged && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => saveOrder(item)}
                          className="bg-emerald-600 text-white rounded px-2 py-0.5 text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('admin.bioLinks.updatedAt')}: {formatDate(item.updated_at, currentLang)}
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
                  <th className="px-6 py-3">{t('admin.bioLinks.colTitle')}</th>
                  <th className="px-6 py-3">{t('admin.bioLinks.colUrl')}</th>
                  <th className="px-6 py-3 w-32">{t('admin.bioLinks.colOrder')}</th>
                  <th className="px-6 py-3">{t('admin.bioLinks.colStatus')}</th>
                  <th className="px-6 py-3">{t('admin.bioLinks.colUpdated')}</th>
                  <th className="px-6 py-3 text-right">{t('admin.bioLinks.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => {
                  const title = resolveTitle(item.bio_link_translations, currentLang)
                  const orderVal = orderChanges[item.id] !== undefined ? orderChanges[item.id] : item.display_order
                  const hasOrderChanged = orderChanges[item.id] !== undefined && orderChanges[item.id] !== item.display_order
                  const isProcessing = actionLoadingId === item.id

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{title}</td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {item.url}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={isProcessing}
                            value={orderVal}
                            onChange={(e) => handleOrderChange(item.id, e.target.value)}
                            className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-emerald-600 focus:border-emerald-600"
                          />
                          {hasOrderChanged && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => saveOrder(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2 py-1 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                          )}
                        </div>
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
