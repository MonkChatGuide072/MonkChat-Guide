import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { getTranslation } from '../utils/translation'

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
  dci_center_translations: CenterTranslationRow[]
}

export function CentersPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [centers, setCenters] = useState<CenterRow[]>([])

  // ── Fetch DCI Centers ──────────────────────────────────────────────────────

  const fetchCenters = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('centers.errorNoClient'))
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
          dci_center_translations (
            language_code,
            name,
            description
          )
        `)
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (dbError) throw dbError

      setCenters((data as CenterRow[]) ?? [])
      setIsLoading(false)
    } catch {
      setError(t('centers.errorLoadCenters'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  return (
    <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 max-w-4xl mx-auto">
      {/* Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              {t('centers.heroTag')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('centers.title')}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {t('centers.subtitle')}
        </p>
      </section>

      {/* Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
        {t('centers.demoNotice')}
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
          <p className="text-red-800 font-semibold">{t('centers.errorLoad')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchCenters}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
          >
            {t('centers.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && centers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-3xl">
            🏛️
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('centers.empty')}
          </h2>
        </div>
      )}

      {/* Centers List */}
      {!isLoading && !error && centers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🏛️</span>
              <span>{t('centers.listTitle')}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {centers.length} {t('centers.itemCount', { count: centers.length })}
            </span>
          </div>

          <div className="space-y-4">
            {centers.map((center, index) => {
              const translation = getTranslation(center.dci_center_translations, currentLang, 'th')

              return (
                <article
                  key={center.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono text-slate-400">
                        #{index + 1} · {center.id}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {translation?.name || center.id}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 flex-shrink-0">
                      {center.country_code}
                    </span>
                  </div>

                  {/* Description */}
                  {translation?.description && (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {translation.description}
                    </p>
                  )}

                  {/* Location Fields */}
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row gap-1">
                      <span className="font-semibold text-slate-700 sm:w-24 flex-shrink-0">
                        {t('centers.fieldCity')}:
                      </span>
                      <span className="text-slate-600">{center.city}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <span className="font-semibold text-slate-700 sm:w-24 flex-shrink-0">
                        {t('centers.fieldAddress')}:
                      </span>
                      <span className="text-slate-600 italic">{center.address}</span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-2 text-sm">
                    <NullSafeLink
                      href={center.map_url}
                      label={t('centers.linkMap')}
                      pendingLabel={t('centers.linkPending')}
                    />
                    <NullSafeLink
                      href={center.website_url}
                      label={t('centers.linkWebsite')}
                      pendingLabel={t('centers.linkPending')}
                    />
                    <NullSafeLink
                      href={center.contact_url}
                      label={t('centers.linkContact')}
                      pendingLabel={t('centers.linkPending')}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function NullSafeLink({
  href,
  label,
  pendingLabel,
}: {
  href: string | null
  label: string
  pendingLabel: string
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 items-start sm:items-center">
      <span className="font-semibold text-slate-700 sm:w-24 flex-shrink-0">{label}:</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 underline underline-offset-2 hover:text-amber-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          {href}
        </a>
      ) : (
        <span className="text-slate-400 italic text-xs">
          {pendingLabel}
        </span>
      )}
    </div>
  )
}
