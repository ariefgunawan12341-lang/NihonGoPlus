import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Crown } from 'lucide-react'

export function PremiumGate({ children }: { children: ReactNode }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center">
        <Lock size={26} />
      </div>
      {children}
      <Link to="/premium" className="btn-primary mt-1">
        <Crown size={16} /> Upgrade to Premium
      </Link>
    </div>
  )
}
