import { Link } from 'react-router-dom'
import { Flame, Star, Trophy, Type, BookMarked, Layers, Timer, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { xpForNextLevel } from '../utils/progress'

const quickAccess = [
  { label: 'Hiragana', to: '/basics/hiragana', icon: Type, color: 'bg-blue-50 text-blue-600' },
  { label: 'Vocabulary', to: '/vocabulary', icon: BookMarked, color: 'bg-mint-50 text-mint-600' },
  { label: 'Flashcards', to: '/flashcards', icon: Layers, color: 'bg-hanko/10 text-hanko' },
  { label: 'N5 Exam', to: '/exam-center', icon: Timer, color: 'bg-blue-50 text-blue-600' }
]

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  const pct = Math.min(100, Math.round((user.xp / xpForNextLevel(user.level)) * 100))

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
        <p className="text-sm text-blue-100">Welcome back</p>
        <h1 className="text-2xl font-bold font-display">{user.displayName}さん</h1>
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame size={20} />
            <div>
              <p className="text-lg font-bold leading-none">{user.streak}</p>
              <p className="text-xs text-blue-100">day streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star size={20} />
            <div>
              <p className="text-lg font-bold leading-none">{user.xp} XP</p>
              <p className="text-xs text-blue-100">Level {user.level}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="h-2 rounded-full bg-white/25 overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-blue-100 mt-1">{xpForNextLevel(user.level) - user.xp} XP to level {user.level + 1}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickAccess.map((q) => (
            <Link key={q.to} to={q.to} className="card p-4 flex flex-col items-center gap-2 hover:shadow-card transition">
              <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center ${q.color}`}>
                <q.icon size={18} />
              </div>
              <span className="text-sm font-semibold">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-hanko" />
            <h3 className="font-semibold">Daily mission</h3>
          </div>
          <p className="text-sm text-ink-soft mb-3">Review 10 flashcards and complete one Hiragana quiz.</p>
          <Link to="/flashcards" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1">
            Start now <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Timer size={18} className="text-blue-500" />
            <h3 className="font-semibold">Continue exam</h3>
          </div>
          <p className="text-sm text-ink-soft mb-3">Pick up your N5 practice exam — Moji, Goi, Bunpou &amp; Dokkai.</p>
          <Link to="/exam-center" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1">
            Go to Exam Center <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
