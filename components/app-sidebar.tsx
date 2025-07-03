"use client"

import { useRouter } from "next/navigation"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { logout } from "@/lib/auth"

export function AppSidebar() {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/chat")
  }

  const handleNewReflection = () => {
    router.push(`/chat?new=${Date.now()}`)
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[#2A2A2A] bg-[#1b1b1b] hidden md:block">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A]">
          <button onClick={handleLogoClick} className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
              <SarthiIcon size="sm" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-white">Sarthi</span>
              <span className="truncate text-xs text-white/60">Your safe space</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* New Reflection Button */}
          <div className="mb-6">
            <button
              onClick={handleNewReflection}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Start new reflection</span>
            </button>
          </div>

          {/* Recent reflections */}
          <div className="mb-4">
            <h3 className="text-white/50 font-normal px-2 mb-2 text-sm">Recent reflections</h3>
            <div className="space-y-3">
              {/* Sample reflection items */}
              <div
                className="p-3 hover:bg-[#1A1A1A] cursor-pointer transition-colors rounded-md"
                onClick={() => router.push("/conversation/1")}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/90 truncate">Apology to Alex</span>
                      <span className="text-xs text-white/40">Today</span>
                    </div>
                    <p className="text-xs text-white/60 truncate mt-1">
                      I wanted to share some feedback about our meeting...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A2A]">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/60 hover:text-white/80 hover:bg-white/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
