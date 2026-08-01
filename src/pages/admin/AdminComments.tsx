import { useEffect, useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import { commentCollection } from '../../services/db'
import type { Comment } from '../../types/content'

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    commentCollection.list().then((all) => {
      setComments([...all].sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function toggleApproved(c: Comment) {
    await commentCollection.update(c.id, { approved: !c.approved })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Hapus komentar ini?')) return
    await commentCollection.remove(id)
    load()
  }

  return (
    <div>
      <p className="text-sm text-ink-soft mb-4">{comments.length} komentar total</p>
      {loading ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : comments.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">Belum ada komentar.</div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="card p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{c.authorName}</p>
                <p className="text-sm text-ink-soft">{c.body}</p>
                <p className="text-[11px] text-ink-soft/60 mt-1">{new Date(c.createdAt).toLocaleString('id-ID')} · artikel: {c.articleId}</p>
              </div>
              <button onClick={() => toggleApproved(c)} className={c.approved ? 'text-mint-600' : 'text-ink-soft/40'} title="Toggle approved">
                <Check size={18} />
              </button>
              <button onClick={() => remove(c.id)} className="text-hanko" title="Hapus">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
