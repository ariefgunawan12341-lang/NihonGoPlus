import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Check, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { premiumPackageCollection, premiumOrderCollection, getSiteSettings } from '../services/db'
import type { PremiumPackage, SiteSettings, PremiumOrder } from '../types/content'
import { PaymentModal } from '../components/content/PaymentModal'

const FALLBACK_PERKS = [
  'Semua modul JLPT N5–N1',
  'Download materi PDF/ZIP',
  'Audio & video premium',
  'Kaiwa AI tanpa batas',
  'Semua modul SSW & Kaigo Fukushishi'
]

export default function Premium() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<PremiumPackage[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [payingPackage, setPayingPackage] = useState<PremiumPackage | null>(null)
  const [pendingOrder, setPendingOrder] = useState<PremiumOrder | null>(null)

  function loadOrders() {
    if (!user) return
    premiumOrderCollection.listFiltered({ userUid: user.uid }).then((orders) => {
      setPendingOrder(orders.find((o) => o.status === 'pending') ?? null)
    })
  }

  useEffect(() => {
    premiumPackageCollection.list().then((all) => setPackages(all.filter((p) => p.active).sort((a, b) => a.order - b.order)))
    getSiteSettings().then(setSettings)
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="card p-8 text-center bg-gradient-to-br from-hanko to-hanko-dark text-white border-none">
        <Crown className="mx-auto mb-2" size={32} />
        <h1 className="text-xl font-bold">NihonGoPlus Premium</h1>
        <p className="text-sm text-white/85 mt-1">Semua yang kamu butuhkan untuk mencapai kefasihan, lebih cepat.</p>
      </div>

      {packages.length > 0 ? (
        <div className="grid sm:grid-cols-3 gap-3">
          {packages.map((p) => (
            <div key={p.id} className="card p-5 flex flex-col">
              <p className="font-bold">{p.name}</p>
              <p className="text-xl font-bold text-blue-600 my-1">{p.currency} {p.price.toLocaleString('id-ID')}</p>
              <p className="text-xs text-ink-soft mb-3 capitalize">{p.plan} · {p.durationDays ? `${p.durationDays} hari` : 'Lifetime'}</p>
              <ul className="space-y-1.5 mb-4 flex-1">
                {p.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check size={14} className="text-mint-500 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              {user && !user.isPremium && (
                <button className="btn-primary w-full text-sm" onClick={() => setPayingPackage(p)} disabled={!!pendingOrder}>
                  Pilih Paket
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 space-y-3">
          {FALLBACK_PERKS.map((p) => (
            <div key={p} className="flex items-start gap-3">
              <Check size={18} className="text-mint-500 shrink-0 mt-0.5" />
              <p className="text-sm">{p}</p>
            </div>
          ))}
          <p className="text-xs text-ink-soft">Belum ada paket premium — admin bisa menambahkannya di Admin Panel → Premium.</p>
        </div>
      )}

      {!user ? (
        <div className="card p-5 text-center">
          <p className="text-sm text-ink-soft mb-3">Masuk atau daftar dulu untuk upgrade ke Premium.</p>
          <div className="flex justify-center gap-2">
            <Link to="/login" className="btn-secondary">Masuk</Link>
            <Link to="/signup" className="btn-primary">Daftar</Link>
          </div>
        </div>
      ) : user.isPremium ? (
        <div className="card p-5 text-center text-mint-600 font-semibold text-sm">
          Kamu sudah Premium. ありがとう！
        </div>
      ) : pendingOrder ? (
        <div className="card p-5 text-center flex flex-col items-center gap-2">
          <Clock size={24} className="text-gold-500" />
          <p className="text-sm font-semibold">Pembayaran sedang diverifikasi</p>
          <p className="text-xs text-ink-soft">
            Kamu mengirim konfirmasi pembayaran untuk {pendingOrder.packageName} pada {new Date(pendingOrder.createdAt).toLocaleString('id-ID')}.
            Admin akan meninjau secara manual.
          </p>
        </div>
      ) : (
        <p className="text-xs text-ink-soft text-center">
          Pilih paket di atas untuk membayar via QRIS atau DANA. Setelah mengunggah bukti transfer, admin akan memverifikasi
          secara manual — ini bukan proses otomatis karena belum ada payment gateway terhubung.
        </p>
      )}

      {payingPackage && settings && (
        <PaymentModal
          pkg={payingPackage}
          settings={settings}
          onClose={() => setPayingPackage(null)}
          onSubmitted={() => {
            setPayingPackage(null)
            loadOrders()
          }}
        />
      )}
    </div>
  )
}
