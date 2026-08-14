import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { trackPageView } from '../lib/analytics'

export function UsageTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    void trackPageView(pathname)
  }, [pathname])

  return null
}
