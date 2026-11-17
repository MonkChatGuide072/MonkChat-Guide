import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'
import {
  getNisitAdmissionMode,
  invokeStudentCohorts,
  setNisitAdmissionMode,
  type CohortInviteSummary,
  type NisitAdmissionMode,
  type StudentRosterItem,
} from '../../lib/studentPractice'

const buttonClass =
  'min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass =
  'min-h-11 cursor-pointer rounded-lg bg-[#11223C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a3357] disabled:cursor-not-allowed disabled:opacity-50'
const approveButtonClass =
  'min-h-11 cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50'
const inputClass =
  'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900'

/** Owner-only CMS page for Cohort Invite Codes, student roster progress, admission mode & approvals. */
export function AdminStudentsPage() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const { profile } = useAuth()
  const owner = Boolean(profile?.role === 'owner' && profile.is_active)

  const [admissionMode, setAdmissionModeState] = useState<NisitAdmissionMode>(getNisitAdmissionMode())
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all')
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
        admission_mode?: NisitAdmissionMode
      }>({ action: 'list' })
      setInvites(Array.isArray(data.invites) ? data.invites : [])
      setStudents(Array.isArray(data.students) ? data.students : [])
      if (data.admission_mode) {
        setAdmissionModeState(data.admission_mode)
        setNisitAdmissionMode(data.admission_mode)
      }
    } catch {
      if (!supabaseClient) {
        setStudents([
          {
            id: 'mock-stu-1',
            display_name: 'พระมหาชานนท์ ปัญญาวชิโร',
            dharma_name: 'ปัญญาวชิโร',
            student_code: '6611018',
            cohort_year: 66,
            role: 'student',
            is_active: false,
            vocab_count: 0,
            qa_count: 0,
          },
          {
            id: 'mock-stu-2',
            display_name: 'พระกิตติศักดิ์ ญาณวโร',
            dharma_name: 'ญาณวโร',
            student_code: '6611025',
            cohort_year: 66,
            role: 'student',
            is_active: true,
            vocab_count: 6,
            qa_count: 12,
          },
        ])
        setInvites([
          {
            id: 'mock-inv-1',
            cohort_year: 66,
            label: 'รุ่น 66 ภาคเรียนที่ 1/2569',
            code_hint: 'AYT66-***',
            is_active: true,
            max_uses: 60,
            used_count: 2,
            expires_at: null,
            created_at: new Date().toISOString(),
          },
        ])
      } else {
        setError(
          isEnglish
            ? 'Student cohort service is currently unavailable. Please verify migrations and Edge Function deployment.'
            : 'ไม่สามารถเชื่อมต่อระบบจัดการรุ่นพระนิสิตได้ในขณะนี้ กรุณาตรวจสอบการอัปเดตฐานข้อมูลและ Edge Function',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [isEnglish, owner])

  useEffect(() => {
    void load()
  }, [load])

  const pendingStudents = useMemo(() => students.filter((s) => !s.is_active), [students])
  const activeStudents = useMemo(() => students.filter((s) => s.is_active), [students])

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
      if (statusFilter === 'pending' && s.is_active) return false
      if (statusFilter === 'active' && !s.is_active) return false
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
  }, [searchQuery, selectedCohortFilter, statusFilter, students])

  const handleToggleAdmissionMode = async () => {
    if (!owner || busy) return
    const nextMode: NisitAdmissionMode =
      admissionMode === 'auto_approve' ? 'admin_approval' : 'auto_approve'
    setBusy(true)
    setError('')
    setNotice('')
    try {
      setNisitAdmissionMode(nextMode)
      setAdmissionModeState(nextMode)
      try {
        await invokeStudentCohorts({
          action: 'set_admission_mode',
          mode: nextMode,
        })
      } catch {
        // Fallback to client persistence
      }
      setNotice(
        nextMode === 'auto_approve'
          ? (isEnglish
              ? 'Admission mode set to Auto-Approve (Open Access). New students can access immediately.'
              : 'เปิดรับสมัครแบบอนุมัติทันทีแล้ว: พระนิสิตสมัครแล้วเข้าใช้งานได้ทันทีโดยไม่ต้องรอแอดมินยืนยัน')
          : (isEnglish
              ? 'Admission mode set to Admin Approval Required. New students remain pending until approved.'
              : 'ตั้งเป็นโหมดต้องรอแอดมินยืนยันแล้ว: บัญชีสมัครใหม่จะอยู่ในสถานะรอยืนยันจนกว่าแอดมินจะกดยืนยันสิทธิ์'),
      )
    } catch {
      setError(isEnglish ? 'Could not update admission mode.' : 'ไม่สามารถเปลี่ยนโหมดการรับสมัครได้')
    } finally {
      setBusy(false)
    }
  }

  const handleApproveStudent = async (student: StudentRosterItem) => {
    if (!owner || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (!supabaseClient) {
        setStudents((prev) =>
          prev.map((item) => (item.id === student.id ? { ...item, is_active: true } : item)),
        )
        setNotice(
          isEnglish
            ? `Approved student ${student.student_code ?? student.display_name}. Account is now active!`
            : `อนุมัติสิทธิ์ให้ ${student.student_code ?? student.display_name} เรียบร้อยแล้ว สามารถเข้าใช้งานได้ทันที`,
        )
        return
      }
      const data = await invokeStudentCohorts<{ student: StudentRosterItem }>({
        action: 'update_student',
        id: student.id,
        display_name: student.display_name,
        dharma_name: student.dharma_name,
        is_active: true,
      })
      setStudents((prev) =>
        prev.map((item) =>
          item.id === data.student.id ? { ...item, ...data.student } : item,
        ),
      )
      setNotice(
        isEnglish
          ? `Approved student ${data.student.student_code ?? student.display_name}. Account is now active!`
          : `อนุมัติสิทธิ์ให้ ${data.student.student_code ?? student.display_name} เรียบร้อยแล้ว สามารถเข้าใช้งานได้ทันที`,
      )
    } catch {
      setError(isEnglish ? 'Could not approve student.' : 'ไม่สามารถอนุมัติสิทธิ์พระนิสิตได้')
    } finally {
      setBusy(false)
    }
  }

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
      if (!supabaseClient) {
        setStudents((prev) =>
          prev.map((item) =>
            item.id === editingStudent.id
              ? {
                  ...item,
                  display_name: cleanName,
                  dharma_name: editDharmaName.trim() || null,
                }
              : item,
          ),
        )
        setEditingStudent(null)
        setNotice(isEnglish ? 'Student profile updated.' : 'อัปเดตข้อมูลพระนิสิตเรียบร้อย')
        return
      }
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
      if (!supabaseClient) {
        setStudents((prev) =>
          prev.map((item) =>
            item.id === student.id ? { ...item, is_active: !student.is_active } : item,
          ),
        )
        setNotice(
          !student.is_active
            ? (isEnglish ? `Reactivated ${student.student_code ?? student.display_name}.` : 'เปิดใช้งานบัญชีนิสิตแล้ว')
            : (isEnglish ? `Suspended ${student.student_code ?? student.display_name}.` : 'ระงับบัญชีนิสิตชั่วคราวแล้ว'),
        )
        return
      }
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

      {/* Section 1: Admission Mode Policy Switcher */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  admissionMode === 'auto_approve'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {admissionMode === 'auto_approve'
                  ? (isEnglish ? '🟢 Auto-Approve (Open Access)' : '🟢 เปิดรับสมัครเข้าได้ทันที')
                  : (isEnglish ? '🟡 Approval Required (Gated)' : '🟡 ปิดรับตรง (ต้องรอแอดมินยืนยัน)')}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#11223C]">
              {isEnglish ? 'Student Admission Policy' : 'นโยบายการรับสมัครพระนิสิต'}
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:max-w-2xl">
              {admissionMode === 'auto_approve'
                ? (isEnglish
                    ? 'Open access period: Newly registered students are automatically approved and can sign in to /nisit immediately without waiting for admin approval.'
                    : 'เปิดให้คนเข้าได้เลยช่วงนี้: พระนิสิตลงทะเบียนด้วยตนเองแล้ว ระบบจะอนุมัติสิทธิ์ให้อัตโนมัติ สามารถเข้าสู่ระบบมุมฝึก /nisit ได้ทันทีโดยไม่ต้องรอแอดมินยืนยัน')
                : (isEnglish
                    ? 'Gated admission: Newly registered students remain pending until an administrator manually clicks Approve below.'
                    : 'แบบปิดรับตรง: พระนิสิตที่ลงทะเบียนใหม่จะอยู่ในสถานะ "รอยืนยัน" จนกว่าผู้ดูแลระบบจะกดปุ่ม "อนุมัติสิทธิ์" ด้านล่าง')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => { void handleToggleAdmissionMode() }}
              className={admissionMode === 'auto_approve' ? buttonClass : approveButtonClass}
            >
              {admissionMode === 'auto_approve'
                ? (isEnglish ? 'Switch to Approval Required' : 'สลับเป็นโหมดต้องรอแอดมินยืนยัน')
                : (isEnglish ? 'Open Auto-Approve Access' : 'เปิดให้เข้าได้ทันที (Auto-approve)')}
            </button>
            <button type="button" disabled={busy || loading} onClick={load} className={buttonClass}>
              {t('management.refresh')}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Registered Students Roster & Approvals */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#11223C]">
                {isEnglish ? 'Student Roster & Approvals' : 'รายชื่อพระนิสิตและการอนุมัติสิทธิ์'}
              </h2>
              {pendingStudents.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {isEnglish ? `${pendingStudents.length} pending` : `รอยืนยัน ${pendingStudents.length} รูป`}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-600 tabular-nums">
              {isEnglish
                ? `Showing ${filteredStudents.length} of ${students.length} accounts (${activeStudents.length} active, ${pendingStudents.length} pending)`
                : `แสดง ${filteredStudents.length} จากทั้งหมด ${students.length} รูป (อนุมัติแล้ว ${activeStudents.length} รูป, รอยืนยัน ${pendingStudents.length} รูป)`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter Tabs */}
            <div role="tablist" aria-label={isEnglish ? 'Filter status' : 'กรองตามสถานะ'} className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`min-h-9 cursor-pointer rounded-md px-3 font-semibold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEnglish ? `All (${students.length})` : `ทั้งหมด (${students.length})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`min-h-9 cursor-pointer rounded-md px-3 font-semibold transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-100 text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                {isEnglish ? `Pending (${pendingStudents.length})` : `รอยืนยัน (${pendingStudents.length})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`min-h-9 cursor-pointer rounded-md px-3 font-semibold transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-emerald-800'
                }`}
              >
                {isEnglish ? `Active (${activeStudents.length})` : `อนุมัติแล้ว (${activeStudents.length})`}
              </button>
            </div>

            <label className="text-xs font-semibold text-slate-700">
              <span className="sr-only">{isEnglish ? 'Filter by cohort' : 'กรองตามรุ่น'}</span>
              <select
                value={selectedCohortFilter}
                onChange={(e) => setSelectedCohortFilter(e.target.value)}
                className="block min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900"
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
              <span className="sr-only">{isEnglish ? 'Search ID or name' : 'ค้นหารหัสหรือชื่อ'}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEnglish ? 'Search ID or name' : 'ค้นหารหัสหรือชื่อ'}
                className="block min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900"
              />
            </label>
          </div>
        </div>

        {/* Pending Approval Callout Banner */}
        {pendingStudents.length > 0 && statusFilter !== 'pending' && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
            <p>
              <span className="font-semibold">
                {isEnglish ? 'Pending Approvals: ' : 'มีพระนิสิตรอยืนยันสิทธิ์: '}
              </span>
              {isEnglish
                ? `There are ${pendingStudents.length} student account(s) waiting for your confirmation.`
                : `มีพระนิสิต ${pendingStudents.length} รูป สมัครเข้ามาและกำลังรอผู้ดูแลระบบกดยืนยันสิทธิ์`}
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className="cursor-pointer font-bold text-amber-950 underline hover:text-amber-800"
            >
              {isEnglish ? 'View pending only' : 'ดูเฉพาะที่รอยืนยัน'}
            </button>
          </div>
        )}

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
                className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                  student.is_active
                    ? 'border-slate-200 bg-white'
                    : 'border-amber-300 bg-amber-50/40'
                }`}
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
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        student.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                      }`}
                    >
                      {student.is_active
                        ? (isEnglish ? 'Active' : 'อนุมัติแล้ว')
                        : (isEnglish ? 'Suspended' : 'รอยืนยัน')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {isEnglish ? `Cohort ${student.cohort_year ?? '-'}` : `รุ่นปี ${student.cohort_year ?? '-'}`} ·{' '}
                    {isEnglish ? 'Vocab practiced:' : 'ฝึกคำศัพท์:'} {student.vocab_count ?? 0} ·{' '}
                    {isEnglish ? 'Q&A mastered:' : 'ทวน Q&A:'} {student.qa_count ?? 0}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!student.is_active ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { void handleApproveStudent(student) }}
                      className={approveButtonClass}
                      aria-label={`${isEnglish ? 'Approve student' : 'อนุมัติสิทธิ์'} ${student.student_code ?? student.display_name}`}
                    >
                      ✓ {isEnglish ? 'Approve student' : 'อนุมัติสิทธิ์'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { void handleToggleStudentActive(student) }}
                      className={buttonClass}
                      aria-label={`${isEnglish ? 'Suspend' : 'ระงับบัญชี'} ${student.student_code ?? student.display_name}`}
                    >
                      {isEnglish ? 'Suspend' : 'ระงับบัญชี'}
                    </button>
                  )}
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section 3: Cohort Invite Codes (Legacy / Class Groups) */}
      <details className="group rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 text-base font-semibold text-[#11223C] select-none hover:text-brand-terracotta">
          <div className="flex items-center gap-2">
            <span>{isEnglish ? 'Cohort Invite Codes (Legacy / Group Invites)' : 'รหัสเชิญประจำรุ่น (ทางเลือก / สำหรับจัดกลุ่มตามห้อง)'}</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600 tabular-nums">
              {invites.length} {isEnglish ? 'codes' : 'ชุด'}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-600 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>

        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              {isEnglish
                ? 'Issue structured AYT-codes if you wish to group students by classroom. Only SHA-256 hashes are stored.'
                : 'สร้างรหัสเชิญเฉพาะกลุ่มหากต้องการแบ่งกลุ่มนิสิตตามห้องเรียน ระบบจัดเก็บเฉพาะค่าแฮชปลอดภัย'}
            </p>
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
        </div>
      </details>
    </div>
  )
}

