import { useEffect, useState } from 'react'
import { Mail, Trash2, CheckCircle, Clock, Archive } from 'lucide-react'
import clsx from 'clsx'
import { feedbackCollection } from '../../services/db'
import type { Feedback } from '../../types/content'

export default function AdminFeedback() {
  const [list, setList] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    feedbackCollection.list().then((all) => {
      setList(all.sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function updateStatus(id: string, status: Feedback['status']) {
    await feedbackCollection.update(id, { status })
    setList(list.map(f => f.id === id ? { ...f, status } : f))
  }

  async function remove(id: string) {
    if (confirm('Hapus feedback ini?')) {
      await feedbackCollection.remove(id)
      setList(list.filter(f => f.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-ink-soft">Loading…</p> : (
        <div className="grid gap-3">
          {list.map((f) => (
            <div key={f.id} className={clsx("card p-4 flex flex-col md:flex-row gap-4 justify-between", f.status === 'unread' && "border-blue-200 bg-blue-50/20")}>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                    f.status === 'unread' ? "bg-blue-100 text-blue-700" :
                    f.status === 'read' ? "bg-line text-ink-soft" :
                    f.status === 'replied' ? "bg-mint-100 text-mint-700" : "bg-line text-ink-soft opacity-50"
                  )}>
                    {f.status}
                  </span>
                  <p className="text-[10px] text-ink-soft">{new Date(f.createdAt).toLocaleString()}</p>
                </div>
                <h3 className="font-bold text-sm">{f.subject}</h3>
                <p className="text-xs text-ink leading-relaxed">{f.message}</p>
                <div className="pt-2 flex items-center gap-3 text-[10px] text-ink-soft">
                  <span className="flex items-center gap-1"><Mail size={10} /> {f.userEmail || 'Anonymous'}</span>
                  <span>{f.userName || 'Anonymous User'}</span>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                <button
                  onClick={() => updateStatus(f.id, 'read')}
                  className="btn-secondary py-1 text-[10px] gap-1.5"
                  title="Mark as read"
                >
                  <CheckCircle size={12} /> Read
                </button>
                <button
                  onClick={() => updateStatus(f.id, 'archived')}
                  className="btn-secondary py-1 text-[10px] gap-1.5"
                >
                  <Archive size={12} /> Archive
                </button>
                <button
                  onClick={() => remove(f.id)}
                  className="btn-secondary py-1 text-[10px] gap-1.5 text-hanko hover:bg-hanko/10"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="card p-10 text-center text-sm text-ink-soft">Tidak ada feedback.</div>}
        </div>
      )}
    </div>
  )
}
