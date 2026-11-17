import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getNextRovingTabIndex, parseNisitStudentId } from '../content/nisitPractice'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'
import { isAcceptableStudentPassword } from '../lib/studentPractice'
import { GuideIcon, type GuideIconName } from '../components/GuideIcon'
import { NisitVocabCards } from '../components/nisit/NisitVocabCards'
import { NisitAudioTeleprompter } from '../components/nisit/NisitAudioTeleprompter'
import { NisitVideoStudy } from '../components/nisit/NisitVideoStudy'
import { NisitFlashcards } from '../components/nisit/NisitFlashcards'
import { NisitThankYouCard } from '../components/nisit/NisitThankYouCard'
import { NisitInteractiveDrill } from '../components/nisit/NisitInteractiveDrill'
import { NisitFieldCockpit } from '../components/nisit/NisitFieldCockpit'

type NisitTab = 'drills' | 'cockpit' | 'vocab' | 'audio' | 'videos' | 'qa' | 'cards'

interface LocalNisitProfile {
  studentId: string
  fullName: string
}

const PROFILE_STORAGE_KEY = 'monkchat_nisit_profile_v1'

/** Dedicated Student Monk Training Hub (`/nisit`), separated from public visitor routes. */
export function NisitPracticePage() {
  const { i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const { session, profile: authProfile, signOut } = useAuth()

  const isSignedStudent = Boolean(session && authProfile?.is_active && authProfile.role === 'student')
  const isSignedCmsStaff = Boolean(
    session && authProfile?.is_active && (authProfile.role === 'owner' || authProfile.role === 'team_member'),
  )
  const isSuspendedSession = Boolean(session && authProfile && !authProfile.is_active)

  const [activeTab, setActiveTab] = useState<NisitTab>(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('tab')
      if (
        param === 'drills' ||
        param === 'cockpit' ||
        param === 'qa' ||
        param === 'audio' ||
        param === 'vocab' ||
        param === 'videos' ||
        param === 'cards'
      ) {
        return param
      }
    } catch {
      // Ignore
    }
    return 'vocab'
  })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [localProfile, setLocalProfile] = useState<LocalNisitProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as LocalNisitProfile) : null
    } catch {
      return null
    }
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [studentIdInput, setStudentIdInput] = useState(localProfile?.studentId ?? '')
  const [fullNameInput, setFullNameInput] = useState(localProfile?.fullName ?? '')
  const [profileError, setProfileError] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  const parsedCurrentId = localProfile ? parseNisitStudentId(localProfile.studentId) : null
  const parsedAuthStudentId = authProfile?.student_code ? parseNisitStudentId(authProfile.student_code) : null

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseNisitStudentId(studentIdInput)
    if (!parsed) {
      setProfileError(
        isEnglish
          ? 'Enter a valid 7-digit ID (4011001–6911060, year 40–69 + 110 + seat 01–60).'
          : 'กรุณากรอกรหัสนิสิต 7 หลักให้ถูกต้อง (4011001–6911060 เช่น 6611018)',
      )
      return
    }
    const cleanName = fullNameInput.trim().slice(0, 80)
    if (!cleanName) {
      setProfileError(
        isEnglish ? 'Please enter your name or dharma title.' : 'กรุณากรอกชื่อ–ฉายา–นามสกุลสำหรับแสดงบนเครื่องฝึก',
      )
      return
    }
    const next: LocalNisitProfile = { studentId: parsed.code, fullName: cleanName }
    setLocalProfile(next)
    setProfileError('')
    setIsEditingProfile(false)
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage quota issues.
    }
  }

  const handleClearProfile = () => {
    setLocalProfile(null)
    setStudentIdInput('')
    setFullNameInput('')
    setProfileError('')
    setIsEditingProfile(false)
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    } catch {
      // Ignore storage errors.
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!authProfile || !supabaseClient || passwordBusy) return
    setPasswordError('')
    setPasswordSaved(false)

    const studentCode = authProfile.student_code ?? ''
    if (!isAcceptableStudentPassword(newPassword, studentCode)) {
      setPasswordError(
        isEnglish
          ? 'Use at least 12 characters and avoid your student ID or monkchat+ID.'
          : 'กรุณาตั้งรหัสผ่านใหม่อย่างน้อย 12 ตัวอักษร และห้ามใช้รหัส 7 หลักหรือ monkchat+รหัส',
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(
        isEnglish ? 'Passwords do not match.' : 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน',
      )
      return
    }

    setPasswordBusy(true)
    try {
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordError(
          isEnglish ? 'Could not update password. Please try again.' : 'ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่',
        )
        return
      }
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setShowPasswordForm(false)
    } catch {
      setPasswordError(
        isEnglish ? 'Could not update password. Please try again.' : 'ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่',
      )
    } finally {
      setPasswordBusy(false)
    }
  }

  const activeStudentProfileId = isSignedStudent && authProfile ? authProfile.id : undefined

  const defaultMonkLabel =
    isSignedStudent && authProfile
      ? `${authProfile.display_name}${authProfile.dharma_name ? ` (${authProfile.dharma_name})` : ''}${authProfile.student_code ? ` · ${authProfile.student_code}` : ''}`
      : localProfile
        ? `${localProfile.fullName} (${localProfile.studentId})`
        : undefined

  const tabs: Array<{ id: NisitTab; icon: GuideIconName; th: string; en: string }> = [
    { id: 'drills', icon: 'lotus', th: 'ซ้อมสถานการณ์จำลอง (Drills)', en: 'Interactive Drills' },
    { id: 'cockpit', icon: 'chat', th: 'ผู้ช่วยหน้างานจริง (Cockpit)', en: 'On-Site Cockpit' },
    { id: 'vocab', icon: 'book', th: 'คำศัพท์ & การ์ด', en: 'Vocab & Cards' },
    { id: 'audio', icon: 'play', th: 'เสียง + บทอ่านวิ่ง', en: 'Audio & Script' },
    { id: 'videos', icon: 'globe', th: 'วิดีโอฝึกฟัง', en: 'Listening Videos' },
    { id: 'qa', icon: 'question', th: 'คลัง Q&A ฝึกตอบ (200 ข้อ)', en: '200 Q&A Flashcards' },
    { id: 'cards', icon: 'clipboard', th: 'จดชื่อ & การ์ดขอบคุณ', en: 'Notes & Card' },
  ]

  const stageForTab = (tab: NisitTab): 1 | 2 | 3 => {
    if (tab === 'cockpit') return 2
    if (tab === 'cards') return 3
    return 1
  }

  const currentStage = stageForTab(activeTab)

  return (
    <div className="space-y-6 pb-20 text-brand-text break-words [overflow-wrap:anywhere]">
      {/* Cockpit Operational Header */}
      <header className="rounded-2xl border border-brand-border bg-white p-5 sm:p-7 shadow-xs space-y-5">
        {/* Top Row: Cockpit Brand on Left, Prominent User Profile on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-brand-border/60 pb-5">
          {/* Left: Operational Title & Breadcrumb */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                {isEnglish
                  ? 'MONK CHAT COCKPIT · Ayutthaya Monk Chat Operational System'
                  : 'MONK CHAT COCKPIT · ศูนย์ปฏิบัติการประจำโต๊ะพระนิสิต'}
              </span>
            </div>
            <h1 className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold leading-snug text-brand-maroon">
              {isEnglish ? 'Ayutthaya Monk Chat Practice Hub' : 'Ayutthaya Monk Chat Practice Hub · ศูนย์ฝึกนำสมาธิและสนทนาธรรมพระนิสิต'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-brand-muted">
              {isEnglish
                ? 'Master 200 diplomatic Buddhist Q&As in Luang Por Dattajeevo style, practice synchronized meditation audio scripts, vocabulary cards, and create visitor Thank-You cards.'
                : 'คลังคำถาม-คำตอบ 200 ข้อสไตล์หลวงพ่อทัตตชีโว (4 หมวด หมวดละ 50 ข้อ), ซ้อมอ่านนำสมาธิตามเสียงซิงก์ซับ, คำศัพท์ภาษาอังกฤษ, และเตรียมการ์ดขอบคุณผู้มาเยือนหน้างาน'}
            </p>
            <div className="mt-3">
              <Link
                to="/visit"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-border bg-stone-50 hover:bg-stone-100 px-3 text-xs font-medium text-brand-maroon transition-colors"
              >
                <span>{isEnglish ? 'View visitor page (/visit)' : 'ดูฝั่งนักท่องเที่ยว (/visit)'}</span>
                <GuideIcon name="external" className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right: Prominent Logged-In User Profile Card */}
          <div className="shrink-0 bg-stone-50/90 border border-brand-border rounded-xl p-4 sm:p-5 min-w-[280px]">
            {isSignedStudent && authProfile ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    พร้อมปฏิบัติหน้าที่
                  </span>
                  {authProfile.student_code && (
                    <span className="text-xs font-mono font-medium text-brand-maroon tabular-nums">
                      รหัส {authProfile.student_code}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-base font-bold text-brand-maroon">
                    {authProfile.display_name}
                    {authProfile.dharma_name ? ` · ${authProfile.dharma_name}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted tabular-nums">
                    {isEnglish
                      ? `Cohort Year ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · Signed in as student · Progress synced to database`
                      : `รุ่นปี ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · บัญชีพระนิสิต · บันทึกความก้าวหน้าลงฐานข้อมูลอัตโนมัติ`}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-brand-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm((v) => !v)
                      setPasswordError('')
                      setPasswordSaved(false)
                    }}
                    className="font-medium text-brand-maroon hover:underline cursor-pointer"
                  >
                    {showPasswordForm ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Change password' : 'เปลี่ยนรหัสผ่าน')}
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => { void signOut() }}
                    className="font-medium text-stone-500 hover:text-brand-maroon cursor-pointer"
                  >
                    {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                  </button>
                </div>

                {passwordSaved && (
                  <p role="status" className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs text-emerald-800 font-medium">
                    {isEnglish ? 'Password updated.' : 'เปลี่ยนรหัสผ่านสำเร็จแล้ว'}
                  </p>
                )}

                {showPasswordForm && (
                  <form
                    onSubmit={handleChangePassword}
                    className="mt-3 grid gap-2.5 border-t border-brand-border/60 pt-3"
                  >
                    <label className="block text-xs font-medium text-brand-maroon">
                      <span>{isEnglish ? 'New password (12+ chars)' : 'รหัสผ่านใหม่ (อย่างน้อย 12 ตัว)'}</span>
                      <input
                        type="password"
                        name="new_password"
                        required
                        minLength={12}
                        maxLength={128}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 min-h-9 w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-text"
                      />
                    </label>
                    <label className="block text-xs font-medium text-brand-maroon">
                      <span>{isEnglish ? 'Confirm new password' : 'ยืนยันรหัสผ่านใหม่'}</span>
                      <input
                        type="password"
                        name="confirm_password"
                        required
                        minLength={12}
                        maxLength={128}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 min-h-9 w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-text"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={passwordBusy}
                      className="min-h-9 w-full cursor-pointer rounded-lg bg-brand-maroon px-3 text-xs font-semibold text-white hover:bg-brand-maroon/90 disabled:opacity-50"
                    >
                      {passwordBusy ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...') : (isEnglish ? 'Update password' : 'บันทึกรหัสผ่านใหม่')}
                    </button>
                    {passwordError && (
                      <p role="alert" className="text-xs text-red-700">
                        {passwordError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            ) : isSuspendedSession ? (
              <div className="space-y-2">
                <p role="alert" className="text-xs font-medium text-red-700">
                  {isEnglish
                    ? 'This student account is currently suspended. Contact your MonkChat coordinator.'
                    : 'บัญชีนิสิตนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลโครงการ'}
                </p>
                <button
                  type="button"
                  onClick={() => { void signOut() }}
                  className="min-h-9 rounded-lg border border-brand-border bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-stone-100"
                >
                  {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                </button>
              </div>
            ) : localProfile && parsedCurrentId ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    ทดลองบนเครื่องนี้
                  </span>
                  <span className="text-xs font-mono font-medium text-brand-maroon tabular-nums">
                    รหัส {parsedCurrentId.code}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-maroon">
                    {localProfile.fullName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-brand-muted tabular-nums">
                    {isEnglish
                      ? `Cohort Year ${parsedCurrentId.thaiYear} · Code ${parsedCurrentId.statusCode} · Seat ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · Stored locally on this device`
                      : `รุ่นปี ${parsedCurrentId.thaiYear} · รหัสสถานะ ${parsedCurrentId.statusCode} · เลขที่ ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · บันทึกเฉพาะเครื่องนี้`}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-brand-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((v) => !v)}
                    className="font-medium text-brand-maroon hover:underline cursor-pointer"
                  >
                    {isEditingProfile ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Edit profile' : 'แก้ไขข้อมูลฝึก')}
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearProfile}
                    className="font-medium text-stone-500 hover:text-brand-maroon cursor-pointer"
                  >
                    {isEnglish ? 'Clear' : 'ล้างข้อมูล'}
                  </button>
                </div>
              </div>
            ) : isSignedCmsStaff ? (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-brand-maroon block">
                  {isEnglish ? 'Instructor Preview Mode' : 'โหมดอาจารย์ผู้สอน / ผู้ดูแลระบบ'}
                </span>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  {isEnglish
                    ? 'Previewing all 5 training modules. Practice records will remain local on this browser.'
                    : 'เข้าดูและทดลองชุดฝึกทั้ง 5 หมวดในมุมมองครูผู้สอน ข้อมูลการฝึกซ้อมจะจำลองเฉพาะบนเบราว์เซอร์นี้'}
                </p>
                <div className="flex items-center gap-3 pt-1 border-t border-brand-border/60 text-xs">
                  <Link
                    to={authProfile?.role === 'owner' ? '/admin/students' : '/admin'}
                    className="font-medium text-brand-maroon underline"
                  >
                    {authProfile?.role === 'owner' ? 'จัดการรุ่นนิสิต' : 'กลับสู่ CMS'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { void signOut() }}
                    className="font-medium text-stone-500 hover:text-brand-maroon"
                  >
                    {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-brand-maroon">
                    {isEnglish ? 'Sign in with Cohort ID or practice locally on this device' : 'เข้าสู่ระบบด้วยรหัสนิสิต 7 หลัก หรือทดลองฝึกบนเครื่องนี้'}
                  </p>
                  <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                    {isEnglish
                      ? 'Student accounts sync vocabulary & Q&A progress automatically. Guests can set a local 7-digit ID for Thank-You cards.'
                      : 'เมื่อเข้าสู่ระบบด้วยรหัส 7 หลัก ระบบจะบันทึกความก้าวหน้าลงฐานข้อมูล หรือระบุชื่อบนเครื่องชั่วคราวสำหรับซ้อมออกการ์ดขอบคุณ'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to="/nisit/login"
                    className="inline-flex min-h-9 items-center rounded-lg bg-brand-maroon px-3 text-xs font-semibold text-white hover:bg-brand-maroon/90"
                  >
                    {isEnglish ? 'Student Sign In / Register' : 'เข้าสู่ระบบ / สมัครด้วยรหัสเชิญรุ่น'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((v) => !v)}
                    className="min-h-9 rounded-lg border border-brand-border bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-stone-100"
                  >
                    {isEditingProfile ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Enter ID & Name' : 'ระบุรหัสและชื่อ')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Profile Editing Drawer */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="grid gap-3 border-t border-brand-border/60 pt-4 sm:grid-cols-3">
            <label className="block text-xs font-medium text-brand-maroon">
              <span>{isEnglish ? '7-digit Student ID' : 'รหัสนิสิต 7 หลัก (4011001–6911060)'}</span>
              <input
                type="text"
                name="student_code"
                inputMode="numeric"
                spellCheck={false}
                maxLength={7}
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="6611018"
                className="mt-1 min-h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-text tabular-nums"
              />
            </label>
            <label className="block text-xs font-medium text-brand-maroon">
              <span>{isEnglish ? 'Name & Dharma Name' : 'ชื่อ – ฉายา – นามสกุล'}</span>
              <input
                type="text"
                name="full_name"
                maxLength={80}
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder={isEnglish ? 'e.g. Phra ...' : 'เช่น พระมหา... ฉายา...'}
                className="mt-1 min-h-10 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-text"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="min-h-10 w-full cursor-pointer rounded-xl bg-brand-maroon px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-maroon/90"
              >
                {isEnglish ? 'Save on this device' : 'บันทึกบนเครื่องนี้'}
              </button>
            </div>
            {profileError && (
              <p role="alert" className="text-xs text-red-700 sm:col-span-3">
                {profileError}
              </p>
            )}
          </form>
        )}

        {/* Telemetry Bar (แถบแสดงสถานะความพร้อม Readiness Level) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-brand-border/60">
          <div>
            <span className="text-[11px] text-brand-muted block">สถานะความพร้อมออกสนาม (Readiness)</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-800 tabular-nums">95%</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                เชี่ยวชาญ
              </span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-brand-muted block">คลังพุทธธรรม Q&A สไตล์หลวงพ่อทัตตชีโว</span>
            <p className="text-xl font-bold text-brand-maroon tabular-nums mt-1">
              200 <span className="text-xs font-normal text-stone-500">ข้อ (4 หมวด)</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-brand-muted block">สถานการณ์จำลองข้อปฏิบัติพระวินัย</span>
            <p className="text-xl font-bold text-brand-maroon tabular-nums mt-1">
              14 <span className="text-xs font-normal text-stone-500">สถานการณ์</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-brand-muted block">ผู้ช่วยเสียงสมาธิประจำโต๊ะ</span>
            <p className="text-xl font-bold text-brand-gold tabular-nums mt-1">
              5:00 <span className="text-xs font-normal text-stone-500">นาที (One-Tap)</span>
            </p>
          </div>
        </div>
      </header>

      {/* 3-Stage Monastic Propagation Workflow (Tactile Control Bar) */}
      <section aria-label={isEnglish ? 'Monk Chat 3-Stage Workflow' : 'ผัง 3 ระยะการปฏิบัติหน้าที่ของพระนิสิต'} className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold">
          <span>●</span>
          <span>{isEnglish ? 'Monk Chat 3-Stage Monastic Workflow' : 'ผัง 3 ระยะการปฏิบัติหน้าที่ของพระนิสิต (Monk Chat Workflow)'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Pre-Encounter */}
          <button
            type="button"
            onClick={() => setActiveTab('drills')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              currentStage === 1
                ? 'border-brand-maroon bg-white ring-1 ring-brand-maroon shadow-xs'
                : 'border-brand-border bg-white hover:border-stone-400 hover:bg-stone-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 1 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-700'
              }`}>
                {isEnglish ? 'Stage 1: Pre-Encounter' : 'ระยะ 1: ก่อนลงพื้นที่'}
              </span>
              <span className="text-xs font-mono text-brand-gold font-bold">MODE 01</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-3 text-sm sm:text-base">
              {isEnglish ? 'Interactive Scenario Drills' : 'ซ้อมสถานการณ์จำลอง (Drills)'}
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              {isEnglish
                ? 'Simulate visitor questions, instant Vinaya feedback, word bank scramble, and export Chapter 4 thesis stats.'
                : 'ซ้อมรับมือคำถามพระวินัย, เรียงประโยคนำสมาธิ, และบันทึกสถิติวิจัยลงบทที่ 4'}
            </p>
            <div className="mt-3 text-xs font-medium text-brand-maroon flex items-center gap-1.5">
              <span>{currentStage === 1 ? '● กำลังเปิดใช้งาน (5 โมดูลฝึก)' : '➔ แตะเพื่อเปิดชุดฝึก'}</span>
            </div>
          </button>

          {/* Stage 2: Live On-Site Cockpit */}
          <button
            type="button"
            onClick={() => setActiveTab('cockpit')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              currentStage === 2
                ? 'border-brand-maroon bg-white ring-1 ring-brand-maroon shadow-xs'
                : 'border-brand-border bg-white hover:border-stone-400 hover:bg-stone-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 2 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-700'
              }`}>
                {isEnglish ? 'Stage 2: Live On-Site' : 'ระยะ 2: หน้างานจริง ณ โต๊ะ'}
              </span>
              <span className="text-xs font-mono text-brand-gold font-bold">MODE 02</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-3 text-sm sm:text-base">
              {isEnglish ? 'Live On-Site Cockpit' : 'ผู้ช่วยหน้างานจริง (Cockpit)'}
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              {isEnglish
                ? 'One-tap 5-min meditation audio, quick Vinaya boundaries, and full-screen cards to show tourists.'
                : 'เปิดเสียงสมาธิ 5 นาทีทันใจ, ประโยคช่วยชีวิตพระวินัย, และการ์ดยื่นให้ฝรั่งอ่าน'}
            </p>
            <div className="mt-3 text-xs font-medium text-brand-maroon flex items-center gap-1.5">
              <span>{currentStage === 2 ? '● กำลังเปิดใช้งาน' : '➔ แตะเพื่อเปิดหน้าช่วยชีวิต'}</span>
            </div>
          </button>

          {/* Stage 3: Post-Encounter & CMS Governance */}
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              currentStage === 3
                ? 'border-brand-maroon bg-white ring-1 ring-brand-maroon shadow-xs'
                : 'border-brand-border bg-white hover:border-stone-400 hover:bg-stone-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 3 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-700'
              }`}>
                {isEnglish ? 'Stage 3: Post-Encounter' : 'ระยะ 3: หลังเสร็จกิจกรรม'}
              </span>
              <span className="text-xs font-mono text-brand-gold font-bold">MODE 03</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-3 text-sm sm:text-base">
              {isEnglish ? 'Thank-You Cards & CMS Sync' : 'การ์ดขอบคุณ & ส่งต่อ CMS'}
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              {isEnglish
                ? 'Create personalized Thank-You cards with temple photo and track questions logged to CMS.'
                : 'ออกการ์ดขอบคุณผู้มาเยือนเป็นที่ระลึก และตรวจสถานะคำถามที่ส่งเข้า CMS'}
            </p>
            <div className="mt-3 text-xs font-medium text-brand-maroon flex items-center gap-1.5">
              <span>{currentStage === 3 ? '● กำลังเปิดใช้งาน' : '➔ แตะเพื่อเปิดการ์ดขอบคุณ'}</span>
            </div>
          </button>
        </div>
      </section>

      {/* Multi-Tab Workspace Navigation */}
      <div>
        <div
          role="tablist"
          aria-label={isEnglish ? 'Student training modules' : 'หมวดหมู่การฝึกพระนิสิต'}
          className="flex flex-wrap gap-1.5 rounded-2xl border border-brand-border bg-white p-2 shadow-2xs"
        >
          {tabs.map((tab, index) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[index] = el }}
                role="tab"
                type="button"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  const nextIndex = getNextRovingTabIndex(e.key, index, tabs.length)
                  if (nextIndex == null) return
                  e.preventDefault()
                  setActiveTab(tabs[nextIndex].id)
                  tabRefs.current[nextIndex]?.focus()
                }}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-maroon text-white shadow-xs'
                    : 'text-stone-700 hover:text-brand-maroon hover:bg-stone-100'
                }`}
              >
                <GuideIcon name={tab.icon} className="h-4 w-4" />
                <span>{isEnglish ? tab.en : tab.th}</span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-6"
        >
          {activeTab === 'drills' && (
            <NisitInteractiveDrill
              isEnglish={isEnglish}
              studentCode={authProfile?.student_code ?? localProfile?.studentId ?? 'AYT-MONK'}
              studentName={
                authProfile?.display_name ??
                localProfile?.fullName ??
                (isEnglish ? 'Student Monk' : 'พระนิสิตผู้ปฏิบัติหน้าที่')
              }
            />
          )}
          {activeTab === 'cockpit' && (
            <NisitFieldCockpit
              isEnglish={isEnglish}
              studentCode={authProfile?.student_code ?? localProfile?.studentId ?? 'AYT-MONK'}
              studentName={
                authProfile?.display_name ??
                localProfile?.fullName ??
                (isEnglish ? 'Student Monk' : 'พระนิสิตผู้ปฏิบัติหน้าที่')
              }
            />
          )}
          {activeTab === 'vocab' && (
            <NisitVocabCards
              key={`vocab-${activeStudentProfileId ?? 'guest'}`}
              isEnglish={isEnglish}
              studentProfileId={activeStudentProfileId}
            />
          )}
          {activeTab === 'audio' && <NisitAudioTeleprompter isEnglish={isEnglish} />}
          {activeTab === 'videos' && <NisitVideoStudy isEnglish={isEnglish} />}
          {activeTab === 'qa' && (
            <NisitFlashcards
              key={`qa-${activeStudentProfileId ?? 'guest'}`}
              isEnglish={isEnglish}
              studentProfileId={activeStudentProfileId}
            />
          )}
          {activeTab === 'cards' && (
            <NisitThankYouCard
              isEnglish={isEnglish}
              defaultMonkLabel={defaultMonkLabel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
