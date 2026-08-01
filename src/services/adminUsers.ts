import { USE_SUPABASE, supabase } from '../supabase/client'
import { toCamelCase, toSnakeCase } from './caseConvert'
import type { UserProfile } from '../types'

const LOCAL_USERS_KEY = 'ngp_local_users'

export async function listAllUsersAdmin(): Promise<UserProfile[]> {
  if (USE_SUPABASE) {
    if (!supabase) return []
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return (data ?? []).map((row) => toCamelCase<UserProfile>(row))
  }
  const raw = localStorage.getItem(LOCAL_USERS_KEY)
  const users: { profile: UserProfile }[] = raw ? JSON.parse(raw) : []
  return users.map((u) => u.profile)
}

export async function setUserAdminFlags(uid: string, patch: Partial<UserProfile>): Promise<void> {
  if (USE_SUPABASE) {
    if (!supabase) return
    const { error } = await supabase.from('users').update(toSnakeCase(patch as Record<string, unknown>)).eq('uid', uid)
    if (error) throw error
    return
  }
  const raw = localStorage.getItem(LOCAL_USERS_KEY)
  const users: { profile: UserProfile; passwordHash: string }[] = raw ? JSON.parse(raw) : []
  const idx = users.findIndex((u) => u.profile.uid === uid)
  if (idx >= 0) {
    users[idx].profile = { ...users[idx].profile, ...patch }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  }
}
