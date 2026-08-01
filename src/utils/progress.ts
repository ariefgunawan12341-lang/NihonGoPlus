import type { UserProfile } from '../types'

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function xpForNextLevel(level: number): number {
  return level * 100
}

/** Awards XP, recalculates level, and updates the daily streak. Returns the patch to persist. */
export function applyStudySession(user: UserProfile, xpEarned: number): Partial<UserProfile> {
  const today = todayISO()
  let streak = user.streak
  if (user.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    streak = user.lastStudyDate === yesterday ? user.streak + 1 : 1
  }

  let xp = user.xp + xpEarned
  let level = user.level
  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level)
    level += 1
  }

  return { xp, level, streak, lastStudyDate: today }
}
