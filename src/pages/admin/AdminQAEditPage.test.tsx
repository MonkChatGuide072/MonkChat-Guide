import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminQAEditPage } from './AdminQAEditPage'

const mocks = vi.hoisted(() => ({
  verified: false,
  publishedWithoutVerification: false,
  becomesVerified: false,
  reads: 0,
  writeError: null as null | { code: string },
  emptyWrite: false,
  writes: [] as Array<{ table: string; values: unknown }>,
  from: vi.fn(),
  t: (key: string) => key,
}))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mocks.t }) }))
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { id: 'owner-1' } }) }))
vi.mock('../../lib/supabase', () => ({ supabaseClient: { from: mocks.from } }))

const open = () => render(<MemoryRouter initialEntries={['/admin/qa/qa-1/edit']}><Routes>
  <Route path="/admin/qa/:qaId/edit" element={<AdminQAEditPage />} />
  <Route path="/admin/qa" element={<p>Saved list</p>} />
</Routes></MemoryRouter>)

beforeEach(() => {
  mocks.verified = false
  mocks.publishedWithoutVerification = false
  mocks.becomesVerified = false
  mocks.reads = 0
  mocks.writeError = null
  mocks.emptyWrite = false
  mocks.writes = []
  mocks.from.mockImplementation((table: string) => {
    let writing = false
    const response = () => ({ data: null, error: null })
    const builder = {
      select: () => builder,
      eq: () => builder,
      update: (values: unknown) => { writing = true; mocks.writes.push({ table, values }); return builder },
      insert: async (values: unknown) => { mocks.writes.push({ table, values }); return response() },
      single: async () => {
        if (writing) return { data: mocks.emptyWrite ? null : { id: 'qa-1' }, error: mocks.writeError }
        mocks.reads++
        const verified = mocks.verified || (mocks.becomesVerified && mocks.reads > 1)
        const published = verified || mocks.publishedWithoutVerification
        return { data: { id: 'qa-1', category: 'Meditation', source_reference: 'Reviewed source',
          content_status: published ? 'published' : 'draft',
          verification_status: verified ? 'verified' : 'unverified', is_published: published,
          qa_translations: [{ id: 'th-1', language_code: 'th', question: 'คำถามไทย', short_answer: 'คำตอบไทย', detailed_answer: null }] }, error: null }
      },
      then: (resolve: (value: ReturnType<typeof response>) => unknown) => Promise.resolve(response()).then(resolve),
    }
    return builder
  })
})

describe('Q&A edit lock', () => {
  it('blocks opening verified content directly by URL', async () => {
    mocks.verified = true
    open()
    expect(await screen.findByText('admin.qa.edit.errorVerified')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'admin.qa.edit.submit' })).not.toBeInTheDocument()
    expect(mocks.writes).toHaveLength(0)
  })

  it('allows saving a draft and preserves empty English fields', async () => {
    open()
    const save = await screen.findByRole('button', { name: 'admin.qa.edit.submit' })
    fireEvent.click(save)
    expect(await screen.findByText('Saved list')).toBeInTheDocument()
    expect(mocks.writes.map(write => write.table)).toEqual(['qa_items', 'qa_translations'])
  })

  it('preserves the Windows restriction on published but unverified items', async () => {
    mocks.publishedWithoutVerification = true
    open()
    expect(await screen.findByText('admin.qa.edit.errorRequiresDraft')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'admin.qa.edit.submit' })).not.toBeInTheDocument()
  })

  it('refuses a stale draft before writing if another account has verified it', async () => {
    mocks.becomesVerified = true
    open()
    fireEvent.click(await screen.findByRole('button', { name: 'admin.qa.edit.submit' }))
    expect(await screen.findByText('admin.qa.edit.errorVerified')).toBeInTheDocument()
    expect(mocks.writes).toHaveLength(0)
  })

  it('closes the form if the database reports that content became verified', async () => {
    mocks.writeError = { code: '23514' }
    open()
    fireEvent.click(await screen.findByRole('button', { name: 'admin.qa.edit.submit' }))
    expect(await screen.findByText('admin.qa.edit.errorVerified')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'admin.qa.edit.submit' })).not.toBeInTheDocument()
    expect(mocks.writes.map(write => write.table)).toEqual(['qa_items'])
  })

  it('does not report success or write translations when no core row was updated', async () => {
    mocks.emptyWrite = true
    open()
    fireEvent.click(await screen.findByRole('button', { name: 'admin.qa.edit.submit' }))
    await waitFor(() => expect(screen.getByText('admin.qa.edit.errorUpdateCore')).toBeInTheDocument())
    expect(screen.queryByText('Saved list')).not.toBeInTheDocument()
    expect(mocks.writes.map(write => write.table)).toEqual(['qa_items'])
  })
})
