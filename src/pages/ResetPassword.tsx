import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, USE_SUPABASE } from '../supabase/client'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (!USE_SUPABASE || !supabase) {
      setError('Reset password lewat email hanya tersedia di mode Supabase.')
      return
    }
    setLoading(true)
    try {
      // Supabase automatically establishes a temporary session from the
      // reset-password email link's URL fragment (detectSessionInUrl: true
      // in src/supabase/client.ts), so updateUser() here just needs an
      // active session, not the old password.
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal reset password. Tautan mungkin sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold text-xl mb-3">語</div>
          <h1 className="text-xl font-bold">Buat password baru</h1>
        </div>

        {success ? (
          <p className="text-sm text-mint-600 text-center">Password berhasil diubah! Mengalihkan ke halaman masuk…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input className="input" type="password" placeholder="Password baru (min. 6 karakter)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-hanko">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan password baru'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
