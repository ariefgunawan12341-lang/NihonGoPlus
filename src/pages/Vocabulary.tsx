import { useEffect, useState } from 'react'
import { Heart, Volume2 } from 'lucide-react'
import clsx from 'clsx'
import type { JLPTLevel, VocabWord } from '../types'
import { vocabCollection } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import { checkAccess } from '../utils/access'
import { ItemAccessLock } from '../components/ui/ItemAccessLock'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

function speak(text: string) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    window.speechSynthesis.speak(utter)
  }
}

export default function Vocabulary({ initialLevel }: { initialLevel?: JLPTLevel }) {
  const { user } = useAuth()
  const [level, setLevel] = useState<JLPTLevel>(initialLevel ?? 'N5')
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Server-side filtered query — only this level's words are ever fetched,
    // so this stays fast even once a level holds thousands of entries.
    vocabCollection.listFiltered({ level }).then((words) => {
      setWords(words)
      setLoading(false)
    })
  }, [level])

  async function toggleFavorite(word: VocabWord) {
    const updated = { ...word, favorite: !word.favorite }
    setWords((ws) => ws.map((w) => (w.id === word.id ? updated : w)))
    await vocabCollection.update(word.id, { favorite: updated.favorite })
  }

  return (
    <div className="space-y-5">
      {!initialLevel && (
        <div>
          <h1 className="text-xl font-bold">Kotoba — Vocabulary</h1>
          <p className="text-sm text-ink-soft">Browse words by JLPT level.</p>
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
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : words.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">
          No {level} vocabulary yet — add some from the Admin Panel.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {words.map((w) => {
            const access = checkAccess(w.accessType, user)
            if (access !== 'granted') {
              return <ItemAccessLock key={w.id} result={access} />
            }
            return (
            <div key={w.id} className="card p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {w.kanji && <span className="font-jp text-lg">{w.kanji}</span>}
                  <span className="font-jp text-ink-soft">{w.kana}</span>
                </div>
                <p className="text-sm font-semibold text-blue-600">{w.meaning}</p>
                <p className="text-xs text-ink-soft mt-1 truncate">{w.example}</p>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button onClick={() => speak(w.kana)} className="text-ink-soft hover:text-blue-500">
                  <Volume2 size={18} />
                </button>
                <button onClick={() => toggleFavorite(w)} className={w.favorite ? 'text-hanko' : 'text-ink-soft hover:text-hanko'}>
                  <Heart size={18} fill={w.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
