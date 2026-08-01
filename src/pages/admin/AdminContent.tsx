import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { contentCollection } from '../../services/db'
import type { JLPTLevel, AccessType } from '../../types'
import type { ContentItem, ContentKind } from '../../types/content'
import { Modal } from '../../components/admin/Modal'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const ACCESS_TYPES: AccessType[] = ['public', 'free', 'premium']

const LABELS: Record<ContentKind, { title: string; titleField: string; readingField: string }> = {
  kanji: { title: 'Kanji', titleField: 'Character (e.g. 学)', readingField: 'Reading (on/kun)' },
  grammar: { title: 'Grammar point', titleField: 'Grammar pattern (e.g. 〜ています)', readingField: 'Reading / notes' },
  module: { title: 'Module / Lesson', titleField: 'Title', readingField: 'Subtitle' },
  ssw: { title: 'SSW term', titleField: 'Term (e.g. 入浴介助)', readingField: 'Reading' },
  kaigo: { title: 'Kaigo Fukushishi term', titleField: 'Term', readingField: 'Reading' }
}

function emptyItem(kind: ContentKind): Omit<ContentItem, 'id'> {
  return { kind, level: 'N5', title: '', reading: '', meaning: '', example: '', exampleMeaning: '', order: 0, accessType: 'public' }
}

export default function AdminContent({ kind }: { kind: ContentKind }) {
  const labels = LABELS[kind]
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [form, setForm] = useState(emptyItem(kind))
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    contentCollection.list().then((all) => {
      setItems(all.filter((i) => i.kind === kind).sort((a, b) => a.order - b.order))
      setLoading(false)
    })
  }

  useEffect(load, [kind])

  function openCreate() {
    setEditing(null)
    setForm(emptyItem(kind))
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: ContentItem) {
    setEditing(item)
    setForm({ ...item })
    setError(null)
    setShowModal(true)
  }

  async function save() {
    if (!form.title || !form.meaning) {
      setError('Title and meaning are required.')
      return
    }
    try {
      if (editing) {
        await contentCollection.update(editing.id, form)
      } else {
        await contentCollection.create({ id: `${kind}-${crypto.randomUUID()}`, ...form })
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    await contentCollection.remove(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">{items.length} {labels.title.toLowerCase()} entries</p>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add {labels.title.toLowerCase()}
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
                <th className="px-4 py-3 font-medium">{labels.titleField.split(' (')[0]}</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{item.level}</td>
                  <td className="px-4 py-3 font-jp">{item.title}</td>
                  <td className="px-4 py-3">{item.meaning}</td>
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
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">Nothing here yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? `Edit ${labels.title.toLowerCase()}` : `Add ${labels.title.toLowerCase()}`} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as JLPTLevel })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input className="input" placeholder={labels.titleField + ' *'} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input" placeholder={labels.readingField} value={form.reading ?? ''} onChange={(e) => setForm({ ...form, reading: e.target.value })} />
            {(kind === 'ssw' || kind === 'kaigo') && (
              <input
                className="input"
                placeholder={kind === 'ssw' ? 'Industry (e.g. Kaigo (Nursing Care))' : 'Topic (e.g. Medical Terms)'}
                value={form.category ?? ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            )}
            <input className="input" placeholder="Meaning *" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
            <input className="input" placeholder="Example sentence" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
            <input className="input" placeholder="Example meaning" value={form.exampleMeaning} onChange={(e) => setForm({ ...form, exampleMeaning: e.target.value })} />
            <input className="input" type="number" placeholder="Display order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            <select className="input" value={form.accessType ?? 'public'} onChange={(e) => setForm({ ...form, accessType: e.target.value as AccessType })}>
              {ACCESS_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Save changes' : 'Add'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
