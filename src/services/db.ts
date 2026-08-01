import { USE_SUPABASE } from '../supabase/client'
import { LocalCollection, seedIfEmpty } from './localCollection'
import { SupabaseCollection } from './supabaseCollection'
import { UserScopedTable } from './userScopedCollection'
import type { VocabWord, ExamQuestion, SrsCardState, ExamAttempt, UserProfile, KaiwaSession, DownloadModule, UserProgress, Bookmark, UserNote, UserNotification, UserAchievement } from '../types'
import type { ContentItem, Article, Comment, Announcement, SiteSettings, PremiumPackage, PageView, PremiumOrder, Feedback, Coupon } from '../types/content'
import { vocabN5 } from '../data/vocabN5'
import { vocabN4 } from '../data/vocabN4'
import { examN5 } from '../data/examN5'
import { examN4 } from '../data/examN4'
import { contentSeed } from '../data/contentSeed'

// Single choke point: every screen imports collections from here, never
// directly from localCollection/supabaseCollection. Swapping the backend
// for the whole app is therefore just flipping VITE_USE_SUPABASE.
function makeCollection<T extends { id: string }>(table: string) {
  return USE_SUPABASE ? new SupabaseCollection<T>(table) : new LocalCollection<T>(table)
}

export const vocabCollection = makeCollection<VocabWord>('vocabulary')
export const questionCollection = makeCollection<ExamQuestion>('questions')
export const contentCollection = makeCollection<ContentItem>('content_items')
export const downloadModuleCollection = makeCollection<DownloadModule>('modules')
export const articleCollection = makeCollection<Article>('articles')
export const commentCollection = makeCollection<Comment>('comments')
export const announcementCollection = makeCollection<Announcement>('announcements')
export const premiumPackageCollection = makeCollection<PremiumPackage>('premium_packages')
export const premiumOrderCollection = makeCollection<PremiumOrder>('premium_orders')
export const pageViewCollection = makeCollection<PageView>('pageviews')
export const feedbackCollection = makeCollection<Feedback>('feedback')
export const couponCollection = makeCollection<Coupon>('coupons')

const SETTINGS_DOC_ID = 'site'
const settingsCol = makeCollection<SiteSettings>('settings')

export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await settingsCol.get(SETTINGS_DOC_ID)
  if (existing) return existing
  const fallback: SiteSettings = { id: SETTINGS_DOC_ID, siteName: 'NihonGoPlus' }
  return fallback
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  const existing = await settingsCol.get(SETTINGS_DOC_ID)
  if (existing) {
    await settingsCol.update(SETTINGS_DOC_ID, patch)
  } else {
    await settingsCol.create({ id: SETTINGS_DOC_ID, siteName: 'NihonGoPlus', ...patch })
  }
}

// Per-user data: Firestore modeled this as subcollections (users/{uid}/...);
// Postgres uses flat tables + a user_id column restricted by RLS instead
// (see supabase/schema.sql). Local mode keeps its existing uid-prefixed
// localStorage key approach. Either way, callers get the same interface.
function makeUserCollection<T extends { id: string }>(table: string, uid: string) {
  return USE_SUPABASE ? new UserScopedTable<T>(table, uid) : new LocalCollection<T>(`users_${uid}_${table}`)
}

export function userProgressCollection(uid: string) {
  return makeUserCollection<UserProgress>('progress', uid)
}

/** Generic per-user table factory for anything not already covered above. */
export function makeUserSubcollectionCollection<T extends { id: string }>(uid: string, name: string) {
  return makeUserCollection<T>(name, uid)
}

export function userSrsCollection(uid: string) {
  return makeUserCollection<SrsCardState & { id: string }>('srs_cards', uid)
}

export function userExamAttemptCollection(uid: string) {
  return makeUserCollection<ExamAttempt>('exam_attempts', uid)
}

export function userKaiwaCollection(uid: string) {
  return makeUserCollection<KaiwaSession>('kaiwa_sessions', uid)
}

export function userBookmarkCollection(uid: string) {
  return makeUserCollection<Bookmark>('bookmarks', uid)
}

export function userNoteCollection(uid: string) {
  return makeUserCollection<UserNote>('user_notes', uid)
}

export function userNotificationCollection(uid: string) {
  return makeUserCollection<UserNotification>('notifications', uid)
}

export function userAchievementCollection(uid: string) {
  return makeUserCollection<UserAchievement>('user_achievements', uid)
}

// Users are handled a little differently: in local mode they live inside the
// ngp_local_users blob (see services/localAuth.ts) rather than a flat
// collection, so the Admin "Users" screen reads/writes through this adapter
// instead of makeCollection. In Supabase mode it reads the `users` table
// directly since every signed-up user already has a row there.
export { listAllUsersAdmin, setUserAdminFlags } from './adminUsers'

// Seed local demo data on first run so the app has real content immediately.
// No-ops when running against real Supabase (seed your database via the
// Admin Panel's Bulk Import, or scripts/importSupabase.ts, instead).
export function seedLocalData() {
  if (USE_SUPABASE) return
  seedIfEmpty('vocabulary', [...vocabN5, ...vocabN4])
  seedIfEmpty('questions', [...examN5, ...examN4])
  seedIfEmpty('content_items', contentSeed)
}
