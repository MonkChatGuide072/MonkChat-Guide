import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { matchReviewedQuestion, type ReviewedQuestion } from '../lib/qaMatch'
import { reviewedChatbotCopy } from '../locales/monkAssistant'
import { GuideIcon } from './GuideIcon'

interface QATranslationRow {
  language_code: string
  question: string
  short_answer: string
  detailed_answer: string | null
}

interface QAItemRow {
  id: string
  qa_translations: QATranslationRow[]
}

interface Message {
  role: 'visitor' | 'bot'
  text: string
}

export function ChatbotServiceCard() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language).startsWith('en') ? 'en' : 'th'
  const copy = reviewedChatbotCopy[language]
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (isOpen) closeRef.current?.focus()
    else if (wasOpen.current) triggerRef.current?.focus()
    wasOpen.current = isOpen
  }, [isOpen])

  return <aside className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] text-brand-text sm:bottom-6 sm:right-6" aria-label={copy.serviceTitle}>
    {isOpen ? <section id="reviewed-chatbot-panel" aria-labelledby="reviewed-chatbot-title" onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false) }} className="flex max-h-[min(78dvh,42rem)] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-[0_8px_24px_rgba(0,0,0,.12)]">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-border px-4 py-4">
        <div><p className="text-xs leading-5 text-brand-muted">{language === 'en' ? 'Ayutthaya Monk Chat' : 'อยุธยา มังค์แชท'}</p><h2 id="reviewed-chatbot-title" className="mt-1 text-base font-medium text-brand-maroon">{copy.serviceTitle}</h2></div>
        <button ref={closeRef} type="button" onClick={() => setIsOpen(false)} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-brand-muted transition-colors duration-150 hover:bg-brand-gold-soft" aria-label={copy.close}><GuideIcon name="close" /></button>
      </div>
      <ReviewedChatbot key={language} language={language} />
    </section> : <button ref={triggerRef} type="button" aria-label={copy.serviceTitle} aria-expanded={false} aria-controls="reviewed-chatbot-panel" onClick={() => setIsOpen(true)}
      className="ml-auto flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-left text-brand-maroon shadow-[0_4px_16px_rgba(0,0,0,.08)] transition-colors duration-150 hover:bg-brand-gold-soft">
      <GuideIcon name="chat" />
      <span className="min-w-0"><strong className="block text-sm font-medium">{copy.serviceTitle}</strong><small className="mt-1 hidden text-xs text-brand-muted sm:block">{copy.serviceDescription}</small></span>
    </button>}
  </aside>
}

function ReviewedChatbot({ language }: { language: 'th' | 'en' }) {
  const copy = reviewedChatbotCopy[language]
  const [questions, setQuestions] = useState<ReviewedQuestion[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    setError(false)
    if (!supabaseClient) {
      setError(true)
      setIsLoading(false)
      return
    }
    try {
      const { data, error: loadError } = await supabaseClient
        .from('qa_items')
        .select('id, qa_translations(language_code, question, short_answer, detailed_answer)')
        .eq('content_status', 'published')
        .eq('verification_status', 'verified')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (loadError) throw loadError
      const available = ((data as QAItemRow[]) ?? []).flatMap(item => {
        const translation = item.qa_translations.find(row => row.language_code === language)
        if (!translation?.question || !translation.short_answer) return []
        return [{
          id: item.id,
          question: translation.question,
          shortAnswer: translation.short_answer,
          detailedAnswer: translation.detailed_answer,
        }]
      })
      setQuestions(available)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [language])

  useEffect(() => { void loadQuestions() }, [loadQuestions])

  function sendQuestion(value: string) {
    const asked = value.trim()
    if (!asked || isLoading || error || questions.length === 0) return
    const matched = matchReviewedQuestion(asked, questions, language)
    setMessages(previous => [
      ...previous,
      { role: 'visitor', text: asked },
      matched
        ? {
            role: 'bot',
            text: matched.shortAnswer + (matched.detailedAnswer ? '\n\n' + matched.detailedAnswer : ''),
          }
        : { role: 'bot', text: copy.noMatch },
    ])
    setDraft('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendQuestion(draft)
  }

  return <div className="space-y-3 overflow-y-auto overscroll-contain p-3 text-sm break-words [overflow-wrap:anywhere]" tabIndex={0}>
    {isLoading && <p role="status" className="rounded-xl bg-brand-surface p-5 text-sm">{copy.loading}</p>}
    {!isLoading && error && <div role="alert" className="rounded-xl bg-brand-surface p-5 text-sm">
      <p>{copy.error}</p>
      <button type="button" onClick={() => void loadQuestions()} className="mt-3 min-h-11 rounded-lg bg-brand-terracotta px-5 font-medium text-white">{copy.retry}</button>
    </div>}
    {!isLoading && !error && questions.length === 0 && <p className="rounded-xl bg-brand-surface p-5 text-sm">{copy.noQuestions}</p>}

    {!isLoading && !error && questions.length > 0 && <>
      <section aria-label={copy.suggestions} className="rounded-xl border border-brand-border bg-white p-3">
        <h2 className="text-sm font-medium text-brand-text">{copy.suggestions}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.slice(0, 6).map(item => <button key={item.id} type="button" onClick={() => sendQuestion(item.question)}
            className="min-h-11 rounded-lg border border-brand-border px-3 py-2 text-left text-sm leading-6 text-brand-text hover:bg-brand-gold-soft">{item.question}</button>)}
        </div>
      </section>

      <section aria-label={copy.conversation} aria-live="polite" className="space-y-3">
        {messages.length === 0 && <p className="rounded-xl border border-brand-border bg-white p-3 text-xs text-brand-muted">{copy.empty}</p>}
        {messages.map((message, index) => <article key={index} className={'rounded-xl border p-3 ' + (message.role === 'visitor'
          ? 'ml-4 border-brand-border bg-brand-gold-soft' : 'mr-4 border-brand-border bg-white')}>
          <h2 className="text-xs font-medium text-brand-maroon">{message.role === 'visitor' ? copy.question : copy.answer}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-text">{message.text}</p>
        </article>)}
      </section>

      <form onSubmit={submit} className="rounded-xl border border-brand-border bg-white p-3 shadow-sm">
        <label htmlFor="chatbot-question" className="block text-sm font-medium text-brand-text">{copy.placeholder}</label>
        <textarea id="chatbot-question" required minLength={2} maxLength={280} rows={2} value={draft}
          onChange={event => setDraft(event.target.value)}
          className="mt-2 min-h-16 w-full resize-y rounded-lg border border-brand-border p-3 text-sm focus:border-[#a86100]" />
        <div className="mt-3 flex justify-end"><button type="submit" disabled={!draft.trim()}
          className="min-h-11 rounded-lg bg-brand-terracotta px-6 text-sm font-medium text-white disabled:opacity-50">{copy.ask}</button></div>
      </form>
    </>}
  </div>
}
