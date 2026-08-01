import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { downloadModuleCollection } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import { PremiumGate } from '../components/ui/PremiumGate'
import type { DownloadModule } from '../types'

export default function Downloads() {
  const { user } = useAuth()
  const [modules, setModules] = useState<DownloadModule[] | null>(null)

  useEffect(() => {
    downloadModuleCollection.list().then((all) => setModules([...all].sort((a, b) => a.order - b.order)))
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Download Modules</h1>
      <p className="text-sm text-ink-soft mb-5">PDF study materials and lesson packs, organized by JLPT level.</p>

      {!user?.isPremium ? (
        <PremiumGate>
          <h2 className="font-bold">Download Modules is a Premium feature</h2>
          <p className="text-sm text-ink-soft">Upgrade to download every study pack as a PDF, offline-ready.</p>
        </PremiumGate>
      ) : !modules ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : modules.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">No download modules yet — add some from the Admin Panel.</div>
      ) : (
        <div className="space-y-2">
          {modules.map((m) => (
            <a
              key={m.id}
              href={m.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="card p-4 flex items-center gap-3 hover:shadow-card transition"
            >
              <div className="w-10 h-10 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-ink-soft truncate">{m.description}</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 shrink-0">{m.level}</span>
              <Download size={16} className="text-ink-soft shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
