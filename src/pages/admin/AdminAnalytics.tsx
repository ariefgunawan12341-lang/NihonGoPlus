import { useEffect, useState } from 'react'
import { Eye, TrendingUp } from 'lucide-react'
import { pageViewCollection, listAllUsersAdmin } from '../../services/db'
import type { PageView } from '../../types/content'

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default function AdminAnalytics() {
  const [views, setViews] = useState<PageView[] | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)

  useEffect(() => {
    pageViewCollection.list().then(setViews)
    listAllUsersAdmin().then((u) => setUserCount(u.length))
  }, [])

  if (!views) return <p className="text-sm text-ink-soft">Memuat…</p>

  const days = last7Days()
  const countsByDay = days.map((day) => views.filter((v) => new Date(v.timestamp).toISOString().slice(0, 10) === day).length)
  const maxCount = Math.max(1, ...countsByDay)

  const topPages = Object.entries(
    views.reduce<Record<string, number>>((acc, v) => {
      acc[v.path] = (acc[v.path] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center"><Eye size={20} /></div>
          <div>
            <p className="text-2xl font-bold font-display">{views.length}</p>
            <p className="text-xs text-ink-soft">Total pageview tercatat</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl2 bg-mint-50 text-mint-600 flex items-center justify-center"><TrendingUp size={20} /></div>
          <div>
            <p className="text-2xl font-bold font-display">{userCount ?? '—'}</p>
            <p className="text-xs text-ink-soft">Total pengguna terdaftar</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4">Pengunjung 7 hari terakhir</h3>
        <div className="flex items-end gap-2 h-32">
          {countsByDay.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-blue-100 rounded-t-lg relative" style={{ height: `${Math.max(4, (count / maxCount) * 100)}%` }}>
                <div className="absolute inset-0 bg-blue-500 rounded-t-lg" />
              </div>
              <p className="text-[10px] text-ink-soft">{days[i].slice(5)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-3">Halaman terpopuler</h3>
        <div className="space-y-2">
          {topPages.map(([path, count]) => (
            <div key={path} className="flex items-center justify-between text-sm">
              <span className="text-ink-soft truncate">{path}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
          {topPages.length === 0 && <p className="text-sm text-ink-soft">Belum ada data.</p>}
        </div>
      </div>

      <p className="text-xs text-ink-soft">
        Analitik ini nyata (dihitung dari koleksi <code>pageviews</code> di Firestore) tapi sengaja ringan — bukan pengganti
        Google Analytics. Untuk analitik lengkap (sumber trafik, perangkat, dsb.), hubungkan Google Analytics ID di Settings.
      </p>
    </div>
  )
}
