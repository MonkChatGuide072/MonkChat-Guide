import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { GuideIcon, type GuideIconName } from '../components/GuideIcon'

interface QATranslationRow {
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

interface QAItemRow {
  id: string
  category: string
  content_status: 'draft' | 'published' | 'archived'
  verification_status: 'unverified' | 'verified'
  is_published: boolean
  qa_translations: QATranslationRow[]
}

export function QAPage() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const currentLang = isEnglish ? 'en' : 'th'
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<QAItemRow[]>([])

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
        .select(`id, category, content_status, verification_status, is_published, qa_translations (language_code, question, short_answer, detailed_answer)`)
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      const loadedItems = (data as QAItemRow[]) ?? []
      setItems(loadedItems)
      setOpenIds(new Set(loadedItems[0] ? [loadedItems[0].id] : []))
    } catch {
      setError(t('qa.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchQAItems()
  }, [fetchQAItems])

  const availableItems = items
    .map(item => ({ item, translation: item.qa_translations.find(translation => translation.language_code === currentLang) }))
    .filter((entry): entry is { item: QAItemRow; translation: QATranslationRow } => Boolean(entry.translation))

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const normalizedSearch = searchQuery.toLocaleLowerCase(currentLang).trim()
  const filteredItems = availableItems.filter(({ item, translation }) => {
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase().includes(selectedCategory.toLowerCase())
    if (!matchesCategory) return false
    if (!normalizedSearch) return true
    return `${translation.question} ${translation.short_answer} ${translation.detailed_answer ?? ''}`
      .toLocaleLowerCase(currentLang)
      .includes(normalizedSearch)
  })

  const featuredQuestion = availableItems[0]?.translation

  const categories = [
    { key: 'All', label: isEnglish ? 'All Questions' : 'คำถามทั้งหมด', icon: 'question' },
    { key: 'Meditation', label: isEnglish ? 'Meditation' : 'สมาธิ', icon: 'lotus' },
    { key: 'Buddhism', label: isEnglish ? 'Buddhism' : 'พระพุทธศาสนา', icon: 'book' },
    { key: 'Visiting', label: isEnglish ? 'Visiting' : 'การมาเยือน', icon: 'pin' },
    { key: 'Monk Chat', label: isEnglish ? 'Monk Chat' : 'Monk Chat', icon: 'chat' },
    { key: 'Etiquette', label: isEnglish ? 'Etiquette' : 'มารยาทในวัด', icon: 'check' },
  ]

  return (
    <div className="space-y-12 bg-brand-cream pb-16 text-brand-text break-words [overflow-wrap:anywhere]">
      <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
        <div className="grid md:grid-cols-[1.3fr_0.7fr]">
          <div className="order-2 p-5 sm:p-6 md:order-1 md:p-8">
            <p className="flex items-center gap-2 text-sm text-brand-muted"><GuideIcon name="chat" />{isEnglish ? 'Questions and answers' : 'ถาม–ตอบ'}</p>
            <h1 className="mt-3 font-serif text-[1.75rem] font-semibold leading-snug text-brand-maroon sm:text-4xl">{t('qa.title')}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-brand-muted sm:text-base">{t('qa.subtitle')}</p>
          </div>
          <img src="/images/home/monkchat-slide-2.webp" alt={isEnglish ? 'A monk among Ayutthaya ruins' : 'พระสงฆ์ท่ามกลางโบราณสถานอยุธยา'} width={560} height={315} className="order-1 h-32 w-full object-cover object-[center_35%] md:order-2 md:h-full" />
        </div>
        <form role="search" onSubmit={event => { event.preventDefault(); resultsHeadingRef.current?.focus() }} className="flex flex-col gap-3 border-t border-brand-border p-5 sm:flex-row sm:p-6 md:px-8">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-brand-border bg-brand-surface px-3 focus-within:border-brand-terracotta focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-terracotta">
            <GuideIcon name="search" className="h-[18px] w-[18px] text-brand-muted" />
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} aria-label={t('qa.searchPlaceholder')} placeholder={t('qa.searchPlaceholder')} className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-brand-text outline-none placeholder:text-brand-muted" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label={t('qa.clearSearch')} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-brand-muted hover:bg-brand-gold-soft"><GuideIcon name="close" /></button>}
          </div>
          <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark">{isEnglish ? 'Search' : 'ค้นหา'}</button>
        </form>
      </section>

      {/* 2. CATEGORY PILLS */}
      <section aria-label="Question categories" className="pb-1">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                aria-pressed={isActive}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#A43D1D] text-white '
                    : 'border border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] hover:bg-[#FDF4E3]'
                }`}
              >
                <GuideIcon name={cat.icon as GuideIconName} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. MAIN 2-COLUMN SECTION: FAQ ACCORDION + ASK MONKCHAT */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">
        {/* Left Column: Frequently Asked Questions Accordion */}
        <div className="space-y-4">
          <div>
            <h2 id="qa-results-heading" ref={resultsHeadingRef} tabIndex={-1} className="scroll-mt-24 font-serif text-2xl font-semibold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Frequently asked questions' : 'คำถามที่พบบ่อย'}
            </h2>
            <p className="text-sm text-brand-muted sm:text-sm">
              {isEnglish ? 'Popular questions from foreign visitors' : 'ข้อสงสัยที่พบบ่อยจากผู้มาเยือนชาวต่างชาติ'}
            </p>
          </div>

          {isLoading && (
            <div role="status" aria-label={t('qa.loading')} className="flex min-h-60 items-center justify-center rounded-2xl border border-[#EADCC6] bg-[#FFFDF7]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#A43D1D]/20 border-t-[#A43D1D]" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-center">
              <p role="alert" className="font-semibold text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => void fetchQAItems()}
                className="mt-3 min-h-11 rounded-xl bg-[#A43D1D] px-5 text-sm font-medium text-white"
              >
                {t('qa.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && availableItems.length === 0 && (
            <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center text-sm text-brand-muted">
              {t('qa.empty')}
            </div>
          )}

          {!isLoading && !error && availableItems.length > 0 && filteredItems.length === 0 && (
            <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center">
              <h2 className="font-serif text-base font-semibold text-[#681B16]">{t('qa.noResults')}</h2>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                className="mt-3 min-h-11 rounded-xl bg-[#A43D1D] px-4 text-sm font-medium text-white hover:bg-[#8E3317]"
              >
                {isEnglish ? 'Show all questions' : 'แสดงคำถามทั้งหมด'}
              </button>
            </div>
          )}

          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="space-y-3">
              {filteredItems.map(({ item, translation }) => {
                const isOpen = openIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] transition-colors duration-150 hover:border-[#D5BD94]"
                  >
                    <h3>
                      <button type="button" onClick={() => toggleAccordion(item.id)} aria-expanded={isOpen} aria-controls={`qa-answer-${item.id}`} className="flex min-h-14 w-full cursor-pointer items-start justify-between gap-4 p-4 text-left text-base font-medium leading-6 text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft">
                        <span>{translation.question}</span>
                        <GuideIcon name="down" className={`mt-1 h-[18px] w-[18px] text-brand-muted transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </h3>

                    {isOpen && (
                      <div id={`qa-answer-${item.id}`} className="border-t border-[#EADCC6]/80 bg-[#FAF2E6]/50 p-4 pt-3 text-sm leading-6 text-[#4A3B32] sm:text-sm">
                        <p className="font-medium">{translation.short_answer}</p>
                        {translation.detailed_answer && (
                          <p className="mt-2 text-sm text-brand-muted whitespace-pre-wrap">
                            {translation.detailed_answer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ask MonkChat Card (Non-generative verified guide) */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-sans text-lg font-medium text-[#681B16]">
                  {isEnglish ? 'Ask MonkChat' : 'ถาม MonkChat'}
                </h3>
                <p className="text-sm text-brand-muted">
                  {isEnglish
                    ? 'Your friendly guide for meditation, Buddhism, and visiting Ayutthaya'
                    : 'คู่มือคำถาม-คำตอบเกี่ยวกับสมาธิ พระพุทธศาสนา และอยุธยา'}
                </p>
              </div>
            </div>

            {/* Use the same published Q&A as the FAQ, never a fabricated demo reply. */}
            <div className="mt-4 space-y-3 rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-4">
              {featuredQuestion ? <>
                <p className="ml-auto max-w-[90%] rounded-xl border border-[#EADCC6] bg-[#FDF4E3] px-4 py-2 text-sm font-semibold text-[#681B16]">{featuredQuestion.question}</p>
                <p className="rounded-xl border border-[#EADCC6] bg-[#FFFDF7] p-3 text-sm leading-7 text-[#4A3B32]">{featuredQuestion.short_answer}</p>
              </> : <p className="text-sm text-brand-muted">{isLoading ? t('qa.loading') : error ? t('qa.errorLoad') : t('qa.empty')}</p>}
            </div>

            {/* Quick Action Suggestions */}
            <div className="mt-4 space-y-2">
              <Link
                to="/meditation"
                className="flex min-h-11 items-center justify-between rounded-lg border border-[#EADCC6] bg-[#FFF8EE] px-4 py-2.5 text-sm font-medium text-[#681B16] transition-colors duration-150 hover:bg-[#FDF4E3]"
              >
                <span className="flex items-center gap-2">
                  <GuideIcon name="play" />
                  <span>{isEnglish ? 'Try a guided meditation' : 'ลองฝึกสมาธิตามเสียงนำ'}</span>
                </span>
                <span>→</span>
              </Link>
              <Link
                to="/meditation#meditation-supplementary"
                className="flex min-h-11 items-center justify-between rounded-lg border border-[#EADCC6] bg-[#FFF8EE] px-4 py-2.5 text-sm font-medium text-[#681B16] transition-colors duration-150 hover:bg-[#FDF4E3]"
              >
                <span className="flex items-center gap-2">
                  <GuideIcon name="book" />
                  <span>{isEnglish ? 'More meditation tips' : 'คำแนะนำเพิ่มเติม'}</span>
                </span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. BOTTOM 3 FEATURE HIGHLIGHTS */}
      <section className="grid gap-4 rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 sm:grid-cols-3 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
            <GuideIcon name="chat" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Meditation Questions' : 'คำถามเรื่องสมาธิ'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Get clear, respectful answers about meditation and Buddhism'
                : 'คำตอบที่เข้าใจง่ายเกี่ยวกับสมาธิและพระพุทธศาสนา'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
            <GuideIcon name="lotus" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Visitor Friendly' : 'เป็นมิตรกับผู้มาเยือน'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Simple, practical guidance for foreign visitors in Ayutthaya'
                : 'คำแนะนำที่เหมาะสมและเป็นประโยชน์สำหรับชาวต่างชาติ'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
            <GuideIcon name="book" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-medium text-[#681B16]">
              {isEnglish ? 'Continue Learning' : 'เรียนรู้และฝึกต่อ'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Explore meditation audio and practical visitor information'
                : 'ฟังเสียงนำสมาธิและดูข้อมูลสำหรับการมาเยือน'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
