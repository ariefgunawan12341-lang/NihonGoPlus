import { supabase } from '../supabase/client'
import { toSnakeCase, toCamelCase } from './caseConvert'

// Drop-in replacement for FirestoreCollection with the IDENTICAL interface
// (list/get/create/update/remove/listFiltered), so services/db.ts and every
// page that imports collections from it needs zero changes for the backend
// swap. Table names map 1:1 to the old Firestore collection names.
export class SupabaseCollection<T extends { id: string }> {
  constructor(private table: string) {}

  private db() {
    if (!supabase) throw new Error('Supabase is not initialized. Check VITE_USE_SUPABASE and your env vars.')
    return supabase
  }

  async list(): Promise<T[]> {
    const { data, error } = await this.db().from(this.table).select('*')
    if (error) throw error
    return (data ?? []).map((row) => toCamelCase<T>(row))
  }

  async get(id: string): Promise<T | undefined> {
    const { data, error } = await this.db().from(this.table).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? toCamelCase<T>(data) : undefined
  }

  /** Filter + optional page size — mirrors the Firestore version's signature
   *  so learner screens can query "only this level/category" server-side
   *  instead of downloading the whole table, even once it holds thousands
   *  of rows. */
  async listFiltered(filters: Partial<T>, opts?: { limit?: number }): Promise<T[]> {
    let query = this.db().from(this.table).select('*')
    for (const [key, value] of Object.entries(toSnakeCase(filters as Record<string, unknown>))) {
      if (value !== undefined) query = query.eq(key, value)
    }
    if (opts?.limit) query = query.limit(opts.limit)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => toCamelCase<T>(row))
  }

  async create(item: T): Promise<T> {
    const { data, error } = await this.db().from(this.table).insert(toSnakeCase(item as Record<string, unknown>)).select().single()
    if (error) throw error
    return toCamelCase<T>(data)
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    const { error } = await this.db().from(this.table).update(toSnakeCase(patch as Record<string, unknown>)).eq('id', id)
    if (error) throw error
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db().from(this.table).delete().eq('id', id)
    if (error) throw error
  }
}
