import { FirestoreCollection, UserScopedFirestoreTable } from './firebase/firestoreCollection'
import type { VocabWord, ExamQuestion, SrsCardState, ExamAttempt, UserProfile, KaiwaSession, DownloadModule, UserProgress, Bookmark, UserNote, UserNotification, UserAchievement } from '../types'
import type { ContentItem, Article, Comment, Announcement, SiteSettings, PremiumPackage, PageView, PremiumOrder, Feedback, Coupon } from '../types/content'

// The application now strictly uses Firebase as the backend.
function makeCollection<T extends { id: string }>(table: string) {
  return new FirestoreCollection<T>(table)
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

function makeUserCollection<T extends { id: string }>(table: string, uid: string) {
  return new UserScopedFirestoreTable<T>(table, uid)
}

export function userProgressCollection(uid: string) {
  return makeUserCollection<UserProgress>('progress', uid)
}

/** Generic per-user table factory. */
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

import { auth } from '../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

// User Profile is stored in the 'users' collection with Doc ID = UID
const usersCol = new FirestoreCollection<UserProfile>('users')

export async function listAllUsersAdmin(): Promise<UserProfile[]> {
  return usersCol.list()
}

export async function setUserAdminFlags(id: string, patch: Partial<UserProfile>): Promise<void> {
  await usersCol.update(id, patch)
}

export async function adminResetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function adminDeleteUser(id: string): Promise<void> {
  // Soft delete via Firestore for now since client SDK can't delete other users
  await usersCol.update(id, { status: 'disabled' } as any)
}

