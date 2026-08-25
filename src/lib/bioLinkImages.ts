import { supabaseClient } from './supabase'

export const BIO_LINK_IMAGES_BUCKET = 'bio-link-images'
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function validateBioLinkImage(file: File): string | null {
  if (!(file.type in IMAGE_EXTENSIONS)) {
    return 'Only JPG, PNG, and WebP images are supported.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 2 MB or smaller.'
  }

  return null
}

export async function uploadBioLinkImage(file: File, bioLinkId: string): Promise<string> {
  if (!supabaseClient) {
    throw new Error('Supabase connection is not configured.')
  }

  const validationError = validateBioLinkImage(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const extension = IMAGE_EXTENSIONS[file.type]
  const path = `${bioLinkId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabaseClient.storage
    .from(BIO_LINK_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error
  return path
}

export function getBioLinkImageUrl(storagePath: string | null | undefined): string | null {
  if (!supabaseClient || !storagePath) return null
  return supabaseClient.storage.from(BIO_LINK_IMAGES_BUCKET).getPublicUrl(storagePath).data.publicUrl
}
