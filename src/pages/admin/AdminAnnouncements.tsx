import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { announcementCollection } from '../../services/db'
import type { Announcement } from '../../types/content'
import { Modal } from '../../components/admin/Modal'

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [level, setLevel] = useState<Announcement['level']>('info')

  function load() {
    setLoading(true)
    announcementCollection.list().then((all) => {
      setItems([...all].sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function create() {
    if (!message.trim()) return
    await announcementCollection.create({ id: `ann-${crypto.randomUUID()}`, message: message.trim(), active: true, level, createdAt: Date.now() })
    setMessage('')
    setShowModal(false)
    load()
  }

  async function toggleActive(a: Announcement) {
    await announcementCollection.update(a.id, { active: !a.active })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    await announcementCollection.remove(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">{items.length} pengumuman</p>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Tambah</button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="card p-4 flex items-center gap-3">
              <span className={clsx('text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0',
                a.level === 'info' ? 'bg-blue-50 text-blue-600' : a.level === 'success' ? 'bg-mint-50 text-mint-600' : 'bg-gold-50 text-gold-600')}>
                {a.level}
              </span>
              <p className="text-sm flex-1">{a.message}</p>
              <button onClick={() => toggleActive(a)} className={clsx('text-xs font-semibold px-2 py-1 rounded-full', a.active ? 'bg-mint-50 text-mint-600' : 'bg-line text-ink-soft')}>
                {a.active ? 'Aktif' : 'Nonaktif'}
              </button>
              <button onClick={() => remove(a.id)} className="text-hanko"><Trash2 size={16} /></button>
            </div>
          ))}
          {items.length === 0 && <div className="card p-8 text-center text-ink-soft text-sm">Belum ada pengumuman.</div>}
        </div>
      )}

      {showModal && (
        <Modal title="Tambah Pengumuman" onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <textarea className="input" rows={3} placeholder="Isi pengumuman" value={message} onChange={(e) => setMessage(e.target.value)} />
            <select className="input" value={level} onChange={(e) => setLevel(e.target.value as Announcement['level'])}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </select>
            <button className="btn-primary w-full" onClick={create}>Publikasikan</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
