import { useState } from 'react'
import { Copy, Upload } from 'lucide-react'
import clsx from 'clsx'
import { Modal } from '../admin/Modal'
import { premiumOrderCollection } from '../../services/db'
import { uploadMediaFile } from '../../services/storage'
import { useAuth } from '../../contexts/AuthContext'
import type { PremiumPackage, SiteSettings, PaymentMethod } from '../../types/content'

export function PaymentModal({
  pkg,
  settings,
  onClose,
  onSubmitted
}: {
  pkg: PremiumPackage
  settings: SiteSettings
  onClose: () => void
  onSubmitted: () => void
}) {
  const { user } = useAuth()
  const [method, setMethod] = useState<PaymentMethod>('qris')
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleProofUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const url = await uploadMediaFile(file, 'payment-proofs')
      setProofUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah bukti pembayaran.')
    } finally {
      setUploading(false)
    }
  }

  async function submit() {
    if (!user) return
    if (!proofUrl) {
      setError('Unggah bukti pembayaran terlebih dahulu.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await premiumOrderCollection.create({
        id: `order-${crypto.randomUUID()}`,
        userUid: user.id,
        userEmail: user.email,
        userName: user.fullName,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        currency: pkg.currency,
        method,
        proofUrl,
        status: 'pending',
        createdAt: Date.now()
      })
      setDone(true)
      onSubmitted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim konfirmasi pembayaran.')
    } finally {
      setSubmitting(false)
    }
  }

  function copyDana() {
    if (settings.danaNumber) navigator.clipboard.writeText(settings.danaNumber)
  }

  if (done) {
    return (
      <Modal title="Konfirmasi terkirim" onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-sm text-mint-600 font-semibold mb-2">Bukti pembayaran berhasil dikirim!</p>
          <p className="text-sm text-ink-soft">
            Admin akan memverifikasi pembayaranmu secara manual. Status Premium akan aktif setelah dikonfirmasi — biasanya
            tidak lama, tapi ini bukan proses otomatis.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`Bayar ${pkg.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="card p-3 bg-paper border-none">
          <p className="text-sm font-semibold">{pkg.name}</p>
          <p className="text-lg font-bold text-blue-600">{pkg.currency} {pkg.price.toLocaleString('id-ID')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMethod('qris')}
            className={clsx('flex-1 py-2 rounded-xl2 text-sm font-semibold border', method === 'qris' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-line text-ink-soft')}
          >
            QRIS
          </button>
          <button
            onClick={() => setMethod('dana')}
            className={clsx('flex-1 py-2 rounded-xl2 text-sm font-semibold border', method === 'dana' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-line text-ink-soft')}
          >
            DANA
          </button>
        </div>

        {method === 'qris' ? (
          settings.qrisImageUrl ? (
            <img src={settings.qrisImageUrl} alt="QRIS" className="w-full rounded-xl2 border border-line" />
          ) : (
            <p className="text-sm text-hanko">Admin belum mengunggah gambar QRIS. Hubungi admin atau pilih metode DANA.</p>
          )
        ) : (
          <div className="card p-4 bg-paper border-none space-y-1">
            <p className="text-xs text-ink-soft">Transfer ke nomor DANA:</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{settings.danaNumber || '—'}</p>
              {settings.danaNumber && (
                <button onClick={copyDana} className="text-blue-600"><Copy size={16} /></button>
              )}
            </div>
            <p className="text-sm text-ink-soft">a.n. {settings.danaName || '—'}</p>
          </div>
        )}

        {settings.paymentInstructions && <p className="text-xs text-ink-soft whitespace-pre-line">{settings.paymentInstructions}</p>}

        <div>
          <p className="text-xs font-semibold text-ink-soft mb-1">Unggah bukti pembayaran *</p>
          {proofUrl && <img src={proofUrl} alt="Bukti" className="h-32 rounded-lg mb-2 object-cover" />}
          <label className="btn-secondary w-full justify-center cursor-pointer">
            <Upload size={16} /> {uploading ? 'Mengunggah…' : proofUrl ? 'Ganti bukti' : 'Pilih file bukti transfer'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProofUpload(f) }} />
          </label>
        </div>

        {error && <p className="text-sm text-hanko">{error}</p>}
        <button className="btn-primary w-full" onClick={submit} disabled={submitting || uploading || !proofUrl}>
          {submitting ? 'Mengirim…' : 'Kirim konfirmasi pembayaran'}
        </button>
      </div>
    </Modal>
  )
}
