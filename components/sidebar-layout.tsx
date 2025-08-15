"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Menu } from "lucide-react"
import { authFetch } from "@/lib/api"


interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("")

  // Check if we should show sidebar (post-login pages only)
  const shouldShowSidebar = !pathname.includes("/auth") && pathname !== "/"

  // Set default sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true) // Open by default on desktop
      } else {
        setIsSidebarOpen(false) // Closed by default on mobile
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Load user name from localStorage
// Load user name from API or fallback to localStorage



  const handleUserNameChange = (name: string) => {
    setUserName(name)
    localStorage.setItem("sarthi-user-name", name)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // For auth pages and root page, don't show sidebar at all
  if (!shouldShowSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-[#121212]">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        userName={userName}
        onUserNameChange={handleUserNameChange}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-30 p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop Toggle Button - Always show when sidebar is closed */}
        <div className="hidden md:block">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="fixed top-4 left-4 z-30 p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
