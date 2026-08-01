import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { getSiteSettings } from '../services/db'
import type { SiteSettings } from '../types/content'
import { useSocialLinks } from '../components/layout/Footer'

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const socials = useSocialLinks()

  useEffect(() => {
    getSiteSettings().then(setSettings)
  }, [])

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">Kontak</h1>
        <p className="text-sm text-ink-soft">Ada pertanyaan atau butuh bantuan? Hubungi kami.</p>
      </div>

      {settings?.contactEmail && (
        <a href={`mailto:${settings.contactEmail}`} className="card p-4 flex items-center gap-3 hover:shadow-card transition">
          <div className="w-10 h-10 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">Email</p>
            <p className="text-xs text-ink-soft">{settings.contactEmail}</p>
          </div>
        </a>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-3">Media Sosial</h2>
        <div className="space-y-2">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-blue-600 transition">
              <s.icon size={18} />
              <span className="text-sm">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
