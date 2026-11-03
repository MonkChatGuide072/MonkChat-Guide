import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { assistantCopy } from '../../locales/monkAssistant'

interface Source { id: string; title: string; reference: string | null }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[]; hasApprovedContext?: boolean }

export function AdminAssistantPage() {
  const { session } = useAuth()
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language).startsWith('en') ? 'en' : 'th'
  const copy = assistantCopy[language]
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    requestId.current += 1
    activeRequest.current?.abort()
    setMessages([])
    setQuestion('')
    setError('')
    setBusy(false)
    return () => {
      requestId.current += 1
      activeRequest.current?.abort()
    }
  }, [language, session?.user.id])

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const asked = question.trim()
    if (asked.length < 2 || asked.length > 600 || busy || !session?.access_token) return
    const id = ++requestId.current
    const controller = new AbortController()
    activeRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 45000)
    setBusy(true)
    setError('')
    setQuestion('')
    const previous = messages.slice(-4).map(({ role, content }) => ({ role, content: content.slice(0, 1000) }))
    setMessages(items => [...items, { role: 'user', content: asked }])
    try {
      const response = await fetch('/api/monk-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ question: asked, language, history: previous }),
        signal: controller.signal,
      })
      const data = await response.json() as { answer?: string; sources?: Source[]; error?: string; hasApprovedContext?: boolean }
      if (!response.ok || typeof data.answer !== 'string' || !data.answer.trim()) throw new Error(data.error || 'service_unavailable')
      if (requestId.current !== id) return
      const sources = Array.isArray(data.sources) ? data.sources.filter(source => source && typeof source.id === 'string' && typeof source.title === 'string' && (source.reference === null || typeof source.reference === 'string')) : []
      setMessages(items => [...items, { role: 'assistant', content: data.answer!.trim(), sources, hasApprovedContext: data.hasApprovedContext ?? sources.length > 0 }])
    } catch (cause) {
      if (requestId.current !== id) return
      const reason = cause instanceof Error ? cause.message : ''
      setError(reason === 'unauthorized' ? copy.unauthorized : reason === 'forbidden' ? copy.forbidden : reason === 'service_unavailable' ? copy.limit : copy.error)
      setQuestion(asked)
      setMessages(items => items.slice(0, -1))
    } finally {
      clearTimeout(timeout)
      if (requestId.current === id) {
        activeRequest.current = null
        setBusy(false)
      }
    }
  }

  return <div className="mx-auto max-w-3xl space-y-6 pb-12">
    <header className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900">
      <p className="text-sm text-neutral-600">MonkChat Guide</p>
      <h1 className="mt-3 text-2xl font-medium sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{copy.intro}</p>
    </header>
    <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-[#594525]">{copy.review}</p>
    <div className="space-y-4" aria-live="polite">
      {messages.length === 0 && <p className="rounded-2xl border border-[#ded3c3] bg-white p-6 text-sm text-[#5d6058]">{copy.empty}</p>}
      {messages.map((item, index) => <article key={index} className={`rounded-2xl border p-5 ${item.role === 'user' ? 'ml-4 border-neutral-200 bg-neutral-100' : 'mr-4 border-[#ded3c3] bg-white'}`}>
        <h2 className="text-sm font-medium text-brand-maroon">{item.role === 'user' ? copy.question : copy.answer}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#293029]">{item.content}</p>
        {item.role === 'assistant' && !item.hasApprovedContext && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-[#594525]">{copy.noSource}</p>}
        {item.sources && item.sources.length > 0 && <div className="mt-4 border-t border-[#e6ddcf] pt-3 text-sm leading-6 text-[#5d6058]">
          <p className="font-medium">{copy.sources}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{item.sources.map(source => <li key={source.id}><Link className="underline underline-offset-2" to="/qa">{source.title}</Link>{source.reference ? ` — ${source.reference}` : ''}</li>)}</ul>
        </div>}
      </article>)}
      {busy && <p role="status" className="text-sm text-[#5d6058]">{copy.working}</p>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <form onSubmit={event => void ask(event)} className="rounded-2xl border border-[#ded3c3] bg-white p-4">
      <label className="mb-2 block text-sm font-medium" htmlFor="assistant-question">{copy.question}</label>
      <textarea id="assistant-question" required minLength={2} maxLength={600} rows={3} value={question}
        onChange={event => setQuestion(event.target.value)} placeholder={copy.placeholder}
        className="min-h-24 w-full resize-y rounded-xl border border-[#ded3c3] p-3 text-sm outline-none focus:border-[#a86100]" />
      <div className="mt-3 flex justify-end"><button type="submit" disabled={busy || !question.trim()}
        className="min-h-11 rounded-lg bg-brand-terracotta transition-colors hover:bg-brand-terracotta-dark px-6 text-sm font-medium text-white disabled:opacity-50">{copy.ask}</button></div>
    </form>
  </div>
}
