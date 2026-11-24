import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StudentAccessWorkspace, type StudentAccessApi, type StudentAccessData } from './StudentAccessWorkspace'
import { getStudentAccessStatus, studentStatusCounts } from '../../lib/studentAccess'
import { getNisitAdmissionMode } from '../../lib/studentPractice'
import { StudentAccountStatus } from '../StudentAccountStatus'

const student = { id: 'student-1', display_name: 'Phra Test', dharma_name: null, student_code: '6611018', cohort_year: 66, role: 'student' as const, is_active: false, student_access_status: 'pending' as const }
function fixture(overrides: Partial<StudentAccessData> = {}) {
  const data: StudentAccessData = { students: [student], invites: [], admission_mode: 'admin_approval', access_management_ready: true, ...overrides }
  const api: StudentAccessApi = { list: vi.fn(async () => data), request: vi.fn(async body => body.action === 'student_access_history' ? { events: [] } : { student: { ...student, student_access_status: body.status, is_active: body.status === 'active' } }) }
  return api
}
const openAccount = async () => fireEvent.click(await screen.findByRole('button', { name: 'Review account 6611018' }))

describe('student access workspace', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key), clear: () => values.clear() })
  })
  afterEach(() => vi.unstubAllGlobals())
  it('classifies historical inactive accounts separately from pending applications', () => {
    const legacy = { ...student, student_access_status: undefined }
    expect(getStudentAccessStatus(legacy)).toBe('needs_review')
    expect(studentStatusCounts([student, legacy, { ...student, is_active: true }, { ...student, student_access_status: 'suspended' }])).toEqual({ pending: 1, needs_review: 1, active: 1, suspended: 1 })
  })

  it('requires verification before approval and shows the server-confirmed state', async () => {
    const api = fixture(); render(<StudentAccessWorkspace api={api} english />)
    await openAccount()
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: 'Verify & approve access' }))
    expect(dialog.getByRole('button', { name: 'Confirm access change' })).toBeDisabled()
    fireEvent.click(dialog.getByRole('checkbox', { name: /I verified the student ID/ }))
    fireEvent.click(dialog.getByRole('button', { name: 'Confirm access change' }))
    await waitFor(() => expect(api.request).toHaveBeenCalledWith(expect.objectContaining({ action: 'set_student_access', expected_status: 'pending', status: 'active', verified_identity: true })))
    await screen.findByText('Account status saved by the server.')
    expect(dialog.getByText('Access granted')).toBeInTheDocument()
  })

  it('preserves access and explains a conflicting server update', async () => {
    const api = fixture()
    vi.mocked(api.request).mockImplementation(async body => { if (body.action === 'student_access_history') return { events: [] }; throw new Error('staleState') })
    render(<StudentAccessWorkspace api={api} english />); await openAccount()
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: 'Verify & approve access' }))
    fireEvent.click(dialog.getByRole('checkbox', { name: /I verified the student ID/ }))
    fireEvent.click(dialog.getByRole('button', { name: 'Confirm access change' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('This account changed')
    expect(dialog.getByText('Awaiting review')).toBeInTheDocument()
  })

  it('requires a reason to suspend access', async () => {
    const api = fixture({ students: [{ ...student, is_active: true, student_access_status: 'active' }] })
    render(<StudentAccessWorkspace api={api} english />); await openAccount()
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: 'Suspend access' }))
    expect(dialog.getByRole('button', { name: 'Confirm access change' })).toBeDisabled()
    fireEvent.change(dialog.getByRole('textbox', { name: 'Note (required)' }), { target: { value: 'Duplicate account checked' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Confirm access change' }))
    await waitFor(() => expect(api.request).toHaveBeenCalledWith(expect.objectContaining({ status: 'suspended', expected_status: 'active', reason: 'Duplicate account checked' })))
  })

  it('does not report policy success or update the cached policy on server failure', async () => {
    const api = fixture(); vi.mocked(api.request).mockRejectedValue(new Error('offline'))
    render(<StudentAccessWorkspace api={api} english />)
    await screen.findByText('Phra Test')
    fireEvent.click(screen.getByRole('button', { name: 'Admission policy' }))
    fireEvent.click(screen.getByRole('radio', { name: /Grant access on registration/ }))
    fireEvent.click(screen.getByRole('button', { name: /Confirm admission policy/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('previous policy remains')
    expect(screen.getByRole('radio', { name: /Review before granting access/ })).toBeChecked()
    expect(getNisitAdmissionMode()).toBe('admin_approval')
  })

  it('leaves lifecycle controls disabled when the migration has not been applied', async () => {
    const api = fixture({ access_management_ready: false })
    render(<StudentAccessWorkspace api={api} english />); await openAccount()
    expect(screen.getByRole('button', { name: 'Verify & approve access' })).toBeDisabled()
    expect(api.request).not.toHaveBeenCalled()
  })

  it('creates an optional cohort invite and displays the returned code only until dismissed', async () => {
    const api = fixture()
    vi.mocked(api.request).mockResolvedValue({ invite_code: 'AYT66-TEST-CODE', invite: { id: 'invite-1', cohort_year: 66, label: 'Fixture cohort', code_hint: 'AYT66-***', is_active: true, max_uses: 60, used_count: 0, expires_at: null, created_at: '2026-11-23T12:00:00Z' } })
    render(<StudentAccessWorkspace api={api} english />); await screen.findByText('Phra Test')
    fireEvent.click(screen.getByRole('button', { name: 'Cohort invites' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create invite' }))
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.change(dialog.getByRole('textbox', { name: 'Cohort label' }), { target: { value: 'Fixture cohort' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Create invite' }))
    expect(await screen.findByText('AYT66-TEST-CODE')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Saved it, dismiss' }))
    expect(screen.queryByText('AYT66-TEST-CODE')).not.toBeInTheDocument()
  })

  it('requires identity verification for a reset and leaves a suspended account suspended', async () => {
    const api = fixture({ students: [{ ...student, student_access_status: 'suspended' }] })
    vi.mocked(api.request).mockImplementation(async body => body.action === 'reset_student_password' ? { temporary_password: 'FixtureTemporaryOnly' } : { events: [] })
    render(<StudentAccessWorkspace api={api} english />); await openAccount()
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: 'Reset temporary password' }))
    expect(dialog.getByRole('button', { name: 'Confirm password reset' })).toBeDisabled()
    fireEvent.click(dialog.getByRole('checkbox', { name: /I verified that the requester/ }))
    fireEvent.click(dialog.getByRole('button', { name: 'Confirm password reset' }))
    expect(await screen.findByText('FixtureTemporaryOnly')).toBeInTheDocument()
    expect(api.request).toHaveBeenCalledWith({ action: 'reset_student_password', id: student.id })
    expect(api.request).not.toHaveBeenCalledWith(expect.objectContaining({ action: 'set_student_access' }))
    expect(screen.getByLabelText('Status')).toHaveValue('all')
    expect(screen.getByText('Suspended', { selector: '.access-badge' })).toBeInTheDocument()
  })

  it('requires a fresh load after a failed refresh before changing access', async () => {
    const api = fixture(); render(<StudentAccessWorkspace api={api} english />)
    await screen.findByText('Phra Test')
    vi.mocked(api.list).mockRejectedValue(new Error('offline'))
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    await screen.findByRole('alert')
    await openAccount()
    expect(screen.getByRole('button', { name: 'Verify & approve access' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit name' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset temporary password' })).toBeDisabled()
  })

  it('signs an inactive student out before opening guest practice and preserves the route on failure', async () => {
    const signOut = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const onGuest = vi.fn()
    render(<StudentAccountStatus profile={{ ...student, student_access_status: 'suspended' }} english signOut={signOut} onGuest={onGuest} />)
    expect(screen.getByText('Suspended')).toBeInTheDocument()
    expect(screen.queryByText('Awaiting review')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out and practice as a guest' }))
    await screen.findByRole('alert'); expect(onGuest).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out and practice as a guest' }))
    await waitFor(() => expect(onGuest).toHaveBeenCalledOnce())
    expect(signOut).toHaveBeenCalledTimes(2)
  })
})
