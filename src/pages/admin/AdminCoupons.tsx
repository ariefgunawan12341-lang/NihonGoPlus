import { useEffect, useState } from 'react'
import { Plus, Trash2, Tag, Check, X } from 'lucide-react'
import { couponCollection } from '../../services/db'
import type { Coupon } from '../../types/content'

export default function AdminCoupons() {
  const [list, setList] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    plan: 'monthly',
    maxUses: 1,
    active: true,
    durationDays: 30
  })

  function load() {
    setLoading(true)
    couponCollection.list().then((all) => {
      setList(all.sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function add() {
    if (!newCoupon.code) return
    const c: Coupon = {
      id: crypto.randomUUID(),
      code: newCoupon.code.toUpperCase(),
      plan: newCoupon.plan as any,
      durationDays: newCoupon.durationDays || null,
      maxUses: newCoupon.maxUses || 1,
      currentUses: 0,
      active: true,
      createdAt: Date.now(),
      ...newCoupon
    }
    await couponCollection.create(c)
    setShowAdd(false)
    load()
  }

  async function remove(id: string) {
    if (confirm('Hapus kupon ini?')) {
      await couponCollection.remove(id)
      load()
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await couponCollection.update(id, { active: !active })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-ink-soft uppercase tracking-widest">Daftar Kupon</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary py-1.5 text-xs gap-2">
          <Plus size={14} /> Tambah Kupon
        </button>
      </div>

      {showAdd && (
        <div className="card p-5 space-y-4 bg-blue-50/30 border-blue-200">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Kode Kupon</label>
              <input
                className="input"
                placeholder="PROMO2026"
                value={newCoupon.code || ''}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Plan</label>
              <select
                className="input"
                value={newCoupon.plan}
                onChange={e => setNewCoupon({...newCoupon, plan: e.target.value as any})}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Durasi (Hari)</label>
              <input
                type="number"
                className="input"
                value={newCoupon.durationDays || ''}
                onChange={e => setNewCoupon({...newCoupon, durationDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Maksimal Pakai</label>
              <input
                type="number"
                className="input"
                value={newCoupon.maxUses || ''}
                onChange={e => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary py-1.5 px-4 text-xs">Batal</button>
            <button onClick={add} className="btn-primary py-1.5 px-6 text-xs">Simpan Kupon</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-ink-soft">Loading…</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper-light border-b border-line text-ink-soft font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-center">Terpakai</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map(c => (
                <tr key={c.id} className="hover:bg-paper-light transition">
                  <td className="px-4 py-3 font-bold text-blue-600 flex items-center gap-2">
                    <Tag size={12} /> {c.code}
                  </td>
                  <td className="px-4 py-3 capitalize">{c.plan} ({c.durationDays || '∞'} hari)</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span className={c.currentUses >= c.maxUses ? 'text-hanko' : 'text-mint-600'}>
                      {c.currentUses} / {c.maxUses}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.active)} className={c.active ? 'text-mint-600' : 'text-hanko'}>
                      {c.active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c.id)} className="text-hanko p-1.5 hover:bg-hanko/10 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-soft italic">Belum ada kupon.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
