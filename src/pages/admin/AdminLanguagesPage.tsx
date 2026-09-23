import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

interface Language { code: string; native_name: string; is_active: boolean }
const inputClass = 'mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm'
const buttonClass = 'min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50'

export function AdminLanguagesPage() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const allowed = !!profile?.is_active && ['owner', 'team_member'].includes(profile.role)
  const owner = allowed && profile?.role === 'owner'
  const [rows, setRows] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Language | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(async () => {
    if (!allowed) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      if (!supabaseClient) throw new Error()
      const { data, error } = await supabaseClient.from('languages').select('code,native_name,is_active').order('code')
      if (error) throw error
      setRows(data ?? [])
    } catch { setError('management.error') } finally { setLoading(false) }
  }, [allowed])
  useEffect(() => { void load() }, [load])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!owner || busy || !editing || !supabaseClient) return
    const form = new FormData(event.currentTarget)
    const code = String(form.get('code') ?? '').trim()
    const native_name = String(form.get('native_name') ?? '').trim()
    const is_active = ['th', 'en'].includes(code) || form.get('is_active') === 'on'
    if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(code) || code.length > 35 || !native_name || native_name.length > 80) { setError('management.languageInvalid'); return }
    if (editing === 'new' && rows.some(row => row.code.toLowerCase() === code.toLowerCase())) { setError('management.duplicate'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const request = editing === 'new'
        ? supabaseClient.from('languages').insert({ code, native_name, is_active })
        : supabaseClient.from('languages').update({ native_name, is_active }).eq('code', editing.code)
      const { data, error } = await request.select('code,native_name,is_active').single()
      if (error || !data) throw error ?? new Error()
      setRows(current => [...current.filter(row => row.code !== data.code), data].sort((a, b) => a.code.localeCompare(b.code)))
      setEditing(null); setNotice('management.saved')
    } catch { setError('management.error') } finally { setBusy(false) }
  }

  if (!allowed) return <p role="alert">{t('admin.accessDeniedTitle')}</p>
  const selected = editing && editing !== 'new' ? editing : null
  return (
    <div className="mx-auto max-w-4xl space-y-5 [overflow-wrap:anywhere]">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-bold text-[#11223C]">{t('management.languagesTitle')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('management.languagesDescription')}</p>
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t('management.languageNote')}</p>
      </header>
      {!owner && <p className="text-sm text-slate-600">{t('management.readOnly')}</p>}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800"><p>{t(error)}</p><button type="button" onClick={load} disabled={busy} className={buttonClass}>{t('management.retry')}</button></div>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{t(notice)}</p>}
      <div className="flex flex-wrap gap-3">
        {owner && <button type="button" disabled={busy || loading} onClick={() => { setEditing('new'); setError(''); setNotice('') }} className={buttonClass}>{t('management.addLanguage')}</button>}
        <button type="button" disabled={busy || loading} onClick={load} className={buttonClass}>{t('management.refresh')}</button>
      </div>
      {owner && editing && (
        <form key={selected?.code ?? 'new'} onSubmit={save} className="space-y-4 rounded-2xl border border-amber-200 bg-white p-5">
          <fieldset disabled={busy} className="space-y-4">
            <label className="block text-sm font-semibold">{t('management.code')}<input name="code" required maxLength={35} defaultValue={selected?.code ?? ''} readOnly={!!selected} className={inputClass} /></label>
            <label className="block text-sm font-semibold">{t('management.nativeName')}<input name="native_name" required maxLength={80} defaultValue={selected?.native_name ?? ''} className={inputClass} /></label>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input name="is_active" type="checkbox" defaultChecked={selected?.is_active ?? true} disabled={!!selected && ['th','en'].includes(selected.code)} />{t('management.active')}</label>
            {selected && ['th','en'].includes(selected.code) && <p className="text-sm text-slate-600">{t('management.coreLanguage')}</p>}
            <div className="flex flex-wrap gap-3"><button type="submit" className={`${buttonClass} bg-[#11223C] text-white`}>{t(busy ? 'management.saving' : 'management.save')}</button><button type="button" onClick={() => setEditing(null)} className={buttonClass}>{t('management.cancel')}</button></div>
          </fieldset>
        </form>
      )}
      {loading ? <p role="status">{t('management.loading')}</p> : rows.length === 0 ? <p>{t('management.empty')}</p> : (
        <ul className="grid gap-3 sm:grid-cols-2">{rows.map(row => <li key={row.code} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5"><div className="min-w-0"><h2 className="font-semibold">{row.native_name} <span className="text-sm text-slate-500">({row.code})</span></h2><p className="mt-1 text-sm text-slate-600">{t(row.is_active ? 'management.active' : 'management.inactive')}</p></div>{owner && <button type="button" disabled={busy} onClick={() => { setEditing(row); setError(''); setNotice('') }} className={buttonClass} aria-label={`${t('management.edit')} ${row.native_name}`}>{t('management.edit')}</button>}</li>)}</ul>
      )}
    </div>
  )
}
