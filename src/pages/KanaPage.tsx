import { useState } from 'react'
import { hiraganaSet, katakanaSet } from '../data/kana'
import { KanaGrid } from '../components/kana/KanaGrid'
import { KanaQuiz } from '../components/kana/KanaQuiz'

export default function KanaPage({ script }: { script: 'hiragana' | 'katakana' }) {
  const chars = script === 'hiragana' ? hiraganaSet : katakanaSet
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">{script}</h1>
          <p className="text-sm text-ink-soft">Tap a card to flip between kana and rōmaji.</p>
        </div>
        <div className="flex gap-2">
          <button
            className={mode === 'learn' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('learn')}
          >
            Learn
          </button>
          <button
            className={mode === 'quiz' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setMode('quiz')}
          >
            Quiz
          </button>
        </div>
      </div>

      {mode === 'learn' ? (
        <KanaGrid chars={chars} />
      ) : (
        <KanaQuiz chars={chars} onExit={() => setMode('learn')} />
      )}
    </div>
  )
}
