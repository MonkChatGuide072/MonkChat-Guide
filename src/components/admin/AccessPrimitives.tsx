import { useEffect, useId, useRef, type ReactNode } from 'react'
import { GuideIcon } from '../GuideIcon'
import './AccessCenter.css'

export function AccessDialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const heading = useId()
  const ref = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const old = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = ref.current
    dialog?.focus()
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) { event.preventDefault(); close.current() }
      if (event.key !== 'Tab' || !dialog) return
      const all = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]'))
      if (!all.length) { event.preventDefault(); return }
      const first = all[0], last = all[all.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handle)
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = overflow; old?.focus() }
  }, [busy])
  return <div className="access-dialog-backdrop"><div ref={ref} className="access-center access-dialog" role="dialog" aria-modal="true" aria-labelledby={heading} tabIndex={-1}>
    <header className="access-dialog-heading"><h2 id={heading}>{title}</h2><button type="button" className="access-icon-button" onClick={onClose} disabled={busy} aria-label="Close / ปิด"><GuideIcon name="close" /></button></header>{children}
  </div></div>
}

export function AccessRoleGuide({ english = false }: { english?: boolean }) {
  return <details className="access-role-guide"><summary><GuideIcon name="info" />{english ? 'Who can do what?' : 'แต่ละบัญชีทำอะไรได้บ้าง?'}</summary>
    <div className="access-role-grid">
      <div><strong>{english ? 'Student monks' : 'พระนิสิต'}</strong><p>{english ? 'Practice and save their own progress. No access to site management.' : 'ฝึกและบันทึกผลของตนเอง เข้าแก้เนื้อหาหรือจัดการบัญชีผู้อื่นไม่ได้'}</p><a href="/admin/students">{english ? 'Manage student access' : 'จัดการสิทธิ์พระนิสิต'} →</a></div>
      <div><strong>{english ? 'Team members' : 'ทีมงาน'}</strong><p>{english ? 'Manage published content. Cannot approve users or create owners.' : 'จัดการเนื้อหาเว็บไซต์ แต่ให้สิทธิ์บัญชีหรือเพิ่ม Owner ไม่ได้'}</p><a href="/admin/team">{english ? 'Manage team members' : 'จัดการบัญชีทีมงาน'} →</a></div>
      <div><strong>Owner</strong><p>{english ? 'Verify applicants, grant or suspend access, manage the team and admission policy.' : 'ตรวจผู้สมัคร ให้หรือระงับสิทธิ์ จัดการทีมงาน และกำหนดรูปแบบรับสมัคร'}</p></div>
    </div>
  </details>
}
