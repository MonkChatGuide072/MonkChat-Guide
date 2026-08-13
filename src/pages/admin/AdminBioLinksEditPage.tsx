import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router'
import { supabaseClient } from '../../lib/supabase'

export function AdminBioLinksEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { linkId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Database core metadata
  const [url, setUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('1')
  const [contentStatus, setContentStatus] = useState('draft')
  const [isPublished, setIsPublished] = useState(false)

  // Localized state
  const [thTitle, setThTitle] = useState('')
  const [enTitle, setEnTitle] = useState('')

  // Track if English translation already exists in DB
  const [hadEnTranslation, setHadEnTranslation] = useState(false)

  useEffect(() => {
    const fetchLink = async () => {
      if (!supabaseClient || !linkId) return

      try {
        // Fetch core link data
        const { data: link, error: linkErr } = await supabaseClient
          .from('bio_links')
          .select('*')
          .eq('id', linkId)
          .single()

        if (linkErr || !link) {
          setError(t('admin.bioLinks.edit.errorNotFound'))
          setIsLoading(false)
          return
        }

        if (link.content_status === 'archived') {
          setError(t('admin.bioLinks.edit.errorArchived'))
          setIsLoading(false)
          return
        }

        setUrl(link.url)
        setDisplayOrder(String(link.display_order))
        setContentStatus(link.content_status)
        setIsPublished(link.is_published)

        // Fetch translations
        const { data: translations, error: transErr } = await supabaseClient
          .from('bio_link_translations')
          .select('*')
          .eq('bio_link_id', linkId)

        if (transErr || !translations) {
          setError(t('admin.bioLinks.create.errorGeneric'))
          setIsLoading(false)
          return
        }

        const th = translations.find((tr) => tr.language_code === 'th')
        if (th) {
          setThTitle(th.title)
        }

        const en = translations.find((tr) => tr.language_code === 'en')
        if (en) {
          setEnTitle(en.title)
          setHadEnTranslation(true)
        }

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.bioLinks.create.errorGeneric'))
        setIsLoading(false)
      }
    }

    fetchLink()
  }, [linkId, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabaseClient || !linkId) {
      setError(t('admin.bioLinks.create.errorNoClient'))
      return
    }

    // Validation
    if (!url.trim()) {
      setError(t('admin.bioLinks.create.errorUrlRequired'))
      return
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setError(t('admin.bioLinks.create.errorUrlInvalid'))
      return
    }

    if (!displayOrder.trim()) {
      setError(t('admin.bioLinks.create.errorOrderRequired'))
      return
    }

    if (!thTitle.trim()) {
      setError(t('admin.bioLinks.create.errorThTitleRequired'))
      return
    }

    const trimmedEnTitle = enTitle.trim()

    // Checking English translation preservation rule
    const shouldSkipEnUpdate = hadEnTranslation && !trimmedEnTitle

    setIsSaving(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error(t('admin.bioLinks.create.errorNoUser'))
      }

      // 1. Update Core DCI Center
      const { error: linkUpdateErr } = await supabaseClient
        .from('bio_links')
        .update({
          url: trimmedUrl,
          display_order: parseInt(displayOrder, 10),
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linkId)

      if (linkUpdateErr) {
        throw new Error(t('admin.bioLinks.edit.errorUpdateCore'))
      }

      // 2. Upsert Thai translation
      const { error: thErr } = await supabaseClient
        .from('bio_link_translations')
        .upsert({
          bio_link_id: linkId,
          language_code: 'th',
          title: thTitle.trim(),
        }, {
          onConflict: 'bio_link_id,language_code'
        })

      if (thErr) {
        throw new Error(t('admin.bioLinks.edit.errorUpdateTh'))
      }

      // 3. Handle English translation
      if (!shouldSkipEnUpdate && trimmedEnTitle) {
        const { error: enErr } = await supabaseClient
          .from('bio_link_translations')
          .upsert({
            bio_link_id: linkId,
            language_code: 'en',
            title: trimmedEnTitle,
          }, {
            onConflict: 'bio_link_id,language_code'
          })

        if (enErr) {
          throw new Error(t('admin.bioLinks.edit.errorUpdateEn'))
        }
      }

      navigate('/admin/bio-links')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.bioLinks.create.errorGeneric'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin/bio-links"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-1"
          >
            ← {t('admin.bioLinks.edit.backToList')}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.bioLinks.edit.title')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('admin.bioLinks.edit.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1 font-mono">
          <p className="font-semibold">{t('admin.bioLinks.create.errorHeader')}:</p>
          <p className="break-all">{error}</p>
        </div>
      )}

      {/* System Status Details */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600 flex flex-wrap gap-x-6 gap-y-1 font-mono">
        <p>
          <strong>Status:</strong> {contentStatus}
        </p>
        <p>
          <strong>Published:</strong> {isPublished ? 'true' : 'false'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.bioLinks.create.secMetadata')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('admin.bioLinks.create.labelUrl')} *
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('admin.bioLinks.create.labelOrder')} *
              </label>
              <input
                type="number"
                required
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Thai Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.bioLinks.create.secThai')}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.bioLinks.create.labelTitle')} (TH) *
            </label>
            <input
              type="text"
              required
              value={thTitle}
              onChange={(e) => setThTitle(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* English Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {t('admin.bioLinks.create.secEnglish')}
            </h2>
            {hadEnTranslation && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚠️ {t('admin.bioLinks.edit.enPreserveNotice')}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.bioLinks.create.labelTitle')} (EN)
            </label>
            <input
              type="text"
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder={hadEnTranslation ? t('admin.bioLinks.edit.enPreserveNotice') : undefined}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/bio-links"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            {t('admin.bioLinks.create.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? t('admin.bioLinks.edit.saving') : t('admin.bioLinks.edit.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
