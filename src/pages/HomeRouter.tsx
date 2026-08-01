import { useAuth } from '../contexts/AuthContext'
import Dashboard from './Dashboard'
import GuestHome from './GuestHome'
import { FullScreenLoader } from '../components/layout/RouteGuards'

export default function HomeRouter() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return user ? <Dashboard /> : <GuestHome />
}
