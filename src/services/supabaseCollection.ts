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
    console.log(`[Supabase] Fetching all from ${this.table}...`)
    const { data, error } = await this.db().from(this.table).select('*')
    if (error) {
      console.error(`[Supabase Error] Failed to list ${this.table}:`, error)
      throw error
    }
    console.log(`[Supabase] Found ${data?.length ?? 0} rows in ${this.table}`)
    return (data ?? []).map((row) => toCamelCase<T>(row))
  }

  async get(id: string): Promise<T | undefined> {
    console.log(`[Supabase] Getting item ${id} from ${this.table}...`)
    const { data, error } = await this.db().from(this.table).select('*').eq('id', id).maybeSingle()
    if (error) {
      console.error(`[Supabase Error] Failed to get ${id} from ${this.table}:`, error)
      throw error
    }
    return data ? toCamelCase<T>(data) : undefined
  }

  async listFiltered(filters: Partial<T>, opts?: { limit?: number }): Promise<T[]> {
    console.log(`[Supabase] Fetching filtered from ${this.table}:`, filters)
    let query = this.db().from(this.table).select('*')
    for (const [key, value] of Object.entries(toSnakeCase(filters as Record<string, unknown>))) {
      if (value !== undefined) query = query.eq(key, value)
    }
    if (opts?.limit) query = query.limit(opts.limit)
    const { data, error } = await query
    if (error) {
      console.error(`[Supabase Error] Failed to list filtered ${this.table}:`, error)
      throw error
    }
    return (data ?? []).map((row) => toCamelCase<T>(row))
  }

  async create(item: T): Promise<T> {
    console.log(`[Supabase] Creating item in ${this.table}...`)
    const payload = toSnakeCase(item as Record<string, unknown>)
    const { data, error } = await this.db().from(this.table).insert(payload).select().single()
    if (error) {
      console.error(`[Supabase Error] Failed to create in ${this.table}:`, error)
      throw error
    }
    console.log(`[Supabase] Item created in ${this.table}`)
    return toCamelCase<T>(data)
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    console.log(`[Supabase] Updating item ${id} in ${this.table}...`)
    const payload = toSnakeCase(patch as Record<string, unknown>)
    const { error } = await this.db().from(this.table).update(payload).eq('id', id)
    if (error) {
      console.error(`[Supabase Error] Failed to update ${id} in ${this.table}:`, error)
      throw error
    }
    console.log(`[Supabase] Item ${id} updated in ${this.table}`)
  }

  async remove(id: string): Promise<void> {
    console.log(`[Supabase] Deleting item ${id} from ${this.table}...`)
    const { error } = await this.db().from(this.table).delete().eq('id', id)
    if (error) {
      console.error(`[Supabase Error] Failed to delete ${id} from ${this.table}:`, error)
      throw error
    }
    console.log(`[Supabase] Item ${id} deleted from ${this.table}`)
  }
}
