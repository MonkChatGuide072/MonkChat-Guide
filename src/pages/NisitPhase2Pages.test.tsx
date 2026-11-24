import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import th from '../locales/th/common.json'
import en from '../locales/en/common.json'
import { NisitLoginPage } from './NisitLoginPage'
import { LoginPage } from './LoginPage'
import { NisitPracticePage } from './NisitPracticePage'
import { AdminStudentsPage } from './admin/AdminStudentsPage'
import { NisitProtectedRoute } from '../components/NisitProtectedRoute'
import type { Profile } from '../lib/auth'

const mocks = vi.hoisted(() => ({
  authState: {
    session: null as { user: { id: string } } | null,
    profile: null as Profile | null,
    isLoading: false,
    signOut: vi.fn(async () => {}),
  },
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
  functionsInvoke: vi.fn(),
  fromSelect: vi.fn(),
  fromUpsert: vi.fn(),
  fromDelete: vi.fn(),
  qaRows: [
    {
      id: 'qa-med-01',
      category: 'Meditation',
      qa_translations: [
        {
          language_code: 'en',
          question: 'Why do monks close their eyes gently?',
          short_answer: 'Closing the eyes softly helps rest visual distraction without strain.',
          detailed_answer: null,
        },
      ],
    },
  ],
  completedVocabKeys: ['posture'] as string[],
  completedQaKeys: ['qa-med-01'] as string[],
}))

vi.mock('../lib/auth', () => ({
  useAuth: () => mocks.authState,
}))

vi.mock('../lib/supabase', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      updateUser: mocks.updateUser,
    },
    functions: {
      invoke: mocks.functionsInvoke,
    },
    storage: {
      from: () => ({
        createSignedUrl: vi.fn(async () => ({ data: null, error: null })),
        download: vi.fn(async () => ({ data: null, error: null })),
      }),
    },
    from: (table: string) => {
      if (table === 'student_practice_progress') {
        return {
          select: () => ({
            eq: (_col1: string, _val1: string) => ({
              eq: async (_col2: string, moduleType: string) => {
                mocks.fromSelect(moduleType)
                const keys =
                  moduleType === 'vocab_lesson' ? mocks.completedVocabKeys : mocks.completedQaKeys
                return { data: keys.map((k) => ({ item_key: k })), error: null }
              },
            }),
          }),
          upsert: (payload: { item_key: string }) => {
            mocks.fromUpsert(payload)
            return { select: () => ({ maybeSingle: async () => ({ data: { item_key: payload.item_key }, error: null }) }) }
          },
          delete: () => ({
            eq: (_c1: string, _v1: string) => ({
              eq: (_c2: string, _v2: string) => ({
                eq: (_c3: string, key: string) => {
                  mocks.fromDelete(key)
                  return { select: async () => ({ data: [{ item_key: key }], error: null }) }
                },
              }),
            }),
          }),
        }
      }
      if (table === 'qa_items') {
        const builder: Record<string, unknown> = {
          select: () => builder,
          eq: () => builder,
          order: () => builder,
          then: (resolve: (val: unknown) => unknown) =>
            Promise.resolve({ data: mocks.qaRows, error: null }).then(resolve),
        }
        return builder
      }
      const emptyBuilder: Record<string, unknown> = {
        select: () => emptyBuilder,
        eq: () => emptyBuilder,
        order: () => emptyBuilder,
        then: (resolve: (val: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve),
      }
      return emptyBuilder
    },
  },
}))

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'th',
  resources: { th: { translation: th }, en: { translation: en } },
  interpolation: { escapeValue: false },
})

function renderRoute(ui: React.ReactNode, initialEntries = ['/']) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </I18nextProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  try {
    localStorage.clear()
  } catch {
    // Ignore if unavailable.
  }
  mocks.authState.session = null
  mocks.authState.profile = null
  mocks.authState.isLoading = false
  mocks.signInWithPassword.mockResolvedValue({ error: null })
  mocks.updateUser.mockResolvedValue({ error: null })
  mocks.completedVocabKeys = ['posture']
  mocks.completedQaKeys = ['qa-med-01']
})

afterEach(() => {
  cleanup()
})

describe('Phase 2 Student Accounts & Role Isolation', () => {
  it('NisitLoginPage signs in via 7-digit ID mapped to .invalid internal email and validates cohort registration passwords', async () => {
    mocks.functionsInvoke.mockResolvedValue({
      data: { registered: true, student_code: '6611018', cohort_year: 66, display_name: 'Phra Somchai', is_active: false },
      error: null,
    })

    renderRoute(<NisitLoginPage />, ['/nisit/login'])

    expect(screen.getByRole('link', { name: 'Enter /nisit as Guest' })).toHaveAttribute('href', '/nisit')
    expect(screen.getByRole('link', { name: 'Guest Practice (/nisit)' })).toHaveAttribute('href', '/nisit')

    // Invalid 7-digit ID caught client-side
    fireEvent.change(screen.getByLabelText('7-digit Student ID'), { target: { value: '661018' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'DhammaPractice66!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to /nisit' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/4011001–6911060/)
    expect(mocks.signInWithPassword).not.toHaveBeenCalled()

    // Valid 7-digit ID maps internally to @student.monkchat.invalid
    fireEvent.change(screen.getByLabelText('7-digit Student ID'), { target: { value: '6611018' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to /nisit' }))
    await waitFor(() =>
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: '6611018@student.monkchat.invalid',
        password: 'DhammaPractice66!',
      }),
    )

    // Switch to Direct Registration tab
    fireEvent.click(screen.getByRole('tab', { name: 'Register student' }))
    fireEvent.change(screen.getByLabelText(/7-digit Student ID/), { target: { value: '6611018' } })
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Phra Somchai' } })
    fireEvent.change(screen.getByLabelText('Dharma name (optional)'), { target: { value: 'Sutthipanyo' } })
    fireEvent.change(screen.getByLabelText('Choose password (12+ chars)'), { target: { value: 'monkchat6611018' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'monkchat6611018' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /I checked my student ID/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Create student account' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/12–128 characters/i)
    expect(mocks.functionsInvoke).not.toHaveBeenCalledWith('student-register', expect.objectContaining({ body: expect.anything() }))

    fireEvent.change(screen.getByLabelText('Choose password (12+ chars)'), {
      target: { value: 'DhammaPractice2026!' },
    })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'DhammaPractice2026!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create student account' }))

    await waitFor(() =>
      expect(mocks.functionsInvoke).toHaveBeenCalledWith('student-register', {
        body: {
          student_code: '6611018',
          display_name: 'Phra Somchai',
          dharma_name: 'Sutthipanyo',
          password: 'DhammaPractice2026!',
          invite_code: undefined,
        },
      }),
    )
  })

  it('LoginPage blocks active student accounts from auto-redirecting to /admin', () => {
    mocks.authState.session = { user: { id: 'stu-1' } }
    mocks.authState.profile = {
      id: 'stu-1',
      display_name: 'Phra Somchai',
      role: 'student',
      is_active: true,
      student_code: '6611018',
      cohort_year: 66,
    }

    renderRoute(
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<p>CMS Dashboard</p>} />
        <Route path="/nisit" element={<p>Nisit Hub</p>} />
      </Routes>,
      ['/admin/login'],
    )

    expect(screen.queryByText('CMS Dashboard')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /\/nisit/i })).toHaveAttribute('href', '/nisit')
    expect(screen.getByRole('button', { name: en.admin.nav.signOut })).toBeInTheDocument()
  })

  it('NisitPracticePage syncs DB progress and allows student self-service password change', async () => {
    mocks.authState.session = { user: { id: 'stu-1' } }
    mocks.authState.profile = {
      id: 'stu-1',
      display_name: 'Phra Somchai',
      dharma_name: 'Sutthipanyo',
      student_code: '6611018',
      cohort_year: 66,
      role: 'student',
      is_active: true,
    }

    renderRoute(<NisitPracticePage />, ['/nisit'])

    expect(screen.getByText(/Phra Somchai · Sutthipanyo/)).toBeInTheDocument()
    expect(screen.getByText(/Signed in as student · Progress synced to database/)).toBeInTheDocument()
    await waitFor(() => expect(mocks.fromSelect).toHaveBeenCalledWith('vocab_lesson'))
    expect(screen.getByText('1 / 7')).toBeInTheDocument()

    // Marking a second vocabulary lesson syncs to Supabase
    const markButtons = screen.getAllByRole('button', { name: 'Mark practiced' })
    fireEvent.click(markButtons[0])
    await waitFor(() => expect(mocks.fromUpsert).toHaveBeenCalled())
    expect(screen.getByText('2 / 7')).toBeInTheDocument()

    // Switching to Q&A tab fetches qa_flashcard completion keys
    fireEvent.click(screen.getByRole('tab', { name: /Q&A Flashcards/i }))
    await waitFor(() => expect(mocks.fromSelect).toHaveBeenCalledWith('qa_flashcard'))
    expect(await screen.findByRole('heading', { name: 'Why do monks close their eyes gently?' })).toBeInTheDocument()

    // Password change validates against monkchat+ID and updates on valid password
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }))
    fireEvent.change(screen.getByLabelText('New password (12+ chars)'), { target: { value: 'monkchat6611018' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'monkchat6611018' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/at least 12 characters/i)
    expect(mocks.updateUser).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('New password (12+ chars)'), { target: { value: 'DhammaPractice2026!' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'DhammaPractice2026!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'DhammaPractice2026!' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Password updated.')
  })

  it('AdminStudentsPage only contacts the account API for an active owner', () => {
    for (const profile of [null, { id: 'member', display_name: 'Team', role: 'team_member', is_active: true }, { id: 'student', display_name: 'Student', role: 'student', is_active: true }, { id: 'owner', display_name: 'Owner', role: 'owner', is_active: false }]) {
      mocks.authState.profile = profile as typeof mocks.authState.profile
      const view = renderRoute(<AdminStudentsPage />, ['/admin/students'])
      expect(screen.getByRole('alert')).toHaveTextContent(en.admin.accessDeniedTitle)
      expect(mocks.functionsInvoke).not.toHaveBeenCalled()
      view.unmount()
    }
  })

  it('NisitProtectedRoute allows active student/staff and guest local practice, while blocking suspended accounts', async () => {
    const renderProtectedNisit = () =>
      renderRoute(
        <Routes>
          <Route path="/nisit" element={<NisitProtectedRoute />}>
            <Route index element={<p>Protected Practice Hub</p>} />
          </Route>
          <Route path="/nisit/login" element={<NisitLoginPage />} />
        </Routes>,
        ['/nisit'],
      )

    // Unauthenticated visitor -> allowed into /nisit for local guest practice
    mocks.authState.session = null
    mocks.authState.profile = null
    const r1 = renderProtectedNisit()
    expect(screen.getByText('Protected Practice Hub')).toBeInTheDocument()
    r1.unmount()

    // Suspended/pending student -> blocked from /nisit and redirected to /nisit/login pending view
    mocks.authState.session = { user: { id: 'stu-suspended' } }
    mocks.authState.profile = {
      id: 'stu-suspended',
      display_name: 'Phra Suspended',
      role: 'student',
      is_active: false,
    }
    const r2 = renderProtectedNisit()
    expect(screen.queryByText('Protected Practice Hub')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your student account' })).toBeInTheDocument()
    expect(screen.getByText('Legacy status review')).toBeInTheDocument()
    r2.unmount()

    // Inactive staff -> blocked and shows account suspended view
    mocks.authState.session = { user: { id: 'team-inactive' } }
    mocks.authState.profile = {
      id: 'team-inactive',
      display_name: 'Inactive Staff',
      role: 'team_member',
      is_active: false,
    }
    const r2b = renderProtectedNisit()
    expect(screen.getByRole('heading', { name: 'Account suspended or missing' })).toBeInTheDocument()
    r2b.unmount()

    // Active student -> allowed
    mocks.authState.session = { user: { id: 'stu-active' } }
    mocks.authState.profile = {
      id: 'stu-active',
      display_name: 'Phra Somchai',
      role: 'student',
      is_active: true,
    }
    const r3 = renderProtectedNisit()
    expect(screen.getByText('Protected Practice Hub')).toBeInTheDocument()
    r3.unmount()

    // Active team_member -> allowed
    mocks.authState.session = { user: { id: 'team-1' } }
    mocks.authState.profile = {
      id: 'team-1',
      display_name: 'Team Monk',
      role: 'team_member',
      is_active: true,
    }
    const r4 = renderProtectedNisit()
    expect(screen.getByText('Protected Practice Hub')).toBeInTheDocument()
    r4.unmount()
  })
})
