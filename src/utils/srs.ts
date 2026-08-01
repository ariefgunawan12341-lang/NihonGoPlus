import type { SrsCardState } from '../types'

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy'

const GRADE_QUALITY: Record<SrsGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5
}

/** A simplified SM-2 spaced-repetition scheduler. */
export function scheduleNext(prev: SrsCardState | undefined, wordId: string, grade: SrsGrade): SrsCardState {
  const quality = GRADE_QUALITY[grade]
  const state = prev ?? { wordId, interval: 0, easeFactor: 2.5, repetitions: 0, dueDate: '' }

  let { interval, easeFactor, repetitions } = state

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 6
    else interval = Math.round(interval * easeFactor)

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  }

  const due = new Date()
  due.setDate(due.getDate() + interval)

  return {
    wordId,
    interval,
    easeFactor,
    repetitions,
    dueDate: due.toISOString().slice(0, 10)
  }
}

export function isDue(card: SrsCardState): boolean {
  return card.dueDate <= new Date().toISOString().slice(0, 10)
}
