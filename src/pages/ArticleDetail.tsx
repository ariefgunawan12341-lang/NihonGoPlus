import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articleCollection } from '../services/db'
import type { Article } from '../types/content'
import { useAuth } from '../contexts/AuthContext'
import { checkAccess } from '../utils/access'
import { ItemAccessLock } from '../components/ui/ItemAccessLock'
import { CommentSection } from '../components/content/CommentSection'
import { sanitizeHtml } from '../utils/sanitize'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [article, setArticle] = useState<Article | null | undefined>(undefined)

  useEffect(() => {
    articleCollection.list().then((all) => {
      setArticle(all.find((a) => a.slug === slug) ?? null)
    })
  }, [slug])

  if (article === undefined) return <p className="text-sm text-ink-soft">Memuat…</p>
  if (article === null) {
    return (
      <div className="card p-8 text-center text-ink-soft text-sm">
        Artikel tidak ditemukan. <Link to="/articles" className="text-blue-600 font-semibold">Kembali ke daftar artikel</Link>
      </div>
    )
  }

  const access = checkAccess(article.accessType, user)

  return (
    <div className="max-w-2xl mx-auto">
      {article.thumbnailUrl && <img src={article.thumbnailUrl} alt="" className="w-full h-56 object-cover rounded-xl2 mb-5" />}
      <p className="text-xs text-blue-600 font-semibold mb-1">{article.category}</p>
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <p className="text-xs text-ink-soft mb-5">{new Date(article.updatedAt).toLocaleDateString('id-ID')} · {article.authorName}</p>

      {access === 'granted' ? (
        <>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.bodyHtml) }} />
          {article.tags.length > 0 && (
            <div className="flex gap-2 mt-5 flex-wrap">
              {article.tags.map((t) => (
                <span key={t} className="text-xs bg-paper border border-line rounded-full px-2.5 py-1 text-ink-soft">#{t}</span>
              ))}
            </div>
          )}
          <CommentSection articleId={article.id} />
        </>
      ) : (
        <ItemAccessLock result={access} />
      )}
    </div>
  )
}
