import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { uploadProfilePhoto } from '../services/storage'
import { getOrCreateProgress, ACHIEVEMENTS } from '../utils/gamification'
import type { UserProgress } from '../types'

export default function Profile() {
  const { user, updateProfile, signOutUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) getOrCreateProgress(user.uid).then(setProgress)
  }, [user])

  if (!user) return null

  async function save() {
    await updateProfile({ displayName: name })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setPhotoError(null)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      await updateProfile({ photoURL: url })
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

  const unlocked = progress ? ACHIEVEMENTS.filter((a) => a.isUnlocked(user, progress)) : []

  return (
    <div className="max-w-lg space-y-5">
      <div className="card p-6 flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 overflow-hidden group"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={28} />
          )}
          <span className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        <div>
          <p className="font-bold text-lg">{user.displayName}</p>
          <p className="text-sm text-ink-soft">{user.email}</p>
          {uploading && <p className="text-xs text-blue-600 mt-1">Uploading…</p>}
          {photoError && <p className="text-xs text-hanko mt-1">{photoError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Level', value: user.level },
          { label: 'XP', value: user.xp },
          { label: 'Streak', value: user.streak }
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold font-display text-blue-600">{s.value}</p>
            <p className="text-xs text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-sm">Display name</h3>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary" onClick={save}>
          {saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-3">Achievements ({unlocked.length}/{ACHIEVEMENTS.length})</h3>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.includes(a)
            return (
              <div key={a.id} className="flex flex-col items-center text-center gap-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isUnlocked ? 'bg-gold-500 text-white' : 'bg-line text-ink-soft/50'}`}>
                  🏅
                </div>
                <p className={`text-[11px] font-semibold ${isUnlocked ? 'text-ink' : 'text-ink-soft/50'}`}>{a.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="btn-secondary w-full text-hanko bg-hanko/10 hover:bg-hanko/20"
        onClick={async () => {
          await signOutUser()
          navigate('/login')
        }}
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  )
}
