"use client"

import { useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SarthiIcon } from "@/components/ui/sarthi-icon"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-[#2a2a2a] p-4">
            <div className="container flex items-center justify-between">
              <SidebarTrigger className="text-[#cbd5e1] hover:text-white" />
              <h1 className="text-xl font-medium text-white">Your space</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 container max-w-4xl py-8 px-4 mx-auto">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto mb-4">
                  <SarthiIcon size="lg" />
                </div>
                <h1 className="text-4xl font-medium">Your space</h1>
                <p className="text-[#cbd5e1] text-lg">A safe place for reflection and meaningful conversations.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Start New Conversation */}
                <div className="sarthi-card p-6 space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                      <path d="M8 14h.01" />
                      <path d="M12 14h.01" />
                      <path d="M16 14h.01" />
                      <path d="M8 18h.01" />
                      <path d="M12 18h.01" />
                      <path d="M16 18h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">New conversation</h3>
                    <p className="text-[#cbd5e1]">Start a new reflection with Sarthi</p>
                  </div>
                  <SarthiButton onClick={() => router.push("/chat")} className="w-full">
                    Begin
                  </SarthiButton>
                </div>

                {/* Journal */}
                <div className="sarthi-card p-6 space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">Private journal</h3>
                    <p className="text-[#cbd5e1]">Write freely in your personal space</p>
                  </div>
                  <SarthiButton onClick={() => router.push("/journal")} variant="secondary" className="w-full">
                    Open journal
                  </SarthiButton>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                <h2 className="text-2xl font-medium">Recent activity</h2>
                <div className="sarthi-card p-6">
                  <div className="text-center text-[#cbd5e1] py-8">
                    <p>Your conversations and reflections will appear here</p>
                    <p className="text-sm mt-2">Start your first conversation to begin your journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
