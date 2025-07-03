"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Use Next.js router for smooth client-side navigation
    router.push("/auth")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#cbd5e1]">Redirecting to authentication...</p>
      </div>
    </div>
  )
}
