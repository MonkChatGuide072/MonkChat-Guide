import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import {
  invokeStudentCohorts,
  type CohortInviteSummary,
  type StudentRosterItem,
} from '../../lib/studentPractice'

const buttonClass =
  'min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass =
  'min-h-11 cursor-pointer rounded-lg bg-[#11223C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a3357] disabled:cursor-not-allowed disabled:opacity-50'
const inputClass =
  'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900'

/** Owner-only CMS page for Cohort Invite Codes, student roster progress, suspension & password resets. */
export function AdminStudentsPage() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const { profile } = useAuth()
  const owner = Boolean(profile?.role === 'owner' && profile.is_active)

  const [invites, setInvites] = useState<CohortInviteSummary[]>([])
  const [students, setStudents] = useState<StudentRosterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [oneTimeSecret, setOneTimeSecret] = useState<{
    title: string
    subtitle: string
    value: string
  } | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Create invite form state
  const [showCreateInvite, setShowCreateInvite] = useState(false)
  const [cohortYear, setCohortYear] = useState('66')
  const [inviteLabel, setInviteLabel] = useState('')
  const [maxUses, setMaxUses] = useState('60')
  const [customCode, setCustomCode] = useState('')

  // Roster filters & editing state
  const [selectedCohortFilter, setSelectedCohortFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingStudent, setEditingStudent] = useState<StudentRosterItem | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDharmaName, setEditDharmaName] = useState('')

  const load = useCallback(async () => {
    if (!owner) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await invokeStudentCohorts<{
        invites?: CohortInviteSummary[]
        students?: StudentRosterItem[]
      }>({ action: 'list' })
      setInvites(Array.isArray(data.invites) ? data.invites : [])
      setStudents(Array.isArray(data.students) ? data.students : [])
    } catch {
      setError(
        isEnglish
          ? 'Student cohort service is currently unavailable. Please verify migrations and Edge Function deployment.'
          : 'ไม่สามารถเชื่อมต่อระบบจัดการรุ่นพระนิสิตได้ในขณะนี้ กรุณาตรวจสอบการอัปเดตฐานข้อมูลและ Edge Function',
      )
    } finally {
      setLoading(false)
    }
  }, [isEnglish, owner])

  useEffect(() => {
    void load()
  }, [load])

  const cohortYears = useMemo(() => {
    const years = new Set<number>()
    students.forEach((s) => {
      if (typeof s.cohort_year === 'number') years.add(s.cohort_year)
    })
    invites.forEach((inv) => years.add(inv.cohort_year))
    return Array.from(years).sort((a, b) => b - a)
  }, [invites, students])

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return students.filter((s) => {
      if (selectedCohortFilter !== 'all' && String(s.cohort_year ?? '') !== selectedCohortFilter) {
        return false
      }
      if (!q) return true
      return (
        (s.display_name ?? '').toLowerCase().includes(q)
        || (s.dharma_name ?? '').toLowerCase().includes(q)
        || (s.student_code ?? '').toLowerCase().includes(q)
      )
    })
  }, [searchQuery, selectedCohortFilter, students])

  const handleCopySecret = async () => {
    if (!oneTimeSecret) return
    try {
      await navigator.clipboard?.writeText(oneTimeSecret.value)
      setCopiedSecret(true)
    } catch {
      setCopiedSecret(false)
    }
  }

  const handleCreateInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!owner || busy) return
    const yearNum = Number(cohortYear)
    const maxUsesNum = Number(maxUses)
    const cleanLabel = inviteLabel.trim()
    if (!Number.isInteger(yearNum) || yearNum < 40 || yearNum > 69) {
      setError(isEnglish ? 'Cohort year must be between 40 and 69.' : 'ปีรุ่นต้องอยู่ระหว่าง 40 ถึง 69')
      return
    }
    if (!cleanLabel) {
      setError(isEnglish ? 'Please enter a cohort label.' : 'กรุณาระบุชื่อรุ่น')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')
    setCopiedSecret(false)
    try {
      const data = await invokeStudentCohorts<{
        invite: CohortInviteSummary
        invite_code: string
      }>({
        action: 'create_invite',
        cohort_year: yearNum,
        label: cleanLabel,
        max_uses: Number.isInteger(maxUsesNum) && maxUsesNum >= 1 ? maxUsesNum : 60,
        custom_code: customCode.trim() || undefined,
      })
      setInvites((prev) => [data.invite, ...prev])
      setOneTimeSecret({
        title: isEnglish ? 'Cohort Invite Code created (shown once)' : 'สร้างรหัสเชิญรุ่นเรียบร้อย (แสดงครั้งเดียว)',
        subtitle: isEnglish
          ? `Share this code with Cohort ${data.invite.cohort_year} students. Only a hash is stored.`
          : `ส่งรหัสนี้ให้พระนิสิตรุ่น ${data.invite.cohort_year} เพื่อสมัครด้วยตนเองที่ /nisit/login`,
        value: data.invite_code,
      })
      setInviteLabel('')
      setCustomCode('')
      setShowCreateInvite(false)
      setNotice(isEnglish ? 'Invite created.' : 'สร้างรหัสเชิญรุ่นเรียบร้อยแล้ว')
    } catch {
      setError(
        isEnglish
          ? 'Could not create invite code. Check if a custom code is duplicated or invalid.'
          : 'ไม่สามารถสร้างรหัสเชิญรุ่นได้ กรุณาตรวจสอบข้อมูลหรือรหัสซ้ำ',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleToggleInvite = async (invite: CohortInviteSummary) => {
    if (!owner || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await invokeStudentCohorts<{ invite: CohortInviteSummary }>({
        action: 'toggle_invite',
        id: invite.id,
        is_active: !invite.is_active,
      })
      setInvites((prev) => prev.map((item) => (item.id === data.invite.id ? data.invite : item)))
      setNotice(
        data.invite.is_active
          ? (isEnglish ? 'Invite reactivated.' : 'เปิดใช้งานรหัสเชิญแล้ว')
          : (isEnglish ? 'Invite paused.' : 'ระงับรหัสเชิญชั่วคราวแล้ว'),
      )
    } catch {
      setError(isEnglish ? 'Could not update invite status.' : 'ไม่สามารถปรับสถานะรหัสเชิญได้')
    } finally {
      setBusy(false)
    }
  }

  const startEditingStudent = (student: StudentRosterItem) => {
    setEditingStudent(student)
    setEditDisplayName(student.display_name)
    setEditDharmaName(student.dharma_name ?? '')
    setError('')
    setNotice('')
  }

  const handleSaveStudentEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!owner || busy || !editingStudent) return
    const cleanName = editDisplayName.trim()
    if (!cleanName || cleanName.length > 80) {
      setError(isEnglish ? 'Display name is required (1–80 chars).' : 'กรุณากรอกชื่อ–นามสกุลให้ถูกต้อง')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await invokeStudentCohorts<{ student: StudentRosterItem }>({
        action: 'update_student',
        id: editingStudent.id,
        display_name: cleanName,
        dharma_name: editDharmaName.trim() || null,
        is_active: editingStudent.is_active,
      })
      setStudents((prev) =>
        prev.map((item) =>
          item.id === data.student.id ? { ...item, ...data.student } : item,
        ),
      )
      setEditingStudent(null)
      setNotice(isEnglish ? 'Student profile updated.' : 'อัปเดตข้อมูลพระนิสิตเรียบร้อย')
    } catch {
      setError(isEnglish ? 'Could not update student profile.' : 'ไม่สามารถแก้ไขข้อมูลพระนิสิตได้')
    } finally {
      setBusy(false)
    }
  }

  const handleToggleStudentActive = async (student: StudentRosterItem) => {
    if (!owner || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await invokeStudentCohorts<{ student: StudentRosterItem }>({
        action: 'update_student',
        id: student.id,
        display_name: student.display_name,
        dharma_name: student.dharma_name,
        is_active: !student.is_active,
      })
      setStudents((prev) =>
        prev.map((item) =>
          item.id === data.student.id ? { ...item, ...data.student } : item,
        ),
      )
      setNotice(
        data.student.is_active
          ? (isEnglish ? `Reactivated ${data.student.student_code ?? student.display_name}.` : 'เปิดใช้งานบัญชีนิสิตแล้ว')
          : (isEnglish ? `Suspended ${data.student.student_code ?? student.display_name}.` : 'ระงับบัญชีนิสิตชั่วคราวแล้ว'),
      )
    } catch {
      setError(isEnglish ? 'Could not change student status.' : 'ไม่สามารถเปลี่ยนสถานะบัญชีนิสิตได้')
    } finally {
      setBusy(false)
    }
  }

  const handleResetPassword = async (student: StudentRosterItem) => {
    if (!owner || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    setCopiedSecret(false)
    try {
      const data = await invokeStudentCohorts<{ reset: boolean; temporary_password: string }>({
        action: 'reset_student_password',
        id: student.id,
      })
      setOneTimeSecret({
        title: isEnglish ? 'Temporary student password generated (shown once)' : 'สร้างรหัสผ่านชั่วคราวแล้ว (แสดงครั้งเดียว)',
        subtitle: `${student.display_name}${student.student_code ? ` (${student.student_code})` : ''}`,
        value: data.temporary_password,
      })
      setNotice(isEnglish ? 'Temporary password issued.' : 'ออกรหัสผ่านชั่วคราวเรียบร้อยแล้ว')
    } catch {
      setError(isEnglish ? 'Could not reset password.' : 'ไม่สามารถรีเซ็ตรหัสผ่านได้')
    } finally {
      setBusy(false)
    }
  }

  if (!owner) {
    return <p role="alert">{t('admin.accessDeniedTitle')}</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 [overflow-wrap:anywhere]">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-medium text-[#11223C]">
          {isEnglish ? 'Student Monk Cohorts & Progress' : 'จัดการรุ่นพระนิสิตและติดตามผลการฝึก'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isEnglish
            ? 'Issue Cohort Invite Codes for self-registration at /nisit/login, monitor vocabulary & Q&A completion, suspend accounts, or issue one-time password resets.'
            : 'สร้างรหัสเชิญรุ่นให้พระนิสิตลงทะเบียนเองที่ /nisit/login ตรวจสอบจำนวนบทฝึกที่ทำสำเร็จ ระงับบัญชี หรือออกรหัสผ่านชั่วคราว'}
        </p>
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {isEnglish
            ? 'Student accounts only access /nisit training & synced progress; they cannot edit CMS content or access /admin.'
            : 'บัญชีบทบาท student ใช้สำหรับฝึกในหน้า /nisit เท่านั้น ไม่สามารถแก้ไขเนื้อหาเว็บหรือเข้าถึงส่วน /admin ได้'}
        </p>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <p className="text-sm">{error}</p>
          <button type="button" onClick={load} disabled={busy} className={buttonClass}>
            {t('management.retry')}
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      {oneTimeSecret && (
        <div
          role="region"
          aria-label={oneTimeSecret.title}
          className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-slate-900"
        >
          <p className="text-sm font-semibold text-amber-950">{oneTimeSecret.title}</p>
          <p className="mt-1 text-xs text-amber-900">{oneTimeSecret.subtitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-base font-semibold text-slate-900">
              {oneTimeSecret.value}
            </code>
            <button type="button" onClick={() => { void handleCopySecret() }} className={buttonClass}>
              {copiedSecret ? (isEnglish ? 'Copied' : 'คัดลอกแล้ว') : (isEnglish ? 'Copy' : 'คัดลอก')}
            </button>
            <button
              type="button"
              onClick={() => setOneTimeSecret(null)}
              className="min-h-11 cursor-pointer rounded-lg px-3 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              {isEnglish ? 'Dismiss' : 'ปิด'}
            </button>
          </div>
        </div>
      )}

      {/* Section A: Cohort Invite Codes */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#11223C]">
              {isEnglish ? 'Cohort Invite Codes' : 'รหัสเชิญประจำรุ่น'}
            </h2>
            <p className="text-xs text-slate-600">
              {isEnglish ? 'Only SHA-256 hashes and prefixes are stored.' : 'ระบบเก็บรหัสเชิญแบบแฮชปลอดภัย (แสดงรหัสเต็มเฉพาะตอนสร้าง)'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => setShowCreateInvite((v) => !v)}
              className={primaryButtonClass}
            >
              {showCreateInvite
                ? (isEnglish ? 'Close form' : 'ปิดแบบฟอร์ม')
                : (isEnglish ? 'New Cohort Invite' : 'สร้างรหัสเชิญรุ่น')}
            </button>
            <button type="button" disabled={busy || loading} onClick={load} className={buttonClass}>
              {t('management.refresh')}
            </button>
          </div>
        </div>

        {showCreateInvite && (
          <form onSubmit={handleCreateInvite} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Cohort year (40–69)' : 'เลขปีรุ่น (40–69)'}</span>
              <input
                type="number"
                min={40}
                max={69}
                required
                value={cohortYear}
                onChange={(e) => setCohortYear(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Cohort label' : 'ชื่อรุ่น (เช่น รุ่น 66)'}</span>
              <input
                type="text"
                required
                maxLength={80}
                placeholder={isEnglish ? 'Cohort 66 (2023)' : 'รุ่น 66 (2566)'}
                value={inviteLabel}
                onChange={(e) => setInviteLabel(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Max seats (1–200)' : 'จำนวนสิทธิ์สูงสุด (1–200)'}</span>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Custom code (optional)' : 'กำหนดรหัสเอง (ไม่บังคับ)'}</span>
              <input
                type="text"
                maxLength={40}
                placeholder={isEnglish ? 'Auto-generated if empty' : 'เว้นว่างเพื่อให้ระบบสุ่มให้'}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={busy} className={primaryButtonClass}>
                {busy ? (isEnglish ? 'Creating...' : 'กำลังสร้าง...') : (isEnglish ? 'Generate Invite Code' : 'สร้างรหัสเชิญรุ่น')}
              </button>
              <button type="button" onClick={() => setShowCreateInvite(false)} className={buttonClass}>
                {t('management.cancel')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p role="status" className="text-sm text-slate-600">{t('management.loading')}</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isEnglish ? 'No cohort invite codes yet.' : 'ยังไม่มีรหัสเชิญรุ่น'}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{invite.label}</p>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {isEnglish ? `Year ${invite.cohort_year}` : `รุ่นปี ${invite.cohort_year}`} ·{' '}
                    <span className="font-mono">{invite.code_hint}</span> · {invite.used_count}/{invite.max_uses}{' '}
                    {isEnglish ? 'used' : 'ใช้ไป'}
                  </p>
                  <p className="mt-1 text-xs font-medium">
                    <span className={invite.is_active ? 'text-emerald-700' : 'text-amber-700'}>
                      {invite.is_active
                        ? (isEnglish ? 'Active' : 'เปิดรับสมัครอยู่')
                        : (isEnglish ? 'Paused' : 'ระงับชั่วคราว')}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { void handleToggleInvite(invite) }}
                  className={buttonClass}
                  aria-label={`${invite.is_active ? (isEnglish ? 'Pause invite' : 'ระงับรหัส') : (isEnglish ? 'Activate invite' : 'เปิดใช้รหัส')} ${invite.label}`}
                >
                  {invite.is_active
                    ? (isEnglish ? 'Pause' : 'ปิดรับสมัคร')
                    : (isEnglish ? 'Activate' : 'เปิดรับสมัคร')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section B: Registered Students Roster & Progress */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#11223C]">
              {isEnglish ? 'Student Roster & Training Progress' : 'รายชื่อพระนิสิตและผลความก้าวหน้า'}
            </h2>
            <p className="text-xs text-slate-600 tabular-nums">
              {isEnglish ? `Showing ${filteredStudents.length} of ${students.length} accounts` : `แสดง ${filteredStudents.length} จากทั้งหมด ${students.length} รูป`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-semibold text-slate-700">
              <span>{isEnglish ? 'Filter by cohort' : 'กรองตามรุ่น'}</span>
              <select
                value={selectedCohortFilter}
                onChange={(e) => setSelectedCohortFilter(e.target.value)}
                className="mt-1 block min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900"
              >
                <option value="all">{isEnglish ? 'All cohorts' : 'ทุกรุ่น'}</option>
                {cohortYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {isEnglish ? `Cohort ${yr}` : `รุ่นปี ${yr}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              <span>{isEnglish ? 'Search ID or name' : 'ค้นหารหัสหรือชื่อ'}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="6611018"
                className="mt-1 block min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900"
              />
            </label>
          </div>
        </div>

        {editingStudent && (
          <form onSubmit={handleSaveStudentEdit} className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Name & Surname' : 'ชื่อ–นามสกุล'}</span>
              <input
                type="text"
                required
                maxLength={80}
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              <span>{isEnglish ? 'Dharma name (optional)' : 'ฉายา (ไม่บังคับ)'}</span>
              <input
                type="text"
                maxLength={80}
                value={editDharmaName}
                onChange={(e) => setEditDharmaName(e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={busy} className={primaryButtonClass}>
                {t('management.save')}
              </button>
              <button type="button" onClick={() => setEditingStudent(null)} className={buttonClass}>
                {t('management.cancel')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p role="status" className="text-sm text-slate-600">{t('management.loading')}</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isEnglish ? 'No student accounts match this filter.' : 'ยังไม่มีบัญชีพระนิสิตตามเงื่อนไขนี้'}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredStudents.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{student.display_name}</span>
                    {student.dharma_name && (
                      <span className="text-sm text-slate-600">({student.dharma_name})</span>
                    )}
                    {student.student_code && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800 tabular-nums">
                        {student.student_code}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {isEnglish ? `Cohort ${student.cohort_year ?? '-'}` : `รุ่นปี ${student.cohort_year ?? '-'}`} ·{' '}
                    {isEnglish ? 'Vocab practiced:' : 'ฝึกคำศัพท์:'} {student.vocab_count ?? 0} ·{' '}
                    {isEnglish ? 'Q&A mastered:' : 'ทวน Q&A:'} {student.qa_count ?? 0} ·{' '}
                    <span className={student.is_active ? 'font-medium text-emerald-700' : 'font-medium text-red-700'}>
                      {student.is_active
                        ? (isEnglish ? 'Active' : 'ปกติ')
                        : (isEnglish ? 'Suspended' : 'ถูกระงับ')}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEditingStudent(student)}
                    className={buttonClass}
                    aria-label={`${isEnglish ? 'Edit' : 'แก้ไข'} ${student.student_code ?? student.display_name}`}
                  >
                    {isEnglish ? 'Edit name' : 'แก้ชื่อ'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { void handleResetPassword(student) }}
                    className={buttonClass}
                    aria-label={`${isEnglish ? 'Reset password' : 'รีเซ็ตรหัสผ่าน'} ${student.student_code ?? student.display_name}`}
                  >
                    {isEnglish ? 'Reset password' : 'รีเซ็ตรหัสชั่วคราว'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { void handleToggleStudentActive(student) }}
                    className={buttonClass}
                    aria-label={`${student.is_active ? (isEnglish ? 'Suspend' : 'ระงับบัญชี') : (isEnglish ? 'Reactivate' : 'เปิดบัญชี')} ${student.student_code ?? student.display_name}`}
                  >
                    {student.is_active
                      ? (isEnglish ? 'Suspend' : 'ระงับบัญชี')
                      : (isEnglish ? 'Reactivate' : 'เปิดบัญชีคืน')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

