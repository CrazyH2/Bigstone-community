import { supabase } from './supabase'
import { sessionManager } from './session'

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const user = sessionManager.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${user.id}/${Date.now()}-${path}`, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data
}

export const getPublicUrl = (bucket: string, path: string) => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      download: false
    })
  return publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const user = sessionManager.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

export const uploadImageWithPreview = async (bucket: string, file: File) => {
  const user = sessionManager.getUser()
  if (!user) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  const { data } = await uploadFile(bucket, fileName, file)
  return getPublicUrl(bucket, data.path)
}
