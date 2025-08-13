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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center space-y-6 sm:space-y-8 max-w-md">
          {/* Responsive icon size and container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
            <SarthiIcon size="lg" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Responsive header font size */}
            <h1 className="text-2xl sm:text-3xl font-medium text-white">You've completed your reflection.</h1>
            {/* Responsive paragraph font size and line height */}
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-normal sm:leading-relaxed">
              Take a moment to appreciate what you've accomplished today. Your courage to reflect and express yourself
              matters.
            </p>
          </div>

          <div className="space-y-4">
            <SarthiButton onClick={handleRestart} className="w-full">
              Start another reflection
            </SarthiButton>
          </div>

          {/* Responsive footer text size */}
          <p className="text-xs sm:text-sm text-[#666] mt-6 sm:mt-8">Remember: growth happens one reflection at a time.</p>
        </div>
      </div>
    </div>
  )
}