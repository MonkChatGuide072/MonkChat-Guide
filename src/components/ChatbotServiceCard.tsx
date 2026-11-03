import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'
import { matchReviewedQuestion, type ReviewedQuestion } from '../lib/qaMatch'
import { reviewedChatbotCopy } from '../locales/monkAssistant'

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
  return <aside className="fixed bottom-4 right-4 z-50 w-[min(25rem,calc(100vw-2rem))] text-[#293029] sm:bottom-6 sm:right-6" aria-label={copy.serviceTitle}>
    {isOpen ? <section id="reviewed-chatbot-panel" className="flex max-h-[min(78dvh,42rem)] flex-col overflow-hidden rounded-3xl border border-[#d5bd94] bg-[#f9f4ea] shadow-[0_20px_70px_rgba(35,43,34,.3)]">
      <div className="flex shrink-0 items-start justify-between gap-3 bg-[#293029] px-4 py-4 text-white">
        <div><p className="text-[.65rem] font-bold uppercase tracking-widest text-[#eec590]">MonkChat Guide</p><h2 className="mt-1 font-serif text-lg font-bold">{copy.serviceTitle}</h2></div>
        <button type="button" onClick={() => setIsOpen(false)} className="min-h-11 min-w-11 rounded-full border border-white/40 text-2xl leading-none" aria-label={copy.close}>×</button>
      </div>
      <ReviewedChatbot key={language} language={language} />
    </section> : <button type="button" aria-label={copy.serviceTitle} aria-expanded={false} aria-controls="reviewed-chatbot-panel" onClick={() => setIsOpen(true)}
      className="ml-auto flex min-h-16 w-full items-center gap-3 rounded-2xl border border-[#d5bd94] bg-[#293029] px-4 py-3 text-left text-white shadow-[0_14px_38px_rgba(35,43,34,.3)] hover:bg-[#354536] sm:w-72">
      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eec590] text-[#293029]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5A2.5 2.5 0 0 1 4 14.5z" strokeLinejoin="round" /><path d="M8 8h8M8 12h6" strokeLinecap="round" /></svg></span>
      <span className="min-w-0"><strong className="block text-sm">{copy.serviceTitle}</strong><small className="mt-1 block text-xs text-white/75">{copy.serviceDescription}</small></span>
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
    {isLoading && <p role="status" className="rounded-2xl bg-white p-5 text-sm">{copy.loading}</p>}
    {!isLoading && error && <div role="alert" className="rounded-2xl bg-white p-5 text-sm">
      <p>{copy.error}</p>
      <button type="button" onClick={() => void loadQuestions()} className="mt-3 min-h-11 rounded-full bg-[#293029] px-5 font-bold text-white">{copy.retry}</button>
    </div>}
    {!isLoading && !error && questions.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm">{copy.noQuestions}</p>}

    {!isLoading && !error && questions.length > 0 && <>
      <section aria-label={copy.suggestions} className="rounded-2xl border border-[#ded3c3] bg-white p-3">
        <h2 className="text-sm font-bold text-[#293029]">{copy.suggestions}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.slice(0, 6).map(item => <button key={item.id} type="button" onClick={() => sendQuestion(item.question)}
            className="min-h-11 rounded-full border border-[#c9b9a2] px-3 py-2 text-left text-xs text-[#293029] hover:bg-[#f6eedf]">{item.question}</button>)}
        </div>
      </section>

      <section aria-label={copy.conversation} aria-live="polite" className="space-y-3">
        {messages.length === 0 && <p className="rounded-2xl border border-[#ded3c3] bg-white p-3 text-xs text-[#5d6058]">{copy.empty}</p>}
        {messages.map((message, index) => <article key={index} className={'rounded-2xl border p-3 ' + (message.role === 'visitor'
          ? 'ml-4 border-[#d5dace] bg-[#eef1e7]' : 'mr-4 border-[#ded3c3] bg-white')}>
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#91402b]">{message.role === 'visitor' ? copy.question : copy.answer}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#293029]">{message.text}</p>
        </article>)}
      </section>

      <form onSubmit={submit} className="rounded-2xl border border-[#ded3c3] bg-white p-3 shadow-sm">
        <label htmlFor="chatbot-question" className="block text-sm font-bold text-[#293029]">{copy.placeholder}</label>
        <textarea id="chatbot-question" required minLength={2} maxLength={280} rows={2} value={draft}
          onChange={event => setDraft(event.target.value)}
          className="mt-2 min-h-16 w-full resize-y rounded-xl border border-[#ded3c3] p-3 text-sm outline-none focus:border-[#a86100]" />
        <div className="mt-3 flex justify-end"><button type="submit" disabled={!draft.trim()}
          className="min-h-11 rounded-full bg-[#293029] px-6 text-sm font-bold text-white disabled:opacity-50">{copy.ask}</button></div>
      </form>
    </>}
  </div>
}
