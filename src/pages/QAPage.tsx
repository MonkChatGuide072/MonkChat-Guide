import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { CURATED_VISITOR_QA_ITEMS } from '../content/visitorCuratedQA'
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
      setItems(CURATED_VISITOR_QA_ITEMS as QAItemRow[])
      setOpenIds(new Set([CURATED_VISITOR_QA_ITEMS[0].id]))
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
      if (loadedItems.length > 0) {
        setItems(loadedItems)
        setOpenIds(new Set(loadedItems[0] ? [loadedItems[0].id] : []))
      } else {
        setItems(CURATED_VISITOR_QA_ITEMS as QAItemRow[])
        setOpenIds(new Set([CURATED_VISITOR_QA_ITEMS[0].id]))
      }
    } catch {
      setItems(CURATED_VISITOR_QA_ITEMS as QAItemRow[])
      setOpenIds(new Set([CURATED_VISITOR_QA_ITEMS[0].id]))
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  const categories = [
    { key: 'All', label: isEnglish ? 'All Questions' : 'คำถามทั้งหมด', icon: 'question' },
    { key: 'Meditation', label: isEnglish ? 'Meditation' : 'สมาธิ', icon: 'lotus' },
    { key: 'Buddhism', label: isEnglish ? 'Buddhism' : 'พระพุทธศาสนา', icon: 'book' },
    { key: 'Visiting', label: isEnglish ? 'Visiting' : 'การมาเยือน', icon: 'pin' },
    { key: 'Monk Chat', label: isEnglish ? 'Monk Chat' : 'Monk Chat', icon: 'chat' },
    { key: 'Etiquette', label: isEnglish ? 'Etiquette' : 'มารยาทในวัด', icon: 'check' },
  ]

  const quickPills = [
    { label: isEnglish ? 'How to meditate' : 'วิธีทำสมาธิ', query: isEnglish ? 'meditation' : 'สมาธิ', category: 'Meditation' },
    { label: isEnglish ? 'Dress code' : 'การแต่งกาย', query: isEnglish ? 'dress' : 'แต่งกาย', category: 'Etiquette' },
    { label: isEnglish ? 'Touching monks' : 'การสัมผัสพระสงฆ์', query: isEnglish ? 'touch' : 'สัมผัส', category: 'Buddhism' },
    { label: isEnglish ? 'Monk Chat schedule' : 'เวลา Monk Chat', query: isEnglish ? 'Monk Chat' : 'Monk Chat', category: 'Monk Chat' },
  ]

  // Count items per category
  const getCategoryCount = (catKey: string) => {
    if (catKey === 'All') return availableItems.length
    return availableItems.filter(({ item }) => item.category.toLowerCase().includes(catKey.toLowerCase())).length
  }

  return (
    <div className="relative space-y-12 bg-[#FAF8F5] pb-20 text-stone-800 break-words [overflow-wrap:anywhere]">
      {/* Subtle ambient warm aura at top */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-96 w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.07),transparent_70%)]"
        aria-hidden="true"
      />

      {/* 1. EDITORIAL HERITAGE HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-b from-white via-[#FCFAF8] to-[#F7F2EB] p-6 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(43,24,16,0.05)]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Title, Subtitle, Search, Quick Topic Pills */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-800/20 bg-amber-50/90 px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-900 shadow-2xs">
              <GuideIcon name="chat" className="h-3.5 w-3.5 text-amber-700" />
              <span>{isEnglish ? 'Wat Mahathat · Ayutthaya Monk Chat Heritage' : 'สนทนาธรรม Monk Chat ณ วัดมหาธาตุ พระนครศรีอยุธยา'}</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-brand-maroon leading-[1.18] [text-wrap:balance]">
              {t('qa.title')}
            </h1>

            <p className="mt-3.5 max-w-xl text-base sm:text-[17px] leading-relaxed text-stone-600 [text-wrap:pretty]">
              {t('qa.subtitle')}
            </p>

            {/* Elevated Search Input */}
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                resultsHeadingRef.current?.focus()
              }}
              className="mt-6 flex flex-col gap-3 sm:flex-row max-w-xl"
            >
              <div className="flex min-h-13 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-stone-300/80 bg-white px-4 shadow-[0_2px_10px_rgba(43,24,16,0.03)] focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/25 transition-all">
                <GuideIcon name="search" className="h-4.5 w-4.5 text-stone-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label={t('qa.searchPlaceholder')}
                  placeholder={t('qa.searchPlaceholder')}
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-stone-800 outline-none placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={t('qa.clearSearch')}
                    className="flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                  >
                    <GuideIcon name="close" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-maroon px-7 text-sm sm:text-base font-medium text-white shadow-xs transition-all duration-200 hover:bg-brand-terracotta hover:shadow-md active:scale-[0.98]"
              >
                {isEnglish ? 'Search' : 'ค้นหา'}
              </button>
            </form>

            {/* Quick Topic Chips for Instant Exploration */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-stone-500">{isEnglish ? 'Explore:' : 'หัวข้อยอดนิยม:'}</span>
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(pill.query)
                    setSelectedCategory(pill.category)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white/90 px-3 py-1 text-xs text-stone-700 shadow-2xs transition-all duration-150 hover:border-amber-400 hover:bg-amber-50/70 hover:text-amber-900 cursor-pointer"
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Authentic Exhibition Photo Frame */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-stone-100 shadow-[0_12px_36px_rgba(43,24,16,0.1)]">
              <img
                src="/images/home/monkchat-qa-dialogue.jpg"
                alt={isEnglish ? 'Buddhist monk conversing warmly with foreign visitors under temple trees' : 'พระภิกษุสงฆ์สนทนาธรรมกับชาวต่างชาติอย่างอบอุ่นใต้ร่มไม้'}
                width={640}
                height={420}
                className="h-56 sm:h-72 lg:h-80 w-full object-cover object-[center_32%]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-300">
                  <GuideIcon name="pin" className="h-3.5 w-3.5" />
                  <span>{isEnglish ? 'Wat Mahathat Courtyard · Ayutthaya' : 'ลานธรรมวัดมหาธาตุ อยุธยา'}</span>
                </div>
                <p className="mt-1 text-xs text-stone-200 line-clamp-1">
                  {isEnglish ? 'Daily open exchange between travelers and Buddhist monks' : 'พื้นที่แลกเปลี่ยนวัฒนธรรมและสนทนาธรรมอย่างเป็นกันเอง'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GALLERY CATEGORY PILLS */}
      <section aria-label="Question categories" className="pb-1">
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key
            const count = getCategoryCount(cat.key)
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                aria-pressed={isActive}
                aria-label={cat.label}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-maroon text-white shadow-xs ring-1 ring-brand-maroon/20'
                    : 'border border-stone-200/90 bg-white text-stone-700 hover:border-amber-400/70 hover:bg-amber-50/50 hover:text-brand-maroon shadow-2xs'
                }`}
              >
                <GuideIcon name={cat.icon as GuideIconName} className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    aria-hidden="true"
                    className={`ml-0.5 rounded-full px-2 py-0.2 text-[11px] font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. MAIN 2-COLUMN SECTION: FAQS ACCORDION + MONK CHAT PAVILION COMPANION */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-start">
        {/* Left Column: Frequently Asked Questions */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200/80 pb-3">
            <div>
              <h2
                id="qa-results-heading"
                ref={resultsHeadingRef}
                tabIndex={-1}
                className="scroll-mt-24 font-sans text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl"
              >
                {isEnglish ? 'Frequently asked questions' : 'คำถามที่พบบ่อย'}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {isEnglish ? 'Popular questions from international visitors' : 'ข้อสงสัยที่พบบ่อยจากผู้มาเยือนชาวต่างชาติ'}
              </p>
            </div>
            {filteredItems.length > 0 && (
              <span className="text-xs font-medium text-stone-500">
                {isEnglish ? `${filteredItems.length} question(s)` : `${filteredItems.length} ข้อ`}
              </span>
            )}
          </div>

          {isLoading && (
            <div role="status" aria-label={t('qa.loading')} className="flex min-h-60 items-center justify-center rounded-3xl border border-stone-200 bg-white shadow-2xs">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-600/20 border-t-amber-600" />
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-3xl border border-red-900/15 bg-red-50 p-6 text-center">
              <p role="alert" className="font-semibold text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => void fetchQAItems()}
                className="mt-3 min-h-11 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white shadow-xs"
              >
                {t('qa.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && availableItems.length === 0 && (
            <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500 shadow-2xs">
              {t('qa.empty')}
            </div>
          )}

          {!isLoading && !error && availableItems.length > 0 && filteredItems.length === 0 && (
            <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-2xs">
              <h2 className="font-serif text-base font-semibold text-brand-maroon">{t('qa.noResults')}</h2>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                className="mt-3 min-h-11 rounded-xl bg-brand-maroon px-5 text-sm font-medium text-white hover:bg-brand-terracotta shadow-xs transition-colors"
              >
                {isEnglish ? 'Show all questions' : 'แสดงคำถามทั้งหมด'}
              </button>
            </div>
          )}

          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="space-y-4">
              {filteredItems.map(({ item, translation }) => {
                const isOpen = openIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                      isOpen
                        ? 'border-amber-400/80 bg-white shadow-[0_12px_32px_rgba(43,24,16,0.08)] ring-2 ring-amber-400/20'
                        : 'border-stone-200/90 bg-white shadow-[0_2px_8px_rgba(43,24,16,0.03)] hover:border-amber-400/60 hover:shadow-[0_8px_20px_rgba(43,24,16,0.06)] hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-amber-900 border border-amber-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        {item.category}
                      </span>
                    </div>

                    <h3>
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`qa-answer-${item.id}`}
                        className="group flex min-h-12 w-full cursor-pointer items-start justify-between gap-4 px-5 pb-5 pt-2 sm:px-6 sm:pb-6 sm:pt-2 text-left transition-colors duration-150"
                      >
                        <span className="block font-sans text-base sm:text-[17.5px] font-semibold leading-snug text-stone-900 group-hover:text-amber-800 transition-colors [text-wrap:balance]">
                          {translation.question}
                        </span>
                        <div
                          className={`mt-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            isOpen
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-900'
                          }`}
                        >
                          <GuideIcon
                            name="down"
                            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>
                    </h3>

                    {isOpen && (
                      <div
                        id={`qa-answer-${item.id}`}
                        className="border-t border-amber-200/60 bg-gradient-to-b from-[#FCFAF7] via-[#FBF8F2] to-[#F7F2E7] p-5 sm:p-7 space-y-4"
                      >
                        {/* Direct Monk Insight */}
                        <div className="border-l-4 border-amber-700/80 pl-4 sm:pl-5">
                          <p className="text-base sm:text-[17.5px] font-normal leading-[1.75] text-stone-800 [text-wrap:pretty]">
                            {translation.short_answer}
                          </p>
                        </div>

                        {/* Practical Context & Etiquette Card */}
                        {translation.detailed_answer && (
                          <div className="rounded-xl border border-amber-200/70 bg-white/95 p-4 sm:p-5 shadow-2xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
                              <GuideIcon name="info" className="h-3.5 w-3.5 text-amber-700" />
                              <span>{isEnglish ? 'Helpful Context & Cultural Etiquette' : 'ข้อควรรู้และธรรมเนียมปฏิบัติ'}</span>
                            </p>
                            <p className="text-sm sm:text-[14.5px] leading-relaxed text-stone-600 whitespace-pre-wrap">
                              {translation.detailed_answer}
                            </p>
                          </div>
                        )}

                        {/* Quick Navigation Micro-Link */}
                        <div className="pt-1">
                          {item.category.toLowerCase().includes('meditat') ? (
                            <Link
                              to="/meditation"
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-900 border border-amber-300/40 hover:bg-amber-500/20 transition-colors"
                            >
                              <GuideIcon name="play" className="h-3.5 w-3.5 text-amber-700" />
                              <span>{isEnglish ? 'Try 5-minute guided meditation audio' : 'ฟังเสียงนำสมาธิ 5 นาที'}</span>
                              <span>→</span>
                            </Link>
                          ) : item.category.toLowerCase().includes('etiquette') || item.category.toLowerCase().includes('visit') ? (
                            <Link
                              to="/activities"
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-900 border border-amber-300/40 hover:bg-amber-500/20 transition-colors"
                            >
                              <GuideIcon name="pin" className="h-3.5 w-3.5 text-amber-700" />
                              <span>{isEnglish ? 'View temple etiquette & schedule' : 'ดูตารางเวลาและข้อปฏิบัติในการเยี่ยมชม'}</span>
                              <span>→</span>
                            </Link>
                          ) : (
                            <Link
                              to="/activities"
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-900 border border-amber-300/40 hover:bg-amber-500/20 transition-colors"
                            >
                              <GuideIcon name="chat" className="h-3.5 w-3.5 text-amber-700" />
                              <span>{isEnglish ? 'Learn about daily Monk Chat at Wat Mahathat' : 'ดูข้อมูล Monk Chat วัดมหาธาตุ'}</span>
                              <span>→</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Wat Mahathat Monk Chat Companion */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-[0_8px_24px_rgba(43,24,16,0.04)]">
            <div className="flex items-center gap-3.5 border-b border-stone-200/80 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/60 text-amber-800 shadow-2xs">
                <GuideIcon name="lotus" className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-stone-900">
                  {isEnglish ? 'Daily Monk Chat Pavilion' : 'ลานสนทนาธรรม Monk Chat'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEnglish ? 'Wat Mahathat, Ayutthaya' : 'วัดมหาธาตุ พระนครศรีอยุธยา'}
                </p>
              </div>
            </div>

            {/* Quick Visiting Facts */}
            <div className="mt-5 space-y-3 rounded-2xl border border-amber-200/60 bg-[#FAF7F2] p-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <GuideIcon name="clock" className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800">{isEnglish ? 'Daily Hours: ' : 'เวลาจัดกิจกรรม: '}</span>
                  <span className="text-stone-600">{isEnglish ? '9:00 AM – 5:00 PM' : '09:00 – 17:00 น. ทุกวัน'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <GuideIcon name="pin" className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800">{isEnglish ? 'Location: ' : 'สถานที่: '}</span>
                  <span className="text-stone-600">{isEnglish ? 'Under the Bodhi tree courtyard' : 'ลานต้นโพธิ์ วัดมหาธาตุ'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <GuideIcon name="check" className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800">{isEnglish ? 'Admission: ' : 'ค่าธรรมเนียม: '}</span>
                  <span className="text-stone-600">{isEnglish ? '100% Free · No booking needed' : 'ไม่มีค่าใช้จ่าย · ไม่ต้องจอง'}</span>
                </div>
              </div>
            </div>

            {/* 3 Golden Etiquette Rules */}
            <div className="mt-5 border-t border-stone-200/80 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2.5">
                {isEnglish ? '3 Visiting Etiquette Rules' : '3 ข้อปฏิบัติสำคัญในการเยือน'}
              </p>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">1.</span>
                  <span>{isEnglish ? 'Cover shoulders and knees (modest temple dress).' : 'แต่งกายสุภาพ ปิดหัวไหล่และคลุมเข่า'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">2.</span>
                  <span>{isEnglish ? 'Women maintain physical distance (offerings placed on table).' : 'สตรีเว้นระยะห่างและวางของบนโต๊ะรับประเคน'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-800">3.</span>
                  <span>{isEnglish ? 'Sit mindfully without pointing feet at monks or Buddha images.' : 'นั่งโดยไม่ชี้ปลายเท้าไปยังพระสงฆ์หรือพระพุทธรูป'}</span>
                </li>
              </ul>
            </div>

            {/* Action Links */}
            <div className="mt-6 space-y-2.5">
              <Link
                to="/meditation"
                className="flex min-h-11 items-center justify-between rounded-xl border border-stone-200/90 bg-stone-50 px-4 py-2.5 text-sm font-medium text-brand-maroon transition-all duration-200 hover:bg-amber-50 hover:border-amber-300/60 shadow-2xs group"
              >
                <span className="flex items-center gap-2.5">
                  <GuideIcon name="play" className="h-4 w-4 text-amber-700" />
                  <span>{isEnglish ? 'Try 5-min guided meditation' : 'ลองฝึกสมาธิตามเสียงนำ 5 นาที'}</span>
                </span>
                <span className="text-stone-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber-800">→</span>
              </Link>
              <Link
                to="/activities"
                className="flex min-h-11 items-center justify-between rounded-xl border border-stone-200/90 bg-stone-50 px-4 py-2.5 text-sm font-medium text-brand-maroon transition-all duration-200 hover:bg-amber-50 hover:border-amber-300/60 shadow-2xs group"
              >
                <span className="flex items-center gap-2.5">
                  <GuideIcon name="book" className="h-4 w-4 text-amber-700" />
                  <span>{isEnglish ? 'More Ayutthaya activities' : 'กิจกรรมอื่น ๆ ในอยุธยา'}</span>
                </span>
                <span className="text-stone-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber-800">→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. THREE CULTURAL PILLARS OF MONK CHAT */}
      <section className="grid gap-6 rounded-3xl border border-stone-200/90 bg-white p-6 sm:grid-cols-3 sm:p-8 shadow-[0_4px_24px_rgba(43,24,16,0.03)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 shadow-2xs">
            <GuideIcon name="chat" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-stone-900">
              {isEnglish ? 'Warm, Informal Dialogue' : 'สนทนาอย่างเป็นกันเอง'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {isEnglish
                ? 'No sermons or preaching. Just open, friendly conversations between travelers and student monks.'
                : 'ไม่มีการสั่งสอนหรือเทศนา พื้นที่เปิดกว้างสำหรับแลกเปลี่ยนมุมมองอย่างอบอุ่นและเป็นมิตร'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 shadow-2xs">
            <GuideIcon name="lotus" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-stone-900">
              {isEnglish ? 'Open to All Beliefs' : 'เปิดรับทุกความเชื่อ'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {isEnglish
                ? 'You do not need to be Buddhist. Everyone is welcomed with genuine hospitality and respect.'
                : 'ไม่จำเป็นต้องนับถือพุทธศาสนา ผู้คนทุกศาสนาและทุกวัฒนธรรมได้รับการต้อนรับด้วยไมตรีจิต'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 shadow-2xs">
            <GuideIcon name="book" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-stone-900">
              {isEnglish ? 'Peace You Can Take Home' : 'ความสงบที่นำกลับไปได้'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {isEnglish
                ? 'Take away simple mindfulness and breath-centering practices you can use anywhere in daily life.'
                : 'เรียนรู้วิธีทำสมาธิและวางใจเบา ๆ ที่สามารถนำไปฝึกต่อได้ทุกที่ในชีวิตประจำวัน'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
