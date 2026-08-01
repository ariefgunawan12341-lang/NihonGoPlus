import { useEffect, useState } from 'react'
import { Trash2, Search, FileText, Music, Video, Image as ImageIcon, Copy } from 'lucide-react'
import { listMediaFiles, deleteMediaFile, type MediaFile } from '../../services/storage'
import { USE_SUPABASE } from '../../supabase/client'

function iconFor(contentType: string) {
  if (contentType.startsWith('image/')) return ImageIcon
  if (contentType.startsWith('audio/')) return Music
  if (contentType.startsWith('video/')) return Video
  return FileText
}

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[] | null>(null)
  const [search, setSearch] = useState('')

  function load() {
    listMediaFiles().then(setFiles)
  }

  useEffect(load, [])

  async function remove(bucket: string, path: string) {
    if (!confirm('Hapus file ini secara permanen?')) return
    await deleteMediaFile(bucket, path)
    load()
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
  }

  if (!USE_SUPABASE) {
    return (
      <div className="card p-8 text-center text-ink-soft text-sm">
        Media Library memerlukan Supabase Storage aktif (set <code>VITE_USE_SUPABASE=true</code>). Dalam mode lokal, file yang
        diunggah lewat editor artikel/form Admin akan gagal dengan pesan yang jelas, bukan diam-diam gagal.
      </div>
    )
  }

  const filtered = files?.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-9" placeholder="Cari file…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {!files ? (
        <p className="text-sm text-ink-soft">Memuat…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">
          Belum ada file. Upload lewat editor artikel, thumbnail modul, atau form Admin lainnya — semua tersimpan di sini.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((f) => {
            const Icon = iconFor(f.contentType)
            return (
              <div key={`${f.bucket}/${f.path}`} className="card p-3">
                {f.contentType.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-28 rounded-lg bg-paper flex items-center justify-center mb-2 text-ink-soft">
                    <Icon size={28} />
                  </div>
                )}
                <p className="text-xs font-medium truncate" title={f.name}>{f.name}</p>
                <p className="text-[11px] text-ink-soft">{f.bucket} · {(f.size / 1024).toFixed(0)} KB</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => copyUrl(f.url)} className="text-xs text-blue-600 inline-flex items-center gap-1"><Copy size={12} /> Salin URL</button>
                  <button onClick={() => remove(f.bucket, f.path)} className="text-xs text-hanko inline-flex items-center gap-1"><Trash2 size={12} /> Hapus</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
