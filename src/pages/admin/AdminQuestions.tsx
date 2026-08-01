import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { questionCollection } from '../../services/db'
import type { ExamQuestion, JLPTLevel, QuestionCategory } from '../../types'
import { Modal } from '../../components/admin/Modal'

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const CATEGORIES: QuestionCategory[] = ['moji', 'goi', 'bunpou', 'dokkai', 'choukai']
const EMPTY: Omit<ExamQuestion, 'id'> = {
  level: 'N5', category: 'goi', difficulty: 1, prompt: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '', tags: []
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ExamQuestion | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    questionCollection.list().then((q) => {
      setQuestions(q)
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

  function openEdit(q: ExamQuestion) {
    setEditing(q)
    setForm({ ...q })
    setError(null)
    setShowModal(true)
  }

  function updateChoice(i: number, value: string) {
    const choices = [...form.choices]
    choices[i] = value
    setForm({ ...form, choices })
  }

  async function save() {
    if (!form.prompt || form.choices.some((c) => !c.trim())) {
      setError('Prompt and all four choices are required.')
      return
    }
    try {
      if (editing) {
        await questionCollection.update(editing.id, form)
      } else {
        await questionCollection.create({ id: `q-${crypto.randomUUID()}`, ...form })
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save question.')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return
    await questionCollection.remove(id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">{questions.length} questions total</p>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add question
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
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Prompt</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{q.level}</td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold text-blue-600">{q.category}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{q.prompt}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(q)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => remove(q.id)} className="text-hanko hover:underline inline-flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">No questions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit question' : 'Add question'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as JLPTLevel })}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as QuestionCategory })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <textarea className="input" rows={2} placeholder="Prompt *" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Passage (optional, for reading questions)" value={form.passage ?? ''} onChange={(e) => setForm({ ...form, passage: e.target.value })} />
            <p className="text-xs font-semibold text-ink-soft">Choices — select the correct one</p>
            {form.choices.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.correctIndex === i}
                  onChange={() => setForm({ ...form, correctIndex: i })}
                />
                <input className="input" placeholder={`Choice ${i + 1}`} value={c} onChange={(e) => updateChoice(i, e.target.value)} />
              </div>
            ))}
            <textarea className="input" rows={2} placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Save changes' : 'Add question'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
