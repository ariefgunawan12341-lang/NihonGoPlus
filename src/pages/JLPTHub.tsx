import { Link } from 'react-router-dom'
import type { JLPTLevel } from '../types'

const LEVELS: { level: JLPTLevel; desc: string }[] = [
  { level: 'N5', desc: 'Basic Japanese — start here' },
  { level: 'N4', desc: 'Elementary Japanese' },
  { level: 'N3', desc: 'Intermediate Japanese' },
  { level: 'N2', desc: 'Upper-intermediate Japanese' },
  { level: 'N1', desc: 'Advanced Japanese' }
]

export default function JLPTHub() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-1">JLPT</h1>
      <p className="text-sm text-ink-soft mb-5">Kotoba, Kanji, Grammar, Reading, Listening &amp; Exams for every level.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {LEVELS.map((l) => (
          <Link key={l.level} to={`/jlpt/${l.level}`} className="card p-5 flex items-center justify-between hover:shadow-card transition">
            <div>
              <p className="font-bold text-lg">{l.level}</p>
              <p className="text-sm text-ink-soft">{l.desc}</p>
            </div>
            <span className="btn-secondary pointer-events-none">Open</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
