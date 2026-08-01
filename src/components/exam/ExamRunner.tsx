import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Clock, Volume2 } from 'lucide-react'
import type { ExamQuestion } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { applyStudySession } from '../../utils/progress'
import { logActivity } from '../../utils/gamification'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function speakJapanese(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    utter.rate = 0.9
    window.speechSynthesis.speak(utter)
  }
}

export function ExamRunner({
  questions,
  timeLimitSec,
  onFinish,
  onSubmit
}: {
  questions: ExamQuestion[]
  timeLimitSec: number
  onFinish: () => void
  onSubmit?: (score: number, answers: Record<string, number>) => void
}) {
  const { user, updateProfile } = useAuth()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(timeLimitSec)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          setSubmitted(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [submitted])

  useEffect(() => {
    if (submitted) {
      const score = questions.filter((q) => answers[q.id] === q.correctIndex).length
      if (user) {
        updateProfile(applyStudySession(user, score * 8))
        logActivity(user.uid, 'examsCompleted')
      }
      onSubmit?.(score, answers)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  useEffect(() => {
    const q = questions[index]
    if (!submitted && q?.category === 'choukai') {
      speakJapanese(q.prompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted])

  function select(qId: string, choiceIndex: number) {
    setAnswers((a) => ({ ...a, [qId]: choiceIndex }))
  }

  function finishExam() {
    setSubmitted(true)
  }

  if (submitted) {
    const score = questions.filter((q) => answers[q.id] === q.correctIndex).length
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-bold mb-1">Exam finished</h2>
          <p className="text-3xl font-display font-bold text-blue-600 my-2">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-ink-soft">{Math.round((score / questions.length) * 100)}% correct</p>
        </div>

        <h3 className="font-semibold text-sm text-ink-soft uppercase tracking-wide">Review</h3>
        {questions.map((q, i) => {
          const chosen = answers[q.id]
          const isCorrect = chosen === q.correctIndex
          return (
            <div key={q.id} className="card p-4">
              <p className="text-sm font-semibold mb-2 whitespace-pre-line">{i + 1}. {q.prompt}</p>
              <div className="space-y-1.5">
                {q.choices.map((c, ci) => (
                  <div
                    key={ci}
                    className={clsx(
                      'text-sm px-3 py-1.5 rounded-lg border',
                      ci === q.correctIndex
                        ? 'border-mint-400 bg-mint-50 text-mint-700'
                        : ci === chosen
                          ? 'border-hanko bg-hanko/10 text-hanko'
                          : 'border-line text-ink-soft'
                    )}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p className={clsx('text-xs mt-2', isCorrect ? 'text-mint-600' : 'text-hanko')}>{q.explanation}</p>
            </div>
          )
        })}

        <button className="btn-primary w-full" onClick={onFinish}>
          Back to Exam Center
        </button>
      </div>
    )
  }

  const q = questions[index]

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-soft">
          Question {index + 1} / {questions.length} · <span className="uppercase">{q.category}</span>
        </p>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-hanko">
          <Clock size={16} />
          {formatTime(remaining)}
        </div>
      </div>

      <div className="card p-6 mb-4">
        <p className="font-medium whitespace-pre-line">{q.prompt}</p>
        {q.category === 'choukai' && (
          <button
            onClick={() => speakJapanese(q.prompt)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600"
          >
            <Volume2 size={16} /> Replay audio
          </button>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {q.choices.map((c, ci) => (
          <button
            key={ci}
            onClick={() => select(q.id, ci)}
            className={clsx(
              'w-full text-left px-4 py-3 rounded-xl2 border text-sm font-medium transition',
              answers[q.id] === ci ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-line hover:border-blue-300'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex justify-between gap-2">
        <button
          className="btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </button>
        {index + 1 < questions.length ? (
          <button className="btn-primary" onClick={() => setIndex((i) => i + 1)}>
            Next
          </button>
        ) : (
          <button className="btn-primary" onClick={finishExam}>
            Submit exam
          </button>
        )}
      </div>
    </div>
  )
}
