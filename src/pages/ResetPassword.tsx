import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from 'firebase/auth'
import { auth } from '../firebase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Firebase uses oobCode from URL
  const query = new URLSearchParams(window.location.search)
  const oobCode = query.get('oobCode')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Password tidak cocok.')
      return
    }
    if (!oobCode) {
      setError('Kode reset tidak valid atau sudah kedaluwarsa.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mereset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-ink-soft mb-6">Masukkan password baru Anda.</p>

        {success ? (
          <div className="bg-mint-50 text-mint-600 p-4 rounded-xl text-sm font-semibold">
            Password berhasil diubah! Mengalihkan ke halaman login…
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              className="input"
              type="password"
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              className="input"
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Memproses…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
