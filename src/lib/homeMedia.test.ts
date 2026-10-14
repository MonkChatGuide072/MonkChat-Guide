import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bundledHomeSlides, homeMediaValues, resolvedHomeSlides, uploadHomePhoto, validateHomePhoto, type HomeMediaRow } from './homeMedia'

const mocks = vi.hoisted(() => ({ upload: vi.fn(), getPublicUrl: vi.fn() }))
vi.mock('./supabase', () => ({ supabaseClient: { storage: { from: () => ({ upload: mocks.upload, getPublicUrl: mocks.getPublicUrl }) } } }))

describe('Home image publishing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.upload.mockResolvedValue({ error: null })
    mocks.getPublicUrl.mockImplementation((path: string) => ({ data: { publicUrl: `https://example.org/home/${path}` } }))
  })

  it('shows only published images and keeps bundled images for unpublished slots', () => {
    const slides = resolvedHomeSlides([
      { id: 'first', slot: 1, storage_path: '1/live.webp', caption_th: 'ใหม่', caption_en: 'New', draft_storage_path: '1/draft.webp', draft_caption_th: 'ร่าง', draft_caption_en: 'Draft', is_published: true },
      { id: 'second', slot: 2, storage_path: null, caption_th: null, caption_en: null, draft_storage_path: '2/draft.webp', draft_caption_th: 'ร่าง', draft_caption_en: 'Draft', is_published: false },
    ])
    expect(slides).toHaveLength(4)
    expect(slides[0]).toEqual({ url: 'https://example.org/home/1/live.webp', th: 'ใหม่', en: 'New' })
    expect(slides[1]).toEqual(bundledHomeSlides[1])
    expect(slides[2]).toEqual(bundledHomeSlides[2])
  })

  it('rejects unsupported or oversized files before uploading', async () => {
    const invalid = new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })
    const tooLarge = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.webp', { type: 'image/webp' })
    expect(validateHomePhoto(invalid)).toBe('type')
    expect(validateHomePhoto(tooLarge)).toBe('size')
    await expect(uploadHomePhoto(invalid, 1)).rejects.toThrow('invalidUpload')
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('keeps the public image during draft edits and replaces it only on publication', () => {
    const live: HomeMediaRow = {
      id: 'first', slot: 1, storage_path: '1/live.webp', caption_th: 'เดิม', caption_en: 'Old',
      draft_storage_path: null, draft_caption_th: null, draft_caption_en: null, is_published: true,
    }
    const draft = { ...live, ...homeMediaValues(live, '1/new.webp', 'ใหม่', 'New', false) }
    expect(resolvedHomeSlides([draft])[0]).toEqual({ url: 'https://example.org/home/1/live.webp', th: 'เดิม', en: 'Old' })
    const published = { ...draft, ...homeMediaValues(draft, draft.draft_storage_path!, draft.draft_caption_th!, draft.draft_caption_en!, true) }
    expect(resolvedHomeSlides([published])[0]).toEqual({ url: 'https://example.org/home/1/new.webp', th: 'ใหม่', en: 'New' })
    expect(published.draft_storage_path).toBeNull()
  })
})
