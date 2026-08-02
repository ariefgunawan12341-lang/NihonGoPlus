import { useEffect, useState } from 'react'
import { Check, X, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { premiumOrderCollection, setUserAdminFlags } from '../../services/db'
import { logAdminActivity } from '../../services/adminActivityLog'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { PremiumOrder, PaymentOrderStatus } from '../../types/content'

const TABS: { key: PaymentOrderStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'confirmed', label: 'Dikonfirmasi' },
  { key: 'rejected', label: 'Ditolak' },
  { key: 'all', label: 'Semua' }
]

export default function AdminPremiumOrders() {
  const { user: admin } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<PremiumOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<PaymentOrderStatus | 'all'>('pending')

  function load() {
    setLoading(true)
    premiumOrderCollection.list().then((all) => {
      setOrders([...all].sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function confirmOrder(order: PremiumOrder) {
    if (!admin) return
    await setUserAdminFlags(order.userUid, { premium: true, premiumPlan: null })
    await premiumOrderCollection.update(order.id, {
      status: 'confirmed',
      reviewedAt: Date.now(),
      reviewedBy: admin.fullName
    })
    await logAdminActivity(admin, 'confirm_premium_order', 'premium_orders', order.id, { userEmail: order.userEmail, packageName: order.packageName })
    showToast(`Pembayaran ${order.userName} dikonfirmasi — akun sudah Premium.`, 'success')
    load()
  }

  async function rejectOrder(order: PremiumOrder) {
    if (!admin) return
    await premiumOrderCollection.update(order.id, {
      status: 'rejected',
      reviewedAt: Date.now(),
      reviewedBy: admin.fullName
    })
    await logAdminActivity(admin, 'reject_premium_order', 'premium_orders', order.id, { userEmail: order.userEmail })
    showToast(`Order ${order.userName} ditolak.`, 'info')
    load()
  }

  const filtered = orders.filter((o) => tab === 'all' || o.status === tab)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold transition',
              tab === t.key ? 'bg-blue-500 text-white' : 'bg-surface border border-line text-ink-soft'
            )}
          >
            {t.label} {t.key !== 'all' && `(${orders.filter((o) => o.status === t.key).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">Tidak ada order di kategori ini.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              {o.proofUrl && (
                <a href={o.proofUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={o.proofUrl} alt="Bukti" className="w-20 h-20 object-cover rounded-lg border border-line" />
                </a>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{o.userName} <span className="text-ink-soft font-normal">({o.userEmail})</span></p>
                <p className="text-sm">{o.packageName} — {o.currency} {o.price.toLocaleString('id-ID')} <span className="uppercase text-xs text-ink-soft">via {o.method}</span></p>
                <p className="text-xs text-ink-soft">{new Date(o.createdAt).toLocaleString('id-ID')}</p>
                {o.reviewedBy && <p className="text-xs text-ink-soft/70">Ditinjau oleh {o.reviewedBy}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={clsx(
                  'text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full',
                  o.status === 'confirmed' ? 'bg-mint-50 text-mint-600' : o.status === 'rejected' ? 'bg-hanko/10 text-hanko' : 'bg-gold-50 text-gold-600'
                )}>{o.status}</span>
                {o.status === 'pending' && (
                  <>
                    <button onClick={() => confirmOrder(o)} className="btn-primary text-xs px-3 py-1.5"><Check size={14} /> Konfirmasi</button>
                    <button onClick={() => rejectOrder(o)} className="btn-secondary text-xs px-3 py-1.5 text-hanko bg-hanko/10"><X size={14} /> Tolak</button>
                  </>
                )}
                {o.proofUrl && (
                  <a href={o.proofUrl} target="_blank" rel="noreferrer" className="text-ink-soft"><ExternalLink size={16} /></a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
