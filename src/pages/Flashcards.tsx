import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import type { JLPTLevel, SrsCardState, VocabWord } from '../types'
import { vocabCollection, userSrsCollection } from '../services/db'
import { scheduleNext, isDue, type SrsGrade } from '../utils/srs'
import { useAuth } from '../contexts/AuthContext'
import { applyStudySession } from '../utils/progress'
import { logActivity } from '../utils/gamification'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const GRADES: { grade: SrsGrade; label: string; color: string }[] = [
  { grade: 'again', label: 'Again', color: 'bg-hanko/10 text-hanko hover:bg-hanko/20' },
  { grade: 'hard', label: 'Hard', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { grade: 'good', label: 'Good', color: 'bg-mint-50 text-mint-600 hover:bg-mint-100' },
  { grade: 'easy', label: 'Easy', color: 'bg-mint-100 text-mint-600 hover:bg-mint-200' }
]

export default function Flashcards() {
  const { user, updateProfile } = useAuth()
  const srsCollection = useMemo(() => (user ? userSrsCollection(user.id) : null), [user])

  const [level, setLevel] = useState<JLPTLevel>('N5')
  const [words, setWords] = useState<VocabWord[]>([])
  const [srsMap, setSrsMap] = useState<Record<string, SrsCardState>>({})
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!srsCollection) return
    setLoading(true)
    Promise.all([vocabCollection.listFiltered({ level }), srsCollection.list()]).then(([allWords, allCards]) => {
      const map: Record<string, SrsCardState> = {}
      allCards.forEach((c) => (map[c.wordId] = c))
      const due = allWords.filter((w) => {
        const card = map[w.id]
        return !card || isDue(card)
      })
      setWords(allWords)
      setSrsMap(map)
      setQueue(due)
      setReviewed(0)
      setLoading(false)
    })
  }, [level, srsCollection])

  async function grade(g: SrsGrade) {
    const word = queue[0]
    if (!word || !srsCollection) return
    const next = scheduleNext(srsMap[word.id], word.id, g)
    setSrsMap((m) => ({ ...m, [word.id]: next }))

    const existing = await srsCollection.get(word.id)
    if (existing) {
      await srsCollection.update(word.id, next)
    } else {
      await srsCollection.create({ ...next, id: word.id })
    }

    setReviewed((r) => r + 1)
    setFlipped(false)
    setQueue((q) => q.slice(1))
    if (user) logActivity(user.id, 'flashcardsReviewed')
  }

  useEffect(() => {
    if (!loading && queue.length === 0 && reviewed > 0 && user) {
      updateProfile(applyStudySession(user, reviewed * 3))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length, loading])

  const current = queue[0]

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Flashcards</h1>
        <p className="text-sm text-ink-soft">{loading ? 'Loading…' : `${queue.length} due · ${reviewed} reviewed today`}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition',
              level === l ? 'bg-blue-500 text-white' : 'bg-surface border border-line text-ink-soft'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-10 text-center text-ink-soft text-sm">Loading…</div>
      ) : !current ? (
        <div className="card p-10 text-center">
          <RotateCcw className="mx-auto mb-3 text-mint-500" size={28} />
          <h2 className="font-bold mb-1">All caught up!</h2>
          <p className="text-sm text-ink-soft">
            {words.length === 0 ? `No ${level} vocabulary loaded yet — add some from the Admin Panel.` : "You've reviewed every due card. Come back tomorrow."}
          </p>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="card w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 mb-4 hover:shadow-card transition"
          >
            {!flipped ? (
              <>
                {current.kanji && <span className="font-jp text-4xl">{current.kanji}</span>}
                <span className="font-jp text-xl text-ink-soft">{current.kana}</span>
                <span className="text-xs text-ink-soft mt-2">Tap to flip</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-blue-600">{current.meaning}</span>
                <p className="text-sm text-ink-soft text-center px-6 mt-2">{current.example}</p>
                <p className="text-xs text-ink-soft/70 text-center px-6">{current.exampleMeaning}</p>
              </>
            )}
          </button>

          {flipped && (
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  onClick={() => grade(g.grade)}
                  className={`rounded-xl2 py-2.5 text-xs font-semibold transition ${g.color}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
