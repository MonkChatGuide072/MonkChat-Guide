import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface QATranslationRow {
  language_code: string
  question: string
}

interface QAItemRow {
  id: string
  category: string
  source_reference: string | null
  content_status: 'draft' | 'published' | 'archived'
  verification_status: 'unverified' | 'verified'
  verified_by: string | null
  verified_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  qa_translations: QATranslationRow[]
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

function resolveQuestion(translations: QATranslationRow[], currentLang: string): string {
  const preferred = translations.find((tr) => tr.language_code === currentLang)
  const fallback = translations.find((tr) => tr.language_code === 'th')
  return preferred?.question || fallback?.question || translations[0]?.question || 'เนโฌโ€'
}

export function AdminQAPage() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const isOwner = profile?.role === 'owner'

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<QAItemRow[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  // ── Fetch Q&A Items ────────────────────────────────────────────────────────

  const fetchQAItems = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('admin.qa.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: dbError } = await supabaseClient
        .from('qa_items')
        .select(`
          id,
          category,
          source_reference,
          content_status,
          verification_status,
          verified_by,
          verified_at,
          is_published,
          created_at,
          updated_at,
          qa_translations (
            language_code,
            question
          )
        `)
        .order('created_at', { ascending: false })

      if (dbError) {
        setError(dbError.message)
        setIsLoading(false)
        return
      }

      setItems((data as QAItemRow[]) ?? [])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.qa.errorGeneric'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchQAItems()
  }, [fetchQAItems])

  // ── Status Badges Helper ───────────────────────────────────────────────────

  const renderBadges = (item: QAItemRow) => {
    const statusMap: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-300',
      published: 'bg-green-100 text-green-800 border-green-300',
      archived: 'bg-red-100 text-red-700 border-red-300',
    }

    const verificationMap: Record<string, string> = {
      unverified: 'bg-amber-100 text-amber-900 border-amber-300',
      verified: 'bg-blue-100 text-blue-800 border-blue-300',
    }

    const statusCls = statusMap[item.content_status] ?? 'bg-slate-100 text-slate-700 border-slate-300'
    const verifyCls = verificationMap[item.verification_status] ?? 'bg-amber-100 text-amber-900 border-amber-300'

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Content Status */}
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusCls}`}>
          {t(`admin.qa.status.${item.content_status}`, item.content_status)}
        </span>

        {/* Verification Status */}
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${verifyCls}`}>
          {item.verification_status === 'verified' ? '✓ ' : '⚠ '}
          {t(`admin.qa.verification.${item.verification_status}`, item.verification_status)}
        </span>

        {/* Publication State */}
        {item.is_published ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-emerald-100 text-emerald-800 border-emerald-300">
            {t('admin.qa.published')}
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-slate-100 text-slate-600 border-slate-300">
            {t('admin.qa.unpublished')}
          </span>
        )}
      </div>
    )
  }

  // ── Action Handlers ────────────────────────────────────────────────────────

  type QAAction = 'verify' | 'publish' | 'unpublish' | 'archive' | 'returnToDraft' | 'restore'

  const handleAction = async (item: QAItemRow, action: QAAction) => {
    const messages: Record<QAAction, string> = {
      verify: t('admin.qa.actions.verifyConfirm'),
      publish: t('admin.qa.actions.publishConfirm'),
      unpublish: t('admin.qa.actions.unpublishConfirm'),
      archive: t('admin.qa.actions.archiveConfirm'),
      returnToDraft: t('admin.qa.actions.returnToDraftConfirm'),
      restore: t('admin.qa.actions.restoreConfirm'),
    }

    const confirmMsg = messages[action]
    if (!confirmMsg) {
      setError(t('admin.qa.actions.errorUpdate'))
      return
    }

    if (!window.confirm(confirmMsg)) return

    setActionLoadingId(item.id)
    setError(null)
    setActionSuccessMsg(null)

    try {
      if (!supabaseClient) throw new Error(t('admin.qa.errorNoClient'))

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) throw new Error(t('admin.qa.create.errorNoUser'))

      let updates: Record<string, any> = { updated_by: session.user.id, updated_at: new Date().toISOString() }

      switch (action) {
        case 'verify': {
          // Pre-verify check: fetch only Thai translation
          const { data: thTrans, error: fetchErr } = await supabaseClient
            .from('qa_translations')
            .select('question, short_answer')
            .eq('qa_item_id', item.id)
            .eq('language_code', 'th')
            .single()

          if (fetchErr || !thTrans || !thTrans.question?.trim() || !thTrans.short_answer?.trim()) {
            setError(t('admin.qa.actions.errorVerifyIncomplete'))
            setActionLoadingId(null)
            return
          }
          updates = { ...updates, verification_status: 'verified', verified_by: session.user.id, verified_at: new Date().toISOString() }
          break
        }
        case 'publish':
          updates = { ...updates, content_status: 'published', is_published: true }
          break
        case 'unpublish':
          updates = { ...updates, content_status: 'draft', is_published: false }
          break
        case 'archive':
          updates = { ...updates, content_status: 'archived', is_published: false, archived_at: new Date().toISOString() }
          break
        case 'returnToDraft':
          updates = {
            ...updates,
            content_status: 'draft',
            verification_status: 'unverified',
            is_published: false,
            verified_by: null,
            verified_at: null,
          }
          break
        case 'restore':
          updates = {
            ...updates,
            content_status: 'draft',
            verification_status: 'unverified',
            is_published: false,
            verified_by: null,
            verified_at: null,
            archived_at: null,
          }
          break
        default:
          throw new Error(t('admin.qa.actions.errorUpdate'))
      }

      const { error: updateError } = await supabaseClient
        .from('qa_items')
        .update(updates)
        .eq('id', item.id)

      if (updateError) throw new Error(t('admin.qa.actions.errorUpdate'))

      setActionSuccessMsg(t('admin.qa.actions.successMsg'))
      await fetchQAItems()
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.qa.actions.errorUpdate'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const renderActionButtons = (item: QAItemRow) => {
    const isArchived = item.content_status === 'archived'
    const isVerified = item.verification_status === 'verified'
    const hasSource = !!item.source_reference
    const isPublished = item.is_published
    const isProcessing = actionLoadingId === item.id || isLoading

    const canEdit = !isArchived && !isVerified && !isProcessing
    const canVerify = isOwner && !isArchived && !isVerified && hasSource && !isProcessing
    const canPublish = isOwner && !isArchived && isVerified && hasSource && !isPublished && !isProcessing
    const canUnpublish = isOwner && !isArchived && isPublished && !isProcessing
    const canArchive = !isArchived && (isOwner || (!isVerified && !isPublished)) && !isProcessing
    const canReturnToDraft = isOwner && !isArchived && isVerified && !isProcessing
    const canRestore = isOwner && isArchived && !isProcessing

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to={`/admin/qa/${item.id}/edit`}
          onClick={(e) => { if (!canEdit) e.preventDefault() }}
          className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
            canEdit
              ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
              : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
          }`}
          title={!canEdit && !isArchived && isVerified ? t('admin.qa.ownerOnlyHint') : undefined}
        >
          {t('admin.qa.actions.edit')}
        </Link>

        {isOwner && isVerified && !isArchived && (
          <button
            type="button"
            disabled={!canReturnToDraft}
            onClick={() => handleAction(item, 'returnToDraft')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('admin.qa.actions.returnToDraft')}
          </button>
        )}

        {isOwner && !isVerified && (
          <button
            type="button"
            disabled={!canVerify}
            onClick={() => handleAction(item, 'verify')}
            title={!hasSource ? t('admin.qa.create.labelSourceRef') + ' ' + t('admin.qa.create.fixedStatus') : undefined}
            className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
              canVerify
                ? 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            {t('admin.qa.actions.verify')}
          </button>
        )}

        {isOwner && isVerified && !isPublished && (
          <button
            type="button"
            disabled={!canPublish}
            onClick={() => handleAction(item, 'publish')}
            className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
              canPublish
                ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            {t('admin.qa.status.published')}
          </button>
        )}

        {isOwner && isVerified && isPublished && (
          <button
            type="button"
            disabled={!canUnpublish}
            onClick={() => handleAction(item, 'unpublish')}
            className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
              canUnpublish
                ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer'
                : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            {t('admin.qa.actions.unpublish')}
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            disabled={!canArchive}
            onClick={() => handleAction(item, 'archive')}
            className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
              canArchive
                ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer'
                : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            {t('admin.qa.actions.archive')}
          </button>
        )}

        {isOwner && isArchived && (
          <button
            type="button"
            disabled={!canRestore}
            onClick={() => handleAction(item, 'restore')}
            className={`px-2.5 py-1 text-xs font-semibold rounded border whitespace-nowrap ${
              canRestore
                ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
            }`}
          >
            {t('admin.qa.actions.restore')}
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
              {t('admin.modules.qa.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.qa.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Refresh button */}
            <button
              type="button"
              onClick={fetchQAItems}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('admin.qa.refresh')}
            </button>

            {/* Add Q&A button */}
            <Link
              to="/admin/qa/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('admin.qa.addQA')}
            </Link>
          </div>
        </div>
      </div>

      {/* Safety & Policy Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs text-amber-900 space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-sm">
          <span>ℹ️</span> {t('admin.qa.policyNoticeTitle')}
        </p>
        <p className="text-amber-800 leading-relaxed">
          {t('admin.qa.policyNotice')}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('admin.qa.errorTitle')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchQAItems}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            {t('admin.qa.retry')}
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
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-3xl">
            ❓
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('admin.qa.emptyTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('admin.qa.emptyDesc')}
          </p>
          <p className="text-xs text-slate-400 italic">
            {t('admin.qa.emptyHint')}
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && !error && items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {t('admin.qa.itemCount', { count: items.length })}
            </p>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {items.map((item) => {
              const question = resolveQuestion(item.qa_translations, currentLang)
              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="font-semibold text-slate-900 text-sm">{question}</div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {t('admin.qa.category')}: {item.category || '—'}
                    </span>
                    <span className={item.source_reference ? 'text-emerald-700' : 'text-slate-400'}>
                      {item.source_reference ? `✓ ${t('admin.qa.hasSourceRef')}` : `— ${t('admin.qa.noSourceRef')}`}
                    </span>
                  </div>

                  {renderBadges(item)}

                  <div className="text-xs text-slate-400">
                    {t('admin.qa.updatedAt')}: {formatDate(item.updated_at, currentLang)}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-1">
                    {renderActionButtons(item)}
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
                    'admin.qa.colQuestion',
                    'admin.qa.colCategory',
                    'admin.qa.colStatus',
                    'admin.qa.colSource',
                    'admin.qa.colUpdated',
                    'admin.qa.colActions',
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
                {items.map((item) => {
                  const question = resolveQuestion(item.qa_translations, currentLang)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-sm truncate">
                        {question}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                          {item.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {renderBadges(item)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <span className={item.source_reference ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                          {item.source_reference ? `✓ ${t('admin.qa.hasSourceRef')}` : `— ${t('admin.qa.noSourceRef')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(item.updated_at, currentLang)}
                      </td>
                      <td className="px-4 py-3">
                        {renderActionButtons(item)}
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
