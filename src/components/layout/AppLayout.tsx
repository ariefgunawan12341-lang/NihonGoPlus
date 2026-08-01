import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Topbar } from './Topbar'
import { Footer } from './Footer'

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
        <div className="pb-20 lg:pb-0">
          <Footer />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
