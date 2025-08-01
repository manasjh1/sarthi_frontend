"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { ArrowLeft } from "lucide-react"

export default function JournalPage() {
  const router = useRouter()
  const [journalEntry, setJournalEntry] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    // In real app, save to database
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 100)
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-normal text-white/90">Private journal</h1>
          </div>
          <div className="w-10"></div>
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
  )
}
