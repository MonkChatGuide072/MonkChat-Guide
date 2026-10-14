import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { assistantCopy } from '../../locales/monkAssistant'

interface Source { id: string; title: string; reference: string | null }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[] }

export function AdminAssistantPage() {
  const { session } = useAuth()
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language).startsWith('en') ? 'en' : 'th'
  const copy = assistantCopy[language]
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const asked = question.trim()
    if (!asked || busy || !session?.access_token) return
    setBusy(true)
    setError('')
    setQuestion('')
    const previous = messages.slice(-4).map(({ role, content }) => ({ role, content }))
    setMessages(items => [...items, { role: 'user', content: asked }])
    try {
      const response = await fetch('/api/monk-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ question: asked, language, history: previous }),
      })
      const data = await response.json() as { answer?: string; sources?: Source[]; error?: string }
      if (!response.ok || !data.answer) throw new Error(data.error || 'service_unavailable')
      setMessages(items => [...items, { role: 'assistant', content: data.answer!, sources: data.sources }])
    } catch (cause) {
      setError(cause instanceof Error && cause.message === 'service_unavailable' ? copy.limit : copy.error)
      setQuestion(asked)
      setMessages(items => items.slice(0, -1))
    } finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-3xl space-y-6 pb-12">
    <header className="rounded-3xl bg-[#293029] px-5 py-7 text-white sm:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-[#eec590]">MonkChat Guide · AI</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{copy.intro}</p>
    </header>
    <p className="rounded-2xl border border-[#ddc492] bg-[#fff4d9] p-4 text-sm leading-6 text-[#594525]">{copy.review}</p>
    <div className="min-h-44 space-y-4" aria-live="polite">
      {messages.length === 0 && <p className="rounded-2xl border border-[#ded3c3] bg-white p-6 text-sm text-[#5d6058]">{copy.empty}</p>}
      {messages.map((item, index) => <article key={index} className={`rounded-2xl border p-5 ${item.role === 'user' ? 'ml-4 border-[#d5dace] bg-[#eef1e7]' : 'mr-4 border-[#ded3c3] bg-white'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#91402b]">{item.role === 'user' ? copy.question : copy.answer}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#293029]">{item.content}</p>
        {item.sources && item.sources.length > 0 && <div className="mt-4 border-t border-[#e6ddcf] pt-3 text-xs leading-5 text-[#5d6058]">
          <p className="font-bold">{copy.sources}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{item.sources.map(source => <li key={source.id}><Link className="underline underline-offset-2" to="/qa">{source.title}</Link>{source.reference ? ` — ${source.reference}` : ''}</li>)}</ul>
        </div>}
      </article>)}
      {busy && <p role="status" className="text-sm text-[#5d6058]">{copy.working}</p>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <form onSubmit={event => void ask(event)} className="rounded-2xl border border-[#ded3c3] bg-white p-4 shadow-sm">
      <label className="sr-only" htmlFor="assistant-question">{copy.placeholder}</label>
      <textarea id="assistant-question" required minLength={2} maxLength={600} rows={3} value={question}
        onChange={event => setQuestion(event.target.value)} placeholder={copy.placeholder}
        className="min-h-24 w-full resize-y rounded-xl border border-[#ded3c3] p-3 text-sm outline-none focus:border-[#a86100]" />
      <div className="mt-3 flex justify-end"><button type="submit" disabled={busy || !question.trim()}
        className="min-h-11 rounded-full bg-[#293029] px-6 text-sm font-bold text-white disabled:opacity-50">{copy.ask}</button></div>
    </form>
  </div>
}
