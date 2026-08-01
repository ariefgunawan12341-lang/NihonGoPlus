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

  async function handleUpload(field: 'logoUrl' | 'faviconUrl' | 'bannerUrl' | 'qrisImageUrl' | 'heroImageUrl', kind: 'logo' | 'favicon' | 'banner' | 'qris' | 'hero', file: File) {
    setUploading(kind as any)
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
    <div className="max-w-2xl space-y-5 pb-10">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Identitas Situs</h3>
        <input className="input" placeholder="Nama Website" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        <div className="grid grid-cols-3 gap-3">
          {(['logoUrl', 'faviconUrl', 'bannerUrl'] as const).map((field) => {
            const kind = field === 'logoUrl' ? 'logo' : field === 'faviconUrl' ? 'favicon' : 'banner'
            return (
              <div key={field}>
                <p className="text-xs font-semibold text-ink-soft mb-1 capitalize">{kind}</p>
                {form[field] && <img src={form[field]} alt="" className="h-14 mb-1 rounded border border-line" />}
                <input type="file" accept="image/*" className="text-[10px]" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(field, kind, f) }} />
                {uploading === kind && <p className="text-[11px] text-blue-600">Mengunggah…</p>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-sm border-b border-line pb-2">Hero Section (Beranda)</h3>
        <div className="space-y-3">
          <input className="input" placeholder="Hero Heading" value={form.heroHeading ?? ''} onChange={(e) => setForm({ ...form, heroHeading: e.target.value })} />
          <textarea className="input" rows={2} placeholder="Hero Subheading" value={form.heroSubheading ?? ''} onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })} />
          <input className="input" placeholder="CTA Label (e.g. Mulai Belajar)" value={form.heroCtaLabel ?? ''} onChange={(e) => setForm({ ...form, heroCtaLabel: e.target.value })} />
          <div>
            <p className="text-xs font-semibold text-ink-soft mb-1">Hero Image</p>
            {form.heroImageUrl && <img src={form.heroImageUrl} alt="" className="h-24 mb-2 rounded border border-line" />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload('heroImageUrl', 'hero', f) }} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" checked={form.showHeroSection ?? true} onChange={e => setForm({...form, showHeroSection: e.target.checked})} /> Tampilkan Hero
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" checked={form.showQuickAccessSection ?? true} onChange={e => setForm({...form, showQuickAccessSection: e.target.checked})} /> Tampilkan Akses Cepat
            </label>
          </div>
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

      <div className="card p-5 space-y-3 text-ink-soft">
        <h3 className="font-semibold text-sm text-ink">Tema & Gaya</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase">Warna Utama (Hex)</label>
            <input className="input h-10 px-1" type="color" value={form.themePrimaryColor ?? '#5B8DEF'} onChange={e => setForm({...form, themePrimaryColor: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase">Border Radius (px)</label>
            <input className="input" type="number" value={form.themeBorderRadius ?? '12'} onChange={e => setForm({...form, themeBorderRadius: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">SEO Default</h3>
        <input className="input" placeholder="SEO Title default" value={form.seoDefaultTitle ?? ''} onChange={(e) => setForm({ ...form, seoDefaultTitle: e.target.value })} />
        <textarea className="input" rows={2} placeholder="SEO Description default" value={form.seoDefaultDescription ?? ''} onChange={(e) => setForm({ ...form, seoDefaultDescription: e.target.value })} />
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Pembayaran Premium (QRIS / DANA)</h3>
        <p className="text-xs text-ink-soft">
          Verifikasi pembayaran dilakukan manual oleh admin.
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
        <textarea className="input" rows={3} placeholder="Instruksi pembayaran" value={form.paymentInstructions ?? ''} onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })} />
      </div>

      <button className="btn-primary w-full shadow-lg py-4" onClick={save}>{saved ? 'Tersimpan!' : 'Simpan Semua Pengaturan'}</button>
    </div>
  )
}
