import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { parseNisitStudentId } from '../content/nisitPractice'
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

  const [activeTab, setActiveTab] = useState<NisitTab>('vocab')
  const [profile, setProfile] = useState<LocalNisitProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as LocalNisitProfile) : null
    } catch {
      return null
    }
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [studentIdInput, setStudentIdInput] = useState(profile?.studentId ?? '')
  const [fullNameInput, setFullNameInput] = useState(profile?.fullName ?? '')
  const [profileError, setProfileError] = useState('')

  const parsedCurrentId = profile ? parseNisitStudentId(profile.studentId) : null

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
    setProfile(next)
    setProfileError('')
    setIsEditingProfile(false)
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage quota issues.
    }
  }

  const handleClearProfile = () => {
    setProfile(null)
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

        {/* Local Cohort Study Profile & Phase 2 Readiness Bar */}
        <div className="mt-6 rounded-xl border border-brand-border bg-[#FAF2E6]/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <GuideIcon name="user" className="mt-0.5 h-5 w-5 text-brand-maroon" />
              <div>
                {profile && parsedCurrentId ? (
                  <>
                    <p className="text-sm font-medium text-brand-maroon">
                      {profile.fullName}{' '}
                      <span className="font-normal text-brand-muted tabular-nums">({parsedCurrentId.code})</span>
                    </p>
                    <p className="mt-0.5 text-xs text-brand-muted tabular-nums">
                      {isEnglish
                        ? `Cohort Year ${parsedCurrentId.thaiYear} · Code ${parsedCurrentId.statusCode} · Seat ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · Stored locally on this device`
                        : `รุ่นปี ${parsedCurrentId.thaiYear} · รหัสสถานะ ${parsedCurrentId.statusCode} · เลขที่ ${String(parsedCurrentId.seatNumber).padStart(2, '0')} · บันทึกเฉพาะเครื่องนี้ (เฟส 1)`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-brand-maroon">
                      {isEnglish ? 'Set local student profile (optional)' : 'ระบุรหัส 7 หลักและชื่อ–ฉายา (เก็บในเครื่องนี้ — เฟส 1)'}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-brand-muted">
                      {isEnglish
                        ? 'Enter your 7-digit ID (4011001–6911060) to tag Thank-You cards locally. Phase 2 cohort Invite Code accounts connect to the database next.'
                        : 'กรอกรหัส 7 หลัก (4011001–6911060) เพื่อแสดงชื่อผู้แนะนำบนการ์ดขอบคุณ ระบบสมัครด้วยรหัสเชิญรุ่นและบทบาท student จะเชื่อมฐานข้อมูลในเฟส 2'}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile((v) => !v)}
                className="min-h-11 cursor-pointer rounded-xl border border-brand-border-dark bg-brand-surface px-4 text-sm font-medium text-brand-maroon hover:bg-brand-gold-soft"
              >
                {isEditingProfile
                  ? (isEnglish ? 'Close' : 'ปิด')
                  : profile
                    ? (isEnglish ? 'Edit profile' : 'แก้ไขข้อมูลฝึก')
                    : (isEnglish ? 'Enter ID & Name' : 'ระบุรหัสและชื่อ')}
              </button>
              {profile && (
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
          {activeTab === 'vocab' && <NisitVocabCards isEnglish={isEnglish} />}
          {activeTab === 'audio' && <NisitAudioTeleprompter isEnglish={isEnglish} />}
          {activeTab === 'videos' && <NisitVideoStudy isEnglish={isEnglish} />}
          {activeTab === 'qa' && <NisitFlashcards isEnglish={isEnglish} />}
          {activeTab === 'cards' && (
            <NisitThankYouCard
              isEnglish={isEnglish}
              defaultMonkLabel={profile ? `${profile.fullName} (${profile.studentId})` : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

