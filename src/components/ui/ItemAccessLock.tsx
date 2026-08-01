import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { AccessResult } from '../../utils/access'

export function ItemAccessLock({ result }: { result: Extract<AccessResult, 'needs-login' | 'needs-premium'> }) {
  const isPremium = result === 'needs-premium'
  return (
    <div className="card p-4 flex items-center gap-3 border-dashed">
      <div className={`w-9 h-9 rounded-xl2 flex items-center justify-center shrink-0 ${isPremium ? 'bg-gold-50 text-gold-600' : 'bg-blue-50 text-blue-600'}`}>
        <Lock size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{isPremium ? 'Materi ini khusus Premium' : 'Masuk untuk membuka materi ini'}</p>
        <p className="text-xs text-ink-soft">
          {isPremium ? 'Upgrade akun untuk membuka semua fitur.' : 'Buat akun gratis untuk mengakses materi ini.'}
        </p>
      </div>
      <Link to={isPremium ? '/premium' : '/signup'} className={isPremium ? 'btn-primary text-xs px-3 py-1.5' : 'btn-secondary text-xs px-3 py-1.5'}>
        {isPremium ? 'Upgrade' : 'Daftar'}
      </Link>
    </div>
  )
}
