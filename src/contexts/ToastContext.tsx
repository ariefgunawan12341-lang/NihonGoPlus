import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
}

const STYLES: Record<ToastKind, string> = {
  success: 'bg-mint-50 text-mint-700 border-mint-200',
  error: 'bg-hanko/10 text-hanko border-hanko/20',
  info: 'bg-blue-50 text-blue-700 border-blue-200'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  function dismiss(id: string) {
    setToasts((t) => t.filter((x) => x.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div key={t.id} className={clsx('rounded-xl2 border px-4 py-3 flex items-start gap-2 text-sm shadow-card animate-popIn', STYLES[t.kind])}>
              <Icon size={16} className="shrink-0 mt-0.5" />
              <p className="flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
