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

  const tabs: Array<{ id: NisitTab; icon: GuideIconName; th: string; en: string; stage: 1 | 2 | 3; badge?: string }> = [
    { id: 'drills', icon: 'lotus', th: 'ซ้อมสถานการณ์จำลอง (Drills)', en: 'Interactive Drills', stage: 1, badge: '14 ด่าน' },
    { id: 'cockpit', icon: 'chat', th: 'ผู้ช่วยหน้างานจริง (Cockpit)', en: 'On-Site Cockpit', stage: 2, badge: 'หน้างาน' },
    { id: 'vocab', icon: 'book', th: 'คำศัพท์ & การ์ด', en: 'Vocab & Cards', stage: 1, badge: '7 ท่า' },
    { id: 'audio', icon: 'play', th: 'เสียง + บทอ่านวิ่ง', en: 'Audio & Script', stage: 1, badge: '5:00 น.' },
    { id: 'videos', icon: 'globe', th: 'วิดีโอฝึกฟัง', en: 'Listening Videos', stage: 1, badge: 'สากล' },
    { id: 'qa', icon: 'question', th: 'คลัง Q&A ฝึกตอบ (200 ข้อ)', en: '200 Q&A Flashcards', stage: 1, badge: '200 ข้อ' },
    { id: 'cards', icon: 'clipboard', th: 'จดชื่อ & การ์ดขอบคุณ', en: 'Notes & Card', stage: 3, badge: 'ที่ระลึก' },
  ]

  const stageForTab = (tab: NisitTab): 1 | 2 | 3 => {
    if (tab === 'cockpit') return 2
    if (tab === 'cards') return 3
    return 1
  }

  const currentStage = stageForTab(activeTab)

  return (
    <div className="space-y-6 pb-20 text-brand-text break-words [overflow-wrap:anywhere]">
      {/* Monastic Academy Operational Header */}
      <header className="rounded-3xl border border-[#D5B77E]/80 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#FFFDF9] p-5 sm:p-7 shadow-xs space-y-6">
        {/* Top Strip: Live Cockpit Status on Left, Prominent Monastic Profile / Sign-In on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DFD3]/80 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-gold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isEnglish ? 'LIVE COCKPIT OPERATIONAL' : 'ศูนย์ปฏิบัติการประจำโต๊ะพระนิสิต'}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-brand-terracotta font-medium">
              {isEnglish ? 'Ayutthaya Historic Monk Chat · Wat Mahathat' : 'อยุธยา มังค์แชท วัดมหาธาตุ'}
            </span>
          </div>

          {/* Right: Monastic Profile Identity Bar (Accessible, Prominent, Clickable) */}
          <div className="shrink-0">
            {isSignedStudent && authProfile ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/60 bg-white px-3.5 py-1 text-xs shadow-2xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">🪷</span>
                  <span className="font-serif font-bold text-brand-maroon">
                    {authProfile.display_name}
                    {authProfile.dharma_name ? ` · ${authProfile.dharma_name}` : ''}
                  </span>
                  {authProfile.student_code && (
                    <span className="font-mono text-[11px] bg-brand-gold-soft/90 border border-brand-gold/40 px-2 py-0.5 rounded text-brand-maroon font-bold tabular-nums">
                      รหัส {authProfile.student_code}
                    </span>
                  )}
                  <span className="text-stone-300">|</span>
                  <span className="text-[11px] text-brand-muted hidden sm:inline">
                    {isEnglish
                      ? `Cohort Year ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · Signed in as student · Progress synced to database`
                      : `รุ่นปี ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · บัญชีพระนิสิต · บันทึกความก้าวหน้าลงฐานข้อมูลอัตโนมัติ`}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={showPasswordForm ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Change password' : 'เปลี่ยนรหัสผ่าน')}
                  onClick={() => {
                    setShowPasswordForm((v) => !v)
                    setPasswordError('')
                    setPasswordSaved(false)
                  }}
                  className="inline-flex min-h-8 items-center gap-1 rounded-full border border-brand-border bg-white px-3 text-xs font-semibold text-brand-maroon hover:border-brand-gold hover:bg-stone-50 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span aria-hidden="true">🔑</span>
                  <span>{showPasswordForm ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Change password' : 'เปลี่ยนรหัสผ่าน')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { void signOut() }}
                  className="inline-flex min-h-8 items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-500 hover:text-red-700 hover:bg-stone-50 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span>{isEnglish ? 'Sign out' : 'ออกจากระบบ'}</span>
                </button>
              </div>
            ) : isSuspendedSession ? (
              <div className="flex items-center gap-2">
                <span role="alert" className="text-xs font-medium text-red-700">
                  {isEnglish
                    ? 'This student account is currently suspended. Contact your MonkChat coordinator.'
                    : 'บัญชีนิสิตนี้ถูกระงับการใช้งานชั่วคราว'}
                </span>
                <button
                  type="button"
                  onClick={() => { void signOut() }}
                  className="min-h-8 rounded-full border border-brand-border bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-stone-100 cursor-pointer"
                >
                  {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                </button>
              </div>
            ) : localProfile && parsedCurrentId ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1 text-xs shadow-2xs">
                  <span>📱</span>
                  <span className="font-semibold text-amber-950">{localProfile.fullName}</span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-amber-200 font-bold text-brand-maroon tabular-nums">
                    รหัส {parsedCurrentId.code}
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-[11px] text-amber-900/80 hidden sm:inline">
                    {isEnglish
                      ? `Cohort Year ${parsedCurrentId.thaiYear} · Code ${parsedCurrentId.statusCode} · Seat ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · Stored locally on this device`
                      : `รุ่นปี ${parsedCurrentId.thaiYear} · รหัสสถานะ ${parsedCurrentId.statusCode} · เลขที่ ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · บันทึกเฉพาะเครื่องนี้`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile((v) => !v)}
                  className="inline-flex min-h-8 items-center rounded-full border border-brand-border bg-white px-3 text-xs font-medium text-brand-maroon hover:bg-stone-50 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  {isEditingProfile ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Edit profile' : 'แก้ไขข้อมูลฝึก')}
                </button>

                <button
                  type="button"
                  onClick={handleClearProfile}
                  className="inline-flex min-h-8 items-center rounded-full border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-500 hover:text-red-700 hover:bg-stone-50 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  {isEnglish ? 'Clear' : 'ล้างข้อมูล'}
                </button>
              </div>
            ) : isSignedCmsStaff ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-maroon">
                  {isEnglish ? 'Instructor Preview Mode' : 'โหมดอาจารย์ผู้สอน'}
                </span>
                <Link
                  to={authProfile?.role === 'owner' ? '/admin/students' : '/admin'}
                  className="min-h-8 inline-flex items-center rounded-full bg-brand-gold-soft border border-brand-gold/40 px-3 text-xs font-medium text-brand-maroon"
                >
                  {authProfile?.role === 'owner' ? 'จัดการรุ่นนิสิต' : 'กลับสู่ CMS'}
                </Link>
                <button
                  type="button"
                  onClick={() => { void signOut() }}
                  className="min-h-8 rounded-full border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-500 hover:text-red-700 cursor-pointer"
                >
                  {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/nisit/login"
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-brand-maroon px-3.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-brand-maroon/90 transition-all active:scale-95"
                >
                  <span>🔑</span>
                  <span>{isEnglish ? 'Student Sign In / Register' : 'เข้าสู่ระบบ / สมัครด้วยรหัสเชิญรุ่น'}</span>
                </Link>
                <button
                  type="button"
                  aria-label={isEditingProfile ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Enter ID & Name' : 'ระบุรหัสและชื่อ')}
                  onClick={() => setIsEditingProfile((v) => !v)}
                  className="inline-flex min-h-8 items-center gap-1 rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-medium text-brand-maroon shadow-2xs hover:bg-stone-50 transition-all active:scale-95 cursor-pointer"
                >
                  <span aria-hidden="true">✍️</span>
                  <span>{isEditingProfile ? (isEnglish ? 'Close' : 'ปิด') : (isEnglish ? 'Enter ID & Name' : 'ระบุรหัสและชื่อ')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Password Change Drawer */}
        {passwordSaved && (
          <p role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 font-medium">
            {isEnglish ? 'Password updated.' : 'เปลี่ยนรหัสผ่านสำเร็จแล้ว'}
          </p>
        )}

        {showPasswordForm && (
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-brand-gold/40 bg-white p-4 shadow-sm grid gap-3 sm:grid-cols-3"
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
            <div className="flex items-end">
              <button
                type="submit"
                disabled={passwordBusy}
                className="min-h-9 w-full cursor-pointer rounded-lg bg-brand-maroon px-3 text-xs font-semibold text-white hover:bg-brand-maroon/90 disabled:opacity-50 transition-all active:scale-95"
              >
                {passwordBusy ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...') : (isEnglish ? 'Update password' : 'บันทึกรหัสผ่านใหม่')}
              </button>
            </div>
            {passwordError && (
              <p role="alert" className="text-xs text-red-700 sm:col-span-3">
                {passwordError}
              </p>
            )}
          </form>
        )}

        {/* Collapsible Local Profile Setup Drawer */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-brand-gold/40 bg-white p-4 shadow-sm grid gap-3 sm:grid-cols-3">
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
                className="mt-1 min-h-9 w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-text tabular-nums"
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
                className="mt-1 min-h-9 w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-text"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="min-h-9 w-full cursor-pointer rounded-xl bg-brand-maroon px-4 text-xs font-semibold text-white transition-all active:scale-95 hover:bg-brand-maroon/90 shadow-2xs"
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

        {/* Hero Showcase: Rich Visual Atmosphere + Monastic Guidance */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          {/* Left: Operational Title, Academic Identity & Action Launchers */}
          <div className="max-w-2xl space-y-3">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[2.2rem] font-bold leading-tight text-brand-maroon">
                Ayutthaya Monk Chat Practice Hub
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-normal text-brand-maroon/85 mt-1 font-sans">
                {isEnglish ? 'Student Monk Meditation & Dhamma Dialogue Training' : 'ศูนย์ฝึกนำสมาธิและสนทนาธรรมพระนิสิต'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-[11px] sm:text-xs font-semibold text-amber-900 shadow-2xs">
              <span className="text-amber-600">✨</span>
              <span>
                {isEnglish
                  ? 'Interactive English Dhamma Dialogue & Meditation Hub'
                  : 'ศูนย์ฝึกนำสมาธิภาษาอังกฤษ & ตอบคำถามธรรมะสากลอย่างมั่นใจ'}
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
              {isEnglish
                ? 'Master 200 diplomatic Buddhist Q&As, practice synchronized meditation audio scripts, interactive flashcards, and step into real Monk Chat sessions with confidence.'
                : 'คลัง 200 คำตอบพุทธธรรมสไตล์หลวงพ่อทัตตชีโว พร้อมเสียงซิงก์ซับนำสมาธิ 5 นาที และการ์ดฝึกตอบคำถามชาวต่างชาติ เพื่อให้ทุกรูปพร้อมเป็นธรรมทูตสากลอย่างสง่างาม'}
            </p>

            {/* Quick Action Cockpit Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('cockpit')}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-maroon to-brand-terracotta px-4 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              >
                <span>🎙️</span>
                <span>{isEnglish ? 'Open Live Cockpit' : 'ผู้ช่วยหน้างานจริง (Cockpit)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('drills')}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-brand-gold/60 bg-white hover:bg-brand-gold-soft/60 px-3.5 text-xs font-semibold text-brand-maroon shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <span>🪷</span>
                <span>{isEnglish ? 'Practice 14 Drills' : 'ซ้อมสถานการณ์จำลอง (Drills)'}</span>
              </button>
              <Link
                to="/visit"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3 text-xs font-medium text-stone-700 transition-all active:scale-95 shadow-2xs"
              >
                <span>{isEnglish ? 'View visitor page (/visit)' : 'ดูฝั่งนักท่องเที่ยว (/visit)'}</span>
                <GuideIcon name="external" className="h-3 w-3 text-brand-gold" />
              </Link>
            </div>
          </div>

          {/* Right: Inspiring Real Monk Chat Practice Showcase */}
          <div className="shrink-0 lg:w-[350px] xl:w-[390px] rounded-2xl overflow-hidden border border-[#D5B77E]/80 bg-white shadow-sm relative group">
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-900">
              <img
                src="/images/home/monkchat-slide-3.webp"
                alt="Real Monk Chat meditation session under the trees at Wat Mahathat"
                className="h-full w-full object-cover object-[center_35%] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#FEF3C7] font-semibold">
                  <span>🌿</span>
                  <span>บรรยากาศจริง ณ วัดมหาธาตุ</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/80 text-white font-semibold text-[10px]">
                  <span>🧘‍♂️</span>
                  <span>นำสมาธิใต้ร่มไม้</span>
                </span>
              </div>
            </div>
            <div className="p-3.5 space-y-2.5 bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE]">
              <p className="text-xs font-serif italic text-brand-maroon/90 leading-snug">
                "ฝึกฝนวันละนิด นำสมาธิอย่างเป็นธรรมชาติ สื่อสารธรรมะด้วยความเมตตาถึงใจผู้มาเยือน"
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-stone-200/80 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className="p-1.5 rounded-xl bg-white border border-stone-200 hover:border-brand-gold hover:shadow-2xs transition-all text-center cursor-pointer"
                >
                  <div className="text-xs font-bold text-brand-maroon">5:00 น.</div>
                  <div className="text-[10px] text-stone-500 font-medium">เสียงนำสมาธิ</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qa')}
                  className="p-1.5 rounded-xl bg-white border border-stone-200 hover:border-brand-gold hover:shadow-2xs transition-all text-center cursor-pointer"
                >
                  <div className="text-xs font-bold text-brand-maroon">200 ข้อ</div>
                  <div className="text-[10px] text-stone-500 font-medium">คลังคำตอบ</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('drills')}
                  className="p-1.5 rounded-xl bg-white border border-stone-200 hover:border-brand-gold hover:shadow-2xs transition-all text-center cursor-pointer"
                >
                  <div className="text-xs font-bold text-brand-maroon">14 ด่าน</div>
                  <div className="text-[10px] text-stone-500 font-medium">ซ้อมสถานการณ์</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Dashboard (มาตรวัดสมรรถนะธรรมทูต 4 ด้าน) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Readiness Metric */}
          <div className="rounded-2xl border border-brand-border/70 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-2xs hover:border-brand-gold/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-brand-muted">ความพร้อมออกสนาม</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                พร้อมปฏิบัติ
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-serif text-emerald-800 tabular-nums">95%</span>
              <span className="text-xs text-brand-muted font-medium">ระดับเชี่ยวชาญ</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full w-[95%]"></div>
            </div>
          </div>

          {/* 200 Q&A */}
          <div className="rounded-2xl border border-brand-border/70 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-2xs hover:border-brand-gold/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-brand-muted">คลังพุทธธรรม Q&A</span>
              <span className="text-[10px] font-semibold text-brand-maroon bg-brand-gold-soft border border-brand-gold/30 px-1.5 py-0.5 rounded">
                4 หมวดหลัก
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-serif text-brand-maroon tabular-nums">200</span>
              <span className="text-xs text-brand-muted">ข้อ (หลวงพ่อทัตตชีโว)</span>
            </div>
            <p className="mt-2 text-[11px] text-brand-muted leading-tight">
              พระวินัย, สมาธิ, วัดพระธรรมกาย, วัฒนธรรม
            </p>
          </div>

          {/* 14 Scenarios */}
          <div className="rounded-2xl border border-brand-border/70 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-2xs hover:border-brand-gold/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-brand-muted">สถานการณ์จำลอง</span>
              <span className="text-[10px] font-bold text-brand-maroon bg-brand-gold-soft border border-brand-gold/30 px-1.5 py-0.5 rounded">
                14 ด่านซ้อม
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-serif text-brand-maroon tabular-nums">14</span>
              <span className="text-xs text-brand-muted">ด่านฝึกรับมือ</span>
            </div>
            <p className="mt-2 text-[11px] text-brand-muted leading-tight">
              ซ้อมรับมือทุกสถานการณ์จริงหน้างาน
            </p>
          </div>

          {/* 5:00 Audio */}
          <div className="rounded-2xl border border-brand-border/70 bg-gradient-to-b from-white to-stone-50/80 p-4 shadow-2xs hover:border-brand-gold/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-brand-muted">ผู้ช่วยเสียงสมาธิสากล</span>
              <span className="text-[10px] font-semibold text-brand-gold bg-brand-gold-soft border border-brand-gold/40 px-1.5 py-0.5 rounded">
                One-Tap
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-serif text-brand-gold tabular-nums">5:00</span>
              <span className="text-xs text-brand-muted">นาที (สำเนียงสากล)</span>
            </div>
            <p className="mt-2 text-[11px] text-brand-muted leading-tight">
              กดเปิดให้ชาวต่างชาตินั่งสมาธิได้ทันใจ
            </p>
          </div>
        </div>
      </header>

      {/* 3-Stage Monastic Workflow Controller */}
      <section aria-label={isEnglish ? 'Monk Chat 3-Stage Practice Path' : 'เส้นทางฝึกซ้อม 3 ระยะสู่สนามจริง'} className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-gold px-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-gold"></span>
            <span>{isEnglish ? 'Monk Chat 3-Stage Practice Path' : 'เส้นทางฝึกซ้อม 3 ระยะสู่สนามจริง (3-Stage Practice Path)'}</span>
          </div>
          <span className="text-[11px] font-normal text-brand-muted hidden sm:inline">
            {isEnglish ? 'Select practice phase or switch modules below' : 'แตะสลับระยะการฝึก หรือเลือกชุดฝึกด้านล่าง'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('drills')}
            className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              currentStage === 1
                ? 'border-brand-maroon bg-white ring-2 ring-brand-maroon/20 shadow-xs'
                : 'border-brand-border bg-white/70 hover:border-brand-gold/60 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 1 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}>
                {isEnglish ? 'Stage 1: Pre-Encounter' : 'ระยะ 1: ก่อนลงพื้นที่'}
              </span>
              <span className="text-[11px] font-mono font-bold text-brand-gold">MODE 01</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-2 text-sm sm:text-base">
              {isEnglish ? 'Interactive Scenario Drills' : 'ซ้อมสถานการณ์จำลอง (Drills)'}
            </h3>
            <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">
              {isEnglish ? '5 prep modules: Scenarios, 200 Q&A, Audio script, Vocabulary, Videos.' : '5 ชุดฝึกเตรียมตัว: จำลองสถานการณ์, 200 Q&A, เสียงซิงก์ซับ, คำศัพท์, วิดีโอ'}
            </p>
            <div className="mt-2 text-xs font-semibold text-brand-maroon flex items-center gap-1">
              <span>{currentStage === 1 ? '● กำลังเปิดใช้งาน (5 โมดูลฝึก)' : '➔ แตะเพื่อเปิดชุดฝึก'}</span>
            </div>
          </button>

          {/* Stage 2 */}
          <button
            type="button"
            onClick={() => setActiveTab('cockpit')}
            className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              currentStage === 2
                ? 'border-brand-maroon bg-white ring-2 ring-brand-maroon/20 shadow-xs'
                : 'border-brand-border bg-white/70 hover:border-brand-gold/60 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 2 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}>
                {isEnglish ? 'Stage 2: Live On-Site' : 'ระยะ 2: หน้างานจริง ณ โต๊ะ'}
              </span>
              <span className="text-[11px] font-mono font-bold text-brand-gold">MODE 02</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-2 text-sm sm:text-base">
              {isEnglish ? 'Live On-Site Cockpit' : 'ผู้ช่วยหน้างานจริง (Cockpit)'}
            </h3>
            <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">
              {isEnglish ? 'One-tap 5-min audio, Vinaya phrases, and full-screen cards to show tourists.' : 'เปิดเสียงสมาธิ 5 นาทีทันใจ, ประโยคช่วยชีวิตพระวินัย, และการ์ดยื่นให้ชาวต่างชาติอ่าน'}
            </p>
            <div className="mt-2 text-xs font-semibold text-brand-maroon flex items-center gap-1">
              <span>{currentStage === 2 ? '● กำลังเปิดใช้งาน' : '➔ แตะเพื่อเปิดหน้าช่วยชีวิต'}</span>
            </div>
          </button>

          {/* Stage 3 */}
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              currentStage === 3
                ? 'border-brand-maroon bg-white ring-2 ring-brand-maroon/20 shadow-xs'
                : 'border-brand-border bg-white/70 hover:border-brand-gold/60 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                currentStage === 3 ? 'bg-brand-gold-soft border-brand-gold/40 text-brand-maroon' : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}>
                {isEnglish ? 'Stage 3: Post-Encounter' : 'ระยะ 3: หลังเสร็จกิจกรรม'}
              </span>
              <span className="text-[11px] font-mono font-bold text-brand-gold">MODE 03</span>
            </div>
            <h3 className="font-serif font-bold text-brand-maroon mt-2 text-sm sm:text-base">
              {isEnglish ? 'Thank-You Cards & CMS Sync' : 'การ์ดขอบคุณ & ส่งต่อ CMS'}
            </h3>
            <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">
              {isEnglish ? 'Personalized Thank-You card generator and log visitor questions to CMS.' : 'ออกการ์ดขอบคุณผู้มาเยือนเป็นที่ระลึก และจดบันทึกคำถามส่งเข้าคลัง CMS'}
            </p>
            <div className="mt-2 text-xs font-semibold text-brand-maroon flex items-center gap-1">
              <span>{currentStage === 3 ? '● กำลังเปิดใช้งาน' : '➔ แตะเพื่อเปิดการ์ดขอบคุณ'}</span>
            </div>
          </button>
        </div>
      </section>

      {/* Multi-Tab Workspace Navigation */}
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label={isEnglish ? 'Student training modules' : 'หมวดหมู่การฝึกพระนิสิต'}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 rounded-2xl border border-brand-border bg-white shadow-2xs scrollbar-none"
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
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                  active
                    ? 'bg-gradient-to-r from-brand-maroon to-brand-terracotta-dark text-white shadow-xs border border-brand-maroon'
                    : 'text-stone-700 hover:text-brand-maroon hover:bg-stone-50 border border-transparent'
                }`}
              >
                <GuideIcon name={tab.icon} className={`h-4 w-4 shrink-0 ${active ? 'text-brand-gold' : 'text-stone-500'}`} />
                <span className="whitespace-nowrap">{isEnglish ? tab.en : tab.th}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
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
