import { supabase } from '../supabase/client'
import { toCamelCase, toSnakeCase } from './caseConvert'
import type { UserProfile } from '../types'

export async function fetchSupabaseProfile(uid: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle()
  if (error) throw error
  return data ? toCamelCase<UserProfile>(data) : null
}

export async function createSupabaseProfile(profile: UserProfile): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('users').insert(toSnakeCase(profile as unknown as Record<string, unknown>))
  if (error) throw error
}

export async function updateSupabaseProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('users').update(toSnakeCase(patch as Record<string, unknown>)).eq('uid', uid)
  if (error) throw error
}
