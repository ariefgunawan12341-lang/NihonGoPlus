import { supabase } from '../supabase/client'
import { toSnakeCase, toCamelCase } from './caseConvert'

// Firestore modeled per-user data as subcollections (users/{uid}/srs_cards).
// Postgres has no equivalent — the idiomatic approach is one flat table with
// a user_id column, restricted by Row Level Security to auth.uid() = user_id.
// This wrapper auto-injects/filters on user_id so callers (Flashcards.tsx,
// ExamCenter.tsx, etc.) don't need to know the difference — same
// list/get/create/update/remove interface as SupabaseCollection.
export class UserScopedTable<T extends { id: string }> {
  constructor(private table: string, private userId: string) {}

  private db() {
    if (!supabase) throw new Error('Supabase is not initialized. Check VITE_USE_SUPABASE and your env vars.')
    return supabase
  }

  async list(): Promise<T[]> {
    const { data, error } = await this.db().from(this.table).select('*').eq('user_id', this.userId)
    if (error) throw error
    return (data ?? []).map((row) => toCamelCase<T>(row))
  }

  async get(id: string): Promise<T | undefined> {
    const { data, error } = await this.db().from(this.table).select('*').eq('id', id).eq('user_id', this.userId).maybeSingle()
    if (error) throw error
    return data ? toCamelCase<T>(data) : undefined
  }

  async create(item: T): Promise<T> {
    const row = { ...toSnakeCase(item as Record<string, unknown>), user_id: this.userId }
    const { data, error } = await this.db().from(this.table).insert(row).select().single()
    if (error) throw error
    return toCamelCase<T>(data)
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    const { error } = await this.db().from(this.table).update(toSnakeCase(patch as Record<string, unknown>)).eq('id', id).eq('user_id', this.userId)
    if (error) throw error
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db().from(this.table).delete().eq('id', id).eq('user_id', this.userId)
    if (error) throw error
  }
}
