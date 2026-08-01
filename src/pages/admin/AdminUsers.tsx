import { useEffect, useState } from 'react'
import { Crown, ShieldCheck, Search, Ban } from 'lucide-react'
import { listAllUsersAdmin, setUserAdminFlags } from '../../services/db'
import { logAdminActivity } from '../../services/adminActivityLog'
import { useAuth } from '../../contexts/AuthContext'
import type { UserProfile } from '../../types'

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    listAllUsersAdmin().then((u) => {
      setUsers(u)
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function toggle(target: UserProfile, field: 'isAdmin' | 'isPremium' | 'isSuspended', value: boolean) {
    setUsers((us) => us.map((u) => (u.uid === target.uid ? { ...u, [field]: value } : u)))
    await setUserAdminFlags(target.uid, { [field]: value })
    if (currentAdmin) {
      let action = ''
      if (field === 'isAdmin') action = value ? 'grant_admin' : 'revoke_admin'
      else if (field === 'isPremium') action = value ? 'upgrade_premium' : 'downgrade_premium'
      else if (field === 'isSuspended') action = value ? 'suspend_user' : 'unsuspend_user'

      await logAdminActivity(
        currentAdmin,
        action,
        'users',
        target.uid,
        { targetEmail: target.email }
      )
    }
  }

  const filtered = users.filter(
    (u) => u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-ink-soft whitespace-nowrap">{users.length} registered users</p>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input className="input pl-8 py-1.5 text-sm" placeholder="Cari nama atau email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-soft border-b border-line">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-center">Admin</th>
                <th className="px-4 py-3 font-medium text-center">Premium</th>
                <th className="px-4 py-3 font-medium text-center">Suspend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className={`border-b border-line last:border-0 ${u.isSuspended ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-4 py-3 font-medium">{u.displayName}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3">Lv. {u.level}</td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{u.role ?? 'user'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(u, 'isAdmin', !u.isAdmin)}
                      className={u.isAdmin ? 'text-hanko' : 'text-ink-soft/40 hover:text-hanko'}
                      title="Toggle admin"
                    >
                      <ShieldCheck size={18} className="inline" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(u, 'isPremium', !u.isPremium)}
                      className={u.isPremium ? 'text-blue-600' : 'text-ink-soft/40 hover:text-blue-600'}
                      title="Toggle premium"
                    >
                      <Crown size={18} className="inline" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(u, 'isSuspended', !u.isSuspended)}
                      className={u.isSuspended ? 'text-red-600' : 'text-ink-soft/40 hover:text-red-600'}
                      title={u.isSuspended ? 'Unsuspend user' : 'Suspend user'}
                    >
                      <Ban size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
