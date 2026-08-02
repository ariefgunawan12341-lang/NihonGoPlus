import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import GuestHome from './GuestHome'
import { FullScreenLoader } from '../components/layout/RouteGuards'

export default function HomeRouter() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return user ? <Navigate to="/dashboard" replace /> : <GuestHome />
}
