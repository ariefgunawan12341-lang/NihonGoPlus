import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { vocabCollection } from '../../services/db'
import type { AccessType, JLPTLevel, VocabWord } from '../../types'
import { Modal } from '../../components/admin/Modal'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const ACCESS_TYPES: AccessType[] = ['public', 'free', 'premium']
const EMPTY: Omit<VocabWord, 'id'> = {
  level: 'N5', kanji: '', kana: '', romaji: '', meaning: '', example: '', exampleMeaning: '', tags: [], accessType: 'public'
}

export default function AdminVocabulary() {
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<VocabWord | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    vocabCollection.list().then((w) => {
      setWords(w)
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

  function openEdit(w: VocabWord) {
    setEditing(w)
    setForm({ ...w, tags: w.tags ?? [] })
    setError(null)
    setShowModal(true)
  }

  async function save() {
    if (!form.kana || !form.meaning) {
      setError('Kana and meaning are required.')
      return
    }
    try {
      if (editing) {
        await vocabCollection.update(editing.id, form)
      } else {
        await vocabCollection.create({ id: `vocab-${crypto.randomUUID()}`, ...form })
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save word.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this word? This cannot be undone.')) return
    await vocabCollection.remove(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">{words.length} words total</p>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add word
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
                <th className="px-4 py-3 font-medium">Word</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((w) => (
                <tr key={w.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{w.level}</td>
                  <td className="px-4 py-3 font-jp">{w.kanji || w.kana} <span className="text-ink-soft text-xs">{w.kanji && w.kana}</span></td>
                  <td className="px-4 py-3">{w.meaning}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(w)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => remove(w.id)} className="text-hanko hover:underline inline-flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {words.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">No vocabulary yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit word' : 'Add word'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as JLPTLevel })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <input className="input" placeholder="Kanji (optional)" value={form.kanji} onChange={(e) => setForm({ ...form, kanji: e.target.value })} />
            <input className="input" placeholder="Kana *" value={form.kana} onChange={(e) => setForm({ ...form, kana: e.target.value })} />
            <input className="input" placeholder="Romaji" value={form.romaji} onChange={(e) => setForm({ ...form, romaji: e.target.value })} />
            <input className="input" placeholder="Meaning *" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
            <input className="input" placeholder="Example sentence (Japanese)" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
            <input className="input" placeholder="Example meaning (English)" value={form.exampleMeaning} onChange={(e) => setForm({ ...form, exampleMeaning: e.target.value })} />
            <select className="input" value={form.accessType ?? 'public'} onChange={(e) => setForm({ ...form, accessType: e.target.value as AccessType })}>
              {ACCESS_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Save changes' : 'Add word'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
