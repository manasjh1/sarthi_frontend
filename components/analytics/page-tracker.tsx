'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import analytics from '@/lib/mixpanel'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      analytics.trackPageView(pathname, {
        route: pathname,
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname])

  return null
}