"use client"

import { useState } from "react"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SarthiIcon } from "@/components/ui/sarthi-icon"

export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    // In real app, save to database
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[#2a2a2a] p-4">
            <div className="container flex items-center justify-between">
              <SidebarTrigger className="text-[#cbd5e1] hover:text-white" />
              <h1 className="text-xl font-medium text-white">Private journal</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </header>

          <div className="flex-1 container max-w-4xl py-8 px-4">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto mb-4">
                  <SarthiIcon size="md" />
                </div>
                <h1 className="text-3xl font-medium">Your private journal</h1>
                <p className="text-[#cbd5e1]">A space for your thoughts, completely private</p>
              </div>

              <div className="sarthi-card p-6 space-y-4">
                <textarea
                  className="w-full bg-transparent border-none text-white placeholder-[#cbd5e1] focus:outline-none resize-none text-lg leading-relaxed"
                  rows={15}
                  placeholder="What's on your mind today? Write freely, without judgment..."
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                />

                <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2a]">
                  <div className="text-sm text-[#cbd5e1]">{journalEntry.length} characters</div>

                  <div className="flex space-x-3">
                    <SarthiButton variant="secondary" onClick={() => setJournalEntry("")}>
                      Clear
                    </SarthiButton>
                    <SarthiButton onClick={handleSave} disabled={!journalEntry.trim()}>
                      {isSaved ? "Saved ✓" : "Save entry"}
                    </SarthiButton>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-[#cbd5e1]">
                <p>Your journal entries are completely private and stored securely</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
