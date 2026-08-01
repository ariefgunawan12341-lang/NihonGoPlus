import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold text-xl mb-3">語</div>
          <h1 className="text-xl font-bold">Reset password</h1>
          <p className="text-sm text-ink-soft text-center">Masukkan email akunmu, kami kirim tautan reset password.</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-mint-600">Email terkirim! Cek kotak masuk (dan folder spam) untuk tautan reset password.</p>
            <Link to="/login" className="text-sm font-semibold text-blue-600">Kembali ke halaman masuk</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Mengirim…' : 'Kirim tautan reset'}</button>
          </form>
        )}

        <p className="text-sm text-center text-ink-soft mt-5">
          <Link to="/login" className="text-blue-600 font-semibold">Kembali ke masuk</Link>
        </p>
      </div>
    </div>
  )
}
