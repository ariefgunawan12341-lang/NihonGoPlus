import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { KanaChar } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { applyStudySession } from '../../utils/progress'
import { logActivity } from '../../utils/gamification'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestions(chars: KanaChar[], count: number) {
  const pool = shuffle(chars).slice(0, count)
  return pool.map((c) => {
    const distractors = shuffle(chars.filter((o) => o.id !== c.id)).slice(0, 3)
    return {
      char: c,
      options: shuffle([c, ...distractors])
    }
  })
}

export function KanaQuiz({ chars, onExit }: { chars: KanaChar[]; onExit: () => void }) {
  const { user, updateProfile } = useAuth()
  const questions = useMemo(() => buildQuestions(chars, Math.min(10, chars.length)), [chars])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const current = questions[index]

  function choose(optionId: string) {
    if (selected) return
    setSelected(optionId)
    const isCorrect = optionId === current.char.id
    if (isCorrect) setCorrectCount((c) => c + 1)

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1)
        setSelected(null)
      } else {
        setDone(true)
        if (user) {
          const xpEarned = correctCount + (isCorrect ? 1 : 0)
          updateProfile(applyStudySession(user, xpEarned * 5))
          logActivity(user.uid, 'quizzesCompleted')
        }
      }
    }, 500)
  }

  if (done) {
    const finalScore = correctCount
    return (
      <div className="card p-8 text-center max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-1">Quiz complete!</h2>
        <p className="text-ink-soft mb-4">
          You got {finalScore}/{questions.length} correct.
        </p>
        <button className="btn-primary w-full" onClick={onExit}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="card p-8 max-w-sm mx-auto">
      <p className="text-xs text-ink-soft mb-1">
        Question {index + 1} of {questions.length}
      </p>
      <div className="text-center my-6">
        <span className="font-jp text-6xl">{current.char.kana}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {current.options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrectOpt = opt.id === current.char.id
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              disabled={!!selected}
              className={clsx(
                'rounded-xl2 border px-4 py-3 text-sm font-semibold transition',
                selected
                  ? isCorrectOpt
                    ? 'bg-mint-50 border-mint-400 text-mint-600'
                    : isSelected
                      ? 'bg-hanko/10 border-hanko text-hanko'
                      : 'border-line text-ink-soft'
                  : 'border-line hover:border-blue-400 hover:bg-blue-50'
              )}
            >
              {opt.romaji}
            </button>
          )
        })}
      </div>
    </div>
  )
}
