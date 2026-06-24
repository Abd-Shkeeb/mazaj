import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export const BUCKET_NAME = process.env.BUCKET_NAME || 'mazaj'

export function getStoragePathFromUrl(
  url: string,
  bucketName: string = BUCKET_NAME,
): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucketName}/`
    const index = url.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.substring(index + marker.length))
  } catch (e) {
    return null
  }
}

export async function uploadFileToStorage(file: File, folderPath: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
  const filePath = `${folderPath}/${fileName}`

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteFileFromStorage(url: string) {
  const path = getStoragePathFromUrl(url, BUCKET_NAME)
  if (!path) return

  await supabase.storage.from(BUCKET_NAME).remove([path])
}
