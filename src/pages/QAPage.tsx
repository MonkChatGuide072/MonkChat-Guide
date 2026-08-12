import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockQAItems, mockQATranslations } from '../data/mock'
import { getTranslation, isPublicQAItem } from '../utils/translation'

export function QAPage() {
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  // Map mock items to their current translations
  const itemsWithTranslations = mockQAItems.map((item) => {
    const translation = getTranslation(
      mockQATranslations.filter((tr) => tr.qa_item_id === item.id),
      i18n.language,
      'th'
    )
    return {
      item,
      translation,
      isPublicEligible: isPublicQAItem(item),
    }
  })

  // Filter items based on search query
  const query = searchQuery.trim().toLowerCase()
  const filteredItems = itemsWithTranslations.filter(({ translation }) => {
    if (!query) return true
    if (!translation) return false
    const questionMatch = translation.question.toLowerCase().includes(query)
    const shortAnsMatch = translation.short_answer.toLowerCase().includes(query)
    const detailedAnsMatch = translation.detailed_answer?.toLowerCase().includes(query)
    return questionMatch || shortAnsMatch || detailedAnsMatch
  })

  return (
    <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 max-w-4xl mx-auto">
      {/* Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              {t('qa.heroTag')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('qa.title')}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {t('qa.demoBadge')}
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-600">
          {t('qa.subtitle')}
        </p>

        {/* Search Field */}
        <div className="relative pt-2">
          <label htmlFor="qa-search-input" className="sr-only">
            {t('qa.searchPlaceholder')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400 text-base">🔍</span>
            <input
              id="qa-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('qa.searchPlaceholder')}
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus:bg-white transition-all duration-200 min-h-[48px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={t('qa.clearSearch')}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Official Requirement Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
        {t('qa.verificationNotice')}
      </div>

      {/* Prototype Demo Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>❓</span>
            <span>{t('qa.demoSectionTitle')}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {filteredItems.length} {t('qa.demoBadge')}
          </span>
        </div>

        <p className="text-xs text-slate-500 italic">
          * {t('qa.demoSectionNotice')}
        </p>

        {/* Q&A Items List */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4 pt-1">
            {filteredItems.map(({ item, translation }) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3"
              >
                {/* Header / Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                    ID: {item.id}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t('qa.statusDraft')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {t('qa.statusUnverified')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t('qa.statusUnpublished')}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {translation?.question || item.id}
                </h3>

                {/* Short & Detailed Answer (Placeholder wording only) */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  <p className="font-semibold text-amber-800 flex items-start gap-1.5">
                    <span>💡</span>
                    <span>{translation?.short_answer}</span>
                  </p>
                  {translation?.detailed_answer && (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6 pt-1 border-t border-slate-200/60">
                      {translation.detailed_answer}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
            <span className="text-3xl block">🔍</span>
            <h3 className="text-base font-bold text-slate-800">
              {t('qa.noResults')}
            </h3>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            >
              {t('qa.clearSearch')}
            </button>
          </div>
        )}
      </section>

      {/* Footer Notice */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 italic">
          * {t('qa.placeholderDisclaimer')}
        </p>
      </div>
    </div>
  )
}
