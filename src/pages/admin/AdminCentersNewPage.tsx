import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router'
import { supabaseClient } from '../../lib/supabase'

export function AdminCentersNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form Fields
  const [countryCode, setCountryCode] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [contactUrl, setContactUrl] = useState('')

  // Localized Fields
  const [thName, setThName] = useState('')
  const [thDesc, setThDesc] = useState('')
  const [enName, setEnName] = useState('')
  const [enDesc, setEnDesc] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabaseClient) {
      setError(t('admin.centers.create.errorNoClient'))
      return
    }

    // Validation
    if (!countryCode.trim()) {
      setError(t('admin.centers.create.errorCountryCodeRequired'))
      return
    }
    if (!city.trim()) {
      setError(t('admin.centers.create.errorCityRequired'))
      return
    }
    if (!address.trim()) {
      setError(t('admin.centers.create.errorAddressRequired'))
      return
    }
    if (!thName.trim()) {
      setError(t('admin.centers.create.errorThNameRequired'))
      return
    }
    if (!thDesc.trim()) {
      setError(t('admin.centers.create.errorThDescRequired'))
      return
    }

    const hasEnName = !!enName.trim()
    const hasEnDesc = !!enDesc.trim()

    if (hasEnName && !hasEnDesc) {
      setError(t('admin.centers.create.errorEnDescRequired'))
      return
    }
    if (hasEnDesc && !hasEnName) {
      setError(t('admin.centers.create.errorEnNameRequired'))
      return
    }

    setIsLoading(true)
    setError(null)

    let createdCenterId: string | null = null

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error(t('admin.centers.create.errorNoUser'))
      }

      // 1. Insert Core Center
      const { data: centerData, error: centerErr } = await supabaseClient
        .from('dci_centers')
        .insert({
          country_code: countryCode.trim().toUpperCase(),
          city: city.trim(),
          address: address.trim(),
          map_url: mapUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          contact_url: contactUrl.trim() || null,
          content_status: 'draft',
          is_published: false,
          created_by: session.user.id,
          updated_by: session.user.id,
        })
        .select('id')
        .single()

      if (centerErr || !centerData) {
        throw new Error(centerErr?.message || t('admin.centers.create.errorGeneric'))
      }

      createdCenterId = centerData.id

      // 2. Insert Translations
      const translations = [
        {
          center_id: createdCenterId,
          language_code: 'th',
          name: thName.trim(),
          description: thDesc.trim(),
        },
      ]

      if (hasEnName && hasEnDesc) {
        translations.push({
          center_id: createdCenterId,
          language_code: 'en',
          name: enName.trim(),
          description: enDesc.trim(),
        })
      }

      const { error: transErr } = await supabaseClient
        .from('dci_center_translations')
        .insert(translations)

      if (transErr) {
        // Rollback safety - set core row to archived
        await supabaseClient
          .from('dci_centers')
          .update({ content_status: 'archived', archived_at: new Date().toISOString() })
          .eq('id', createdCenterId)

        throw new Error(transErr.message)
      }

      navigate('/admin/centers')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.centers.create.errorGeneric'))
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
            to="/admin/centers"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-1"
          >
            ← {t('admin.centers.create.backToList')}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.centers.create.title')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('admin.centers.create.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1 font-mono">
          <p className="font-semibold">{t('admin.centers.create.errorHeader')}:</p>
          <p className="break-all">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.centers.create.secMetadata')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('admin.centers.create.labelCountryCode')} *
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder={t('admin.centers.create.phCountryCode')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('admin.centers.create.labelCity')} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('admin.centers.create.phCity')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelAddress')} *
            </label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('admin.centers.create.phAddress')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelMapUrl')} ({t('admin.centers.create.optional')})
              </label>
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder={t('admin.centers.create.phMapUrl')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelWebsiteUrl')} ({t('admin.centers.create.optional')})
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder={t('admin.centers.create.phWebsiteUrl')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelContactUrl')} ({t('admin.centers.create.optional')})
              </label>
              <input
                type="url"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder={t('admin.centers.create.phContactUrl')}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Thai Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.centers.create.secThai')}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelName')} (TH) *
            </label>
            <input
              type="text"
              required
              value={thName}
              onChange={(e) => setThName(e.target.value)}
              placeholder={t('admin.centers.create.phThName')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelDescription')} (TH) *
            </label>
            <textarea
              required
              rows={4}
              value={thDesc}
              onChange={(e) => setThDesc(e.target.value)}
              placeholder={t('admin.centers.create.phThDesc')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* English Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t('admin.centers.create.secEnglish')}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelName')} (EN)
            </label>
            <input
              type="text"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              placeholder={t('admin.centers.create.phEnName')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelDescription')} (EN)
            </label>
            <textarea
              rows={4}
              value={enDesc}
              onChange={(e) => setEnDesc(e.target.value)}
              placeholder={t('admin.centers.create.phEnDesc')}
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/centers"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            {t('admin.centers.create.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? t('admin.centers.create.saving') : t('admin.centers.create.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
