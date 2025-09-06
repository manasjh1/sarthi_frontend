'use client'

import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReflectionConfirmationPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState<'keep-private' | 'email' | 'phone' | 'phone_email'>('keep-private')

  useEffect(() => {
    const method = searchParams.get('method')
    if (method === 'email' || method === 'phone' || method === 'phone_email') {
      setDeliveryMethod(method)
    }

    const timer = setTimeout(() => {
      router.push(`/reflections/closure/${id}`)
    }, 1200) // increased to 1.2s so user can read the confirmation
    return () => clearTimeout(timer)
  }, [searchParams, router, id])

  const getMessage = () => {
    switch (deliveryMethod) {
      case 'keep-private':
        return {
          heading: 'Reflection saved',
          text: 'Your reflection has been saved privately.'
        }
      case 'email':
        return {
          heading: 'Message sent',
          text: 'Your message has been sent via email.'
        }
      case 'phone':
        return {
          heading: 'Message sent',
          text: 'Your message has been sent via WhatsApp.'
        }
      case 'phone_email':
        return {
          heading: 'Message sent',
          text: 'Your message has been sent via email and WhatsApp.'
        }
      default:
        return {
          heading: 'Reflection saved',
          text: 'Your reflection has been saved privately.'
        }
    }
  }

  const { heading, text } = getMessage()

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center space-y-6 sm:space-y-8 max-w-xs sm:max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <svg
            className="h-8 w-8 sm:h-10 sm:w-10 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-medium text-white">{heading}</h1>
          <p className="text-[#cbd5e1] text-sm sm:text-lg leading-normal sm:leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}
