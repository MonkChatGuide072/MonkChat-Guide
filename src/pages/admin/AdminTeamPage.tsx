import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth, type Profile } from '../../lib/auth'
import { AccessDialog, AccessRoleGuide } from '../../components/admin/AccessPrimitives'
import { GuideIcon } from '../../components/GuideIcon'
import { supabaseClient } from '../../lib/supabase'

interface Member { id: string; display_name: string; role: 'owner' | 'team_member'; is_active: boolean }
const buttonClass = 'access-btn'
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
  const { profile } = useAuth()
  const { t } = useTranslation()
  if (!profile?.is_active || profile.role !== 'owner') return <p role="alert">{t('admin.accessDeniedTitle')}</p>
  return <TeamAccessWorkspace profile={profile} />
}

export function TeamAccessWorkspace({ profile, request = requestTeam }: { profile: Profile; request?: typeof requestTeam }) {
  const { t, i18n } = useTranslation()
  const english = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const x = (th: string, en: string) => english ? en : th
  const owner = profile?.role === 'owner' && profile.is_active
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [editing, setEditing] = useState<Member | 'new' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const load = useCallback(async () => {
    if (!owner) { setLoading(false); return }
    setLoading(true); setError(''); setReady(false)
    try {
      const data = await request({ action: 'list' })
      if (!Array.isArray(data.profiles)) throw new Error()
      setMembers(data.profiles); setReady(true)
    } catch { setError('management.serviceUnavailable') } finally { setLoading(false) }
  }, [owner, request])
  useEffect(() => { void load() }, [load])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!owner || busy || !ready || !editing) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    if (form.get('confirmed') !== 'on') return
    const display_name = String(form.get('display_name') ?? '').trim()
    if (!display_name || display_name.length > 80) { setError('management.memberInvalid'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const body = editing === 'new'
        ? { action: 'create', display_name, email: String(form.get('email') ?? '').trim(), password: String(form.get('password') ?? '') }
        : { action: 'update', id: editing.id, display_name, is_active: form.get('is_active') === 'on' }
      const { profile: saved } = await request(body)
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
    <div className="access-center">
      <header className="access-hero"><div><span className="access-eyebrow">MONKCHAT · ACCESS CENTER</span><h1>{x('จัดการบัญชีทีมงาน', 'Team accounts')}</h1><p>{x('สร้างบัญชีให้ผู้ดูแลเนื้อหา และตรวจสอบสิทธิ์ได้ในที่เดียว', 'Create content-team accounts and review their access in one place.')}</p></div><div className="access-hero-art" aria-hidden="true"><span><GuideIcon name="user" /></span><span><GuideIcon name="check" /></span></div></header>
      <AccessRoleGuide english={english} />
      <div className="access-message">{x('Owner เท่านั้นที่สร้างหรือพักบัญชีทีมงานได้ ทีมงานแก้ไขเนื้อหาได้ แต่จัดการบัญชีหรือให้สิทธิ์ผู้อื่นไม่ได้', 'Only an owner can create or suspend team accounts. Team members manage content and cannot grant access.')}</div>
      <div className="access-stats access-team-stats" aria-label={x('ภาพรวมทีมงาน', 'Team overview')}>
        <div className="access-stat active"><strong>{ready ? members.filter(m => m.role === 'team_member' && m.is_active).length : '—'}</strong><span>{x('ทีมงานที่ใช้งานได้', 'Active team members')}</span></div>
        <div className="access-stat suspended"><strong>{ready ? members.filter(m => m.role === 'team_member' && !m.is_active).length : '—'}</strong><span>{x('ทีมงานที่ระงับ', 'Suspended team members')}</span></div>
        <div className="access-stat needs_review"><strong>{ready ? members.filter(m => m.role === 'owner').length : '—'}</strong><span>Owner · {x('บัญชีคุ้มครอง', 'protected')}</span></div>
      </div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800"><p>{t(error)}</p><button type="button" onClick={load} disabled={busy} className={buttonClass}>{t('management.retry')}</button></div>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{t(notice)}</p>}
      <div className="access-team-toolbar"><button type="button" disabled={!ready || busy || loading} onClick={() => { setEditing('new'); setError(''); setNotice('') }} className={buttonClass}>{t('management.addMember')}</button><button type="button" disabled={busy || loading} onClick={load} className={buttonClass}>{t('management.refresh')}</button></div>
      {editing && <AccessDialog title={selected ? x('แก้ไขบัญชีทีมงาน', 'Edit team account') : x('สร้างบัญชีและให้สิทธิ์ทีมงาน', 'Create a team account')} busy={busy} onClose={() => setEditing(null)}><form key={selected?.id ?? 'new'} onSubmit={save} className="rounded-2xl border border-amber-200 bg-white p-5"><fieldset disabled={busy || !ready} className="space-y-4">
        <label className="block text-sm font-semibold">{t('management.name')}<input name="display_name" required maxLength={80} defaultValue={selected?.display_name ?? ''} className={inputClass} /></label>
        {!selected && <><label className="block text-sm font-semibold">{t('management.email')}<input name="email" type="email" required maxLength={254} autoComplete="off" className={inputClass} /></label><label className="block text-sm font-semibold">{t('management.password')}<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={inputClass} /></label><p className="text-sm text-slate-600">{t('management.passwordNote')}</p></>}
        {selected && <label className="flex min-h-11 items-center gap-3 text-sm"><input name="is_active" type="checkbox" defaultChecked={selected.is_active} />{t('management.active')}</label>}
        <div className="access-confirm"><p className="access-small">{x('ตรวจชื่อและอีเมลกับเจ้าของบัญชีโดยตรง ระบบนี้ไม่ส่งอีเมลเชิญหรือยืนยันอัตโนมัติ ส่งรหัสผ่านให้เจ้าของบัญชีผ่านช่องทางส่วนตัวเท่านั้น', 'Verify the name and email with the account holder. This creates an account directly; no invitation or verification email is sent. Share the password privately.')}</p><label className="access-check"><input name="confirmed" type="checkbox" required /><span>{x('ตรวจสอบข้อมูลและสิทธิ์ทีมงานแล้ว ยืนยันการบันทึก', 'I checked the details and team permissions and confirm this change.')}</span></label></div>
        <div className="flex flex-wrap gap-3"><button type="submit" className={`${buttonClass} primary`}>{t(busy ? 'management.saving' : 'management.save')}</button><button type="button" className={buttonClass} onClick={() => setEditing(null)}>{t('management.cancel')}</button></div>
      </fieldset></form></AccessDialog>}
      <label className="access-field access-search">{x('ค้นหาชื่อทีมงาน', 'Search team by name')}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={x('พิมพ์ชื่อที่ต้องการค้นหา', 'Enter a name')} /></label>
      {loading ? <p role="status">{t('management.loading')}</p> : ready && <ul className="access-team-list">{members.filter(member => member.display_name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(member => <li key={member.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5"><div className="min-w-0"><h2 className="font-semibold">{member.display_name}</h2>{member.role === 'owner' && <p className="access-small">{x('เปลี่ยนสิทธิ์หรือระงับผ่านหน้านี้ไม่ได้', 'Access cannot be changed here')}</p>}<p className="mt-1 text-sm text-slate-600">{t(member.role === 'owner' ? 'management.owner' : 'management.member')} · {t(member.is_active ? 'management.active' : 'management.inactive')}</p></div>{member.role !== 'owner' && member.id !== profile.id && <button type="button" disabled={busy} onClick={() => { setEditing(member); setError(''); setNotice('') }} className={buttonClass} aria-label={`${t('management.edit')} ${member.display_name}`}>{t('management.edit')}</button>}</li>)}</ul>}
      {ready && !loading && members.filter(member => member.display_name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).length === 0 && <p>{t('management.empty')}</p>}
    </div>
  )
}
