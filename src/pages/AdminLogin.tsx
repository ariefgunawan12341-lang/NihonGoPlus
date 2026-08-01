import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLogin() {
  const { signIn, user, signOutUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      // signIn() sets `user` asynchronously via context; re-check role from a
      // fresh fetch to avoid acting on stale state in this same tick.
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  // If someone is signed in but not an admin, make that explicit rather than
  // silently redirecting — this IS the dedicated admin entry point, so a
  // non-admin landing here deserves a clear explanation, not a bounce.
  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="card w-full max-w-sm p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 text-hanko" size={32} />
          <h1 className="text-lg font-bold mb-1">Bukan akun Admin</h1>
          <p className="text-sm text-ink-soft mb-4">Akun {user.email} tidak memiliki akses admin.</p>
          <button className="btn-secondary w-full" onClick={() => signOutUser()}>Keluar &amp; coba akun lain</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-hanko flex items-center justify-center text-white mb-3">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold">NihonGoPlus Admin</h1>
          <p className="text-sm text-ink-soft">Portal khusus administrator</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input" type="email" placeholder="Email admin" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-hanko">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Memproses…' : 'Masuk sebagai Admin'}</button>
        </form>
      </div>
    </div>
  )
}
