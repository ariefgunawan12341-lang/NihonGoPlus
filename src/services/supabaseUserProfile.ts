import { supabase } from '../supabase/client'
import { toCamelCase, toSnakeCase } from './caseConvert'
import type { UserProfile } from '../types'

function normalizeProfile(profile: Record<string, unknown>, fallbackId?: string): UserProfile {
  const id = typeof profile.id === 'string' ? profile.id : typeof profile.uid === 'string' ? profile.uid : fallbackId
  const normalized = toCamelCase<UserProfile & { id?: string }>(profile)
  return {
    ...normalized,
    uid: id ?? '',
    id: id ?? ''
  } as UserProfile
}

export async function fetchSupabaseProfile(id: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? normalizeProfile(data as Record<string, unknown>, id) : null
}

export async function createSupabaseProfile(profile: UserProfile): Promise<void> {
  if (!supabase) return
  const payload = toSnakeCase(profile as unknown as Record<string, unknown>)
  const id = typeof profile.uid === 'string' ? profile.uid : profile.id
  if (id) {
    payload.id = id
    delete payload.uid
  }
  const { error } = await supabase.from('profiles').insert(payload)
  if (error) throw error
}

export async function updateSupabaseProfile(id: string, patch: Partial<UserProfile>): Promise<void> {
  if (!supabase) return
  const payload = toSnakeCase(patch as Record<string, unknown>)
  if (payload.uid !== undefined) delete payload.uid
  if (payload.id !== undefined) delete payload.id
  const { error } = await supabase.from('profiles').update(payload).eq('id', id)
  if (error) throw error
}
