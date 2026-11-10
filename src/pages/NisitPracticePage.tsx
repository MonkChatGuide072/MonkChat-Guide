import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { parseNisitStudentId } from '../content/nisitPractice'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'
import { isAcceptableStudentPassword } from '../lib/studentPractice'
import { GuideIcon, type GuideIconName } from '../components/GuideIcon'
import { NisitVocabCards } from '../components/nisit/NisitVocabCards'
import { NisitAudioTeleprompter } from '../components/nisit/NisitAudioTeleprompter'
import { NisitVideoStudy } from '../components/nisit/NisitVideoStudy'
import { NisitFlashcards } from '../components/nisit/NisitFlashcards'
import { NisitThankYouCard } from '../components/nisit/NisitThankYouCard'

type NisitTab = 'vocab' | 'audio' | 'videos' | 'qa' | 'cards'

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

  const [activeTab, setActiveTab] = useState<NisitTab>('vocab')
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
    { id: 'vocab', icon: 'book', th: 'คำศัพท์ & การ์ด', en: 'Vocab & Cards' },
    { id: 'audio', icon: 'play', th: 'เสียง + บทอ่านวิ่ง', en: 'Audio & Script' },
    { id: 'videos', icon: 'globe', th: 'วิดีโอฝึกฟัง', en: 'Listening Videos' },
    { id: 'qa', icon: 'question', th: 'คลัง Q&A ฝึกตอบ', en: 'Q&A Flashcards' },
    { id: 'cards', icon: 'clipboard', th: 'จดชื่อ & การ์ดขอบคุณ', en: 'Notes & Card' },
  ]

  return (
    <div className="space-y-8 pb-20 text-brand-text break-words [overflow-wrap:anywhere]">
      {/* Header Banner */}
      <header className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium text-brand-terracotta">
              <GuideIcon name="book" />
              <span>{isEnglish ? 'Student Monk Training · /nisit' : 'พื้นที่ฝึกทักษะพระนิสิต · /nisit'}</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl font-semibold leading-snug text-brand-maroon sm:text-4xl">
              {isEnglish ? 'Ayutthaya Monk Chat Practice Hub' : 'ศูนย์ฝึกนำสมาธิและสนทนาธรรมพระนิสิต'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">
              {isEnglish
                ? 'Prepare meditation English vocabulary, practice with live synchronized audio scripts, drill verified Q&A flashcards, and prepare visitor Thank-You cards on-site.'
                : 'ฝึกคำศัพท์นำนั่งสมาธิ ซ้อมอ่านออกเสียงตามคลิปซิงก์ซับไตเติล ทบทวนคลัง Q&A ให้มั่นใจ และเตรียมการ์ดขอบคุณผู้มาเยือนหน้างาน'}
            </p>
          </div>

          <Link
            to="/visit"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-brand-border bg-brand-cream px-4 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
          >
            <span>{isEnglish ? 'View visitor page' : 'ดูฝั่งนักท่องเที่ยว (/visit)'}</span>
            <GuideIcon name="external" />
          </Link>
        </div>

        {/* Student Account Bar & Local Study Profile */}
        <div className="mt-6 rounded-xl border border-brand-border bg-[#FAF2E6]/70 p-4">
          {isSignedStudent && authProfile ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <GuideIcon name="user" className="mt-0.5 h-5 w-5 text-brand-maroon" />
                  <div>
                    <p className="text-sm font-medium text-brand-maroon">
                      {authProfile.display_name}
                      {authProfile.dharma_name ? ` · ${authProfile.dharma_name}` : ''}{' '}
                      {authProfile.student_code && (
                        <span className="font-normal text-brand-muted tabular-nums">({authProfile.student_code})</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted tabular-nums">
                      {isEnglish
                        ? `Cohort Year ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · Signed in as student · Progress synced to database`
                        : `รุ่นปี ${authProfile.cohort_year ?? parsedAuthStudentId?.thaiYear ?? '-'} · บัญชีพระนิสิต · บันทึกความก้าวหน้าลงฐานข้อมูลอัตโนมัติ`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm((v) => !v)
                      setPasswordError('')
                      setPasswordSaved(false)
                    }}
                    className="min-h-11 cursor-pointer rounded-xl border border-brand-border-dark bg-brand-surface px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                  >
                    {showPasswordForm
                      ? (isEnglish ? 'Close' : 'ปิด')
                      : (isEnglish ? 'Change password' : 'เปลี่ยนรหัสผ่าน')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void signOut() }}
                    className="min-h-11 cursor-pointer rounded-xl border border-brand-border px-4 text-sm font-medium text-brand-muted hover:bg-white"
                  >
                    {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
                  </button>
                </div>
              </div>

              {passwordSaved && (
                <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {isEnglish ? 'Password updated.' : 'เปลี่ยนรหัสผ่านสำเร็จแล้ว'}
                </p>
              )}

              {showPasswordForm && (
                <form
                  onSubmit={handleChangePassword}
                  className="mt-4 grid gap-3 border-t border-brand-border pt-4 sm:grid-cols-3"
                >
                  <label className="block text-sm font-medium text-brand-maroon">
                    <span>{isEnglish ? 'New password (12+ chars)' : 'รหัสผ่านใหม่ (อย่างน้อย 12 ตัว)'}</span>
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="block text-sm font-medium text-brand-maroon">
                    <span>{isEnglish ? 'Confirm new password' : 'ยืนยันรหัสผ่านใหม่'}</span>
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={passwordBusy}
                      className="min-h-11 w-full cursor-pointer rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark disabled:opacity-50"
                    >
                      {passwordBusy
                        ? (isEnglish ? 'Saving...' : 'กำลังบันทึก...')
                        : (isEnglish ? 'Update password' : 'บันทึกรหัสผ่านใหม่')}
                    </button>
                  </div>
                  {passwordError && (
                    <p role="alert" className="text-sm text-red-700 sm:col-span-3">
                      {passwordError}
                    </p>
                  )}
                </form>
              )}
            </>
          ) : isSuspendedSession ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="alert" className="text-sm font-medium text-red-700">
                {isEnglish
                  ? 'This student account is currently suspended. Contact your MonkChat coordinator.'
                  : 'บัญชีนิสิตนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลโครงการ'}
              </p>
              <button
                type="button"
                onClick={() => { void signOut() }}
                className="min-h-11 cursor-pointer rounded-xl border border-brand-border bg-white px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
              >
                {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
              </button>
            </div>
          ) : (
            <>
              {isSignedCmsStaff && authProfile && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3 text-xs text-brand-muted">
                  <span>
                    {isEnglish
                      ? `Browsing as staff: ${authProfile.display_name}`
                      : `เข้าดูด้วยบัญชีทีมงาน: ${authProfile.display_name}`}
                  </span>
                  <Link
                    to={authProfile.role === 'owner' ? '/admin/students' : '/admin'}
                    className="font-medium text-brand-maroon underline"
                  >
                    {authProfile.role === 'owner'
                      ? (isEnglish ? 'Manage student cohorts' : 'จัดการรุ่นนิสิต (/admin/students)')
                      : (isEnglish ? 'Open CMS' : 'กลับสู่หน้าจัดการเว็บ')}
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <GuideIcon name="user" className="mt-0.5 h-5 w-5 text-brand-maroon" />
                  <div>
                    {localProfile && parsedCurrentId ? (
                      <>
                        <p className="text-sm font-medium text-brand-maroon">
                          {localProfile.fullName}{' '}
                          <span className="font-normal text-brand-muted tabular-nums">({parsedCurrentId.code})</span>
                        </p>
                        <p className="mt-0.5 text-xs text-brand-muted tabular-nums">
                          {isEnglish
                            ? `Cohort Year ${parsedCurrentId.thaiYear} · Code ${parsedCurrentId.statusCode} · Seat ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · Stored locally on this device`
                            : `รุ่นปี ${parsedCurrentId.thaiYear} · รหัสสถานะ ${parsedCurrentId.statusCode} · เลขที่ ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · บันทึกเฉพาะเครื่องนี้`}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-brand-maroon">
                          {isEnglish
                            ? 'Sign in with Cohort ID or practice locally on this device'
                            : 'เข้าสู่ระบบด้วยรหัสนิสิต 7 หลัก หรือทดลองฝึกบนเครื่องนี้'}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-brand-muted">
                          {isEnglish
                            ? 'Student accounts sync vocabulary & Q&A progress automatically. Guests can set a local 7-digit ID for Thank-You cards.'
                            : 'เมื่อเข้าสู่ระบบด้วยรหัส 7 หลัก ระบบจะบันทึกความก้าวหน้าลงฐานข้อมูล หรือระบุชื่อบนเครื่องชั่วคราวสำหรับซ้อมออกการ์ดขอบคุณ'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isSignedCmsStaff && (
                    <Link
                      to="/nisit/login"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
                    >
                      <span>{isEnglish ? 'Student Sign In / Register' : 'เข้าสู่ระบบ / สมัครด้วยรหัสเชิญรุ่น'}</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((v) => !v)}
                    className="min-h-11 cursor-pointer rounded-xl border border-brand-border-dark bg-brand-surface px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
                  >
                    {isEditingProfile
                      ? (isEnglish ? 'Close' : 'ปิด')
                      : localProfile
                        ? (isEnglish ? 'Edit profile' : 'แก้ไขข้อมูลฝึก')
                        : (isEnglish ? 'Enter ID & Name' : 'ระบุรหัสและชื่อ')}
                  </button>
                  {localProfile && (
                    <button
                      type="button"
                      onClick={handleClearProfile}
                      className="min-h-11 cursor-pointer rounded-xl border border-brand-border px-3 text-xs font-medium text-brand-muted hover:bg-white"
                    >
                      {isEnglish ? 'Clear' : 'ล้างข้อมูล'}
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <form onSubmit={handleSaveProfile} className="mt-4 grid gap-3 border-t border-brand-border pt-4 sm:grid-cols-3">
                  <label className="block text-sm font-medium text-brand-maroon">
                    <span>{isEnglish ? '7-digit Student ID' : 'รหัสนิสิต 7 หลัก (4011001–6911060)'}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={7}
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      placeholder="6611018"
                      className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text tabular-nums"
                    />
                  </label>
                  <label className="block text-sm font-medium text-brand-maroon">
                    <span>{isEnglish ? 'Name & Dharma Name' : 'ชื่อ – ฉายา – นามสกุล'}</span>
                    <input
                      type="text"
                      maxLength={80}
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder={isEnglish ? 'e.g. Phra ...' : 'เช่น พระมหา... ฉายา...'}
                      className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="min-h-11 w-full cursor-pointer rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
                    >
                      {isEnglish ? 'Save on this device' : 'บันทึกบนเครื่องนี้'}
                    </button>
                  </div>
                  {profileError && (
                    <p role="alert" className="text-sm text-red-700 sm:col-span-3">
                      {profileError}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </header>

      {/* 5-Tab Workspace Navigation */}
      <div>
        <div
          role="tablist"
          aria-label={isEnglish ? 'Student training modules' : 'หมวดหมู่การฝึกพระนิสิต'}
          className="flex flex-wrap gap-2 rounded-2xl border border-brand-border bg-brand-surface p-2"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-brand-terracotta text-white'
                    : 'text-brand-maroon hover:bg-brand-gold-soft'
                }`}
              >
                <GuideIcon name={tab.icon} />
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

