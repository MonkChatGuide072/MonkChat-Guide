import type { StudentRosterItem } from './studentPractice'

export type StudentAccessStatus = 'pending' | 'active' | 'suspended' | 'needs_review'
export interface StudentAccessEvent {
  id: string
  from_status: StudentAccessStatus | null
  to_status: StudentAccessStatus
  reason: string | null
  actor_name: string
  created_at: string
}
export const accessStatuses: StudentAccessStatus[] = ['pending', 'active', 'suspended', 'needs_review']
export const accessLabels: Record<StudentAccessStatus, { th: string; en: string; helpTh: string; helpEn: string }> = {
  pending: { th: 'รอยืนยัน', en: 'Awaiting review', helpTh: 'สมัครแล้ว รอ Owner ตรวจชื่อและให้สิทธิ์', helpEn: 'Registered; an owner must verify and approve access.' },
  active: { th: 'เข้าใช้งานได้', en: 'Access granted', helpTh: 'เข้าสู่ระบบและบันทึกผลฝึกในบัญชีได้', helpEn: 'Can sign in and save practice progress.' },
  suspended: { th: 'ระงับสิทธิ์', en: 'Suspended', helpTh: 'พักการเข้าใช้บัญชี จนกว่า Owner จะเปิดสิทธิ์อีกครั้ง', helpEn: 'Account access is paused until an owner restores it.' },
  needs_review: { th: 'ตรวจสถานะเดิม', en: 'Legacy status review', helpTh: 'ข้อมูลเก่ายังแยกไม่ได้ว่ารอยืนยันหรือระงับ ต้องตรวจสอบก่อน', helpEn: 'Older inactive accounts need review before assigning a status.' },
}
/** Missing legacy metadata must never be guessed to mean a new application. */
export function getStudentAccessStatus(student: Pick<StudentRosterItem, 'is_active' | 'student_access_status'>): StudentAccessStatus {
  if (student.is_active) return 'active'
  return student.student_access_status && student.student_access_status !== 'active'
    ? student.student_access_status : 'needs_review'
}
export function canTransitionStudent(from: StudentAccessStatus, to: StudentAccessStatus): boolean {
  return (to === 'active' && ['pending', 'suspended', 'needs_review'].includes(from))
    || (to === 'suspended' && ['active', 'pending', 'needs_review'].includes(from))
}
export function studentStatusCounts(students: StudentRosterItem[]) {
  const counts: Record<StudentAccessStatus, number> = { pending: 0, active: 0, suspended: 0, needs_review: 0 }
  students.forEach(student => counts[getStudentAccessStatus(student)]++)
  return counts
}
