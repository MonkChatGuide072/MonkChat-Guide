import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminLayout } from './AdminLayout'

const mocks = vi.hoisted(() => ({ role: 'owner', signOut: vi.fn() }))
vi.mock('../lib/auth', () => ({ useAuth: () => ({ profile: { display_name: 'Preview team', role: mocks.role }, signOut: mocks.signOut }) }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: 'en', language: 'en' } }) }))
vi.mock('./LanguageSwitcher', () => ({ LanguageSwitcher: () => <div>Language</div> }))
function openShell() {
  return render(<MemoryRouter initialEntries={['/admin']}><Routes><Route element={<AdminLayout />}><Route path="/admin" element={<p>Dashboard</p>} /><Route path="/admin/qa" element={<p>Questions</p>} /></Route><Route path="/admin/login" element={<p>Login screen</p>} /></Routes></MemoryRouter>)
}
beforeEach(() => { vi.clearAllMocks(); mocks.role = 'owner' })
describe('CMS navigation', () => {
  it('closes the mobile menu on Escape, restores focus and closes after navigation', async () => {
    openShell()
    const toggle = screen.getByRole('button', { name: 'Toggle management menu' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    fireEvent.click(toggle)
    fireEvent.click(screen.getAllByRole('link', { name: 'admin.nav.qa' })[0])
    await screen.findByText('Questions')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
  it('does not show owner-only navigation for a team member', () => {
    mocks.role = 'team_member'
    openShell()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle management menu' }))
    expect(screen.queryByRole('link', { name: 'admin.nav.team' })).not.toBeInTheDocument()
  })
  it('keeps the user on the current page when sign-out fails', async () => {
    mocks.signOut.mockRejectedValue(new Error('Unavailable'))
    openShell()
    fireEvent.click(screen.getByRole('button', { name: 'admin.nav.signOut' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('management.signOutError'))
    expect(screen.queryByText('Login screen')).not.toBeInTheDocument()
  })
})
