import { supabaseClient } from './supabase'

export const HOME_PHOTOS_BUCKET = 'home-photos'

export interface HomeMediaRow {
  id: string
  slot: number
  storage_path: string | null
  caption_th: string | null
  caption_en: string | null
  draft_storage_path: string | null
  draft_caption_th: string | null
  draft_caption_en: string | null
  is_published: boolean
}

export const bundledHomeSlides = [
  { url: '/images/home/monkchat-slide-1.webp', th: 'ความสงบภายใน', en: 'Inner peace' },
  { url: '/images/home/monkchat-slide-2.webp', th: 'สมาธิใกล้ชิด', en: 'Guided closely' },
  { url: '/images/home/monkchat-slide-3.webp', th: 'สนทนาอย่างเป็นกันเอง', en: 'Open conversation' },
  { url: '/images/home/monkchat-slide-4.webp', th: 'ความทรงจำจากอยุธยา', en: 'An Ayutthaya memory' },
]

export function validateHomePhoto(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'type'
  if (file.size === 0 || file.size > 2 * 1024 * 1024) return 'size'
  return null
}

export function homePhotoUrl(path: string): string | null {
  return supabaseClient?.storage.from(HOME_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl ?? null
}

export async function uploadHomePhoto(file: File, slot: number): Promise<string> {
  if (!supabaseClient || validateHomePhoto(file) || slot < 1 || slot > 4) throw new Error('invalidUpload')
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  const path = `${slot}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabaseClient.storage.from(HOME_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: '31536000', contentType: file.type, upsert: false,
  })
  if (error) throw error
  return path
}

export async function removeHomePhoto(path: string): Promise<void> {
  const { error } = await supabaseClient!.storage.from(HOME_PHOTOS_BUCKET).remove([path])
  if (error) throw error
}

export function homeMediaValues(row: HomeMediaRow | undefined, path: string, th: string, en: string, publish: boolean) {
  return publish ? {
    storage_path: path, caption_th: th, caption_en: en, is_published: true,
    draft_storage_path: null, draft_caption_th: null, draft_caption_en: null,
  } : {
    storage_path: row?.storage_path ?? null, caption_th: row?.caption_th ?? null,
    caption_en: row?.caption_en ?? null, is_published: row?.is_published ?? false,
    draft_storage_path: path, draft_caption_th: th, draft_caption_en: en,
  }
}

export function resolvedHomeSlides(rows: HomeMediaRow[]) {
  return bundledHomeSlides.map((fallback, index) => {
    const row = rows.find((item) => item.slot === index + 1 && item.is_published)
    const url = row?.storage_path && homePhotoUrl(row.storage_path)
    return row && url && row.caption_th && row.caption_en ? { url, th: row.caption_th, en: row.caption_en } : fallback
  })
}
