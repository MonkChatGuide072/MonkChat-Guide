import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router'
import { supabaseClient } from '../../lib/supabase'
import { uploadBioLinkImage, validateBioLinkImage } from '../../lib/bioLinkImages'

export function AdminBioLinksNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form Fields
  const [url, setUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('1')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Localized Fields
  const [thTitle, setThTitle] = useState('')
  const [enTitle, setEnTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabaseClient) {
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

    setIsLoading(true)
    setError(null)

    let createdLinkId: string | null = null

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error(t('admin.bioLinks.create.errorNoUser'))
      }

      // 1. Insert Core Link
      const { data: linkData, error: linkErr } = await supabaseClient
        .from('bio_links')
        .insert({
          url: trimmedUrl,
          display_order: parseInt(displayOrder, 10),
          content_status: 'draft',
          is_published: false,
          created_by: session.user.id,
          updated_by: session.user.id,
        })
        .select('id')
        .single()

      if (linkErr || !linkData) {
        throw new Error(linkErr?.message || t('admin.bioLinks.create.errorGeneric'))
      }

      createdLinkId = linkData.id

      // 2. Insert Translations
      const translations = [
        {
          bio_link_id: createdLinkId,
          language_code: 'th',
          title: thTitle.trim(),
        },
      ]

      if (enTitle.trim()) {
        translations.push({
          bio_link_id: createdLinkId,
          language_code: 'en',
          title: enTitle.trim(),
        })
      }

      const { error: transErr } = await supabaseClient
        .from('bio_link_translations')
        .insert(translations)

      if (transErr) {
        // Rollback safety - set core row to archived
        await supabaseClient
          .from('bio_links')
          .update({ content_status: 'archived', archived_at: new Date().toISOString() })
          .eq('id', createdLinkId)

        throw new Error(transErr.message)
      }

      if (imageFile && createdLinkId) {
        const imageStoragePath = await uploadBioLinkImage(imageFile, createdLinkId)
        const { error: imageUpdateErr } = await supabaseClient
          .from('bio_links')
          .update({
            image_storage_path: imageStoragePath,
            updated_by: session.user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', createdLinkId)

        if (imageUpdateErr) throw new Error(imageUpdateErr.message)
      }

      navigate('/admin/bio-links')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.bioLinks.create.errorGeneric'))
    } finally {
      setIsLoading(false)
    }
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
            ← {t('admin.bioLinks.create.backToList')}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.bioLinks.create.title')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('admin.bioLinks.create.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1 font-mono">
          <p className="font-semibold">{t('admin.bioLinks.create.errorHeader')}:</p>
          <p className="break-all">{error}</p>
        </div>
      )}

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
                placeholder={t('admin.bioLinks.create.phUrl')}
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
                placeholder={t('admin.bioLinks.create.phOrder')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.bioLinks.create.secImage')}
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="bio-link-image">
              {t('admin.bioLinks.create.labelImage')}
            </label>
            <input
              id="bio-link-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null
                if (!selectedFile) {
                  setImageFile(null)
                  return
                }

                const validationError = validateBioLinkImage(selectedFile)
                if (validationError) {
                  setImageFile(null)
                  setError(validationError)
                  event.target.value = ''
                  return
                }

                setError(null)
                setImageFile(selectedFile)
              }}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-800 hover:file:bg-amber-200"
            />
            <p className="mt-2 text-xs text-slate-500">{t('admin.bioLinks.create.imageHint')}</p>
            {imageFile && <p className="mt-1 text-xs font-medium text-emerald-700">{imageFile.name}</p>}
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
              placeholder={t('admin.bioLinks.create.phThTitle')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* English Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.bioLinks.create.secEnglish')}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.bioLinks.create.labelTitle')} (EN)
            </label>
            <input
              type="text"
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder={t('admin.bioLinks.create.phEnTitle')}
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
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? t('admin.bioLinks.create.saving') : t('admin.bioLinks.create.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
