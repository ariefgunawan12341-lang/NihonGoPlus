import { useEffect, useState } from 'react'
import { getSiteSettings, updateSiteSettings } from '../../services/db'
import { uploadMediaFile } from '../../services/storage'
import type { SiteSettings } from '../../types/content'
import { useToast } from '../../contexts/ToastContext'

export default function AdminSettings() {
  const { showToast } = useToast()
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | 'banner' | 'qris' | null>(null)

  useEffect(() => {
    getSiteSettings().then(setForm)
  }, [])

  async function handleUpload(field: 'logoUrl' | 'faviconUrl' | 'bannerUrl' | 'qrisImageUrl', kind: 'logo' | 'favicon' | 'banner' | 'qris', file: File) {
    setUploading(kind)
    try {
      const url = await uploadMediaFile(file, 'branding')
      setForm((f) => (f ? { ...f, [field]: url } : f))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal mengunggah.')
    } finally {
      setUploading(null)
    }
  }

  async function save() {
    if (!form) return
    await updateSiteSettings(form)
    setSaved(true)
    showToast('Pengaturan berhasil disimpan.', 'success')
    setTimeout(() => setSaved(false), 1500)
  }

  if (!form) return <p className="text-sm text-ink-soft">Memuat…</p>

  return (
    <div className="max-w-2xl space-y-5">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Identitas Situs</h3>
        <input className="input" placeholder="Nama Website" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        <div className="grid grid-cols-3 gap-3">
          {(['logoUrl', 'faviconUrl', 'bannerUrl'] as const).map((field) => {
            const kind = field === 'logoUrl' ? 'logo' : field === 'faviconUrl' ? 'favicon' : 'banner'
            return (
              <div key={field}>
                <p className="text-xs font-semibold text-ink-soft mb-1 capitalize">{kind}</p>
                {form[field] && <img src={form[field]} alt="" className="h-14 mb-1 rounded" />}
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(field, kind, f) }} />
                {uploading === kind && <p className="text-[11px] text-blue-600">Mengunggah…</p>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Kontak &amp; Media Sosial</h3>
        <input className="input" placeholder="Email kontak" value={form.contactEmail ?? ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Telegram" value={form.telegram ?? ''} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
          <input className="input" placeholder="Instagram" value={form.instagram ?? ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          <input className="input" placeholder="YouTube" value={form.youtube ?? ''} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
          <input className="input" placeholder="TikTok" value={form.tiktok ?? ''} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
          <input className="input" placeholder="Facebook" value={form.facebook ?? ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          <input className="input" placeholder="Google Analytics ID" value={form.googleAnalyticsId ?? ''} onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })} />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">SEO Default</h3>
        <input className="input" placeholder="SEO Title default" value={form.seoDefaultTitle ?? ''} onChange={(e) => setForm({ ...form, seoDefaultTitle: e.target.value })} />
        <textarea className="input" rows={2} placeholder="SEO Description default" value={form.seoDefaultDescription ?? ''} onChange={(e) => setForm({ ...form, seoDefaultDescription: e.target.value })} />
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">SMTP Email</h3>
        <p className="text-xs text-ink-soft">
          Field ini hanya menyimpan konfigurasi — pengiriman email sungguhan butuh Cloud Function terpisah yang membaca nilai
          ini secara server-side. Sengaja tidak ada field password di sini; simpan password SMTP sebagai secret di Cloud
          Functions, bukan di Firestore.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="SMTP Host" value={form.smtpHost ?? ''} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} />
          <input className="input" placeholder="SMTP Port" value={form.smtpPort ?? ''} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} />
          <input className="input" placeholder="SMTP Username" value={form.smtpUser ?? ''} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Pembayaran Premium (QRIS / DANA)</h3>
        <p className="text-xs text-ink-soft">
          Verifikasi pembayaran dilakukan manual oleh admin (tidak ada payment gateway terhubung) — user mengunggah bukti
          transfer, admin mengecek dan mengonfirmasi dari halaman <b>Konfirmasi Pembayaran</b>.
        </p>
        <div>
          <p className="text-xs font-semibold text-ink-soft mb-1">Gambar QRIS</p>
          {form.qrisImageUrl && <img src={form.qrisImageUrl} alt="QRIS" className="h-40 mb-2 rounded-lg border border-line" />}
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('qrisImageUrl', 'qris', f) }} />
          {uploading === 'qris' && <p className="text-[11px] text-blue-600">Mengunggah…</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Nomor DANA" value={form.danaNumber ?? ''} onChange={(e) => setForm({ ...form, danaNumber: e.target.value })} />
          <input className="input" placeholder="Nama penerima DANA" value={form.danaName ?? ''} onChange={(e) => setForm({ ...form, danaName: e.target.value })} />
        </div>
        <textarea className="input" rows={3} placeholder="Instruksi pembayaran (ditampilkan ke user)" value={form.paymentInstructions ?? ''} onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })} />
      </div>

      <button className="btn-primary w-full" onClick={save}>{saved ? 'Tersimpan!' : 'Simpan Pengaturan'}</button>
    </div>
  )
}
