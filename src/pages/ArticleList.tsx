import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { articleCollection } from '../services/db'
import type { Article } from '../types/content'
import { useAuth } from '../contexts/AuthContext'
import { checkAccess } from '../utils/access'
import { ItemAccessLock } from '../components/ui/ItemAccessLock'

export default function ArticleList() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[] | null>(null)

  useEffect(() => {
    articleCollection.list().then((all) => {
      const now = Date.now()
      const visible = all.filter((a) => a.status === 'published' || (a.status === 'scheduled' && (a.publishAt ?? 0) <= now))
      setArticles(visible.sort((a, b) => b.updatedAt - a.updatedAt))
    })
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Newspaper size={20} className="text-blue-500" />
        <h1 className="text-xl font-bold">Artikel</h1>
      </div>
      <p className="text-sm text-ink-soft mb-5">Tips belajar, budaya Jepang, dan panduan JLPT.</p>

      {!articles ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : articles.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">Belum ada artikel yang dipublikasikan.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {articles.map((a) => {
            const access = checkAccess(a.accessType, user)
            return (
              <div key={a.id} className="card overflow-hidden">
                {a.thumbnailUrl && <img src={a.thumbnailUrl} alt="" className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-1">{a.category}</p>
                  <h2 className="font-bold mb-1">{a.title}</h2>
                  <p className="text-xs text-ink-soft mb-3">{new Date(a.updatedAt).toLocaleDateString('id-ID')} · {a.authorName}</p>
                  {access === 'granted' ? (
                    <Link to={`/articles/${a.slug}`} className="text-sm font-semibold text-blue-600">Baca selengkapnya →</Link>
                  ) : (
                    <ItemAccessLock result={access} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
