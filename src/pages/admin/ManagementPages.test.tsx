import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminLanguagesPage } from './AdminLanguagesPage'
import { AdminTeamPage } from './AdminTeamPage'

const mocks = vi.hoisted(() => ({
  profile: { id: 'owner-id', role: 'owner', is_active: true },
  list: vi.fn(), insert: vi.fn(), update: vi.fn(), single: vi.fn(), invoke: vi.fn(),
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ profile: mocks.profile }) }))
vi.mock('../../lib/supabase', () => ({ supabaseClient: {
  from: () => ({ select: () => ({ order: mocks.list }), insert: mocks.insert, update: mocks.update }),
  functions: { invoke: mocks.invoke },
} }))
describe('CMS management pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.profile = { id: 'owner-id', role: 'owner', is_active: true }
    mocks.list.mockResolvedValue({ data: [{ code: 'th', native_name: 'ภาษาไทย', is_active: true }], error: null })
    mocks.insert.mockReturnValue({ select: () => ({ single: mocks.single }) })
    mocks.update.mockReturnValue({ eq: () => ({ select: () => ({ single: mocks.single }) }) })
  })

  it('allows team members to read languages without editing controls', async () => {
    mocks.profile.role = 'team_member'
    render(<AdminLanguagesPage />)
    await screen.findByRole('heading', { name: /ภาษาไทย/ })
    expect(screen.getByText('management.readOnly')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'management.addLanguage' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /management.edit/ })).not.toBeInTheDocument()
  })

  it('saves a language and displays the returned database row', async () => {
    mocks.single.mockResolvedValue({ data: { code: 'ja', native_name: '日本語', is_active: true }, error: null })
    render(<AdminLanguagesPage />)
    await screen.findByRole('heading', { name: /ภาษาไทย/ })
    fireEvent.click(screen.getByRole('button', { name: 'management.addLanguage' }))
    fireEvent.change(screen.getByLabelText('management.code'), { target: { value: 'ja' } })
    fireEvent.change(screen.getByLabelText('management.nativeName'), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: 'management.save' }))
    await screen.findByText('management.saved')
    expect(mocks.insert).toHaveBeenCalledWith({ code: 'ja', native_name: '日本語', is_active: true })
    expect(screen.getByRole('heading', { name: /日本語/ })).toBeInTheDocument()
  })

  it('protects core language controls and does not report success for a zero-row update', async () => {
    mocks.single.mockResolvedValue({ data: null, error: null })
    render(<AdminLanguagesPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'management.edit ภาษาไทย' }))
    expect(screen.getByLabelText('management.code')).toHaveAttribute('readonly')
    expect(screen.getByRole('checkbox')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'management.save' }))
    await screen.findByRole('alert')
    expect(screen.queryByText('management.saved')).not.toBeInTheDocument()
  })

  it('blocks account creation when the server function is unavailable', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: new Error('not deployed') })
    render(<AdminTeamPage />)
    await screen.findByText('management.serviceUnavailable')
    expect(screen.getByRole('button', { name: 'management.addMember' })).toBeDisabled()
  })

  it('does not contact account management for a team member or inactive owner', async () => {
    mocks.profile.is_active = false
    const { rerender } = render(<AdminTeamPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('admin.accessDeniedTitle')
    mocks.profile = { id: 'member-id', role: 'team_member', is_active: true }
    rerender(<AdminTeamPage />)
    await waitFor(() => expect(mocks.invoke).not.toHaveBeenCalled())
  })
})
