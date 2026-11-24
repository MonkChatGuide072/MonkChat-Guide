import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { GuideIcon } from '../GuideIcon'
import { AccessDialog, AccessRoleGuide } from './AccessPrimitives'
import { accessLabels, accessStatuses, canTransitionStudent, getStudentAccessStatus, studentStatusCounts, type StudentAccessEvent, type StudentAccessStatus } from '../../lib/studentAccess'
import { setNisitAdmissionMode, type CohortInviteSummary, type NisitAdmissionMode, type StudentRosterItem } from '../../lib/studentPractice'

export interface StudentAccessData {
  students: StudentRosterItem[]
  invites: CohortInviteSummary[]
  admission_mode: NisitAdmissionMode
  access_management_ready?: boolean
}
export interface StudentAccessApi {
  list(): Promise<StudentAccessData>
  request(body: Record<string, unknown>): Promise<Record<string, unknown>>
}
const stamp = (value: string | null | undefined, english: boolean) => value && Number.isFinite(Date.parse(value))
  ? new Date(value).toLocaleString(english ? 'en-GB' : 'th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

/** Shared view supports a separate in-memory preview; production always receives the owner-only API. */
export function StudentAccessWorkspace({ api, english = false }: { api: StudentAccessApi; english?: boolean }) {
  const x = (th: string, en: string) => english ? en : th
  const [data, setData] = useState<StudentAccessData | null>(null)
  const [fresh, setFresh] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [section, setSection] = useState<'people' | 'admission' | 'invites'>('people')
  const [filter, setFilter] = useState<StudentAccessStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [cohort, setCohort] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [transition, setTransition] = useState<StudentAccessStatus | null>(null)
  const [verified, setVerified] = useState(false)
  const [reason, setReason] = useState('')
  const [events, setEvents] = useState<StudentAccessEvent[]>([])
  const [historyState, setHistoryState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [draftMode, setDraftMode] = useState<NisitAdmissionMode>('auto_approve')
  const [showInvite, setShowInvite] = useState(false)
  const [secret, setSecret] = useState<{ title: string; value: string; help: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const ready = Boolean(data?.access_management_ready && fresh)
  const counts = studentStatusCounts(data?.students ?? [])
  const person = data?.students.find(item => item.id === selected)
  const state = person ? getStudentAccessStatus(person) : null
  const label = (status: StudentAccessStatus) => english ? accessLabels[status].en : accessLabels[status].th

  const load = useCallback(async () => {
    setLoading(true); setError(''); setFresh(false)
    try {
      const result = await api.list()
      if (!Array.isArray(result.students) || !Array.isArray(result.invites) || !['auto_approve', 'admin_approval'].includes(result.admission_mode)) throw new Error('serviceUnavailable')
      setData(result); setFresh(true); setDraftMode(result.admission_mode); setNisitAdmissionMode(result.admission_mode)
    } catch { setError(english ? 'Could not load accounts. Retry before relying on the current list.' : 'โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่ ข้อมูลบนหน้านี้ยังไม่ใช่สถานะล่าสุด') }
    finally { setLoading(false) }
  }, [api, english])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!selected || !ready) return
    let active = true
    setHistoryState('loading'); setEvents([])
    api.request({ action: 'student_access_history', id: selected }).then(result => {
      if (!Array.isArray(result.events)) throw new Error('invalid')
      if (active) { setEvents(result.events as StudentAccessEvent[]); setHistoryState('ready') }
    }).catch(() => { if (active) setHistoryState('error') })
    return () => { active = false }
  }, [api, selected, ready, person?.student_access_status])

  const people = useMemo(() => (data?.students ?? []).filter(item => {
    const q = query.trim().toLocaleLowerCase()
    return (filter === 'all' || getStudentAccessStatus(item) === filter)
      && (cohort === 'all' || String(item.cohort_year) === cohort)
      && (!q || [item.display_name, item.dharma_name, item.student_code].some(value => value?.toLocaleLowerCase().includes(q)))
  }), [data, filter, cohort, query])
  const years = [...new Set((data?.students ?? []).map(item => item.cohort_year).filter((year): year is number => year !== null))].sort((a, b) => b - a)
  const closePerson = () => { setSelected(null); setTransition(null); setResetting(false); setEditing(false); setError(''); setVerified(false); setReason('') }
  const startTransition = (next: StudentAccessStatus) => { setTransition(next); setResetting(false); setEditing(false); setError(''); setReason(''); setVerified(false) }
  const fail = (cause: unknown) => setError(cause instanceof Error && cause.message === 'staleState'
    ? x('สถานะบัญชีเปลี่ยนไปแล้ว กรุณาปิดแผงนี้และโหลดรายการใหม่ก่อนทำต่อ', 'This account changed. Close this panel and reload before continuing.')
    : x('ยังดำเนินการไม่สำเร็จ สถานะเดิมยังคงแสดงอยู่ กรุณาตรวจสอบแล้วลองใหม่', 'The change was not confirmed. Check the account and retry.'))
  const replaceStudent = (value: unknown) => {
    const saved = value as StudentRosterItem | undefined
    if (!saved?.id || typeof saved.is_active !== 'boolean') throw new Error('serviceUnavailable')
    setData(current => current ? { ...current, students: current.students.map(item => item.id === saved.id ? { ...item, ...saved } : item) } : current)
  }
  const changeStatus = async (event: FormEvent) => {
    event.preventDefault()
    if (!person || !state || !transition || !ready || busy || !canTransitionStudent(state, transition)) return
    if (transition === 'active' && !verified) return
    if (transition === 'suspended' && reason.trim().length < 3) return
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await api.request({ action: 'set_student_access', id: person.id, expected_status: state, status: transition, reason: reason.trim(), verified_identity: verified })
      replaceStudent(result.student); setTransition(null); setVerified(false); setReason('')
      setNotice(x('บันทึกสถานะบัญชีจากระบบเรียบร้อยแล้ว', 'Account status saved by the server.'))
    } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!person || busy || !ready) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      const result = await api.request({ action: 'edit_student', id: person.id, display_name: String(form.get('display_name') ?? '').trim(), dharma_name: String(form.get('dharma_name') ?? '').trim() })
      replaceStudent(result.student); setEditing(false); setNotice(x('แก้ไขข้อมูลเรียบร้อย โดยคงสถานะสิทธิ์เดิม', 'Profile updated. Access status unchanged.'))
    } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  const resetPassword = async () => {
    if (!person || !verified || busy || !fresh) return
    setBusy(true); setError(''); setCopied(false)
    try {
      const result = await api.request({ action: 'reset_student_password', id: person.id })
      if (typeof result.temporary_password !== 'string' || !result.temporary_password) throw new Error('serviceUnavailable')
      setSecret({ title: x('รหัสผ่านชั่วคราว', 'Temporary password'), value: result.temporary_password, help: x(`สำหรับ ${person.student_code} · ส่งให้เจ้าของบัญชีผ่านช่องทางส่วนตัว และขอให้เปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ`, `For ${person.student_code}. Share privately with the account holder and ask them to change it after signing in.`) }); closePerson()
    } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  const savePolicy = async () => {
    if (!data || !fresh || draftMode === data.admission_mode || busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await api.request({ action: 'set_admission_mode', mode: draftMode })
      if (result.admission_mode !== draftMode) throw new Error('serviceUnavailable')
      setData({ ...data, admission_mode: draftMode }); setNisitAdmissionMode(draftMode)
      setNotice(x('เปลี่ยนรูปแบบรับสมัครสำเร็จ ใช้กับผู้สมัครใหม่ตั้งแต่นี้', 'Admission policy saved for new registrations.'))
    } catch { setDraftMode(data.admission_mode); setError(x('เปลี่ยนรูปแบบรับสมัครไม่สำเร็จ ระบบยังใช้ค่าเดิม', 'Policy was not saved. The previous policy remains in effect.')) }
    finally { setBusy(false) }
  }
  const copy = async (value: string) => {
    try { if (!navigator.clipboard) throw new Error('unavailable'); await navigator.clipboard.writeText(value); setCopied(true) }
    catch { setCopied(false); setError(x('คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความและคัดลอกด้วยตนเอง', 'Automatic copy failed. Select and copy the text manually.')) }
  }
  const createInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy || !fresh) return
    if (!fresh) return
    const form = new FormData(event.currentTarget); setBusy(true); setError(''); setCopied(false)
    try {
      const expiry = String(form.get('expires_at') ?? '')
      const result = await api.request({ action: 'create_invite', cohort_year: Number(form.get('cohort_year')), label: String(form.get('label') ?? '').trim(), max_uses: Number(form.get('max_uses')), custom_code: String(form.get('custom_code') ?? '').trim() || undefined, expires_at: expiry ? new Date(expiry).toISOString() : undefined })
      if (typeof result.invite_code !== 'string' || !(result.invite as CohortInviteSummary)?.id) throw new Error('serviceUnavailable')
      setData(current => current ? { ...current, invites: [result.invite as CohortInviteSummary, ...current.invites] } : current)
      setShowInvite(false); setSecret({ title: x('รหัสเชิญรุ่น · แสดงครั้งเดียว', 'Cohort invite · shown once'), value: result.invite_code, help: x('เก็บรหัสนี้ไว้และส่งให้ผู้สมัครรุ่นที่ตรงกัน ระบบจะไม่แสดงรหัสเต็มอีกครั้ง', 'Keep this code and share it with the matching cohort. The full code cannot be shown again.') })
    } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  const toggleInvite = async (invite: CohortInviteSummary) => {
    if (busy || !fresh) return
    setBusy(true); setError('')
    try {
      const result = await api.request({ action: 'toggle_invite', id: invite.id, is_active: !invite.is_active })
      const saved = result.invite as CohortInviteSummary
      if (!saved?.id) throw new Error('serviceUnavailable')
      setData(current => current ? { ...current, invites: current.invites.map(item => item.id === saved.id ? saved : item) } : current)
      setNotice(x('ปรับสถานะรหัสเชิญแล้ว บัญชีที่สมัครไปก่อนหน้ายังคงสิทธิ์เดิม', 'Invite updated. Existing accounts keep their current access.'))
    } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  const signUpLink = typeof window === 'undefined' ? '/nisit/login?mode=register' : `${window.location.origin}/nisit/login?mode=register`

  return <div className="access-center">
    <header className="access-hero"><div><span className="access-eyebrow">MONKCHAT · ACCESS CENTER</span><h1>{x('สมัคร ยืนยัน และให้สิทธิ์', 'Registration & access')}</h1><p>{x('ดูผู้สมัครให้ครบ ตรวจชื่อให้ตรง แล้วให้สิทธิ์พระนิสิตเข้าฝึก ทุกการเปลี่ยนสถานะตรวจย้อนหลังได้', 'Review applicants, verify their identity and grant practice access. Status changes have a clear history.')}</p></div><div className="access-hero-art" aria-hidden="true"><span><GuideIcon name="user" /></span><span><GuideIcon name="check" /></span><span><GuideIcon name="book" /></span></div></header>
    <div className="access-toolbar"><p className="access-muted">{x('เฉพาะ Owner จัดการสิทธิ์ได้ · พระนิสิตไม่เข้าระบบหลังบ้าน', 'Only owners manage access. Students cannot enter site management.')}</p><div className="access-actions"><button className="access-btn" onClick={() => { setCopied(false); void copy(signUpLink) }}>{x('คัดลอกลิงก์สมัคร', 'Copy signup link')}</button><button className="access-btn" disabled={loading || busy} onClick={() => void load()}><GuideIcon name="clock" />{x('โหลดล่าสุด', 'Refresh')}</button></div></div>
    {copied && !secret && <p role="status" className="access-message">{x('คัดลอกลิงก์สมัครแล้ว', 'Signup link copied.')}</p>}
    {notice && !person && <p role="status" className="access-message">{notice}</p>}
    {error && !person && <p role="alert" className="access-message error">{error}</p>}
    {secret && <section className="access-secret" aria-label={secret.title}><h2>{secret.title}</h2><p className="access-small">{secret.help}</p><code>{secret.value}</code><div className="access-actions"><button className="access-btn primary" onClick={() => void copy(secret.value)}>{copied ? x('คัดลอกแล้ว', 'Copied') : x('คัดลอกรหัส', 'Copy code')}</button><button className="access-btn" onClick={() => { setSecret(null); setCopied(false) }}>{x('เก็บแล้ว ปิดข้อความ', 'Saved it, dismiss')}</button></div></section>}
    <div className="access-stats">{accessStatuses.map(status => <button key={status} className={`access-stat ${status} ${filter === status && section === 'people' ? 'selected' : ''}`} onClick={() => { setSection('people'); setFilter(status) }} aria-pressed={section === 'people' && filter === status}><span>{label(status)}</span><strong>{loading && !data ? '—' : counts[status]}</strong><small>{x('เปิดดูรายชื่อ →', 'View accounts →')}</small></button>)}</div>
    {!loading && data && fresh && !ready && <p className="access-message warning">{x('กำลังแสดงข้อมูลระบบเดิม บัญชีที่ยังไม่เปิดใช้ต้องตรวจสถานะก่อน หน้านี้จะเปิดปุ่มยืนยันสิทธิ์เมื่อระบบสถานะใหม่พร้อมแล้ว', 'Showing older account data. Inactive accounts require review; new access controls will be enabled when the updated service is ready.')}</p>}
    <nav className="access-section-tabs" aria-label={x('งานจัดการสิทธิ์', 'Access tasks')}>{(['people', 'admission', 'invites'] as const).map((item, index) => <button key={item} aria-pressed={section === item} onClick={() => setSection(item)}>{[x('รายชื่อและคำขอ', 'Accounts & requests'), x('รูปแบบรับสมัคร', 'Admission policy'), x('รหัสเชิญรุ่น', 'Cohort invites')][index]}</button>)}</nav>
    {loading && <p role="status" className="access-message">{x('กำลังโหลดข้อมูลล่าสุด…', 'Loading current accounts…')}</p>}
    {!loading && !data && <div className="access-empty"><p>{x('ยังไม่มีข้อมูลจากระบบให้แสดง', 'Account data is unavailable.')}</p><button className="access-btn" onClick={() => void load()}>{x('ลองโหลดอีกครั้ง', 'Retry')}</button></div>}
    {data && section === 'people' && <section aria-label={x('รายชื่อพระนิสิต', 'Student roster')}>
      <div className="access-filters"><label className="access-field access-search">{x('ค้นหารหัสหรือชื่อ', 'Find a student')}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={x('เช่น รหัส 6611018 หรือชื่อ–ฉายา', 'Student ID, name or dharma name')} /></label><label className="access-field">{x('สถานะ', 'Status')}<select value={filter} onChange={event => setFilter(event.target.value as StudentAccessStatus | 'all')}><option value="all">{x('ทุกสถานะ', 'All statuses')}</option>{accessStatuses.map(status => <option value={status} key={status}>{label(status)}</option>)}</select></label><label className="access-field">{x('รุ่นปี', 'Cohort')}<select value={cohort} onChange={event => setCohort(event.target.value)}><option value="all">{x('ทุกรุ่น', 'All cohorts')}</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label></div>
      <div className="access-card-top"><p className="access-muted">{x(`แสดง ${people.length} จาก ${data.students.length} บัญชี`, `Showing ${people.length} of ${data.students.length} accounts`)}</p><button className="access-btn" onClick={() => { setQuery(''); setFilter('all'); setCohort('all') }}>{x('ล้างตัวกรอง', 'Clear filters')}</button></div>
      {!people.length ? <div className="access-empty"><h3>{x('ไม่มีรายชื่อตรงกับที่เลือก', 'No matching accounts')}</h3><p>{x('ลองเปลี่ยนสถานะ รุ่น หรือคำค้น', 'Try another status, cohort or search term.')}</p></div> : <ul className="access-roster">{people.map(student => { const status = getStudentAccessStatus(student); return <li key={student.id} className="access-person"><div className="access-person-info"><span className="access-avatar" aria-hidden="true">{student.student_code?.slice(-2) || <GuideIcon name="user" />}</span><div><h3>{student.display_name}</h3><p>{student.student_code} · {x('รุ่น', 'Cohort')} {student.cohort_year ?? '—'}{student.dharma_name ? ` · ${student.dharma_name}` : ''}</p><p>{x('คำศัพท์', 'Vocab')} {student.vocab_count ?? 0}/7 · Q&A {student.qa_count ?? 0}</p></div></div><div className="access-person-side"><span className={`access-badge ${status}`}>{label(status)}</span><button className={`access-btn ${status === 'pending' || status === 'needs_review' ? 'warm' : ''}`} onClick={() => { setSelected(student.id); setError(''); setNotice('') }} aria-label={`${x('ตรวจบัญชี', 'Review account')} ${student.student_code}`}>{status === 'pending' ? x('ตรวจและให้สิทธิ์', 'Review & approve') : x('ดูและจัดการ', 'Manage')} →</button></div></li> })}</ul>}
      <p className="access-note">{x('ตัวเลขฝึกเป็นข้อมูลที่ส่งถึงระบบแล้ว ประวัติด่านที่เก็บเฉพาะเครื่องยังไม่รวมในหน้านี้', 'Counts reflect server-saved progress. Device-only scenario attempts are not included here.')}</p>
    </section>}
    {data && section === 'admission' && <section className="access-card"><div className="access-card-top"><div><h2>{x('ผู้สมัครใหม่จะได้รับสิทธิ์แบบไหน?', 'How do new applicants receive access?')}</h2><p className="access-muted">{x('การเปลี่ยนนี้ใช้กับการสมัครครั้งถัดไป ไม่เปิดหรือระงับบัญชีเดิมย้อนหลัง', 'Applies to future registrations. Existing account statuses do not change.')}</p></div><span className="access-badge active">{x('ค่าปัจจุบันจากระบบ', 'Current server policy')}</span></div>
      <div className="access-policy-options">{(['admin_approval', 'auto_approve'] as const).map(mode => <label key={mode} className="access-policy-choice"><input type="radio" name="admission-policy" value={mode} checked={draftMode === mode} onChange={() => setDraftMode(mode)} disabled={busy || loading} /><div><b>{mode === 'admin_approval' ? x('ตรวจชื่อก่อนให้สิทธิ์', 'Review before granting access') : x('สมัครแล้วเข้าใช้งานได้เลย', 'Grant access on registration')}</b><p>{mode === 'admin_approval' ? x('บัญชีใหม่อยู่ในรอยืนยัน จนกว่า Owner จะตรวจและอนุมัติ', 'New accounts wait for an owner to verify and approve them.') : x('บัญชีใหม่ได้สิทธิ์ฝึกทันที เหมาะกับช่วงเปิดรับที่จัดเตรียมไว้แล้ว', 'New accounts gain practice access immediately during an open registration period.')}</p></div></label>)}</div>
      <p className="access-note">{x('กำลังใช้อยู่:', 'Currently active:')} <strong>{data.admission_mode === 'auto_approve' ? x('สมัครแล้วเข้าใช้งานได้เลย', 'Access on registration') : x('ตรวจชื่อก่อนให้สิทธิ์', 'Owner review')}</strong></p><button className="access-btn primary" disabled={!fresh || busy || loading || draftMode === data.admission_mode} onClick={() => void savePolicy()}>{busy ? x('กำลังบันทึก…', 'Saving…') : x('ยืนยันรูปแบบรับสมัครนี้', 'Confirm admission policy')}</button>
      <div className="access-stepper">{[ [x('ส่งลิงก์สมัคร', 'Share signup link'), x('นิสิตกรอกรหัส ชื่อ และตั้งรหัสผ่าน', 'Students enter their ID, name and a password.')], [x('ตรวจข้อมูล', 'Verify details'), x('ตรวจรหัส รุ่น และชื่อกับผู้สมัคร', 'Match the ID, cohort and applicant name.')], [x('ยืนยันและให้สิทธิ์', 'Approve access'), x('Owner เลือกบัญชีและยืนยันสิทธิ์ฝึก', 'An owner grants practice access.')], [x('เข้าใช้และติดตาม', 'Practice & follow up'), x('นิสิตเข้าสู่ระบบ ผู้ดูแลดูผลที่ส่งแล้ว', 'Students sign in; coordinators follow saved progress.')] ].map(([title, help], index) => <div className="access-step" key={title}><span className="access-step-n">{index + 1}</span><b>{title}</b><p>{help}</p></div>)}</div>
      <label className="access-field" style={{ marginTop: 20 }}>{x('ลิงก์สมัครพระนิสิต', 'Student signup link')}<input readOnly value={signUpLink} onFocus={event => event.target.select()} /></label>
    </section>}
    {data && section === 'invites' && <section className="access-card"><div className="access-card-top"><div><h2>{x('รหัสเชิญสำหรับจัดกลุ่มรุ่น', 'Cohort invite codes')}</h2><p className="access-muted">{x('ใช้เมื่อมีการแจกให้รุ่นนั้น ผู้สมัครทั่วไปยังสมัครได้ตามรูปแบบรับสมัครปัจจุบัน รหัสเชิญไม่ใช่รหัสผ่าน', 'Optional cohort codes. Direct registration still follows the admission policy; an invite is not a password.')}</p></div><button className="access-btn primary" disabled={!fresh || busy || loading} onClick={() => { setShowInvite(true); setError('') }}>{x('สร้างรหัสเชิญ', 'Create invite')}</button></div>
      {!data.invites.length && <p className="access-empty">{x('ยังไม่มีรหัสเชิญรุ่น', 'No cohort invites yet.')}</p>}
      {data.invites.map(invite => <article className="access-card access-invite" key={invite.id}><div><h3>{invite.label}</h3><p className="access-small">{x('รุ่น', 'Cohort')} {invite.cohort_year} · {invite.used_count}/{invite.max_uses} · {x('หมดอายุ', 'Expires')} {stamp(invite.expires_at, english)}</p><code>{invite.code_hint}</code><p className="access-small">{!invite.is_active ? x('พักการใช้รหัสนี้', 'Paused') : invite.expires_at && Date.parse(invite.expires_at) <= Date.now() ? x('รหัสหมดอายุแล้ว', 'Expired') : invite.used_count >= invite.max_uses ? x('ครบจำนวนแล้ว', 'Full') : x('ยังใช้สมัครได้', 'Available')}</p></div><button className="access-btn" disabled={!fresh || busy || loading} onClick={() => void toggleInvite(invite)}>{invite.is_active ? x('พักรหัส', 'Pause code') : x('เปิดรหัส', 'Enable code')}</button></article>)}
    </section>}
    <AccessRoleGuide english={english} />
    {person && state && <AccessDialog title={x('ตรวจและจัดการบัญชี', 'Review account')} onClose={closePerson} busy={busy}>
      <span className={`access-badge ${state}`}>{label(state)}</span><h3 className="access-detail-name">{person.display_name}</h3><p className="access-muted">{english ? accessLabels[state].helpEn : accessLabels[state].helpTh}</p>
      <dl className="access-detail-grid"><div><dt>{x('รหัสนิสิต', 'Student ID')}</dt><dd>{person.student_code}</dd></div><div><dt>{x('รุ่นปี', 'Cohort')}</dt><dd>{person.cohort_year}</dd></div><div><dt>{x('ฉายา', 'Dharma name')}</dt><dd>{person.dharma_name || '—'}</dd></div><div><dt>{x('สิทธิ์บัญชี', 'Role')}</dt><dd>{x('พระนิสิต · ฝึกของตนเอง', 'Student · own practice')}</dd></div></dl>
      {error && <p role="alert" className="access-message error">{error}</p>}{notice && <p role="status" className="access-message">{notice}</p>}
      {!transition && !resetting && !editing && <><div className="access-actions">{state !== 'active' && <button className="access-btn primary" disabled={!ready || busy || loading} onClick={() => startTransition('active')}>{state === 'suspended' ? x('เปิดสิทธิ์อีกครั้ง', 'Restore access') : x('ยืนยันและให้สิทธิ์ฝึก', 'Verify & approve access')}</button>}{state !== 'suspended' && <button className="access-btn" disabled={!ready || busy || loading} onClick={() => startTransition('suspended')}>{x('ระงับสิทธิ์', 'Suspend access')}</button>}<button className="access-btn" disabled={!ready || busy || loading} onClick={() => setEditing(true)}>{x('แก้ไขชื่อ', 'Edit name')}</button></div><p className="access-note">{x('การให้สิทธิ์นี้เป็นสิทธิ์ฝึกเท่านั้น ไม่ให้สิทธิ์แก้ไขเนื้อหาหรือจัดการบัญชี', 'Practice access does not grant content management or account administration.')}</p><div className="access-card"><h3>{x('ช่วยเมื่อเข้าใช้งานไม่ได้', 'Help with signing in')}</h3><p className="access-note">{x('ตรวจรหัสนิสิตและสถานะก่อน หากลืมรหัสผ่าน ให้ตรวจสอบตัวผู้ร้องขอแล้วสร้างรหัสชั่วคราว', 'Check the ID and account status first. Verify the requester before resetting a forgotten password.')}</p><button className="access-btn" disabled={!fresh || busy || loading} onClick={() => { setResetting(true); setVerified(false) }}>{x('รีเซ็ตรหัสผ่านชั่วคราว', 'Reset temporary password')}</button></div></>}
      {transition && <form className="access-confirm" onSubmit={changeStatus}><h3>{transition === 'active' ? x('ยืนยันสิทธิ์ของบัญชีนี้', 'Confirm access for this account') : x('ยืนยันการระงับสิทธิ์', 'Confirm suspension')}</h3><p className="access-note">{transition === 'active' ? x('บัญชีนี้จะเข้าใช้งานและส่งผลฝึกได้ หลังจากระบบยืนยันการบันทึก', 'The account can sign in and save practice once the server confirms the change.') : x('บัญชีนี้จะเข้าใช้พื้นที่ฝึกที่ต้องล็อกอินไม่ได้ ผลเดิมยังคงอยู่ และเปิดสิทธิ์คืนได้ภายหลัง', 'Signed-in practice access will be blocked. Existing progress remains and access can be restored later.')}</p><label className="access-field">{x('หมายเหตุ', 'Note')}{transition === 'suspended' ? x(' (จำเป็น)', ' (required)') : x(' (ไม่บังคับ)', ' (optional)')}<textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} minLength={transition === 'suspended' ? 3 : undefined} required={transition === 'suspended'} placeholder={x('ไม่ใส่รหัสผ่านหรือข้อมูลลับในหมายเหตุ', 'Do not include passwords or secrets.')} /></label>{transition === 'active' && <label className="access-check"><input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} />{x('ตรวจรหัส รุ่น และชื่อกับผู้สมัครแล้ว และต้องการให้สิทธิ์ฝึกแก่บัญชีนี้', 'I verified the student ID, cohort and name and approve practice access for this account.')}</label>}<div className="access-actions"><button type="submit" className={`access-btn ${transition === 'active' ? 'primary' : 'danger'}`} disabled={busy || loading || (transition === 'active' ? !verified : reason.trim().length < 3)}>{busy ? x('กำลังบันทึก…', 'Saving…') : x('ยืนยันการเปลี่ยนสิทธิ์', 'Confirm access change')}</button><button type="button" className="access-btn" disabled={busy} onClick={() => setTransition(null)}>{x('ย้อนกลับ', 'Back')}</button></div></form>}
      {editing && <form className="access-card" onSubmit={saveName}><label className="access-field">{x('ชื่อ–นามสกุล', 'Full name')}<input name="display_name" required maxLength={80} defaultValue={person.display_name} /></label><label className="access-field">{x('ฉายา (ไม่บังคับ)', 'Dharma name (optional)')}<input name="dharma_name" maxLength={80} defaultValue={person.dharma_name ?? ''} /></label><p className="access-note">{x('รหัสนิสิตและบทบาทแก้จากหน้านี้ไม่ได้ การแก้ชื่อไม่เปลี่ยนสิทธิ์เข้าใช้งาน', 'Student IDs and roles are fixed. Editing a name does not grant or revoke access.')}</p><div className="access-actions"><button className="access-btn primary" disabled={busy}>{x('บันทึกชื่อ', 'Save name')}</button><button type="button" className="access-btn" disabled={busy} onClick={() => setEditing(false)}>{x('ยกเลิก', 'Cancel')}</button></div></form>}
      {resetting && <div className="access-confirm"><h3>{x('รหัสผ่านเดิมจะใช้ไม่ได้', 'The old password will stop working')}</h3><p className="access-note">{x('รหัสชั่วคราวแสดงครั้งเดียว ส่งให้เจ้าของบัญชีผ่านช่องทางส่วนตัว การรีเซ็ตไม่เปลี่ยนสถานะอนุมัติหรือระงับ', 'The temporary password is shown once. Share it privately. A reset does not approve or reactivate an account.')}</p><label className="access-check"><input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} />{x('ได้ตรวจสอบแล้วว่าผู้ร้องขอเป็นเจ้าของบัญชีนี้', 'I verified that the requester owns this account.')}</label><div className="access-actions"><button className="access-btn primary" disabled={busy || !verified || loading} onClick={() => void resetPassword()}>{x('ยืนยันสร้างรหัสชั่วคราว', 'Confirm password reset')}</button><button className="access-btn" disabled={busy} onClick={() => setResetting(false)}>{x('ยกเลิก', 'Cancel')}</button></div></div>}
      <section className="access-card"><h3>{x('ประวัติการเปลี่ยนสิทธิ์', 'Access history')}</h3>{!ready ? <p className="access-note">{x('ข้อมูลเก่ายังไม่มีประวัติสถานะรุ่นใหม่นี้', 'The older service does not provide access history yet.')}</p> : historyState === 'loading' ? <p role="status" className="access-note">{x('กำลังโหลดประวัติ…', 'Loading history…')}</p> : historyState === 'error' ? <p className="access-note">{x('ยังโหลดประวัติไม่ได้ กรุณาปิดแล้วเปิดบัญชีนี้ใหม่', 'History could not be loaded. Close and reopen this account.')}</p> : !events.length ? <p className="access-note">{x('ยังไม่มีเหตุการณ์ในระบบประวัติใหม่ ไม่ได้หมายความว่าไม่เคยมีการจัดการบัญชี', 'No events in the new history yet. Older changes may predate this history.')}</p> : <ol className="access-timeline">{events.map(event => <li key={event.id}><b>{event.from_status ? `${label(event.from_status)} → ` : x('สมัครสมาชิก → ', 'Registered → ')}{label(event.to_status)}</b><p>{event.actor_name} · {stamp(event.created_at, english)}</p>{event.reason && <p>{event.reason}</p>}</li>)}</ol>}</section>
    </AccessDialog>}
    {showInvite && <AccessDialog title={x('สร้างรหัสเชิญรุ่น', 'Create a cohort invite')} onClose={() => setShowInvite(false)} busy={busy}><form onSubmit={createInvite}><p className="access-muted">{x('รหัสเชิญช่วยจัดกลุ่มรุ่น ไม่เปลี่ยนสิทธิ์ของบัญชีที่มีอยู่ และไม่ใช้แทนรหัสผ่าน', 'An invite helps group a cohort. It is not a password and does not change existing account access.')}</p>{error && <p role="alert" className="access-message error">{error}</p>}<div className="access-grid-2" style={{ marginTop: 20 }}><label className="access-field">{x('รุ่นปี', 'Cohort year')}<input name="cohort_year" type="number" min={40} max={69} required defaultValue="66" /></label><label className="access-field">{x('จำนวนที่ใช้ได้', 'Maximum uses')}<input name="max_uses" type="number" min={1} max={200} required defaultValue="60" /></label></div><label className="access-field">{x('ชื่อรุ่น / กลุ่ม', 'Cohort label')}<input name="label" required maxLength={80} placeholder={x('เช่น รุ่น 66 · เตรียมกิจกรรมพฤศจิกายน', 'e.g. Cohort 66 · November practice')} /></label><label className="access-field">{x('วันหมดอายุ (ไม่บังคับ)', 'Expiry (optional)')}<input name="expires_at" type="datetime-local" /></label><label className="access-field">{x('กำหนดรหัสเอง (ไม่บังคับ)', 'Custom code (optional)')}<input name="custom_code" minLength={6} maxLength={40} autoComplete="off" /><small>{x('เว้นว่างเพื่อให้ระบบสร้างรหัสให้', 'Leave blank to generate a code.')}</small></label><div className="access-actions" style={{ marginTop: 20 }}><button className="access-btn primary" disabled={busy}>{x('สร้างรหัสเชิญ', 'Create invite')}</button><button type="button" className="access-btn" disabled={busy} onClick={() => setShowInvite(false)}>{x('ยกเลิก', 'Cancel')}</button></div></form></AccessDialog>}
  </div>
}
