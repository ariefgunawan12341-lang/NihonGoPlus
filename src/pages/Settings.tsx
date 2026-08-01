import { useState, type FormEvent } from 'react'
import { Bell, Moon, Trash2, Download, Globe, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getStoredTheme, applyTheme } from '../utils/theme'
import { requestNotificationPermission, sendTestReminder } from '../utils/notifications'

const LANGUAGES: { code: 'en' | 'id' | 'ja'; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ja', label: '日本語' }
]

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth()
  const [notifications, setNotifications] = useState(typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [darkMode, setDarkMode] = useState(getStoredTheme() === 'dark')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  function toggleDarkMode(checked: boolean) {
    setDarkMode(checked)
    applyTheme(checked ? 'dark' : 'light')
  }

  async function toggleNotifications(checked: boolean) {
    if (checked) {
      const granted = await requestNotificationPermission()
      setNotifications(granted)
      if (granted) sendTestReminder("Notifications are on! We'll remind you to keep your streak alive.")
    } else {
      setNotifications(false)
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    try {
      await changePassword(oldPassword, newPassword)
      setPwSuccess(true)
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not change password.')
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nihongoplus-profile.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearLocalData() {
    if (!confirm('This clears all locally stored study progress on this device. Continue?')) return
    ;['vocabulary', 'questions', 'content_items', 'modules'].forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  if (!user) return null

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="card divide-y divide-line">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-blue-500" />
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-ink-soft">Reminders to keep your streak alive</p>
            </div>
          </div>
          <input type="checkbox" checked={notifications} onChange={(e) => toggleNotifications(e.target.checked)} className="w-5 h-5 accent-blue-500" />
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={18} className="text-blue-500" />
            <div>
              <p className="text-sm font-semibold">Dark mode</p>
              <p className="text-xs text-ink-soft">Easier on the eyes at night</p>
            </div>
          </div>
          <input type="checkbox" checked={darkMode} onChange={(e) => toggleDarkMode(e.target.checked)} className="w-5 h-5 accent-blue-500" />
        </div>
        <div className="p-4 flex items-center gap-3">
          <Globe size={18} className="text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Interface language</p>
            <p className="text-xs text-ink-soft">Saved to your profile — full UI translation is not yet wired to this setting</p>
          </div>
          <select
            className="input w-32"
            value={user.language ?? 'en'}
            onChange={(e) => updateProfile({ language: e.target.value as 'en' | 'id' | 'ja' })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="card p-4 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <Lock size={18} className="text-blue-500" />
          <p className="text-sm font-semibold">Change password</p>
        </div>
        <input className="input" type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        <input className="input" type="password" placeholder="New password (min. 6 characters)" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        {pwError && <p className="text-sm text-hanko">{pwError}</p>}
        {pwSuccess && <p className="text-sm text-mint-600">Password updated.</p>}
        <button className="btn-primary w-full">Update password</button>
      </form>

      <div className="card divide-y divide-line">
        <button onClick={exportData} className="p-4 flex items-center gap-3 w-full text-left hover:bg-paper transition">
          <Download size={18} className="text-blue-500" />
          <div>
            <p className="text-sm font-semibold">Export my data</p>
            <p className="text-xs text-ink-soft">Download your profile as JSON</p>
          </div>
        </button>
        <button onClick={clearLocalData} className="p-4 flex items-center gap-3 w-full text-left hover:bg-paper transition">
          <Trash2 size={18} className="text-hanko" />
          <div>
            <p className="text-sm font-semibold text-hanko">Clear local content cache</p>
            <p className="text-xs text-ink-soft">Removes cached vocabulary/exam content on this device (your account data is untouched)</p>
          </div>
        </button>
      </div>

      <p className="text-xs text-ink-soft text-center">NihonGoPlus v1.0.0</p>
    </div>
  )
}
