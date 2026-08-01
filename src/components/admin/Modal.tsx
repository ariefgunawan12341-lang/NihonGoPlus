import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        className="card w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
