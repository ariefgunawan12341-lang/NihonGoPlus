import { useEffect, useState } from 'react'
import { Send, Trash2, Bell, Users, User } from 'lucide-react'
import { listAllUsersAdmin, userNotificationCollection } from '../../services/db'
import type { UserProfile, UserNotification } from '../../types'
import { Modal } from '../../components/admin/Modal'

export default function AdminNotifications() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [targetType, setTargetType] = useState<'all' | 'single'>('all')
  const [selectedUser, setSelectedUser] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<UserNotification['type']>('system')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ text: string; success: boolean } | null>(null)

  useEffect(() => {
    listAllUsersAdmin().then(setUsers)
  }, [])

  async function send() {
    if (!title || !body) return
    if (targetType === 'single' && !selectedUser) return

    setSending(true)
    setMsg(null)
    try {
      const targets = targetType === 'all' ? users : users.filter(u => u.id === selectedUser)

      const promises = targets.map(u => {
        const col = userNotificationCollection(u.id)
        return col.create({
          id: crypto.randomUUID(),
          title,
          body,
          read: false,
          type,
          createdAt: Date.now()
        })
      })

      await Promise.all(promises)
      setMsg({ text: `Berhasil mengirim ${promises.length} notifikasi.`, success: true })
      setTitle('')
      setBody('')
    } catch (e) {
      setMsg({ text: 'Gagal mengirim notifikasi.', success: false })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-bold text-ink-soft uppercase tracking-widest flex items-center gap-2">
          <Bell size={16} /> Kirim Notifikasi Baru
        </h2>

        <div className="flex gap-4">
          <button
            onClick={() => setTargetType('all')}
            className={`flex-1 p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${targetType === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-line text-ink-soft'}`}
          >
            <Users size={20} />
            <span className="text-xs font-bold">Semua User ({users.length})</span>
          </button>
          <button
            onClick={() => setTargetType('single')}
            className={`flex-1 p-3 rounded-xl border-2 transition flex flex-col items-center gap-1 ${targetType === 'single' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-line text-ink-soft'}`}
          >
            <User size={20} />
            <span className="text-xs font-bold">User Spesifik</span>
          </button>
        </div>

        {targetType === 'single' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft">Pilih User</label>
            <select
              className="input"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="">-- Pilih User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-soft">Kategori</label>
          <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="system">Sistem / Pengumuman</option>
            <option value="achievement">Achievement</option>
            <option value="promotion">Promosi / Premium</option>
            <option value="reminder">Pengingat</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-soft">Judul</label>
          <input className="input" placeholder="Judul notifikasi..." value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-ink-soft">Pesan</label>
          <textarea className="input" rows={3} placeholder="Isi pesan notifikasi..." value={body} onChange={e => setBody(e.target.value)} />
        </div>

        {msg && (
          <p className={`text-xs font-bold ${msg.success ? 'text-mint-600' : 'text-hanko'}`}>{msg.text}</p>
        )}

        <button
          className="btn-primary w-full gap-2 py-3 shadow-lg"
          onClick={send}
          disabled={sending || !title || !body}
        >
          <Send size={16} /> {sending ? 'Mengirim...' : 'Kirim Notifikasi'}
        </button>
      </div>

      <div className="card p-6 bg-paper-light border-line italic text-xs text-ink-soft">
        Notifikasi akan tampil di halaman Dashboard atau lonceng notifikasi user secara realtime.
      </div>
    </div>
  )
}
