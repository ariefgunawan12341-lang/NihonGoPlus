import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { commentCollection } from '../../services/db'
import { useAuth } from '../../contexts/AuthContext'
import type { Comment } from '../../types/content'

export function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  function load() {
    setLoading(true)
    commentCollection.listFiltered({ articleId }).then((all) => {
      setComments(all.filter((c) => c.approved).sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [articleId])

  async function post() {
    if (!user || !text.trim()) return
    setPosting(true)
    try {
      await commentCollection.create({
        articleId,
        authorUid: user.id,
        authorName: user.fullName,
        body: text.trim(),
        approved: true // auto-approved by default; admins can moderate/remove from Admin Panel
      } as any)
      setText('')
      load()
    } catch (err) {
      console.error('Gagal mengirim komentar:', err)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={18} className="text-blue-500" />
        <h3 className="font-bold">Komentar ({comments.length})</h3>
      </div>

      {user ? (
        <div className="flex gap-2 mb-4">
          <input className="input" placeholder="Tulis komentar…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && post()} />
          <button className="btn-primary" onClick={post} disabled={posting || !text.trim()}>Kirim</button>
        </div>
      ) : (
        <p className="text-sm text-ink-soft mb-4">Masuk untuk menulis komentar.</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Memuat komentar…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-soft">Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="card p-3">
              <p className="text-sm font-semibold">{c.authorName}</p>
              <p className="text-sm text-ink-soft">{c.body}</p>
              <p className="text-[11px] text-ink-soft/60 mt-1">{new Date(c.createdAt).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
