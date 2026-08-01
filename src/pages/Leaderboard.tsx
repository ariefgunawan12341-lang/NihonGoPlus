import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import clsx from 'clsx'
import { listAllUsersAdmin } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import type { UserProfile } from '../types'

export default function Leaderboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[] | null>(null)

  useEffect(() => {
    listAllUsersAdmin().then((all) => setUsers([...all].sort((a, b) => b.xp - a.xp).slice(0, 20)))
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="text-gold-500" size={22} />
        <h1 className="text-xl font-bold">Leaderboard</h1>
      </div>
      <p className="text-sm text-ink-soft mb-5">Top learners by XP.</p>

      {!users ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <div className="card divide-y divide-line">
          {users.map((u, i) => (
            <div key={u.uid} className={clsx('flex items-center gap-3 p-3', u.uid === user?.uid && 'bg-blue-50')}>
              <span
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  i === 0 ? 'bg-gold-500 text-white' : i === 1 ? 'bg-line text-ink' : i === 2 ? 'bg-hanko/20 text-hanko' : 'text-ink-soft'
                )}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.displayName}{u.uid === user?.uid && ' (you)'}</p>
                <p className="text-xs text-ink-soft">Level {u.level}</p>
              </div>
              <p className="text-sm font-bold text-blue-600">{u.xp} XP</p>
            </div>
          ))}
          {users.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No learners yet.</p>}
        </div>
      )}
    </div>
  )
}
