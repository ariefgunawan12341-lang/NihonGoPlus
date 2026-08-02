import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
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
      navigate('/dashboard')
    } catch (err: any) {
      console.error('[Login Page] Error details:', err)
      const message = err.message || 'An unexpected error occurred.'
      const status = err.status ? ` (Status: ${err.status})` : ''
      setError(`${message}${status}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="card w-full max-w-sm p-8 shadow-xl border-t-4 border-t-blue-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-hanko flex items-center justify-center text-white font-jp font-bold text-3xl mb-4 shadow-lg shadow-hanko/30">語</div>
          <h1 className="text-2xl font-bold font-display text-ink text-center">Welcome Back</h1>
          <p className="text-sm text-ink-soft font-medium">Sign in to continue learning</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-ink-soft tracking-widest px-1">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="john@example.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl animate-shake">
              <p className="text-xs text-red-600 font-bold text-center">{error}</p>
            </div>
          )}

          <div className="text-right">
            <Link to="/forgot-password" title='Reset via Email' className="text-xs text-blue-600 font-bold hover:underline">Forgot password?</Link>
          </div>

          <button
            className="btn-primary w-full shadow-lg py-4 text-base active:scale-95 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </>
            ) : 'Sign In Now'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-line">
          <p className="text-sm text-center text-ink-soft mt-2 font-medium">
            New to NihonGoPlus? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Join For Free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
