import { USE_SUPABASE, supabase, STORAGE_BUCKETS } from '../supabase/client'

function bucketFor(contentType: string): string {
  if (contentType.startsWith('image/')) return STORAGE_BUCKETS.images
  if (contentType.startsWith('audio/')) return STORAGE_BUCKETS.audio
  if (contentType.startsWith('video/')) return STORAGE_BUCKETS.video
  if (contentType === 'application/pdf') return STORAGE_BUCKETS.pdf
  return STORAGE_BUCKETS.modules // zip and anything else falls back to the "modules" bucket
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error('Profile photo upload requires Supabase Storage (set VITE_USE_SUPABASE=true and configure Supabase — see README).')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5MB.')
  }
  const path = `users/${uid}/profile-${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.images).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(STORAGE_BUCKETS.images).getPublicUrl(path)
  return data.publicUrl
}

const MAX_MEDIA_SIZE = 50 * 1024 * 1024 // 50MB — generous enough for short audio/video, blocks accidental huge uploads

/** Generic CMS media upload (images, PDF, audio, video) used by the Article
 *  editor, and any Admin CRUD form with a file field (thumbnails, PDFs, etc).
 *  Routes to the right Storage bucket automatically based on file type. */
export async function uploadMediaFile(file: File, folder: string): Promise<string> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error('Media upload requires Supabase Storage (set VITE_USE_SUPABASE=true and configure Supabase — see README).')
  }
  if (file.size > MAX_MEDIA_SIZE) {
    throw new Error(`File must be under ${MAX_MEDIA_SIZE / (1024 * 1024)}MB.`)
  }
  const bucket = bucketFor(file.type)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${folder}/${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export interface MediaFile {
  bucket: string
  path: string
  name: string
  url: string
  size: number
  contentType: string
  updatedAt: string
}

/** Lists everything across all 5 buckets for the Admin Media Library. */
export async function listMediaFiles(): Promise<MediaFile[]> {
  if (!USE_SUPABASE || !supabase) return []
  const buckets = Object.values(STORAGE_BUCKETS)
  const allFiles: MediaFile[] = []

  for (const bucket of buckets) {
    // eslint-disable-next-line no-await-in-loop
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 200, sortBy: { column: 'updated_at', order: 'desc' } })
    if (error || !data) continue
    for (const item of data) {
      if (!item.id) continue // skip folder placeholders
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(item.name)
      allFiles.push({
        bucket,
        path: item.name,
        name: item.name,
        url: urlData.publicUrl,
        size: item.metadata?.size ?? 0,
        contentType: item.metadata?.mimetype ?? 'application/octet-stream',
        updatedAt: item.updated_at ?? ''
      })
    }
  }

  return allFiles.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function deleteMediaFile(bucket: string, path: string): Promise<void> {
  if (!USE_SUPABASE || !supabase) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
