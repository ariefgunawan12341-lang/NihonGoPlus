import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'

const tabs = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Vocabulary', to: '/admin/vocabulary' },
  { label: 'Kanji', to: '/admin/kanji' },
  { label: 'Grammar', to: '/admin/grammar' },
  { label: 'Modules & Lessons', to: '/admin/modules' },
  { label: 'Download Modules', to: '/admin/download-modules' },
  { label: 'SSW', to: '/admin/ssw' },
  { label: 'Kaigo Fukushishi', to: '/admin/kaigo' },
  { label: 'Questions & Exams', to: '/admin/questions' },
  { label: 'Bulk Import', to: '/admin/import' },
  { label: 'Artikel', to: '/admin/articles' },
  { label: 'Media', to: '/admin/media' },
  { label: 'Komentar', to: '/admin/comments' },
  { label: 'Pengumuman', to: '/admin/announcements' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Premium', to: '/admin/premium' },
  { label: 'Konfirmasi Pembayaran', to: '/admin/premium-orders' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Analytics', to: '/admin/analytics' },
  { label: 'Activity Log', to: '/admin/activity-log' }
]

export default function AdminShell() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          Admin Panel
          <span className="text-[10px] font-semibold uppercase tracking-wide text-hanko bg-hanko/10 px-2 py-0.5 rounded-full">
            Restricted
          </span>
        </h1>
        <p className="text-sm text-ink-soft">Manage every piece of content in NihonGoPlus.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 border-b border-line">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition',
                isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-ink-soft hover:text-ink'
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
