import { Flame, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { xpForNextLevel } from '../../utils/progress'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Ohayou'
  if (h < 17) return 'Konnichiwa'
  return 'Konbanwa'
}

export function Topbar() {
  const { user } = useAuth()

  if (!user) {
    return (
      <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div>
            <p className="text-xs text-ink-soft">{greeting()},</p>
            <p className="font-display font-semibold text-ink">Tamu</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm px-3 py-1.5">Masuk</Link>
            <Link to="/signup" className="btn-primary text-sm px-3 py-1.5">Daftar gratis</Link>
          </div>
        </div>
      </header>
    )
  }

  const pct = Math.min(100, Math.round((user.xp / xpForNextLevel(user.level)) * 100))

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        <div>
          <p className="text-xs text-ink-soft">{greeting()},</p>
          <p className="font-display font-semibold text-ink">{user.displayName}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col w-32">
            <div className="flex items-center justify-between text-[11px] text-ink-soft mb-1">
              <span>Lv. {user.level}</span>
              <span>{user.xp}/{xpForNextLevel(user.level)} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-mint-50 text-mint-600 px-3 py-1.5 text-sm font-semibold">
            <Flame size={16} />
            {user.streak}
          </div>

          <div className="relative w-9 h-9 rounded-full bg-hanko flex items-center justify-center text-white shadow-soft animate-stamp">
            <Star size={16} fill="white" />
          </div>
        </div>
      </div>
    </header>
  )
}
