import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Youtube, Facebook, Send } from 'lucide-react'
import { getSiteSettings } from '../../services/db'
import type { SiteSettings } from '../../types/content'

// lucide-react has no dedicated TikTok icon; a small inline SVG keeps the
// icon set visually consistent with the rest (same stroke-based style).
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

// Default handles — shown as-is until an admin overrides them from
// Admin Panel -> Settings (src/pages/admin/AdminSettings.tsx already has
// editable telegram/instagram/youtube/tiktok/facebook fields).
const DEFAULT_SOCIALS = {
  instagram: 'https://instagram.com/arifboncel.id',
  youtube: 'https://youtube.com/@arifbonceljp',
  tiktok: 'https://tiktok.com/@arifboncel25',
  facebook: 'https://facebook.com/arifdijepang',
  telegram: 'https://t.me/arifboncel25'
}

function buildSocials(settings: SiteSettings | null) {
  return [
    { label: 'Instagram', href: settings?.instagram || DEFAULT_SOCIALS.instagram, icon: Instagram },
    { label: 'YouTube', href: settings?.youtube || DEFAULT_SOCIALS.youtube, icon: Youtube },
    { label: 'TikTok', href: settings?.tiktok || DEFAULT_SOCIALS.tiktok, icon: TikTokIcon },
    { label: 'Facebook', href: settings?.facebook || DEFAULT_SOCIALS.facebook, icon: Facebook },
    { label: 'Telegram', href: settings?.telegram || DEFAULT_SOCIALS.telegram, icon: Send }
  ]
}

// Static fallback for components that render before/without fetching settings.
export const SOCIALS = buildSocials(null)

export function useSocialLinks() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  useEffect(() => {
    getSiteSettings().then(setSettings)
  }, [])
  return buildSocials(settings)
}

export function Footer() {
  const socials = useSocialLinks()

  return (
    <footer className="border-t border-line bg-surface mt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold">語</div>
            <span className="font-display font-bold">NihonGoPlus</span>
          </div>
          <p className="text-ink-soft text-xs">Arif Boncel Academy Japanese Learning</p>
        </div>

        <div>
          <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-ink-soft">Tautan</p>
          <div className="flex flex-col gap-1.5">
            <Link to="/about" className="text-ink-soft hover:text-blue-600">Tentang Kami</Link>
            <Link to="/contact" className="text-ink-soft hover:text-blue-600">Kontak</Link>
            <Link to="/articles" className="text-ink-soft hover:text-blue-600">Blog &amp; Artikel</Link>
            <Link to="/premium" className="text-ink-soft hover:text-blue-600">Premium</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-ink-soft">Ikuti Kami</p>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-paper flex items-center justify-center text-ink-soft hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <s.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} NihonGoPlus — Arif Boncel Academy Japanese Learning
      </div>
    </footer>
  )
}
