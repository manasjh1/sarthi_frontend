'use client'

import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { useEffect, useState } from 'react'
import { authFetch } from "@/lib/api"

export default function ShareFeelingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const feeling = searchParams.get('feeling') || ''
  const { id } = useParams() as { id: string }

  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [isFetching, setIsFetching] = useState(true)

  const shareMessage = `I just used Sarthi to help me reflect and express something important. It really helped me feel ${feeling.toLowerCase()}. You might find it helpful too.`

  // Fetch dynamic invite link (auth?invite=...)
  useEffect(() => {
    const fetchShareLink = async () => {
      try {
        setIsFetching(true)
        const res = await authFetch("/api/invite/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })

        const json = await res.json()
        if (json.success && json.invite_code) {
          const inviteUrl = `${window.location.origin}/auth?invite=${json.invite_code}`
          setInviteLink(inviteUrl)
        } else {
          console.error("Error fetching link:", json.message)
        }
      } catch (err) {
        console.error("Error generating share link:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchShareLink()
  }, [])

  const fullMessage = `${shareMessage}\n\n${inviteLink || 'Loading link...'}`

  const handleShare = (method: string) => {
    if (!inviteLink) return // Avoid actions before link is ready

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank')
        break
      case 'email':
        window.open(
          `mailto:?subject=I found something helpful&body=${encodeURIComponent(fullMessage)}`,
          '_blank'
        )
        break
      case 'copy':
        navigator.clipboard.writeText(fullMessage)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
        break
    }
    router.push(`/reflections/closure/post?id=${id}`)
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6">
            <SarthiIcon size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white">Share your experience</h1>
          <p className="text-sm sm:text-base text-white/60">Let others know how Sarthi helped you</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* WhatsApp Button */}
          <button
            onClick={() => handleShare('whatsapp')}
            disabled={isFetching}
            className="w-full p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-medium text-white">Share on WhatsApp</h3>
                <p className="text-white/60 text-sm">Recommend Sarthi to your contacts</p>
              </div>
            </div>
          </button>

          {/* Email Button */}
          <button
            onClick={() => handleShare('email')}
            disabled={isFetching}
            className="w-full p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-medium text-white">Share via Email</h3>
                <p className="text-white/60 text-sm">Send an email to your friends</p>
              </div>
            </div>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={() => handleShare('copy')}
            disabled={isFetching}
            className="w-full p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h2m0 0h2m-2 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 0V9a1.5 1.5 0 0 1 3 0v3m-3 0h2m1.992 0a1.5 1.5 0 0 1-1.101 1.748l-.717 1.075a4.5 4.5 0 0 0-1.484 2.032.75.75 0 0 1-.522.294m-4.5 0a.75.75 0 0 1-.522-.294 4.5 4.5 0 0 0-1.484-2.032l-.717-1.075a1.5 1.5 0 0 1-1.101-1.748h10.984z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-medium text-white">Copy Link</h3>
                <p className="text-white/60 text-sm">
                  {copied ? 'Copied to clipboard!' : 'Share the link directly'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
