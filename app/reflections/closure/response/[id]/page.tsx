'use client'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"

const getResponseMessage = (feeling: string) => {
  switch (feeling) {
    case 'I feel lighter':
    case 'I feel more clear':
      return "I'm really glad I could help you feel that way. If you'd like, you can share this feeling with someone else — or just carry it with you quietly. It's your moment."
    case 'I feel the same':
      return "Thank you for telling me. Sometimes reflection takes time. I'm always here when you're ready to try again."
    case 'I feel more stuck':
      return "Thank you for telling me. This can be hard work — and it's okay to feel that way. I'm here whenever you want to try again or see things differently."
    case "I'm not sure yet":
      return "That's completely okay. Reflection can take time to settle. Take it slow - I'm here whenever you want to talk again."
    default:
      return "Thank you for sharing how you feel. Your honesty helps me understand how to better support you."
  }
}

export default function ClosureResponsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const feeling = searchParams.get('feeling') || ''
  const { id } = useParams() as { id: string }
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage(getResponseMessage(feeling))
  }, [feeling])

  const showShareOption = feeling === 'I feel lighter' || feeling === 'I feel more clear'

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto mb-6">
            <SarthiIcon size="lg" />
          </div>
          <h1 className="text-3xl font-light text-white">{message}</h1>
        </div>

        <div className="space-y-4">
          {showShareOption ? (
            <div className="space-y-4">
              <SarthiButton
                onClick={() =>
                  router.push(`/reflections/share/${id}?feeling=${encodeURIComponent(feeling)}`)
                }
                className="px-8 py-4"
              >
                Share how I feel
              </SarthiButton>
              <SarthiButton
                onClick={() => router.push(`/reflections/closure/post?id=${id}`)}
                variant="secondary"
                className="px-8 py-4"
              >
                Keep it to myself
              </SarthiButton>
            </div>
          ) : (
            <SarthiButton
              onClick={() => router.push(`/reflections/closure/post?id=${id}`)}
              className="px-8 py-4"
            >
              Complete reflection
            </SarthiButton>
          )}
        </div>
      </div>
    </div>
  )
}
