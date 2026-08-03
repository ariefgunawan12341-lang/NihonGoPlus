import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { toCamelCase } from '../../services/caseConvert'

interface ActivityEntry {
  id: string
  adminName: string
  action: string
  targetTable?: string
  targetId?: string
  details?: Record<string, unknown>
  createdAt: any // Firestore Timestamp or number
}

export default function AdminActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null)

  useEffect(() => {
    async function loadLogs() {
      try {
        const logRef = collection(db, 'admin_activity_log');
        const q = query(logRef, orderBy('created_at', 'desc'), limit(200));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...toCamelCase<Omit<ActivityEntry, 'id'>>(doc.data() as Record<string, unknown>)
        }));
        setEntries(list as ActivityEntry[]);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
        setEntries([]);
      }
    }
    loadLogs();
  }, [])

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
              <p className="text-xs text-ink-soft/60">
                {e.createdAt?.seconds
                  ? new Date(e.createdAt.seconds * 1000).toLocaleString('id-ID')
                  : typeof e.createdAt === 'number'
                    ? new Date(e.createdAt).toLocaleString('id-ID')
                    : 'N/A'
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
