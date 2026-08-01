import { USE_SUPABASE, supabase } from '../supabase/client'
import type { UserProfile } from '../types'

/** Records an admin action to admin_activity_log (Supabase only — local mode
 *  has no server-side audit trail to write to). Call this after any
 *  meaningful create/update/delete from an Admin Panel page. */
export async function logAdminActivity(
  admin: UserProfile,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!USE_SUPABASE || !supabase) return
  try {
    await supabase.from('admin_activity_log').insert({
      admin_uid: admin.uid,
      admin_name: admin.displayName,
      action,
      target_table: targetTable,
      target_id: targetId,
      details: details ?? null
    })
  } catch (err) {
    // Never let logging failures break the actual admin action.
    console.error('Failed to log admin activity:', err)
  }
}
