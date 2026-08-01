import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { USE_SUPABASE, supabase } from '../../supabase/client'
import { toCamelCase } from '../../services/caseConvert'

interface ActivityEntry {
  id: string
  adminName: string
  action: string
  targetTable?: string
  targetId?: string
  details?: Record<string, unknown>
  createdAt: number
}

export default function AdminActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null)

  useEffect(() => {
    if (!USE_SUPABASE || !supabase) {
      setEntries([])
      return
    }
    supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => setEntries((data ?? []).map((row) => toCamelCase<ActivityEntry>(row))))
  }, [])

  if (!USE_SUPABASE) {
    return (
      <div className="card p-8 text-center text-ink-soft text-sm">
        Activity Log memerlukan Supabase aktif (set <code>VITE_USE_SUPABASE=true</code>). Mode lokal tidak memiliki audit
        trail server-side.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History size={18} className="text-blue-500" />
        <p className="text-sm text-ink-soft">{entries?.length ?? 0} aktivitas tercatat (200 terakhir)</p>
      </div>
      {!entries ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">Belum ada aktivitas tercatat.</div>
      ) : (
        <div className="card divide-y divide-line">
          {entries.map((e) => (
            <div key={e.id} className="p-3 text-sm">
              <p><span className="font-semibold">{e.adminName}</span> — {e.action.replace(/_/g, ' ')}
                {e.targetTable && <span className="text-ink-soft"> ({e.targetTable}{e.targetId ? `: ${e.targetId}` : ''})</span>}
              </p>
              <p className="text-xs text-ink-soft/60">{new Date(e.createdAt).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
