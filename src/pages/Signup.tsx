import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      // @ts-ignore - added username to signUp
      const result = await signUp(email, password, fullName, username)
      if (result.sessionCreated) {
        navigate('/dashboard')
      } else if (result.emailVerificationSent) {
        setSuccessMsg('Registration successful. Please verify your email before logging in.')
      }
    } catch (err: any) {
      console.error('[Signup Page] Error details:', err)
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="card w-full max-w-sm p-8 shadow-xl border-t-4 border-t-blue-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-hanko flex items-center justify-center text-white font-jp font-bold text-3xl mb-4 shadow-lg shadow-hanko/30">語</div>
          <h1 className="text-2xl font-bold font-display text-ink text-center">Create Account</h1>
          <p className="text-sm text-ink-soft">Join NihonGoPlus Japanese Academy</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Full Name</label>
            <input
              className="input"
              placeholder="e.g. Arif Gunawan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Username</label>
            <input
              className="input"
              placeholder="e.g. arifboncel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Min. 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Confirm Password</label>
            <input
              className="input"
              type="password"
              placeholder="Repeat your password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl animate-shake">
              <p className="text-xs text-red-600 font-bold text-center">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-mint-50 border border-mint-200 p-4 rounded-xl">
              <p className="text-sm text-mint-700 font-semibold text-center leading-relaxed">{successMsg}</p>
            </div>
          )}

          {!successMsg && (
            <button
              className="btn-primary w-full shadow-lg py-4 text-base active:scale-95 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : 'Sign Up Now'}
            </button>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-line">
          <p className="text-sm text-center text-ink-soft font-medium">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
