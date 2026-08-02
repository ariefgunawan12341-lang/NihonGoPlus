import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import clsx from 'clsx'
import { articleCollection } from '../../services/db'
import { uploadMediaFile } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'
import { slugify } from '../../utils/slug'
import type { Article, PublishStatus } from '../../types/content'
import type { AccessType } from '../../types'
import { Modal } from '../../components/admin/Modal'
import { RichTextEditor } from '../../components/admin/RichTextEditor'

const STATUSES: PublishStatus[] = ['draft', 'published', 'scheduled', 'archived']
const ACCESS_TYPES: AccessType[] = ['public', 'free', 'premium']

function emptyArticle(uid: string, name: string): Omit<Article, 'id'> {
  const now = Date.now()
  return {
    title: '', slug: '', bodyHtml: '', category: '', tags: [], status: 'draft',
    accessType: 'public', authorUid: uid, authorName: name, createdAt: now, updatedAt: now
  }
}

export default function AdminArticles() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState<Omit<Article, 'id'>>(emptyArticle('', ''))
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all')
  const [uploadingThumb, setUploadingThumb] = useState(false)

  function load() {
    setLoading(true)
    articleCollection.list().then((all) => {
      setArticles([...all].sort((a, b) => b.updatedAt - a.updatedAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  function openCreate() {
    if (!user) return
    setEditing(null)
    setForm(emptyArticle(user.uid, user.fullName))
    setError(null)
    setShowModal(true)
  }

  function openEdit(a: Article) {
    setEditing(a)
    setForm({ ...a })
    setError(null)
    setShowModal(true)
  }

  async function handleThumbnail(file: File) {
    setUploadingThumb(true)
    try {
      const url = await uploadMediaFile(file, 'thumbnails')
      setForm((f) => ({ ...f, thumbnailUrl: url }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah thumbnail.')
    } finally {
      setUploadingThumb(false)
    }
  }

  async function save() {
    if (!form.title || !form.bodyHtml) {
      setError('Judul dan isi artikel wajib diisi.')
      return
    }
    const slug = form.slug || slugify(form.title)
    const payload = { ...form, slug, updatedAt: Date.now() }
    try {
      if (editing) {
        await articleCollection.update(editing.id, payload)
      } else {
        await articleCollection.create({ id: `article-${crypto.randomUUID()}`, ...payload })
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan artikel.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus artikel ini? Tindakan ini tidak bisa dibatalkan.')) return
    await articleCollection.remove(id)
    load()
  }

  const filtered = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input className="input" placeholder="Cari artikel…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PublishStatus | 'all')}>
            <option value="all">Semua status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Artikel
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-soft border-b border-line">
              <tr>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Akses</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full',
                      a.status === 'published' ? 'bg-mint-50 text-mint-600' :
                      a.status === 'draft' ? 'bg-line text-ink-soft' :
                      a.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-hanko/10 text-hanko'
                    )}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{a.accessType}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {a.status === 'published' && (
                      <a href={`/articles/${a.slug}`} target="_blank" rel="noreferrer" className="text-ink-soft hover:underline inline-flex items-center gap-1">
                        <Eye size={14} /> Lihat
                      </a>
                    )}
                    <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => remove(a.id)} className="text-hanko hover:underline inline-flex items-center gap-1">
                      <Trash2 size={14} /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-soft">Belum ada artikel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Artikel' : 'Tambah Artikel'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <input className="input" placeholder="Judul *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input" placeholder={`Slug (kosongkan untuk otomatis: ${slugify(form.title || 'judul-artikel')})`} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />

            <div>
              <p className="text-xs font-semibold text-ink-soft mb-1">Thumbnail</p>
              {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" className="h-24 rounded-lg mb-2 object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnail(f) }} />
              {uploadingThumb && <p className="text-xs text-blue-600 mt-1">Mengunggah…</p>}
            </div>

            <div>
              <p className="text-xs font-semibold text-ink-soft mb-1">Isi artikel *</p>
              <RichTextEditor value={form.bodyHtml} onChange={(html) => setForm({ ...form, bodyHtml: html })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="input" placeholder="Tag (pisah koma)" value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            </div>

            <input className="input" placeholder="SEO Title" value={form.seoTitle ?? ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            <textarea className="input" rows={2} placeholder="SEO Description" value={form.seoDescription ?? ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />

            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PublishStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" value={form.accessType} onChange={(e) => setForm({ ...form, accessType: e.target.value as AccessType })}>
                {ACCESS_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {form.status === 'scheduled' && (
              <input
                type="datetime-local"
                className="input"
                onChange={(e) => setForm({ ...form, publishAt: new Date(e.target.value).getTime() })}
              />
            )}

            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Simpan perubahan' : 'Buat artikel'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
