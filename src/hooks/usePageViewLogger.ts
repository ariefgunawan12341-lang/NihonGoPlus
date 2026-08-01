import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageViewCollection } from '../services/db'

/** Logs a real pageview event to Firestore on every route change. Intentionally
 *  minimal (path + timestamp, no user tracking) — this is not a replacement
 *  for Google Analytics, just enough real data to drive the Admin dashboard's
 *  visitor chart. */
export function usePageViewLogger() {
  const location = useLocation()

  useEffect(() => {
    pageViewCollection.create({
      id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      path: location.pathname,
      timestamp: Date.now()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
}
