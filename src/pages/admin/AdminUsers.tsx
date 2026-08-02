import { useEffect, useState } from 'react'
import { Crown, ShieldCheck, Search, Ban, Pencil, Trash2, Key, User as UserIcon, ArrowUpDown } from 'lucide-react'
import { listAllUsersAdmin, setUserAdminFlags, adminResetUserPassword, adminDeleteUser } from '../../services/adminUsers'
import { logAdminActivity } from '../../services/adminActivityLog'
import { useAuth } from '../../contexts/AuthContext'
import type { UserProfile, UserRole } from '../../types'
import { Modal } from '../../components/admin/Modal'

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [showEditModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Partial<UserProfile>>({})

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<keyof UserProfile>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  function load() {
    setLoading(true)
    listAllUsersAdmin().then((u) => {
      setUsers(u)
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function update(uid: string, patch: Partial<UserProfile>) {
    await setUserAdminFlags(uid, patch)
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...patch } : u))
    if (currentAdmin) {
      await logAdminActivity(currentAdmin, 'update_user_profile', 'profiles', uid, patch)
    }
  }

  async function toggleStatus(u: UserProfile) {
    const newStatus = u.status === 'active' ? 'disabled' : 'active'
    await update(u.uid, { status: newStatus })
  }

  async function handleResetPassword(email: string) {
    if (confirm(`Send password reset email to ${email}?`)) {
      try {
        await adminResetUserPassword(email)
        alert('Password reset email sent.')
      } catch (err) {
        alert('Failed to send reset email.')
      }
    }
  }

  async function remove(uid: string) {
    if (confirm('Permanently delete this user from database? Auth record must be deleted in Supabase Dashboard.')) {
      try {
        await adminDeleteUser(uid)
        setUsers(prev => prev.filter(u => u.uid !== uid))
        if (currentAdmin) {
          await logAdminActivity(currentAdmin, 'delete_user', 'profiles', uid)
        }
      } catch (err) {
        alert('Failed to delete profile.')
      }
    }
  }

  async function openEdit(u: UserProfile) {
    setEditing(u)
    setForm({ ...u })
    setShowModal(true)
  }

  async function saveEdit() {
    if (!editing) return
    await update(editing.uid, form)
    setShowModal(false)
  }

  function handleSort(field: keyof UserProfile) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sorted = [...users].sort((a, b) => {
    const valA = a[sortField] ?? ''
    const valB = b[sortField] ?? ''
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const filtered = sorted.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-sm shrink-0">
          {users.length} Total Users
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            className="input pl-10 py-2 text-sm shadow-sm"
            placeholder="Search name, email, or username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 w-full bg-paper animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card overflow-x-auto border-none shadow-sm">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-soft bg-paper-light border-b border-line uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-4 cursor-pointer hover:text-blue-600 transition group" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1">User <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                  </th>
                  <th className="px-5 py-4 cursor-pointer hover:text-blue-600 transition group" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1">Role <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                  </th>
                  <th className="px-5 py-4 text-center cursor-pointer hover:text-blue-600 transition group" onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center gap-1">Status <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                  </th>
                  <th className="px-5 py-4 text-center cursor-pointer hover:text-blue-600 transition group" onClick={() => handleSort('premium')}>
                    <div className="flex items-center justify-center gap-1">Premium <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                  </th>
                  <th className="px-5 py-4 text-center cursor-pointer hover:text-blue-600 transition group" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center justify-center gap-1">Joined <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                  </th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginated.map((u) => (
                  <tr key={u.uid} className={`hover:bg-paper-light transition-colors ${u.status === 'disabled' ? 'bg-paper-light/50 grayscale' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shrink-0 overflow-hidden">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-ink leading-tight truncate">{u.fullName}</p>
                          <p className="text-[10px] text-ink-soft font-mono truncate">{u.email}</p>
                          <p className="text-[10px] font-bold text-blue-500 lowercase mt-0.5 italic">@{u.username || 'n/a'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-hanko/10 text-hanko' : 'bg-blue-50 text-blue-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === 'active' ? 'text-mint-600' : 'text-hanko'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        {u.premium ? (
                          <div className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center shadow-sm">
                            <Crown size={12} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-line/30 text-ink-soft/30 flex items-center justify-center italic text-[10px]">-</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center text-[10px] text-ink-soft font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      <button onClick={() => openEdit(u)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="Edit Profile">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => toggleStatus(u)} className={`p-2 rounded-lg transition ${u.status === 'active' ? 'hover:bg-hanko/10 text-hanko' : 'hover:bg-mint-50 text-mint-600'}`} title={u.status === 'active' ? 'Disable Account' : 'Activate Account'}>
                        <Ban size={14} />
                      </button>
                      <button onClick={() => handleResetPassword(u.email)} className="p-2 hover:bg-gold-50 text-gold-600 rounded-lg transition" title="Reset Password">
                        <Key size={14} />
                      </button>
                      <button onClick={() => remove(u.uid)} className="p-2 hover:bg-hanko text-hanko hover:text-white rounded-lg transition" title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-30"
              >
                Prev
              </button>
              <div className="flex items-center gap-2 px-3 text-xs font-bold text-ink-soft">
                Page {currentPage} of {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card p-20 text-center text-ink-soft italic">No users found.</div>
          )}
        </div>
      )}

      {showEditModal && editing && (
        <Modal title="Edit User Profile" onClose={() => setShowModal(false)}>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 p-3 bg-paper-light rounded-xl mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {editing.avatarUrl ? <img src={editing.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : editing.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-sm">{editing.fullName}</p>
                <p className="text-[10px] text-ink-soft font-mono italic">{editing.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Full Name</label>
              <input className="input" value={form.fullName || ''} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-ink-soft">Username</label>
              <input className="input font-mono text-xs" value={form.username || ''} onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-ink-soft">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})}>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-ink-soft">Membership</label>
                <select className="input font-bold" value={form.premium ? 'true' : 'false'} onChange={e => setForm({...form, premium: e.target.value === 'true'})}>
                  <option value="false">Free Account</option>
                  <option value="true" className="text-gold-600 font-bold">⭐ Premium</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button className="btn-secondary flex-1 py-2.5 text-xs" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary flex-1 py-2.5 text-xs shadow-lg" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
