import { useState } from 'react'
import type { KanaChar } from '../../types'

export function KanaGrid({ chars }: { chars: KanaChar[] }) {
  const groups = Array.from(new Set(chars.map((c) => c.group)))
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">{group}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {chars.filter((c) => c.group === group).map((c) => (
              <button
                key={c.id}
                onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}
                className="card aspect-square flex items-center justify-center hover:shadow-card transition"
              >
                {flipped[c.id] ? (
                  <span className="text-sm font-semibold text-blue-600">{c.romaji}</span>
                ) : (
                  <span className="font-jp text-3xl">{c.kana}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
