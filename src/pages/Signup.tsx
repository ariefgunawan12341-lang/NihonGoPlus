import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('already-in-use') || m.includes('user already exists')) {
    return 'Email ini sudah terdaftar — coba masuk saja lewat halaman Sign in.'
  }
  if (m.includes('password') && m.includes('6')) return 'Password minimal 6 karakter.'
  if (m.includes('provider is not enabled')) return 'Login Google belum diaktifkan. Silakan hubungi admin.'
  if (m.includes('network error')) return 'Koneksi internet bermasalah.'
  return message
}

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, displayName)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? friendlyAuthError(err.message) : 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold text-xl mb-3">語</div>
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-sm text-ink-soft">Start your Japanese journey</p>
        </div>

        <button onClick={onGoogle} disabled={googleLoading} className="btn-secondary w-full mb-4 justify-center">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.5 0 10.3-1.9 14-5.1l-6.5-5.5c-2 1.4-4.6 2.2-7.5 2.2-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 40.5 16.2 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5C40.9 36.4 45 30.6 45 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          {googleLoading ? 'Menghubungkan…' : 'Daftar dengan Google'}
        </button>
        <div className="relative text-center mb-4">
          <span className="text-xs text-ink-soft bg-surface px-2 relative z-10">atau dengan email</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="input"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password (min. 6 characters)"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-hanko">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-center text-ink-soft mt-5">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
