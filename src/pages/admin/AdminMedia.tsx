import { useEffect, useState } from 'react'
import { Upload, Trash2, Link, FileText, Image as ImageIcon, Volume2, Film, Search } from 'lucide-react'
import { uploadMediaFile, listMediaFiles, deleteMediaFile, STORAGE_BUCKETS } from '../../services/storage'

type BucketName = keyof typeof STORAGE_BUCKETS

export default function AdminMedia() {
  const [bucket, setBucket] = useState<BucketName>('images')
  const [files, setFiles] = useState<{ name: string, url: string, path: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    listMediaFiles(STORAGE_BUCKETS[bucket]).then((list) => {
      setFiles(list)
      setLoading(false)
    })
  }

  useEffect(load, [bucket])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadMediaFile(file, STORAGE_BUCKETS[bucket])
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah file.')
    } finally {
      setUploading(false)
    }
  }

  async function remove(path: string) {
    if (!confirm('Hapus file ini permanen?')) return
    try {
      await deleteMediaFile(path)
      load()
    } catch (err) {
      alert('Gagal menghapus file.')
    }
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {(Object.keys(STORAGE_BUCKETS) as BucketName[]).map(b => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${bucket === b ? 'bg-blue-500 text-white shadow-lg' : 'bg-paper text-ink-soft hover:bg-line'}`}
            >
              {b}
            </button>
          ))}
        </div>

        <label className="btn-primary cursor-pointer">
          <Upload size={18} /> {uploading ? 'Mengunggah…' : 'Unggah File'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
        <input
          className="input pl-10"
          placeholder="Cari file…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <p className="text-sm text-ink-soft">Memuat file…</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(f => (
            <div key={f.path} className="card group relative flex flex-col overflow-hidden">
              <div className="aspect-square bg-paper-light flex items-center justify-center overflow-hidden">
                {bucket === 'images' ? (
                  <img src={f.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : bucket === 'audio' ? <Volume2 size={32} className="text-blue-400" />
                  : bucket === 'video' ? <Film size={32} className="text-purple-400" />
                  : <FileText size={32} className="text-ink-soft" />
                }
              </div>
              <div className="p-3 border-t border-line">
                <p className="text-[10px] font-bold text-ink truncate mb-2">{f.name}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => { navigator.clipboard.writeText(f.url); alert('URL disalin!') }}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg flex-1 flex justify-center"
                    title="Salin URL"
                  >
                    <Link size={14} />
                  </button>
                  <button
                    onClick={() => remove(f.path)}
                    className="p-1.5 hover:bg-hanko/10 text-hanko rounded-lg flex-1 flex justify-center"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-ink-soft italic">Tidak ada file ditemukan.</div>
          )}
        </div>
      )}
    </div>
  )
}
