import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getNextRovingTabIndex, parseNisitStudentId } from '../content/nisitPractice'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'
import { isAcceptableStudentPassword } from '../lib/studentPractice'
import { GuideIcon } from '../components/GuideIcon'
import { nisitTrainingModules, type NisitTab } from '../content/nisitTrainingModules'
import '../components/nisit/NisitTraining.css'
import '../components/nisit/NisitTrainingColor.css'
import { NisitModuleArt } from '../components/nisit/NisitModuleArt'
import { NisitVocabCards } from '../components/nisit/NisitVocabCards'
import { NisitAudioTeleprompter } from '../components/nisit/NisitAudioTeleprompter'
import { NisitVideoStudy } from '../components/nisit/NisitVideoStudy'
import { NisitFlashcards } from '../components/nisit/NisitFlashcards'
import { NisitThankYouCard } from '../components/nisit/NisitThankYouCard'
import { NisitInteractiveDrill } from '../components/nisit/NisitInteractiveDrill'
import { MonkChatStoryPlayer } from '../components/nisit/MonkChatStoryPlayer'
import { NisitFieldCockpit } from '../components/nisit/NisitFieldCockpit'


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
  const [drillSubMode, setDrillSubMode] = useState<'story' | 'drills'>('story')
  const [storyInProgress, setStoryInProgress] = useState(false)
  const selectPracticeTab = (next: NisitTab) => {
    if (next === activeTab) return true
    if (activeTab === 'drills' && storyInProgress && !window.confirm(isEnglish
      ? 'Leave this chapter? This practice round will be cleared.'
      : 'ออกจากบทฝึกนี้หรือไม่? การตัดสินใจในรอบนี้จะถูกล้าง')) return false
    setActiveTab(next)
    return true
  }

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

  const tabs = nisitTrainingModules
  const selectedModule = tabs.find((tab) => tab.id === activeTab)!
  const panelRef = useRef<HTMLDivElement>(null)

  const openPractice = (tab: NisitTab) => {
    if (!selectPracticeTab(tab)) return
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
      panelRef.current?.focus({ preventScroll: true })
    })
  }

  return (
    <div className="nisit-training" data-practice={activeTab}>
      <div className="training-account">
        {/* Top Strip: Live Cockpit Status on Left, Prominent Monastic Profile / Sign-In on Right */}
        <div className="training-account-strip">
          <div className="training-location">
            <GuideIcon name="lotus" className="h-4 w-4" />
            <span>Ayutthaya Monk Chat</span>
            <span aria-hidden="true">/</span>
            <span>{isEnglish ? 'Student practice' : 'พื้นที่ฝึกพระนิสิต'}</span>
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

      </div>

      <header className="training-hero">
        <div className="training-hero-copy">
          <p className="training-eyebrow">MONK CHAT · PRACTICE SPACE</p>
          <h1>{isEnglish ? 'Ayutthaya Monk Chat Practice Hub' : 'พื้นที่ฝึกของพระนิสิต'}</h1>
          <p>
            {isEnglish
              ? 'A little practice, at your own pace. Build your vocabulary, rehearse meditation guidance, and explore Dhamma conversations.'
              : 'ทบทวนภาษา ฝึกนำสมาธิ และซ้อมบทสนทนาธรรม เลือกเรื่องที่อยากฝึก แล้วค่อย ๆ เรียนรู้ในจังหวะของตนเอง'}
          </p>
          <div className="training-hero-actions">
            <button type="button" onClick={() => openPractice('vocab')} className="training-primary">
              <span>{isEnglish ? 'Start with vocabulary' : 'เริ่มฝึกคำศัพท์'}</span>
              <GuideIcon name="arrow" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => openPractice('drills')} className="training-secondary">
              <GuideIcon name="chat" className="h-4 w-4" />
              <span>{isEnglish ? 'Try a scenario' : 'ลองซ้อมสถานการณ์'}</span>
            </button>
          </div>
        </div>
        <figure className="training-hero-image">
          <img src="/images/home/monkchat-real-meditation.jpg"
            alt={isEnglish ? 'Monk Chat conversation in the temple grounds' : 'บรรยากาศสนทนา Monk Chat ในบริเวณวัด'} />
          <figcaption>AYUTTHAYA MONK CHAT · WAT MAHATHAT</figcaption>
        </figure>
      </header>

      <div className="training-workspace">
        <aside className="training-sidebar" aria-label={isEnglish ? 'Practice library' : 'คลังฝึกพระนิสิต'}>
          <p className="training-sidebar-title">{isEnglish ? 'Choose your practice' : 'เลือกหมวดที่อยากฝึก'}</p>
          <div role="tablist" aria-label={isEnglish ? 'Student training modules' : 'หมวดหมู่การฝึกพระนิสิต'} className="training-nav">
            {tabs.map((tab, index) => (
              <button key={tab.id} ref={(el) => { tabRefs.current[index] = el }} role="tab" type="button"
                id={`tab-${tab.id}`} data-module={tab.id} aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`training-tab ${tab.id === 'cockpit' ? 'training-tab-tools-start' : ''}`}
                onClick={() => selectPracticeTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.altKey || e.ctrlKey || e.metaKey) return
                  const key = e.key === 'ArrowDown' ? 'ArrowRight' : e.key === 'ArrowUp' ? 'ArrowLeft' : e.key
                  const nextIndex = getNextRovingTabIndex(key, index, tabs.length)
                  if (nextIndex == null) return
                  e.preventDefault()
                  if (!selectPracticeTab(tabs[nextIndex].id)) return
                  tabRefs.current[nextIndex]?.focus()
                }}>
                <span className="training-tab-icon"><NisitModuleArt module={tab.id} compact /></span>
                <span className="training-tab-copy">
                  <strong>{isEnglish ? tab.en : tab.th}</strong>
                  <small>{isEnglish ? tab.detailEn : tab.detailTh}</small>
                </span>
                <GuideIcon name="arrow" className="training-tab-arrow" />
              </button>
            ))}
          </div>
          <Link to="/visit" className="training-sidebar-foot">
            <span>{isEnglish ? 'Visitor area' : 'ไปพื้นที่ผู้มาเยือน'}</span>
            <GuideIcon name="external" className="h-3.5 w-3.5" />
          </Link>
        </aside>

        <div ref={panelRef} role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}
          tabIndex={0} className="training-panel">
          <div className="training-panel-heading">
            <div>
              <p className="training-panel-kicker">{selectedModule.group === 'practice'
                ? (isEnglish ? 'LEARN & REHEARSE' : 'เรียนรู้และฝึกซ้อม')
                : (isEnglish ? 'ACTIVITY TOOLS' : 'เครื่องมือเสริมกิจกรรม')}</p>
              <h2>{isEnglish ? selectedModule.en : selectedModule.th}</h2>
              <p>{activeTab === 'drills' && drillSubMode === 'story'
                ? (isEnglish ? 'Step into a Monk Chat encounter. Choose your words and see how the conversation unfolds.' : 'เข้าสู่เหตุการณ์ Monk Chat เลือกคำพูด แล้วดูว่าบทสนทนาจะดำเนินต่ออย่างไร')
                : (isEnglish ? selectedModule.descriptionEn : selectedModule.descriptionTh)}</p>
            </div>
            <div className="training-panel-illustration"><NisitModuleArt module={activeTab} /></div>
            <span className="training-panel-number" aria-hidden="true">{String(tabs.indexOf(selectedModule) + 1).padStart(2, '0')}</span>
          </div>
          <div className={`training-module ${selectedModule.group === 'tools' ? 'training-tools' : ''}`} data-module={activeTab}>
          {activeTab === 'drills' && (
            <div className="space-y-5">
              {/* Mode Switcher: Story Simulation vs 14 Scenario Drills */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-gradient-to-r from-[#FAF6EE] to-[#F5ECE0] rounded-2xl border border-brand-gold/30">
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setDrillSubMode('story')}
                    aria-pressed={drillSubMode === 'story'}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      drillSubMode === 'story'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <span>{isEnglish ? 'Story Simulation' : 'เรื่องราวต่อเนื่อง'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      drillSubMode === 'story' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isEnglish ? 'Chapter 1' : 'บทที่ 1'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrillSubMode('drills')}
                    aria-pressed={drillSubMode === 'drills'}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      drillSubMode === 'drills'
                        ? 'bg-brand-maroon text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <span>🎯 {isEnglish ? '14 Question Drills' : 'ข้อสอบ 14 สถานการณ์'}</span>
                  </button>
                </div>

                <div className="text-xs text-brand-muted hidden sm:block">
                  {drillSubMode === 'story'
                    ? (isEnglish ? 'Interactive branching dialogue with visitors' : 'บทสนทนาแตกแขนงตามการตัดสินใจจริง')
                    : (isEnglish ? 'Multiple choice & sentence arrangement' : 'โจทย์เลือกตอบและเรียงประโยค')}
                </div>
              </div>

              <div hidden={drillSubMode !== 'story'}>
                <MonkChatStoryPlayer
                  isEnglish={isEnglish}
                  studentCode={authProfile?.student_code ?? localProfile?.studentId ?? 'AYT-MONK'}
                  studentName={
                    authProfile?.display_name ??
                    localProfile?.fullName ??
                    (isEnglish ? 'Student Monk' : 'พระนิสิตผู้ปฏิบัติหน้าที่')
                  }
                  onExit={() => setDrillSubMode('drills')}
                  onProgressChange={setStoryInProgress}
                />
              </div>
              {drillSubMode === 'drills' && (
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
            </div>
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
              key={`vocab-${activeStudentProfileId ?? localProfile?.studentId ?? 'guest'}`}
              isEnglish={isEnglish}
              studentProfileId={activeStudentProfileId}
              progressScope={localProfile?.studentId}
            />
          )}
          {activeTab === 'audio' && <NisitAudioTeleprompter isEnglish={isEnglish} />}
          {activeTab === 'videos' && <NisitVideoStudy isEnglish={isEnglish} />}
          {activeTab === 'qa' && (
            <NisitFlashcards
              key={`qa-${activeStudentProfileId ?? localProfile?.studentId ?? 'guest'}`}
              isEnglish={isEnglish}
              studentProfileId={activeStudentProfileId}
              progressScope={localProfile?.studentId}
            />
          )}
          {activeTab === 'cards' && (
            <NisitThankYouCard
              isEnglish={isEnglish}
              defaultMonkLabel={defaultMonkLabel}
            />
          )}
          </div>
          <p className="training-tip">
            <GuideIcon name="leaf" className="h-4 w-4" />
            <span>{isEnglish ? selectedModule.tipEn : selectedModule.tipTh}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
