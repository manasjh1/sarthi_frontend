"use client"

import { useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/auth")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-normal text-white/90">Your space</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 container max-w-4xl py-8 px-4 mx-auto overflow-y-auto">
        <div className="space-y-8 pb-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto mb-4">
              <SarthiIcon size="lg" />
            </div>
            <h1 className="text-4xl font-medium">Your space</h1>
            <p className="text-[#cbd5e1] text-lg">
              A safe place for reflection and meaningful conversations.
            </p>
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
              <SarthiButton
                onClick={() => router.push("/chat")}
                className="w-full"
              >
                Begin
              </SarthiButton>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-2xl font-medium">Recent activity</h2>
            <div className="sarthi-card p-6">
              <div className="text-center text-[#cbd5e1] py-8">
                <p>Your conversations and reflections will appear here</p>
                <p className="text-sm mt-2">
                  Start your first conversation to begin your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
