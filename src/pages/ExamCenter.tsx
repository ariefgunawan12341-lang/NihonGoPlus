import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ExamRunner } from '../components/exam/ExamRunner'
import { questionCollection, userExamAttemptCollection } from '../services/db'
import type { ExamQuestion, JLPTLevel, QuestionCategory } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { getOrCreateProgress, todaysActivity } from '../utils/gamification'

const SECTIONS: { key: QuestionCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Simulation Exam (all sections)' },
  { key: 'moji', label: 'Moji (Script)' },
  { key: 'goi', label: 'Goi (Vocabulary)' },
  { key: 'bunpou', label: 'Bunpou (Grammar)' },
  { key: 'dokkai', label: 'Dokkai (Reading)' },
  { key: 'choukai', label: 'Choukai (Listening)' }
]

const FREE_DAILY_EXAM_LIMIT = 3

export default function ExamCenter({ level = 'N5' }: { level?: JLPTLevel }) {
  const { user } = useAuth()
  const attemptCollection = useMemo(() => (user ? userExamAttemptCollection(user.id) : null), [user])

  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [section, setSection] = useState<QuestionCategory | 'all'>('all')
  const [running, setRunning] = useState(false)
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([])
  const [starting, setStarting] = useState(false)
  const [examsToday, setExamsToday] = useState(0)

  useEffect(() => {
    setLoadingCounts(true)
    Promise.all(SECTIONS.map((s) =>
      s.key === 'all'
        ? questionCollection.listFiltered({ level })
        : questionCollection.listFiltered({ level, category: s.key as QuestionCategory })
    )).then((results) => {
      const map: Record<string, number> = {}
      SECTIONS.forEach((s, i) => (map[s.key] = results[i].length))
      setCounts(map)
      setLoadingCounts(false)
    })
  }, [level])

  useEffect(() => {
    if (!user) return
    getOrCreateProgress(user.id).then((p) => setExamsToday(todaysActivity(p).examsCompleted))
  }, [user, running])

  const dailyLimitReached = !user?.premium && examsToday >= FREE_DAILY_EXAM_LIMIT

  async function start() {
    setStarting(true)
    const pool =
      section === 'all'
        ? await questionCollection.listFiltered({ level })
        : await questionCollection.listFiltered({ level, category: section })
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    setExamQuestions(shuffled)
    setRunning(true)
    setStarting(false)
  }

  async function saveAttempt(score: number, answers: Record<string, number>) {
    if (!attemptCollection) return
    await attemptCollection.create({
      id: `attempt-${crypto.randomUUID()}`,
      level,
      startedAt: Date.now(),
      finishedAt: Date.now(),
      answers,
      score,
      totalQuestions: examQuestions.length
    })
  }

  if (running) {
    return (
      <ExamRunner
        questions={examQuestions}
        timeLimitSec={Math.max(60, examQuestions.length * 45)}
        onFinish={() => setRunning(false)}
        onSubmit={saveAttempt}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">JLPT Exam Center — {level}</h1>
        <p className="text-sm text-ink-soft">Official-style sections with a timer, scoring, and answer review.</p>
        {!user?.premium && (
          <p className="text-xs text-ink-soft mt-1">
            Free plan: {Math.max(0, FREE_DAILY_EXAM_LIMIT - examsToday)}/{FREE_DAILY_EXAM_LIMIT} exams left today
          </p>
        )}
      </div>

      {dailyLimitReached ? (
        <div className="card p-8 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center">
            <Lock size={26} />
          </div>
          <h2 className="font-bold">Daily exam limit reached</h2>
          <p className="text-sm text-ink-soft">Free plan includes {FREE_DAILY_EXAM_LIMIT} exams per day. Upgrade for unlimited exams.</p>
          <Link to="/premium" className="btn-primary mt-1">Upgrade to Premium</Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={clsx(
                  'w-full flex items-center justify-between card p-4 text-left transition',
                  section === s.key && 'border-blue-400 ring-2 ring-blue-100'
                )}
              >
                <span className="font-semibold text-sm">{s.label}</span>
                <span className="text-xs text-ink-soft">{loadingCounts ? '…' : `${counts[s.key] ?? 0} questions`}</span>
              </button>
            ))}
          </div>

          <button className="btn-primary w-full" disabled={starting || (counts[section] ?? 0) === 0} onClick={start}>
            {starting ? 'Loading questions…' : (counts[section] ?? 0) === 0 ? 'No questions in this section yet' : `Start (${counts[section]} questions)`}
          </button>
        </>
      )}
    </div>
  )
}
