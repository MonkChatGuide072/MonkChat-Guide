export interface ParsedStudentCode {
  code: string
  thaiYear: number
  statusCode: string
  seatNumber: number
}

const STUDENT_CODE_REGEX = /^([4-6]\d)(110)(0[1-9]|[1-5]\d|60)$/
const SAFE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const SAFE_PASS_CHARS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%'

/** Validates MCU student codes in range 4011001–6911060. */
export function parseStudentCode(raw: unknown): ParsedStudentCode | null {
  if (typeof raw !== 'string') return null
  const code = raw.trim()
  const match = code.match(STUDENT_CODE_REGEX)
  if (!match) return null
  return {
    code,
    thaiYear: Number(match[1]),
    statusCode: match[2],
    seatNumber: Number(match[3]),
  }
}

/** Reserved non-routable internal domain (RFC 2606) so student auth never hits real public domains. */
export function toStudentInternalEmail(studentCode: string): string {
  return `${studentCode}@student.monkchat.invalid`
}

/** Rejects short passwords and predictable formulas such as ID=Password or monkchat+ID. */
export function isAcceptableStudentPassword(password: unknown, studentCode: string): password is string {
  if (typeof password !== 'string') return false
  if (password.length < 12 || password.length > 128) return false
  const lower = password.trim().toLowerCase()
  const lowerId = studentCode.toLowerCase()
  if (lower === lowerId) return false
  if (lower === `monkchat${lowerId}` || lower === `${lowerId}monkchat`) return false
  return true
}

export function normalizeInviteCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase().replace(/\s+/g, '') : ''
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateCohortInviteCode(cohortYear: number): string {
  const random = new Uint8Array(8)
  crypto.getRandomValues(random)
  const chars = Array.from(random, (byte) => SAFE_CODE_CHARS[byte % SAFE_CODE_CHARS.length]).join('')
  return `AYT${cohortYear}-${chars.slice(0, 4)}-${chars.slice(4)}`
}

export function generateRandomPassword(length = 14): string {
  const safeLength = Math.max(12, Math.min(32, length))
  const random = new Uint8Array(safeLength)
  crypto.getRandomValues(random)
  return Array.from(random, (byte) => SAFE_PASS_CHARS[byte % SAFE_PASS_CHARS.length]).join('')
}

