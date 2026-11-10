import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'
import { parseNisitStudentId } from '../content/nisitPractice'
import {
  invokeStudentRegister,
  isAcceptableStudentPassword,
  toStudentInternalEmail,
} from '../lib/studentPractice'
import { GuideIcon } from '../components/GuideIcon'

/** Student monk login & Cohort Invite Code registration at `/nisit/login`. */
export function NisitLoginPage() {
  const { i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const navigate = useNavigate()
  const { session, profile, isLoading: isAuthLoading, signOut } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginCode, setLoginCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [inviteCode, setInviteCode] = useState('')
  const [regCode, setRegCode] = useState('')
  const [regName, setRegName] = useState('')
  const [regDharmaName, setRegDharmaName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isAuthLoading && session && profile && profile.is_active) {
      navigate('/nisit', { replace: true })
    }
  }, [session, profile, isAuthLoading, navigate])

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabaseClient) {
      setErrorMsg(
        isEnglish
          ? 'Authentication service is not configured yet.'
          : 'ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบยืนยันตัวตนในสภาพแวดล้อมนี้',
      )
      return
    }
    const parsed = parseNisitStudentId(loginCode)
    if (!parsed) {
      setErrorMsg(
        isEnglish
          ? 'Enter a valid 7-digit student ID (4011001–6911060).'
          : 'กรุณากรอกรหัสนิสิต 7 หลักให้ถูกต้อง (4011001–6911060 เช่น 6611018)',
      )
      return
    }
    if (!loginPassword) {
      setErrorMsg(isEnglish ? 'Please enter your password.' : 'กรุณากรอกรหัสผ่าน')
      return
    }

    setBusy(true)
    setErrorMsg('')
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: toStudentInternalEmail(parsed.code),
        password: loginPassword,
      })
      if (error) {
        setErrorMsg(
          isEnglish
            ? 'Invalid student ID or password. Please check with your cohort administrator if you forgot it.'
            : 'รหัสนิสิตหรือรหัสผ่านไม่ถูกต้อง หากลืมรหัสผ่านกรุณาแจ้งผู้ดูแลระบบออกรหัสชั่วคราวให้ใหม่',
        )
      }
    } catch {
      setErrorMsg(
        isEnglish ? 'Unable to sign in right now.' : 'ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองใหม่',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabaseClient) {
      setErrorMsg(
        isEnglish
          ? 'Registration service is not configured yet.'
          : 'ยังไม่ได้ตั้งค่าการเชื่อมต่อระบบลงทะเบียนในสภาพแวดล้อมนี้',
      )
      return
    }
    const parsed = parseNisitStudentId(regCode)
    if (!parsed) {
      setErrorMsg(
        isEnglish
          ? 'Enter a valid 7-digit student ID (4011001–6911060).'
          : 'รหัสนิสิตต้องเป็นเลข 7 หลักระหว่าง 4011001–6911060 (เช่น 6611018)',
      )
      return
    }
    const cleanInvite = inviteCode.trim().toUpperCase().replace(/\s+/g, '')
    if (cleanInvite.length < 6) {
      setErrorMsg(
        isEnglish ? 'Enter the cohort invite code provided in class.' : 'กรุณากรอกรหัสเชิญประจำรุ่นที่ได้รับจากผู้ดูแล',
      )
      return
    }
    if (!regName.trim()) {
      setErrorMsg(isEnglish ? 'Enter your name and surname.' : 'กรุณากรอกชื่อ–นามสกุล')
      return
    }
    if (!isAcceptableStudentPassword(regPassword, parsed.code)) {
      setErrorMsg(
        isEnglish
          ? 'Password must be 12–128 characters and cannot match your student ID or monkchat+ID.'
          : 'รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษร และห้ามซ้ำกับรหัสนิสิตหรือคำว่า monkchat+รหัส',
      )
      return
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg(isEnglish ? 'Passwords do not match.' : 'รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }

    setBusy(true)
    setErrorMsg('')
    try {
      await invokeStudentRegister({
        invite_code: cleanInvite,
        student_code: parsed.code,
        display_name: regName.trim(),
        dharma_name: regDharmaName.trim() || undefined,
        password: regPassword,
      })

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: toStudentInternalEmail(parsed.code),
        password: regPassword,
      })
      if (error) {
        setMode('login')
        setLoginCode(parsed.code)
        setErrorMsg(
          isEnglish
            ? 'Account created. Please sign in with your new password.'
            : 'สร้างบัญชีสำเร็จแล้ว กรุณากรอกรหัสผ่านที่ตั้งไว้เพื่อเข้าสู่ระบบ',
        )
      }
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : 'serviceUnavailable'
      const messages: Record<string, { th: string; en: string }> = {
        invalidInvite: {
          th: 'รหัสเชิญประจำรุ่นไม่ถูกต้อง หมดอายุ เต็มจำนวน หรือไม่ตรงกับปีรุ่นของรหัสนิสิต',
          en: 'Invalid, expired, full, or wrong-cohort invite code.',
        },
        weakPassword: {
          th: 'รหัสผ่านไม่ผ่านเกณฑ์ความปลอดภัย (ต้องยาว 12 ตัวขึ้นไป และไม่ใช้รหัสประจำตัวหรือ monkchat+รหัส)',
          en: 'Password must be at least 12 characters and avoid predictable patterns.',
        },
        duplicateStudent: {
          th: 'รหัสนิสิตนี้ถูกลงทะเบียนไว้แล้ว หากเข้าไม่ได้กรุณาติดต่อผู้ดูแลระบบ',
          en: 'This student ID is already registered.',
        },
        partialCreate: {
          th: 'บัญชีถูกสร้างบางส่วน กรุณาติดต่อผู้ดูแลระบบตรวจสอบก่อนลองใหม่',
          en: 'Account partially created. Please contact your administrator.',
        },
      }
      const match = messages[code]
      setErrorMsg(
        match
          ? (isEnglish ? match.en : match.th)
          : (isEnglish ? 'Registration service is currently unavailable.' : 'ระบบลงทะเบียนยังไม่พร้อมใช้งานในขณะนี้'),
      )
    } finally {
      setBusy(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-border border-t-brand-terracotta" />
      </div>
    )
  }

  if (session && (!profile || !profile.is_active)) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div className="rounded-2xl border border-red-200 bg-brand-surface p-6">
          <h1 className="font-serif text-xl font-semibold text-red-800">
            {isEnglish ? 'Account suspended or missing' : 'บัญชีถูกระงับหรือไม่พบสิทธิ์การใช้งาน'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            {isEnglish
              ? 'Your account is currently inactive. Please contact the coordinator or sign out to continue as a guest.'
              : 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่ออาจารย์/ผู้ดูแลระบบ หรือออกจากระบบเพื่อเข้าโหมดฝึกแบบไม่ล็อกอิน'}
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-4 min-h-11 w-full cursor-pointer rounded-xl border border-red-200 px-4 text-sm font-medium text-red-800 hover:bg-red-50"
          >
            {isEnglish ? 'Sign out' : 'ออกจากระบบ'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-8">
      <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface lg:grid lg:grid-cols-[0.88fr_1.12fr]">
        <section className="flex flex-col justify-between gap-6 border-b border-brand-border bg-[#FAF2E6]/80 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="space-y-4">
            <img
              src="/images/logo/ayutthaya-monk-chat-logo.png"
              alt="Ayutthaya Monk Chat"
              className="h-16 w-16 object-contain"
            />
            <p className="text-xs font-medium text-brand-terracotta">
              {isEnglish ? 'Student Monk Training · /nisit/login' : 'ระบบบัญชีพระนิสิต · /nisit/login'}
            </p>
            <h1 className="font-serif text-2xl font-semibold leading-snug text-brand-maroon">
              {isEnglish ? 'Cohort Training Access' : 'เข้าสู่มุมฝึกพระนิสิตประจำรุ่น'}
            </h1>
            <p className="text-sm leading-6 text-brand-muted">
              {isEnglish
                ? 'Use your 7-digit student code (e.g. 6611018) to sign in and sync your vocabulary & Q&A drill progress across devices.'
                : 'ใช้รหัสนิสิต 7 หลัก (เช่น 6611018) เพื่อเข้าสู่ระบบและบันทึกความคืบหน้าการฝึกคำศัพท์และคลัง Q&A ลงในบัญชีรุ่นของคุณ'}
            </p>
          </div>

          <div className="space-y-2 border-t border-brand-border pt-4 text-xs leading-5 text-brand-muted">
            <p>
              {isEnglish
                ? 'Student accounts (student) are isolated from the team CMS (/admin).'
                : 'บัญชีนิสิต (role: student) แยกสิทธิ์จากระบบหลังบ้าน CMS (/admin) อย่างชัดเจน'}
            </p>
            <Link
              to="/nisit"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-maroon hover:underline"
            >
              <GuideIcon name="arrow" className="h-[18px] w-[18px] rotate-180" />
              <span>{isEnglish ? 'Back to practice hub' : 'กลับสู่มุมฝึกพระนิสิต'}</span>
            </Link>
          </div>
        </section>

        <section className="p-6 sm:p-8">
          <div role="tablist" className="grid grid-cols-2 gap-2 rounded-xl border border-brand-border bg-brand-cream p-1">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => { setMode('login'); setErrorMsg('') }}
              className={`min-h-11 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                mode === 'login' ? 'bg-brand-terracotta text-white' : 'text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              {isEnglish ? 'Sign in' : 'เข้าสู่ระบบ'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => { setMode('register'); setErrorMsg('') }}
              className={`min-h-11 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                mode === 'register' ? 'bg-brand-terracotta text-white' : 'text-brand-maroon hover:bg-brand-gold-soft'
              }`}
            >
              {isEnglish ? 'Register cohort code' : 'ลงทะเบียนด้วยรหัสเชิญ'}
            </button>
          </div>

          {errorMsg && (
            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-brand-maroon">
                <span>{isEnglish ? '7-digit Student ID' : 'รหัสนิสิต 7 หลัก'}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={7}
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="6611018"
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text tabular-nums"
                />
              </label>

              <label className="block text-sm font-medium text-brand-maroon">
                <span>{isEnglish ? 'Password' : 'รหัสผ่านส่วนตัว'}</span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="min-h-11 w-full cursor-pointer rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark disabled:opacity-50"
              >
                {busy
                  ? (isEnglish ? 'Signing in...' : 'กำลังเข้าสู่ระบบ...')
                  : (isEnglish ? 'Sign in to /nisit' : 'เข้าสู่ระบบฝึกนิสิต')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-brand-maroon">
                <span>{isEnglish ? 'Cohort Invite Code' : 'รหัสเชิญประจำรุ่น (Invite Code)'}</span>
                <input
                  type="text"
                  required
                  maxLength={40}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="AYT66-XXXX-YYYY"
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base uppercase text-brand-text tabular-nums"
                />
              </label>

              <label className="block text-sm font-medium text-brand-maroon">
                <span>{isEnglish ? '7-digit Student ID (4011001–6911060)' : 'รหัสนิสิต 7 หลัก (4011001–6911060)'}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={7}
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  placeholder="6611018"
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text tabular-nums"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-brand-maroon">
                  <span>{isEnglish ? 'Full name' : 'ชื่อ – นามสกุล'}</span>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isEnglish ? 'e.g. Phra Somchai ...' : 'เช่น พระมหา... นามสกุล...'}
                    className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                  />
                </label>

                <label className="block text-sm font-medium text-brand-maroon">
                  <span>{isEnglish ? 'Dharma name (optional)' : 'ฉายา (ถ้ามี)'}</span>
                  <input
                    type="text"
                    maxLength={80}
                    value={regDharmaName}
                    onChange={(e) => setRegDharmaName(e.target.value)}
                    placeholder={isEnglish ? 'e.g. Sutthipanyo' : 'เช่น สุทฺธิปญฺโญ'}
                    className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-brand-maroon">
                  <span>{isEnglish ? 'Choose password (12+ chars)' : 'ตั้งรหัสผ่าน (12 ตัวขึ้นไป)'}</span>
                  <input
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                  />
                </label>

                <label className="block text-sm font-medium text-brand-maroon">
                  <span>{isEnglish ? 'Confirm password' : 'ยืนยันรหัสผ่าน'}</span>
                  <input
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
                  />
                </label>
              </div>

              <p className="text-xs leading-5 text-brand-muted">
                {isEnglish
                  ? 'Password must not match your student ID or monkchat+ID.'
                  : 'รหัสผ่านห้ามตั้งตรงกับเลขรหัสประจำตัว หรือสูตร monkchat+รหัส'}
              </p>

              <button
                type="submit"
                disabled={busy}
                className="min-h-11 w-full cursor-pointer rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark disabled:opacity-50"
              >
                {busy
                  ? (isEnglish ? 'Creating account...' : 'กำลังลงทะเบียน...')
                  : (isEnglish ? 'Register & start learning' : 'ยืนยันลงทะเบียนและเข้าฝึก')}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

