import type { DailyActivity, UserProfile, UserProgress, ActivityLogEntry, DailyChallenge } from '../types'
import { userProgressCollection } from '../services/db'
import { todayISO } from './progress'

const EMPTY_PROGRESS: UserProgress = {
  id: 'progress',
  completedLessons: 0,
  activityLog: [],
  recentActivities: [],
  unlockedAchievements: []
}

export async function getOrCreateProgress(uid: string): Promise<UserProgress> {
  const col = userProgressCollection(uid)
  const existing = await col.get('progress')
  if (existing) {
    // Ensure new fields exist for legacy users
    if (!existing.recentActivities) existing.recentActivities = []
    if (!existing.dailyChallenge || isChallengeExpired(existing.dailyChallenge.id)) {
      existing.dailyChallenge = generateDailyChallenge()
      await col.update('progress', existing)
    }
    return existing
  }
  const created = { ...EMPTY_PROGRESS, dailyChallenge: generateDailyChallenge() }
  await col.create(created)
  return created
}

function isChallengeExpired(challengeId: string): boolean {
  const today = todayISO()
  return !challengeId.startsWith(today)
}

function generateDailyChallenge(): DailyChallenge {
  const today = todayISO()
  const challenges: Omit<DailyChallenge, 'id' | 'current' | 'completed'>[] = [
    { title: 'Review 10 Flashcards', target: 10, type: 'flashcard' as any, xpReward: 50 },
    { title: 'Complete 2 Quizzes', target: 2, type: 'quiz' as any, xpReward: 40 },
    { title: 'Take 1 Practice Exam', target: 1, type: 'exam' as any, xpReward: 100 },
    { title: 'Learn 5 New Kanji', target: 5, type: 'kanji', xpReward: 60 }
  ]
  const random = challenges[Math.floor(Math.random() * challenges.length)]
  return { ...random, id: `${today}-${random.type}`, current: 0, completed: false }
}

/** Increments today's activity counter and adds to recent activities. */
export async function logActivity(
  uid: string,
  field: keyof Omit<DailyActivity, 'date'>,
  amount = 1,
  details?: { type: ActivityLogEntry['type']; title: string; xpGained: number }
): Promise<UserProgress> {
  const col = userProgressCollection(uid)
  const progress = await getOrCreateProgress(uid)
  const today = todayISO()

  // Update Daily Log
  const log = [...progress.activityLog]
  const idx = log.findIndex((a) => a.date === today)
  if (idx >= 0) {
    log[idx] = { ...log[idx], [field]: log[idx][field] + amount }
  } else {
    log.push({ date: today, flashcardsReviewed: 0, quizzesCompleted: 0, examsCompleted: 0, [field]: amount })
  }

  // Update Recent Activities
  let recent = [...(progress.recentActivities || [])]
  if (details) {
    recent.unshift({
      id: crypto.randomUUID(),
      type: details.type,
      title: details.title,
      timestamp: Date.now(),
      xpGained: details.xpGained
    })
    recent = recent.slice(0, 10) // Keep last 10
  }

  // Update Daily Challenge
  let challenge = progress.dailyChallenge
  if (challenge && !challenge.completed) {
    const mapping: Record<string, string> = {
      flashcardsReviewed: 'flashcard',
      quizzesCompleted: 'quiz',
      examsCompleted: 'exam'
    }
    if (mapping[field] === challenge.type) {
      challenge.current += amount
      if (challenge.current >= challenge.target) {
        challenge.completed = true
      }
    }
  }

  const updated: UserProgress = {
    ...progress,
    activityLog: log,
    recentActivities: recent,
    dailyChallenge: challenge,
    completedLessons: progress.completedLessons + 1
  }
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
