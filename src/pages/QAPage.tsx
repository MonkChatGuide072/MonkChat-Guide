import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { supabaseClient } from '../lib/supabase'
import { VisitorBackLink } from '../components/VisitorBackLink'

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
    { key: 'All', label: isEnglish ? 'All Questions' : 'คำถามทั้งหมด', icon: '🪷' },
    { key: 'Meditation', label: isEnglish ? 'Meditation' : 'สมาธิ', icon: '🧘' },
    { key: 'Buddhism', label: isEnglish ? 'Buddhism' : 'พระพุทธศาสนา', icon: '☸️' },
    { key: 'Visiting', label: isEnglish ? 'Visiting' : 'การมาเยือน', icon: '🏛️' },
    { key: 'Monk Chat', label: isEnglish ? 'Monk Chat' : 'Monk Chat', icon: '💬' },
    { key: 'Etiquette', label: isEnglish ? 'Etiquette' : 'มารยาทในวัด', icon: '🙏' },
  ]

  return (
    <div className="space-y-10 pb-6 break-words [overflow-wrap:anywhere]">
      {/* 1. HERO BANNER */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#EADCC6] bg-[#FFF8EE] shadow-[0_16px_40px_rgba(104,27,22,0.12)]">
        <div className="absolute inset-0 -z-20">
          <img
            src="/images/home/monkchat-slide-2.webp"
            alt="Ayutthaya ruins and monks"
            className="h-full w-full object-cover object-[center_35%] opacity-100"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,248,238,0.96)_0%,rgba(255,248,238,0.84)_50%,rgba(255,248,238,0.3)_100%)]"
        />

        <div className="relative z-10 px-4 py-10 text-center sm:px-12 sm:py-16">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B77A24]/20 text-[#A43D1D] ring-1 ring-[#EFD070]/30">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>

          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#A43D1D]">
            {t('qa.heroTag')}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-[#681B16] drop-shadow-sm sm:text-5xl">
            {t('qa.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-[#4A3B32] sm:text-lg sm:leading-7">
            {t('qa.subtitle')}
          </p>

          <div className="mt-6 flex justify-center">
            <VisitorBackLink />
          </div>

          {/* Search Bar Embedded in Hero */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex min-h-12 items-center rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-1.5 shadow-md">
              <span className="grid w-11 shrink-0 place-items-center text-[#A43D1D]" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
                  <path d="m16 16 4 4" strokeWidth={1.8} strokeLinecap="round" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                aria-label={t('qa.searchPlaceholder')}
                placeholder={t('qa.searchPlaceholder')}
                className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#30251E] outline-none placeholder:text-[#7D6B5D] sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs font-bold text-[#A43D1D] hover:underline"
                >
                  {t('qa.clearSearch')}
                </button>
              )}
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#8E3317]"
              >
                {isEnglish ? 'Search' : 'ค้นหา'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS */}
      <section aria-label="Question categories" className="overflow-x-auto pb-1">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#A43D1D] text-white shadow-xs'
                    : 'border border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] hover:bg-[#FDF4E3]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. MAIN 2-COLUMN SECTION: FAQ ACCORDION + ASK MONKCHAT */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Frequently Asked Questions Accordion */}
        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#681B16] sm:text-3xl">
              {isEnglish ? 'Frequently Asked Questions' : 'คำถามที่พบบ่อย'}
            </h2>
            <p className="text-xs text-[#7D6B5D] sm:text-sm">
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
                className="mt-3 min-h-10 rounded-xl bg-[#A43D1D] px-5 text-xs font-bold text-white"
              >
                {t('qa.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && availableItems.length === 0 && (
            <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center text-xs text-[#7D6B5D]">
              {t('qa.empty')}
            </div>
          )}

          {!isLoading && !error && availableItems.length > 0 && filteredItems.length === 0 && (
            <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-8 text-center">
              <h2 className="font-serif text-base font-bold text-[#681B16]">{t('qa.noResults')}</h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 min-h-9 rounded-xl bg-[#A43D1D] px-4 text-xs font-bold text-white hover:bg-[#8E3317]"
              >
                {t('qa.clearSearch')}
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
                    className="overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] shadow-2xs transition hover:border-[#D5BD94]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between p-4 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 pr-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FDF4E3] text-[#A43D1D] text-xs font-bold">
                          {item.category.toLowerCase().includes('meditation') ? '🪷' : '☸️'}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-[#681B16] sm:text-base">
                          {translation.question}
                        </h3>
                      </div>
                      <span className="text-sm font-bold text-[#A43D1D]">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#EADCC6]/80 bg-[#FAF2E6]/50 p-4 pt-3 text-xs leading-6 text-[#4A3B32] sm:text-sm">
                        <p className="font-medium">{translation.short_answer}</p>
                        {translation.detailed_answer && (
                          <p className="mt-2 text-xs text-[#5A4B40] whitespace-pre-wrap">
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
          <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#681B16]">
                  {isEnglish ? 'Ask MonkChat' : 'ถาม MonkChat'}
                </h3>
                <p className="text-xs text-[#7D6B5D]">
                  {isEnglish
                    ? 'Your friendly guide for meditation, Buddhism, and visiting Ayutthaya'
                    : 'คู่มือคำถาม-คำตอบเกี่ยวกับสมาธิ พระพุทธศาสนา และอยุธยา'}
                </p>
              </div>
            </div>

            {/* Use the same published Q&A as the FAQ, never a fabricated demo reply. */}
            <div className="mt-4 space-y-3 rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-3.5">
              {featuredQuestion ? <>
                <p className="ml-auto max-w-[90%] rounded-xl border border-[#EADCC6] bg-[#FDF4E3] px-3.5 py-2 text-sm font-semibold text-[#681B16]">{featuredQuestion.question}</p>
                <p className="rounded-xl border border-[#EADCC6] bg-[#FFFDF7] p-3 text-sm leading-7 text-[#4A3B32]">{featuredQuestion.short_answer}</p>
              </> : <p className="text-sm text-[#5A4B40]">{isLoading ? t('qa.loading') : error ? t('qa.errorLoad') : t('qa.empty')}</p>}
            </div>

            {/* Quick Action Suggestions */}
            <div className="mt-4 space-y-2">
              <Link
                to="/meditation"
                className="flex items-center justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE] px-4 py-2.5 text-xs font-bold text-[#681B16] transition hover:bg-[#FDF4E3]"
              >
                <span className="flex items-center gap-2">
                  <span>▷</span>
                  <span>{isEnglish ? 'Try a guided meditation' : 'ลองฝึกสมาธิตามเสียงนำ'}</span>
                </span>
                <span>→</span>
              </Link>
              <Link
                to="/meditation#meditation-supplementary"
                className="flex items-center justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE] px-4 py-2.5 text-xs font-bold text-[#681B16] transition hover:bg-[#FDF4E3]"
              >
                <span className="flex items-center gap-2">
                  <span>📖</span>
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
            <span>💬</span>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#681B16]">
              {isEnglish ? 'Meditation Questions' : 'คำถามเรื่องสมาธิ'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Get clear, respectful answers about meditation and Buddhism'
                : 'คำตอบที่เข้าใจง่ายและถูกต้องเกี่ยวกับสมาธิและพระพุทธศาสนา'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
            <span>🪷</span>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#681B16]">
              {isEnglish ? 'Visitor Friendly' : 'เป็นมิตรกับผู้มาเยือน'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
              {isEnglish
                ? 'Simple, practical guidance for foreign visitors in Ayutthaya'
                : 'คำแนะนำที่เหมาะสมและเป็นประโยชน์สำหรับชาวต่างชาติ'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF4E3] text-[#A43D1D]">
            <span>🛡️</span>
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#681B16]">
              {isEnglish ? 'Continue Learning' : 'เรียนรู้และฝึกต่อ'}
            </h3>
            <p className="mt-1 text-xs text-[#7D6B5D]">
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
