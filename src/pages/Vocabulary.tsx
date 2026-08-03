import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { JLPTLevel, VocabWord } from '../types'
import { vocabCollection } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import { checkAccess } from '../utils/access'
import { ItemAccessLock } from '../components/ui/ItemAccessLock'
import { StudyItemActions } from '../components/learning/StudyItemActions'
import { logActivity } from '../utils/gamification'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

export default function Vocabulary({ initialLevel }: { initialLevel?: JLPTLevel }) {
  const { user, updateProfile } = useAuth()
  const [level, setLevel] = useState<JLPTLevel>(initialLevel ?? 'N5')
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    vocabCollection.listFiltered({ level }).then((words) => {
      setWords(words)
      setLoading(false)
    })
  }, [level])

  async function handleWordClick(w: VocabWord) {
    if (!user) return
    await logActivity(user.id, 'quizzesCompleted', 0, {
      type: 'lesson',
      title: `Mempelajari: ${w.kanji || w.kana}`,
      xpGained: 2
    })
    await updateProfile({ xp: user.xp + 2 })
  }

  return (
    <div className="space-y-5">
      {!initialLevel && (
        <div>
          <h1 className="text-xl font-bold">Kotoba — Kosakata</h1>
          <p className="text-sm text-ink-soft">Daftar kata berdasarkan level JLPT.</p>
        </div>
      )}

      {!initialLevel && (
        <div className="flex gap-2 overflow-x-auto pb-1">
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
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-line/50 rounded-xl animate-pulse" />)}
        </div>
      ) : words.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">
          Belum ada kosakata {level}.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {words.map((w) => {
            const access = checkAccess(w.accessType, user)
            if (access !== 'granted') {
              return <ItemAccessLock key={w.id} result={access} />
            }
            return (
              <div
                key={w.id}
                className="card p-4 flex items-start justify-between gap-3 hover:border-blue-200 transition-colors group cursor-pointer"
                onClick={() => handleWordClick(w)}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {w.kanji && <span className="font-jp text-lg font-bold text-ink">{w.kanji}</span>}
                    <span className="font-jp text-ink-soft text-sm">{w.kana}</span>
                  </div>
                  <p className="text-sm font-bold text-blue-600 mb-1">{w.meaning}</p>
                  <p className="text-[11px] text-ink-soft italic truncate">{w.example}</p>
                </div>
                <StudyItemActions
                  itemId={w.id}
                  itemType="vocab"
                  audioText={w.kana}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
