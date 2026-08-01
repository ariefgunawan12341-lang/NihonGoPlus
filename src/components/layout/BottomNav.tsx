import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { primaryNav, secondaryNav } from './navConfig'

const items = [...primaryNav, ...secondaryNav].filter((i) => i.inBottomNav)

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition',
                isActive ? 'text-blue-600' : 'text-ink-soft'
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
