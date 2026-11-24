import { useState } from 'react'
import { GuideIcon } from './GuideIcon'
import { accessLabels, getStudentAccessStatus } from '../lib/studentAccess'
import type { Profile } from '../lib/auth'

/** Identity is reviewed by the owner, not by an email sent to the reserved internal address. */
export function StudentAccountStatus({ profile, english, signOut, onGuest }: {
  profile: Profile; english: boolean; signOut(): Promise<void>; onGuest(): void
}) {
  const status = getStudentAccessStatus(profile)
  const label = accessLabels[status]
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const leave = async (guest: boolean) => {
    if (busy) return
    setBusy(true); setFailed(false)
    try { await signOut(); if (guest) onGuest() }
    catch { setFailed(true) } finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-lg py-8">
    <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-amber-50 p-4 text-amber-800"><GuideIcon name={status === 'pending' ? 'clock' : 'info'} className="h-7 w-7" /></span><div>
        <p className="text-sm font-semibold text-amber-800">{english ? label.en : label.th}</p>
        <h1 className="mt-1 text-xl font-semibold text-[#11223c]">{english ? 'Your student account' : 'สถานะบัญชีพระนิสิต'}</h1>
      </div></div>
      <dl className="my-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
        <div><dt className="text-slate-500">{english ? 'Student ID' : 'รหัสนิสิต'}</dt><dd className="font-mono font-bold">{profile.student_code ?? '—'}</dd></div>
        <div><dt className="text-slate-500">{english ? 'Name' : 'ชื่อ–ฉายา'}</dt><dd>{profile.display_name} {profile.dharma_name}</dd></div>
      </dl>
      <p className="text-sm leading-7 text-slate-600">{english ? label.helpEn : label.helpTh}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{english
        ? 'Contact the project coordinator or owner with your student ID and name. Do not send your password. Account verification is performed by the owner.'
        : 'แจ้งรหัสนิสิตและชื่อแก่ผู้ประสานงานโครงการหรือ Owner เพื่อให้ตรวจสอบบัญชี โดยไม่ต้องส่งรหัสผ่าน การยืนยันบัญชีดำเนินการโดย Owner'}</p>
      {failed && <p role="alert" className="my-3 text-sm text-red-700">{english ? 'Could not sign out. Please retry.' : 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่'}</p>}
      <div className="mt-6 grid gap-3">
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-[#11223c] px-4 py-3 text-sm font-semibold text-white">{english ? 'Refresh account status' : 'ตรวจสอบสถานะอีกครั้ง'}</button>
        <button type="button" disabled={busy} onClick={() => void leave(true)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-3 text-sm">{english ? 'Sign out and practice as a guest' : 'ออกจากบัญชีและเข้าฝึกแบบบุคคลทั่วไป'}</button>
        <button type="button" disabled={busy} onClick={() => void leave(false)} className="min-h-11 rounded-xl px-4 py-3 text-sm text-slate-500">{english ? 'Sign out' : 'ออกจากระบบ'}</button>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{english ? 'Guest practice stays on this device and does not sync to your account.' : 'ผลฝึกแบบบุคคลทั่วไปเก็บในเครื่องนี้ และไม่ซิงก์เข้าบัญชีพระนิสิต'}</p>
    </section>
  </div>
}
