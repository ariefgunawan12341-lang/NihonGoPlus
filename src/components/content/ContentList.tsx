import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import clsx from 'clsx'
import type { JLPTLevel } from '../../types'
import type { ContentItem, ContentKind } from '../../types/content'
import { contentCollection } from '../../services/db'
import { useAuth } from '../../contexts/AuthContext'
import { checkAccess } from '../../utils/access'
import { ItemAccessLock } from '../ui/ItemAccessLock'

function speak(text: string) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    window.speechSynthesis.speak(utter)
  }
}

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

export function ContentList({
  kind,
  category,
  fixedLevel,
  showLevelPicker = true,
  emptyLabel,
  previewLimit
}: {
  kind: ContentKind
  category?: string
  fixedLevel?: JLPTLevel
  showLevelPicker?: boolean
  emptyLabel: string
  previewLimit?: number
}) {
  const [level, setLevel] = useState<JLPTLevel>(fixedLevel ?? 'N5')
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const effectiveLevel = fixedLevel ?? level
  const showPicker = showLevelPicker && !fixedLevel

  useEffect(() => {
    setLoading(true)
    // Server-side filtered by kind (+ level, + category when relevant) so this
    // scales to thousands of entries without ever pulling the whole collection.
    contentCollection
      .listFiltered(showLevelPicker || fixedLevel ? { kind, level: effectiveLevel } : { kind, category })
      .then((all) => {
        setItems([...all].sort((a, b) => a.order - b.order))
        setLoading(false)
      })
  }, [kind, effectiveLevel, category, showLevelPicker, fixedLevel])

  const { user } = useAuth()

  return (
    <div className="space-y-4">
      {showPicker && (
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
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">{emptyLabel}</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {(previewLimit ? items.slice(0, previewLimit) : items).map((item) => {
              const access = checkAccess(item.accessType, user)
              if (access !== 'granted') {
                return <ItemAccessLock key={item.id} result={access} />
              }
              return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-jp text-xl">{item.title}</span>
                      {item.reading && <span className="text-sm text-ink-soft">{item.reading}</span>}
                    </div>
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">{item.meaning}</p>
                    {item.example && <p className="text-xs text-ink-soft mt-1">{item.example}</p>}
                    {item.exampleMeaning && <p className="text-xs text-ink-soft/70">{item.exampleMeaning}</p>}
                  </div>
                  <button onClick={() => speak(item.title)} className="text-ink-soft hover:text-blue-500 shrink-0">
                    <Volume2 size={18} />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
          {previewLimit && items.length > previewLimit && (
            <div className="card p-4 text-center text-sm text-ink-soft">
              +{items.length - previewLimit} more entries available with <Link to="/premium" className="text-blue-600 font-semibold">Premium</Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
