import { useState } from 'react'
import { X, Megaphone } from 'lucide-react'
import clsx from 'clsx'
import type { Announcement } from '../../types/content'

const LEVEL_STYLES: Record<Announcement['level'], string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-mint-50 text-mint-700 border-mint-200',
  warning: 'bg-gold-50 text-gold-600 border-gold-400'
}

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const visible = announcements.filter((a) => !dismissed.includes(a.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div key={a.id} className={clsx('rounded-xl2 border px-4 py-3 flex items-start gap-3 text-sm', LEVEL_STYLES[a.level])}>
          <Megaphone size={16} className="shrink-0 mt-0.5" />
          <p className="flex-1">{a.message}</p>
          <button onClick={() => setDismissed((d) => [...d, a.id])} className="shrink-0 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
