import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { MeditationMark } from '../components/MeditationMark'
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
  source_reference: string | null
  content_status: 'draft' | 'published' | 'archived'
  verification_status: 'unverified' | 'verified'
  is_published: boolean
  qa_translations: QATranslationRow[]
}

export function QAPage() {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
        .select(`id, category, source_reference, content_status, verification_status, is_published, qa_translations (language_code, question, short_answer, detailed_answer)`)
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (dbError) throw dbError
      setItems((data as QAItemRow[]) ?? [])
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

  const normalizedSearch = searchQuery.toLocaleLowerCase(currentLang)
  const filteredItems = availableItems.filter(({ translation }) => {
    if (!normalizedSearch) return true
    return `${translation.question} ${translation.short_answer} ${translation.detailed_answer ?? ''}`.toLocaleLowerCase(currentLang).includes(normalizedSearch)
  })

  const selected = filteredItems.find(entry => entry.item.id === selectedId) ?? filteredItems[0]

  return (
    <div className="space-y-6 break-words [overflow-wrap:anywhere]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-[#a34e39]">{t('qa.heroTag')}</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#30342d] sm:text-5xl">{t('qa.title')}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625b50]">{t('qa.subtitle')}</p>
        </div>
        <VisitorBackLink />
      </header>

      <div className="flex min-h-14 overflow-hidden rounded-[1.15rem] border border-white/50 bg-[#eadbc1]/88 shadow-[0_12px_30px_rgba(73,61,45,.08)] backdrop-blur-md">
        <span className="grid w-14 shrink-0 place-items-center text-[#a94732]" aria-hidden="true">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth="1.8" /><path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
        <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} aria-label={t('qa.searchPlaceholder')} placeholder={t('qa.searchPlaceholder')} className="min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-[#30342d] outline-none placeholder:text-[#756d61]" />
        {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="px-3 text-xs font-bold text-[#8e3d2d]">{t('qa.clearSearch')}</button>}
        <button type="button" className="m-1.5 min-w-24 rounded-xl bg-[#a94732] px-4 text-sm font-bold text-white">{t('nav.qa')}</button>
      </div>

      {isLoading && <div role="status" aria-label={t('qa.loading')} className="flex min-h-72 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[#a94732]/20 border-t-[#a94732]" /></div>}

      {!isLoading && error && (
        <div className="rounded-[1.5rem] border border-red-900/15 bg-[#f2d9cf]/80 p-7 text-center">
          <p role="alert" className="font-semibold text-[#812e24]">{error}</p>
          <button type="button" onClick={() => void fetchQAItems()} className="mt-4 min-h-11 rounded-full bg-[#a94732] px-5 text-sm font-bold text-white">{t('qa.retry')}</button>
        </div>
      )}

      {!isLoading && !error && availableItems.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/45 bg-white/28 p-10 text-center text-[#625b50]">{t('qa.empty')}</div>
      )}

      {!isLoading && !error && availableItems.length > 0 && filteredItems.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/45 bg-white/28 p-10 text-center">
          <h2 className="font-bold text-[#30342d]">{t('qa.noResults')}</h2>
          <button type="button" onClick={() => setSearchQuery('')} className="mt-4 min-h-11 rounded-full bg-[#a94732] px-5 text-sm font-bold text-white">{t('qa.clearSearch')}</button>
        </div>
      )}

      {!isLoading && !error && selected && (
        <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <section className="rounded-[1.5rem] border border-white/45 bg-[#eadbc1]/88 p-5 shadow-[0_16px_42px_rgba(73,61,45,.08)] backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#6b5c48]/15 pb-4">
              <h2 className="font-serif text-xl font-bold text-[#30342d]">{t('qa.listTitle')}</h2>
              <span aria-live="polite" className="text-[.65rem] text-[#6b6255]">{filteredItems.length} {t('qa.itemCount', { count: filteredItems.length })}</span>
            </div>
            <div className="divide-y divide-[#6b5c48]/14">
              {filteredItems.map(({ item, translation }) => (
                <button key={item.id} type="button" aria-pressed={item.id === selected.item.id} onClick={() => setSelectedId(item.id)} className={`grid w-full grid-cols-[1fr_auto] gap-4 py-5 text-left transition-colors ${item.id === selected.item.id ? 'text-[#8e3d2d]' : 'text-[#30342d] hover:text-[#8e3d2d]'}`}>
                  <span><strong className="block text-sm leading-6">{translation.question}</strong><small className="mt-1 block text-[.65rem] text-[#6b6255]">{item.category}</small></span>
                  <span aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>

          <article className="relative isolate min-h-[30rem] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#2c362b,#3b4738)] p-6 text-[#fff4df] shadow-[0_24px_60px_rgba(49,55,43,.18)] sm:p-8">
            <MeditationMark className="pointer-events-none absolute -bottom-44 -right-24 -z-10 w-[26rem] text-white/13" />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#efd070] px-3 py-1.5 text-[.65rem] font-bold text-[#4b422e]">
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="m8 12 2.5 2.5L16 9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {currentLang === 'th' ? 'ผ่านการตรวจแล้ว' : 'Reviewed'}
            </span>
            <h2 className="mt-5 max-w-2xl font-serif text-3xl font-bold leading-[1.2] tracking-[-.025em] sm:text-4xl">{selected.translation.question}</h2>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#fff4df]/90">{selected.translation.short_answer}</p>
            {selected.translation.detailed_answer && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#fff4df]/72">{selected.translation.detailed_answer}</p>}
            <div className="mt-8 border-t border-white/15 pt-5 text-xs text-[#fff4df]/55">
              <strong className="block text-[#fff4df]/75">{t('qa.sourceRef')}</strong>
              <span className="mt-1 block">{selected.item.source_reference || (currentLang === 'th' ? 'ข้อมูลอ้างอิงอยู่ระหว่างจัดเตรียม' : 'Reference details pending')}</span>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}
