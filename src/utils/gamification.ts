import type { DailyActivity, UserProfile, UserProgress } from '../types'
import { userProgressCollection } from '../services/db'
import { todayISO } from './progress'

const EMPTY_PROGRESS: UserProgress = { id: 'progress', completedLessons: 0, activityLog: [], unlockedAchievements: [] }

export async function getOrCreateProgress(uid: string): Promise<UserProgress> {
  const col = userProgressCollection(uid)
  const existing = await col.get('progress')
  if (existing) return existing
  const created = { ...EMPTY_PROGRESS }
  await col.create(created)
  return created
}

/** Increments today's activity counter (flashcardsReviewed / quizzesCompleted / examsCompleted)
 *  and bumps completedLessons. Call this from any module that finishes a study action. */
export async function logActivity(uid: string, field: keyof Omit<DailyActivity, 'date'>, amount = 1): Promise<UserProgress> {
  const col = userProgressCollection(uid)
  const progress = await getOrCreateProgress(uid)
  const today = todayISO()
  const log = [...progress.activityLog]
  const idx = log.findIndex((a) => a.date === today)
  if (idx >= 0) {
    log[idx] = { ...log[idx], [field]: log[idx][field] + amount }
  } else {
    log.push({ date: today, flashcardsReviewed: 0, quizzesCompleted: 0, examsCompleted: 0, [field]: amount })
  }
  const updated: UserProgress = { ...progress, activityLog: log, completedLessons: progress.completedLessons + 1 }
  await col.update('progress', updated)
  return updated
}

export function todaysActivity(progress: UserProgress): DailyActivity {
  const today = todayISO()
  return progress.activityLog.find((a) => a.date === today) ?? { date: today, flashcardsReviewed: 0, quizzesCompleted: 0, examsCompleted: 0 }
}

/** Daily mission: review >=10 flashcards AND complete >=1 quiz/exam today. */
export function isDailyMissionComplete(progress: UserProgress): boolean {
  const t = todaysActivity(progress)
  return t.flashcardsReviewed >= 10 && (t.quizzesCompleted >= 1 || t.examsCompleted >= 1)
}

export interface Achievement {
  id: string
  label: string
  description: string
  isUnlocked: (user: UserProfile, progress: UserProgress) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', label: 'First Steps', description: 'Earn your first XP', isUnlocked: (u) => u.xp > 0 || u.level > 1 },
  { id: 'streak-3', label: 'Getting Consistent', description: '3-day study streak', isUnlocked: (u) => u.streak >= 3 },
  { id: 'streak-7', label: 'One Week Strong', description: '7-day study streak', isUnlocked: (u) => u.streak >= 7 },
  { id: 'streak-30', label: 'Habit Formed', description: '30-day study streak', isUnlocked: (u) => u.streak >= 30 },
  { id: 'level-5', label: 'Rising Star', description: 'Reach Level 5', isUnlocked: (u) => u.level >= 5 },
  { id: 'level-10', label: 'Dedicated Learner', description: 'Reach Level 10', isUnlocked: (u) => u.level >= 10 },
  { id: 'lessons-10', label: 'Busy Bee', description: 'Complete 10 study actions', isUnlocked: (_u, p) => p.completedLessons >= 10 },
  { id: 'lessons-100', label: 'Marathoner', description: 'Complete 100 study actions', isUnlocked: (_u, p) => p.completedLessons >= 100 },
  { id: 'premium', label: 'Supporter', description: 'Upgrade to Premium', isUnlocked: (u) => u.isPremium }
]
