import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { trackUsageEvent, getBioLinkImageUrl, supabaseClient } from '../lib/supabase'

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

interface BioLinkTranslationRow {
  language_code: string
  title: string
}

interface BioLinkRow {
  id: string
  url: string
  display_order: number
  image_storage_path: string | null
  bio_link_translations: BioLinkTranslationRow[]
}

export function CentersPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [centers, setCenters] = useState<CenterRow[]>([])
  const [bioLinks, setBioLinks] = useState<BioLinkRow[]>([])

  // ── Fetch Data ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('centers.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [centersRes, linksRes] = await Promise.all([
        supabaseClient
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
          .order('created_at', { ascending: false }),
        supabaseClient
          .from('bio_links')
          .select(`id, url, display_order, image_storage_path, bio_link_translations(language_code, title)`)
          .eq('content_status', 'published')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
      ])

      if (centersRes.error) throw centersRes.error
      if (linksRes.error) throw linksRes.error

      const allCenters = (centersRes.data as CenterRow[]) ?? []
      const validCenters = allCenters.filter(center =>
        center.dci_center_translations.some(tr => tr.language_code === currentLang)
      )
      setCenters(validCenters)

      const linksData = (linksRes.data || []) as BioLinkRow[]
      const validLinks = linksData.filter(link => {
        const trans = link.bio_link_translations.find(tr => tr.language_code === currentLang)
        return trans != null && (link.url.startsWith('http://') || link.url.startsWith('https://'))
      })
      setBioLinks(validLinks)

      setIsLoading(false)
    } catch {
      setError(t('centers.errorLoadCenters'))
      setIsLoading(false)
    }
  }, [t, currentLang])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 max-w-4xl mx-auto font-['Noto_Sans_Thai']">
      {/* Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A86100]">
              {t('centers.heroTag')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#11223C]">
              {t('centers.title')}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {t('centers.subtitle')}
        </p>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A86100]" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('centers.errorLoad')}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#A86100] hover:bg-amber-800 text-white transition-colors cursor-pointer"
          >
            {t('centers.retry')}
          </button>
        </div>
      )}

      {/* Centers List */}
      {!isLoading && !error && centers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-[#11223C] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{t('centers.listTitle')}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {centers.length} {t('centers.itemCount', { count: centers.length })}
            </span>
          </div>

          <div className="space-y-4">
            {centers.map((center) => {
              const translation = center.dci_center_translations.find(tr => tr.language_code === currentLang)

              return (
                <article
                  key={center.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#11223C]">
                      {translation?.name || t('centers.unnamedCenter', 'Unnamed Center')}
                    </h3>
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
                  <div className="flex flex-wrap gap-3 pt-2">
                    {center.map_url && (
                      <a href={center.map_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {t('centers.linkMap')}
                      </a>
                    )}
                    {center.website_url && (
                      <a href={center.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        {t('centers.linkWebsite')}
                      </a>
                    )}
                    {center.contact_url && (
                      <a href={center.contact_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {t('centers.linkContact')}
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && centers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-[#A86100] flex items-center justify-center text-3xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-[#11223C]">
            {t('centers.empty')}
          </h2>
        </div>
      )}

      {/* BioLinks */}
      {!isLoading && !error && bioLinks.length > 0 && (
        <section className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-[#11223C] text-center">{t('home.importantLinks', 'Important Links')}</h2>
          <div className="space-y-3">
            {bioLinks.map(link => {
              const transTitle = link.bio_link_translations.find(tr => tr.language_code === currentLang)?.title;
              const imgUrl = getBioLinkImageUrl(link.image_storage_path);

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackUsageEvent('bio_link_click', 'bio_link', link.id)}
                  className="flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-[#A86100] transition-all"
                >
                  <div className="flex items-center gap-4">
                    {imgUrl ? (
                      <img src={imgUrl} alt={transTitle} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-amber-50 text-[#A86100] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </div>
                    )}
                    <span className="font-semibold text-[#11223C]">{transTitle}</span>
                  </div>
                  <svg className="w-5 h-5 text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
