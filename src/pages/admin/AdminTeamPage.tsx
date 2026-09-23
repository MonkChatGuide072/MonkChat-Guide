import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface Member { id: string; display_name: string; role: 'owner' | 'team_member'; is_active: boolean }
const buttonClass = 'min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50'
const inputClass = 'mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm'

async function requestTeam(body: Record<string, unknown>) {
  if (!supabaseClient) throw new Error('serviceUnavailable')
  const { data, error } = await supabaseClient.functions.invoke('team-management', { body })
  if (error) {
    let code = 'serviceUnavailable'
    if ('context' in error && error.context instanceof Response) {
      try {
        const response = await error.context.json()
        if (['createFailed', 'partialCreate'].includes(response.code)) code = response.code
      } catch { /* Keep the localized generic message. */ }
    }
    throw new Error(code)
  }
  if (!data || data.code) throw new Error('serviceUnavailable')
  return data as { profiles?: Member[]; profile?: Member }
}

export function AdminTeamPage() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const owner = profile?.role === 'owner' && profile.is_active
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [editing, setEditing] = useState<Member | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    if (!owner) { setLoading(false); return }
    setLoading(true); setError(''); setReady(false)
    try {
      const data = await requestTeam({ action: 'list' })
      if (!Array.isArray(data.profiles)) throw new Error()
      setMembers(data.profiles); setReady(true)
    } catch { setError('management.serviceUnavailable') } finally { setLoading(false) }
  }, [owner])
  useEffect(() => { void load() }, [load])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!owner || busy || !ready || !editing) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const display_name = String(form.get('display_name') ?? '').trim()
    if (!display_name || display_name.length > 80) { setError('management.memberInvalid'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const body = editing === 'new'
        ? { action: 'create', display_name, email: String(form.get('email') ?? '').trim(), password: String(form.get('password') ?? '') }
        : { action: 'update', id: editing.id, display_name, is_active: form.get('is_active') === 'on' }
      const { profile: saved } = await requestTeam(body)
      if (!saved) throw new Error('serviceUnavailable')
      formElement.reset()
      setMembers(current => [...current.filter(member => member.id !== saved.id), saved])
      setEditing(null); setNotice('management.saved')
    } catch (cause) {
      const code = cause instanceof Error && ['createFailed','partialCreate','serviceUnavailable'].includes(cause.message) ? cause.message : 'error'
      setError(`management.${code}`)
      if (code === 'partialCreate') { formElement.reset(); setEditing(null) }
    } finally { setBusy(false) }
  }

  if (!owner) return <p role="alert">{t('admin.accessDeniedTitle')}</p>
  const selected = editing && editing !== 'new' ? editing : null
  return (
    <div className="mx-auto max-w-4xl space-y-5 [overflow-wrap:anywhere]">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h1 className="text-2xl font-bold text-[#11223C]">{t('management.teamTitle')}</h1><p className="mt-2 text-sm text-slate-600">{t('management.teamDescription')}</p><p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t('management.teamNote')}</p></header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800"><p>{t(error)}</p><button type="button" onClick={load} disabled={busy} className={buttonClass}>{t('management.retry')}</button></div>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{t(notice)}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={!ready || busy || loading} onClick={() => { setEditing('new'); setError(''); setNotice('') }} className={buttonClass}>{t('management.addMember')}</button><button type="button" disabled={busy || loading} onClick={load} className={buttonClass}>{t('management.refresh')}</button></div>
      {editing && <form key={selected?.id ?? 'new'} onSubmit={save} className="rounded-2xl border border-amber-200 bg-white p-5"><fieldset disabled={busy || !ready} className="space-y-4">
        <label className="block text-sm font-semibold">{t('management.name')}<input name="display_name" required maxLength={80} defaultValue={selected?.display_name ?? ''} className={inputClass} /></label>
        {!selected && <><label className="block text-sm font-semibold">{t('management.email')}<input name="email" type="email" required maxLength={254} autoComplete="off" className={inputClass} /></label><label className="block text-sm font-semibold">{t('management.password')}<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={inputClass} /></label><p className="text-sm text-slate-600">{t('management.passwordNote')}</p></>}
        {selected && <label className="flex min-h-11 items-center gap-3 text-sm"><input name="is_active" type="checkbox" defaultChecked={selected.is_active} />{t('management.active')}</label>}
        <div className="flex flex-wrap gap-3"><button type="submit" className={`${buttonClass} bg-[#11223C] text-white`}>{t(busy ? 'management.saving' : 'management.save')}</button><button type="button" className={buttonClass} onClick={() => setEditing(null)}>{t('management.cancel')}</button></div>
      </fieldset></form>}
      {loading ? <p role="status">{t('management.loading')}</p> : ready && <ul className="grid gap-3 sm:grid-cols-2">{members.map(member => <li key={member.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5"><div className="min-w-0"><h2 className="font-semibold">{member.display_name}</h2><p className="mt-1 text-sm text-slate-600">{t(member.role === 'owner' ? 'management.owner' : 'management.member')} · {t(member.is_active ? 'management.active' : 'management.inactive')}</p></div>{member.role !== 'owner' && member.id !== profile.id && <button type="button" disabled={busy} onClick={() => { setEditing(member); setError(''); setNotice('') }} className={buttonClass} aria-label={`${t('management.edit')} ${member.display_name}`}>{t('management.edit')}</button>}</li>)}</ul>}
      {ready && !loading && members.length === 0 && <p>{t('management.empty')}</p>}
    </div>
  )
}
