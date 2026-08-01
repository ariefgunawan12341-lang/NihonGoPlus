import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import clsx from 'clsx'
import type { JLPTLevel } from '../types'
import { ContentList } from '../components/content/ContentList'
import Vocabulary from './Vocabulary'
import ExamCenter from './ExamCenter'
import { ExamRunner } from '../components/exam/ExamRunner'
import { questionCollection, userExamAttemptCollection } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import type { ExamQuestion } from '../types'

const VALID_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const TABS = [
  { key: 'kotoba', label: 'Kotoba' },
  { key: 'kanji', label: 'Kanji' },
  { key: 'grammar', label: 'Bunpou' },
  { key: 'dokkai', label: 'Dokkai' },
  { key: 'choukai', label: 'Choukai' },
  { key: 'exam', label: 'Exam' },
  { key: 'progress', label: 'Progress' }
] as const

type TabKey = (typeof TABS)[number]['key']

function ReadingOrListeningPractice({ level, category }: { level: JLPTLevel; category: 'dokkai' | 'choukai' }) {
  const { user } = useAuth()
  const attemptCollection = useMemo(() => (user ? userExamAttemptCollection(user.uid) : null), [user])
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setStarted(false)
    questionCollection.listFiltered({ level, category }).then(setQuestions)
  }, [level, category])

  async function saveAttempt(score: number, answers: Record<string, number>) {
    if (!attemptCollection || !questions) return
    await attemptCollection.create({
      id: `attempt-${crypto.randomUUID()}`,
      level,
      startedAt: Date.now(),
      finishedAt: Date.now(),
      answers,
      score,
      totalQuestions: questions.length
    })
  }

  if (questions === null) return <p className="text-sm text-ink-soft">Loading…</p>

  if (questions.length === 0) {
    return (
      <div className="card p-8 text-center text-ink-soft text-sm">
        No {category === 'dokkai' ? 'reading' : 'listening'} questions for {level} yet — add some from the Admin Panel.
      </div>
    )
  }

  if (!started) {
    return (
      <div className="card p-8 text-center">
        <h2 className="font-bold mb-1">{category === 'dokkai' ? 'Reading practice' : 'Listening practice'}</h2>
        <p className="text-sm text-ink-soft mb-4">{questions.length} questions</p>
        <button className="btn-primary" onClick={() => setStarted(true)}>Start</button>
      </div>
    )
  }

  return (
    <ExamRunner
      questions={questions}
      timeLimitSec={Math.max(60, questions.length * 60)}
      onFinish={() => setStarted(false)}
      onSubmit={saveAttempt}
    />
  )
}

function ProgressTab({ level }: { level: JLPTLevel }) {
  const { user } = useAuth()
  const attemptCollection = useMemo(() => (user ? userExamAttemptCollection(user.uid) : null), [user])
  const [attempts, setAttempts] = useState<Awaited<ReturnType<NonNullable<typeof attemptCollection>['list']>> | null>(null)

  useEffect(() => {
    if (!attemptCollection) return
    attemptCollection.list().then((all) => setAttempts(all.filter((a) => a.level === level).reverse()))
  }, [attemptCollection, level])

  if (!attempts) return <p className="text-sm text-ink-soft">Loading…</p>

  if (attempts.length === 0) {
    return <div className="card p-8 text-center text-ink-soft text-sm">No exam attempts yet for {level}. Take a practice exam to see your progress here.</div>
  }

  return (
    <div className="space-y-2">
      {attempts.map((a) => (
        <div key={a.id} className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{new Date(a.startedAt).toLocaleDateString()}</p>
            <p className="text-xs text-ink-soft">{a.totalQuestions} questions</p>
          </div>
          <p className="text-lg font-bold font-display text-blue-600">
            {a.score}/{a.totalQuestions}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function JLPTLevelPage() {
  const { level } = useParams<{ level: string }>()
  const [tab, setTab] = useState<TabKey>('kotoba')

  if (!level || !VALID_LEVELS.includes(level as JLPTLevel)) {
    return <Navigate to="/jlpt" replace />
  }
  const lvl = level as JLPTLevel

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">JLPT {lvl}</h1>
      <p className="text-sm text-ink-soft mb-4">Kotoba, Kanji, Grammar, Reading, Listening and Exams for {lvl}.</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition',
              tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-ink-soft hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'kotoba' && <Vocabulary initialLevel={lvl} />}
      {tab === 'kanji' && <ContentList kind="kanji" fixedLevel={lvl} emptyLabel={`No kanji added for ${lvl} yet — add some from the Admin Panel.`} />}
      {tab === 'grammar' && <ContentList kind="grammar" fixedLevel={lvl} emptyLabel={`No grammar points added for ${lvl} yet — add some from the Admin Panel.`} />}
      {tab === 'dokkai' && <ReadingOrListeningPractice level={lvl} category="dokkai" />}
      {tab === 'choukai' && <ReadingOrListeningPractice level={lvl} category="choukai" />}
      {tab === 'exam' && <ExamCenter level={lvl} />}
      {tab === 'progress' && <ProgressTab level={lvl} />}
    </div>
  )
}
