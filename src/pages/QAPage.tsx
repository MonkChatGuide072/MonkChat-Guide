import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { getTranslation } from '../utils/translation'

interface QATranslationRow {
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

interface QAItemRow {
  id: string
  category: string
  source_reference: string | null
  content_status: 'draft' | 'published' | 'archived'
  verification_status: 'unverified' | 'verified'
  is_published: boolean
  qa_translations: QATranslationRow[]
}

export function QAPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
    ? 'en'
    : 'th'

  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<QAItemRow[]>([])

  // ── Fetch Q&A Items ────────────────────────────────────────────────────────

  const fetchQAItems = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('qa.errorNoClient'))
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
          is_published,
          qa_translations (
            language_code,
            question,
            short_answer,
            detailed_answer
          )
        `)
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (dbError) throw dbError

      setItems((data as QAItemRow[]) ?? [])
      setIsLoading(false)
    } catch {
      setError(t('qa.errorLoadItems'))
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchQAItems()
  }, [fetchQAItems])

  // Resolve current language translations
  const itemsWithTranslations = items.map((item) => {
    const translation = getTranslation(item.qa_translations, currentLang, 'th')
    return {
      item,
      translation,
    }
  })

  // Filter items based on search query
  const query = searchQuery.trim().toLowerCase()
  const filteredItems = itemsWithTranslations.filter(({ translation }) => {
    if (!query) return true
    if (!translation) return false
    const questionMatch = translation.question.toLowerCase().includes(query)
    const shortAnsMatch = translation.short_answer.toLowerCase().includes(query)
    const detailedAnsMatch = translation.detailed_answer?.toLowerCase().includes(query) || false
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
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg focus:outline-hidden"
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-800 font-semibold">{t('qa.errorLoad')}</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchQAItems}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
          >
            {t('qa.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-3xl">
            ❓
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            {t('qa.empty')}
          </h2>
        </div>
      )}

      {/* Q&A Items List */}
      {!isLoading && !error && items.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>❓</span>
              <span>{t('qa.demoSectionTitle')}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {filteredItems.length} {t('qa.itemCount', { count: filteredItems.length })}
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-4 pt-1">
              {filteredItems.map(({ item, translation }) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.category}
                    </span>
                    {item.source_reference && (
                      <span className="text-xs text-slate-500">
                        {t('qa.sourceRef')} {item.source_reference}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {translation?.question || item.id}
                  </h3>

                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    <p className="font-semibold text-amber-800 flex items-start gap-1.5">
                      <span>💡</span>
                      <span>{translation?.short_answer}</span>
                    </p>
                    {translation?.detailed_answer && (
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-6 pt-1 border-t border-slate-200/60 whitespace-pre-wrap">
                        {translation.detailed_answer}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
              <span className="text-3xl block">🔍</span>
              <h3 className="text-base font-bold text-slate-800">
                {t('qa.noResults')}
              </h3>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 focus:outline-hidden transition-colors"
              >
                {t('qa.clearSearch')}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
