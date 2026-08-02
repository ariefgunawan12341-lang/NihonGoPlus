import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Crown } from 'lucide-react'
import { listAllUsersAdmin, premiumPackageCollection } from '../../services/db'
import type { UserProfile } from '../../types'
import type { PremiumPackage } from '../../types/content'
import { Modal } from '../../components/admin/Modal'

const EMPTY: Omit<PremiumPackage, 'id'> = { name: '', plan: 'monthly', price: 0, currency: 'IDR', durationDays: 30, benefits: [], active: true, order: 0 }

export default function AdminPremium() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [packages, setPackages] = useState<PremiumPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PremiumPackage | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showModal, setShowModal] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([listAllUsersAdmin(), premiumPackageCollection.list()]).then(([u, p]) => {
      setUsers(u)
      setPackages([...p].sort((a, b) => a.order - b.order))
      setLoading(false)
    })
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setShowModal(true)
  }

  function openEdit(pkg: PremiumPackage) {
    setEditing(pkg)
    setForm({ ...pkg })
    setShowModal(true)
  }

  async function save() {
    if (editing) {
      await premiumPackageCollection.update(editing.id, form)
    } else {
      await premiumPackageCollection.create({ id: `pkg-${crypto.randomUUID()}`, ...form })
    }
    setShowModal(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Hapus paket ini?')) return
    await premiumPackageCollection.remove(id)
    load()
  }

  const premiumUsers = users.filter((u) => u.premium)

  return (
    <div className="space-y-6">
      <div className="card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center">
          <Crown size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold font-display">{loading ? '—' : premiumUsers.length}</p>
          <p className="text-xs text-ink-soft">Pengguna Premium</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Paket Premium</h3>
          <button className="btn-primary text-sm" onClick={openCreate}><Plus size={14} /> Tambah Paket</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {packages.map((p) => (
            <div key={p.id} className="card p-4">
              <p className="font-bold">{p.name}</p>
              <p className="text-lg font-bold text-blue-600">{p.currency} {p.price.toLocaleString('id-ID')}</p>
              <p className="text-xs text-ink-soft mb-2 capitalize">{p.plan} · {p.durationDays ? `${p.durationDays} hari` : 'Lifetime'}</p>
              <ul className="text-xs text-ink-soft space-y-0.5 mb-3">
                {p.benefits.map((b, i) => <li key={i}>• {b}</li>)}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-blue-600 text-xs inline-flex items-center gap-1"><Pencil size={12} /> Edit</button>
                <button onClick={() => remove(p.id)} className="text-hanko text-xs inline-flex items-center gap-1"><Trash2 size={12} /> Hapus</button>
              </div>
            </div>
          ))}
          {packages.length === 0 && <p className="text-sm text-ink-soft col-span-3">Belum ada paket. Tambahkan agar tampil di halaman /premium.</p>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-soft border-b border-line">
            <tr><th className="px-4 py-3 font-medium">Nama</th><th className="px-4 py-3 font-medium">Email</th></tr>
          </thead>
          <tbody>
            {premiumUsers.map((u) => (
              <tr key={u.uid} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{u.fullName}</td>
                <td className="px-4 py-3 text-ink-soft">{u.email}</td>
              </tr>
            ))}
            {premiumUsers.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-ink-soft">Belum ada pengguna premium.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Paket' : 'Tambah Paket'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <input className="input" placeholder="Nama paket" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as PremiumPackage['plan'] })}>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
              <option value="lifetime">Lifetime</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" type="number" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <input className="input" placeholder="Mata uang" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <input className="input" type="number" placeholder="Durasi (hari, kosongkan/0 untuk lifetime)" value={form.durationDays ?? ''} onChange={(e) => setForm({ ...form, durationDays: e.target.value ? Number(e.target.value) : null })} />
            <textarea className="input" rows={3} placeholder="Benefit (satu per baris)" value={form.benefits.join('\n')} onChange={(e) => setForm({ ...form, benefits: e.target.value.split('\n').filter(Boolean) })} />
            <button className="btn-primary w-full" onClick={save}>{editing ? 'Simpan' : 'Tambah'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
