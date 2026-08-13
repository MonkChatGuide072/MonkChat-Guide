import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router'
import { supabaseClient } from '../../lib/supabase'


export function AdminCentersEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { centerId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Database core metadata
  const [countryCode, setCountryCode] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [contactUrl, setContactUrl] = useState('')
  const [contentStatus, setContentStatus] = useState('draft')
  const [isPublished, setIsPublished] = useState(false)

  // Localized state
  const [thName, setThName] = useState('')
  const [thDesc, setThDesc] = useState('')
  const [enName, setEnName] = useState('')
  const [enDesc, setEnDesc] = useState('')

  // Track if English translation already exists in DB
  const [hadEnTranslation, setHadEnTranslation] = useState(false)

  useEffect(() => {
    const fetchCenter = async () => {
      if (!supabaseClient || !centerId) return

      try {
        // Fetch core center data
        const { data: center, error: centerErr } = await supabaseClient
          .from('dci_centers')
          .select('*')
          .eq('id', centerId)
          .single()

        if (centerErr || !center) {
          setError(t('admin.centers.edit.errorNotFound'))
          setIsLoading(false)
          return
        }

        if (center.content_status === 'archived') {
          setError(t('admin.centers.edit.errorArchived'))
          setIsLoading(false)
          return
        }

        setCountryCode(center.country_code)
        setCity(center.city)
        setAddress(center.address)
        setMapUrl(center.map_url || '')
        setWebsiteUrl(center.website_url || '')
        setContactUrl(center.contact_url || '')
        setContentStatus(center.content_status)
        setIsPublished(center.is_published)

        // Fetch translations
        const { data: translations, error: transErr } = await supabaseClient
          .from('dci_center_translations')
          .select('*')
          .eq('center_id', centerId)

        if (transErr || !translations) {
          setError(t('admin.centers.create.errorGeneric'))
          setIsLoading(false)
          return
        }

        const th = translations.find((tr) => tr.language_code === 'th')
        if (th) {
          setThName(th.name)
          setThDesc(th.description)
        }

        const en = translations.find((tr) => tr.language_code === 'en')
        if (en) {
          setEnName(en.name)
          setEnDesc(en.description)
          setHadEnTranslation(true)
        }

        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.centers.create.errorGeneric'))
        setIsLoading(false)
      }
    }

    fetchCenter()
  }, [centerId, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supabaseClient || !centerId) {
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

    const trimmedEnName = enName.trim()
    const trimmedEnDesc = enDesc.trim()

    // Enforce completeness of English if any English field is provided
    if (trimmedEnName && !trimmedEnDesc) {
      setError(t('admin.centers.create.errorEnDescRequired'))
      return
    }
    if (trimmedEnDesc && !trimmedEnName) {
      setError(t('admin.centers.create.errorEnNameRequired'))
      return
    }

    // Checking English translation preservation rule
    const shouldSkipEnUpdate = hadEnTranslation && !trimmedEnName && !trimmedEnDesc

    setIsSaving(true)
    setError(null)

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        throw new Error(t('admin.centers.create.errorNoUser'))
      }

      // 1. Update Core DCI Center
      const { error: centerUpdateErr } = await supabaseClient
        .from('dci_centers')
        .update({
          country_code: countryCode.trim().toUpperCase(),
          city: city.trim(),
          address: address.trim(),
          map_url: mapUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          contact_url: contactUrl.trim() || null,
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', centerId)

      if (centerUpdateErr) {
        throw new Error(t('admin.centers.edit.errorUpdateCore'))
      }

      // 2. Upsert Thai translation
      const { error: thErr } = await supabaseClient
        .from('dci_center_translations')
        .upsert({
          center_id: centerId,
          language_code: 'th',
          name: thName.trim(),
          description: thDesc.trim(),
        }, {
          onConflict: 'center_id,language_code'
        })

      if (thErr) {
        throw new Error(t('admin.centers.edit.errorUpdateTh'))
      }

      // 3. Handle English translation
      if (!shouldSkipEnUpdate && trimmedEnName && trimmedEnDesc) {
        const { error: enErr } = await supabaseClient
          .from('dci_center_translations')
          .upsert({
            center_id: centerId,
            language_code: 'en',
            name: trimmedEnName,
            description: trimmedEnDesc,
          }, {
            onConflict: 'center_id,language_code'
          })

        if (enErr) {
          throw new Error(t('admin.centers.edit.errorUpdateEn'))
        }
      }

      navigate('/admin/centers')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('admin.centers.create.errorGeneric'))
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
            to="/admin/centers"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-1"
          >
            ← {t('admin.centers.edit.backToList')}
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('admin.centers.edit.title')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('admin.centers.edit.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1 font-mono">
          <p className="font-semibold">{t('admin.centers.create.errorHeader')}:</p>
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
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelMapUrl')}
              </label>
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelWebsiteUrl')}
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                {t('admin.centers.create.labelContactUrl')}
              </label>
              <input
                type="url"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
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
              className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* English Translation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {t('admin.centers.create.secEnglish')}
            </h2>
            {hadEnTranslation && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚠️ {t('admin.centers.edit.enPreserveNotice')}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('admin.centers.create.labelName')} (EN)
            </label>
            <input
              type="text"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              placeholder={hadEnTranslation ? t('admin.centers.edit.enPreserveNotice') : undefined}
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
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? t('admin.centers.edit.saving') : t('admin.centers.edit.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
