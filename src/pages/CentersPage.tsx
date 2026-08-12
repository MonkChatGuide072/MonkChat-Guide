import { useTranslation } from 'react-i18next'
import { mockDCICenters, mockDCICenterTranslations } from '../data/mock'
import { getTranslation } from '../utils/translation'

export function CentersPage() {
  const { t, i18n } = useTranslation()

  const publishedCenters = mockDCICenters.filter((c) => c.is_published)

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t('centers.demoBadge')}
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {t('centers.subtitle')}
        </p>
      </section>

      {/* Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
        {t('centers.demoNotice')}
      </div>

      {/* Centers List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🏛️</span>
            <span>{t('centers.listTitle')}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {publishedCenters.length} {t('centers.demoBadge')}
          </span>
        </div>

        <div className="space-y-4">
          {publishedCenters.map((center, index) => {
            const translation = getTranslation(
              mockDCICenterTranslations.filter((tr) => tr.center_id === center.id),
              i18n.language,
              'th'
            )

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
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {translation.description}
                  </p>
                )}

                {/* Location Fields (from core record — clearly demo) */}
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

                {/* Links — null-safe, no fake links */}
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

      {/* Footer Disclaimer */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 italic">
          * {t('centers.placeholderDisclaimer')}
        </p>
      </div>
    </div>
  )
}

/**
 * NullSafeLink renders a plain disabled row when href is null.
 * Never creates fake href="#" or javascript:void links.
 */
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
