import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { downloadModuleCollection } from '../../services/db'
import type { DownloadModule, JLPTLevel } from '../../types'
import { Modal } from '../../components/admin/Modal'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const EMPTY: Omit<DownloadModule, 'id'> = { title: '', description: '', level: 'N5', fileUrl: '', premium: true, order: 0 }

export default function AdminDownloadModules() {
  const [items, setItems] = useState<DownloadModule[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DownloadModule | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    downloadModuleCollection.list().then((all) => {
      setItems([...all].sort((a, b) => a.order - b.order))
      setLoading(false)
    })
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: DownloadModule) {
    setEditing(item)
    setForm({ ...item })
    setError(null)
    setShowModal(true)
  }

  async function save() {
    if (!form.title || !form.fileUrl) {
      setError('Title and file URL are required.')
      return
    }
    try {
      if (editing) {
        await downloadModuleCollection.update(editing.id, form)
      } else {
        await downloadModuleCollection.create({ id: `mod-${crypto.randomUUID()}`, ...form })
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save module.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this module? This cannot be undone.')) return
    await downloadModuleCollection.remove(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">{items.length} download modules</p>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add module
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-soft border-b border-line">
              <tr>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{item.level}</td>
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.premium ? <span className="text-gold-600 font-semibold">Premium</span> : 'Free'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => remove(item.id)} className="text-hanko hover:underline inline-flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">No download modules yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit module' : 'Add module'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as JLPTLevel })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input className="input" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input" placeholder="File URL (e.g. Google Drive link) *" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.checked })} className="w-4 h-4 accent-blue-500" />
              Premium only
            </label>
            <input className="input" type="number" placeholder="Display order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Save changes' : 'Add module'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
