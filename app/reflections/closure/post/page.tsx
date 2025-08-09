'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"

export default function PostReflectionPage() {
  const router = useRouter()

  const handleRestart = () => {
    localStorage.removeItem('sarthi-reflection') // Optional: clean up local state if stored
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
            <SarthiIcon size="lg" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-medium text-white">You've completed your reflection.</h1>
            <p className="text-[#cbd5e1] text-lg leading-relaxed">
              Take a moment to appreciate what you've accomplished today. Your courage to reflect and express yourself
              matters.
            </p>
          </div>

          <div className="space-y-4">
            <SarthiButton onClick={handleRestart} className="w-full">
              Start another reflection
            </SarthiButton>
          </div>

          <p className="text-sm text-[#666] mt-8">Remember: growth happens one reflection at a time.</p>
        </div>
      </div>
    </div>
  )
}
