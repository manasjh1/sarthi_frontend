'use client'

import { usePathname } from 'next/navigation'

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Pages where sidebar should NOT appear
  const hideSidebarRoutes = [
    '/els-login',
    '/ELS-Test',
    '/els-test-results',
    '/auth',
    '/chat'
  ]

  const shouldHideSidebar =
    hideSidebarRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    ) ||
    pathname === '/404'

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64">
        {/* sidebar content */}
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
