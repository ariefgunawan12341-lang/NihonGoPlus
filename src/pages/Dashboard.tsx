import { Link } from 'react-router-dom'
import { Flame, Star, Trophy, Type, BookMarked, Layers, Timer, ArrowRight, CheckCircle2, History } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { xpForNextLevel } from '../utils/progress'
import { getOrCreateProgress } from '../utils/gamification'
import { listAllUsersAdmin } from '../services/db'
import type { UserProgress, UserProfile } from '../types'

const quickAccess = [
  { label: 'Hiragana', to: '/basics/hiragana', icon: Type, color: 'bg-blue-50 text-blue-600' },
  { label: 'Vocabulary', to: '/vocabulary', icon: BookMarked, color: 'bg-mint-50 text-mint-600' },
  { label: 'Flashcards', to: '/flashcards', icon: Layers, color: 'bg-hanko/10 text-hanko' },
  { label: 'Exam Center', to: '/exam-center', icon: Timer, color: 'bg-blue-50 text-blue-600' }
]

export default function Dashboard() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [topUsers, setTopUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    if (user) {
      getOrCreateProgress(user.uid).then(setProgress)
      listAllUsersAdmin().then((all) => setTopUsers([...all].sort((a, b) => b.xp - a.xp).slice(0, 5)))
    }
  }, [user])

  if (!user) return null

  const nextLevelXp = xpForNextLevel(user.level)
  const pct = Math.min(100, Math.round((user.xp / nextLevelXp) * 100))

  return (
    <div className="space-y-6 pb-10">
      <div className="card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
        <p className="text-sm text-blue-100">Okaeri!</p>
        <h1 className="text-2xl font-bold font-display">{user.displayName}さん</h1>
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame size={20} className={user.streak > 0 ? 'text-orange-400' : 'text-blue-200'} />
            <div>
              <p className="text-lg font-bold leading-none">{user.streak}</p>
              <p className="text-xs text-blue-100">hari streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            <div>
              <p className="text-lg font-bold leading-none">{user.xp} XP</p>
              <p className="text-xs text-blue-100">Level {user.level}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[140px]">
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-blue-100 mt-1.5 font-medium">{nextLevelXp - user.xp} XP menuju Level {user.level + 1}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Challenge */}
          {progress?.dailyChallenge && (
            <div className="card p-5 border-l-4 border-blue-500 bg-blue-50/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-blue-500" />
                  <h3 className="font-bold text-ink">Tantangan Hari Ini</h3>
                </div>
                {progress.dailyChallenge.completed && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Selesai</span>
                )}
              </div>
              <p className="text-sm font-medium mb-2">{progress.dailyChallenge.title}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (progress.dailyChallenge.current / progress.dailyChallenge.target) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
                  {progress.dailyChallenge.current} / {progress.dailyChallenge.target}
                </span>
              </div>
              <p className="text-[11px] text-ink-soft mt-2 flex items-center gap-1">
                <Star size={10} className="text-yellow-500" /> Hadiah: {progress.dailyChallenge.xpReward} XP
              </p>
            </div>
          )}

          {/* Quick Access */}
          <div>
            <h2 className="text-xs font-bold text-ink-soft uppercase tracking-widest mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickAccess.map((q) => (
                <Link key={q.to} to={q.to} className="card p-4 flex flex-col items-center gap-3 hover:shadow-card hover:-translate-y-0.5 transition active:scale-95">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${q.color} shadow-sm`}>
                    <q.icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-ink">{q.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-ink-soft uppercase tracking-widest flex items-center gap-1.5">
                <History size={12} /> Aktivitas Terbaru
              </h2>
            </div>
            <div className="card divide-y divide-line overflow-hidden">
              {progress?.recentActivities?.length ? (
                progress.recentActivities.map((act) => (
                  <div key={act.id} className="p-3 flex items-center gap-3 hover:bg-paper-light transition">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {act.type === 'lesson' ? <BookMarked size={14} /> : act.type === 'quiz' ? <CheckCircle2 size={14} /> : <Trophy size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{act.title}</p>
                      <p className="text-[10px] text-ink-soft">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-[11px] font-bold text-green-600">+{act.xpGained} XP</p>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-xs text-ink-soft italic">Belum ada aktivitas hari ini. Mulai belajar sekarang!</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Mini Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-ink-soft uppercase tracking-widest flex items-center gap-1.5">
                <Trophy size={12} /> Peringkat Teratas
              </h2>
              <Link to="/leaderboard" className="text-[10px] font-bold text-blue-600 hover:underline">Lihat Semua</Link>
            </div>
            <div className="card overflow-hidden divide-y divide-line">
              {topUsers.map((u, i) => (
                <div key={u.uid} className={`p-3 flex items-center gap-3 ${u.uid === user.uid ? 'bg-blue-50/50' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-line text-ink-soft'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{u.displayName}</p>
                    <p className="text-[10px] text-ink-soft">Level {u.level}</p>
                  </div>
                  <p className="text-[10px] font-bold text-blue-600">{u.xp} XP</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 bg-ink text-white">
            <h3 className="font-bold text-sm mb-1">Coba AI Sensei</h3>
            <p className="text-xs text-ink-soft-dark mb-4">Latihan percakapan bahasa Jepang dengan Arif Boncel Sensei kapan saja.</p>
            <Link to="/kaiwa-ai" className="btn-primary w-full py-2 text-xs border-none">Mulai Chat</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
