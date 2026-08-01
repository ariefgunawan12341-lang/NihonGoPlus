import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { primaryNav, secondaryNav, adminNavItem } from './navConfig'
import { useAuth } from '../../contexts/AuthContext'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-line bg-surface">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="w-9 h-9 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold text-lg shadow-soft">
          語
        </div>
        <div>
          <p className="font-display font-bold text-ink leading-none">NihonGoPlus</p>
          <p className="text-xs text-ink-soft mt-0.5">日本語を学ぼう</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {primaryNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition',
                isActive ? 'bg-blue-50 text-blue-600' : 'text-ink-soft hover:bg-paper hover:text-ink'
              )
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-mint-600 bg-mint-50 px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-line space-y-1">
        {secondaryNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition',
                isActive ? 'bg-blue-50 text-blue-600' : 'text-ink-soft hover:bg-paper hover:text-ink'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        {user?.isAdmin && (
          <NavLink
            to={adminNavItem.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition',
                isActive ? 'bg-hanko/10 text-hanko' : 'text-ink-soft hover:bg-paper hover:text-hanko'
              )
            }
          >
            <adminNavItem.icon size={18} />
            {adminNavItem.label}
          </NavLink>
        )}
      </div>
    </aside>
  )
}
