'use client'

import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReflectionConfirmationPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState<'keep-private' | 'email' | 'whatsapp'>('keep-private')

   useEffect(() => {
    const method = searchParams.get('method')
    if (method === 'email' || method === 'whatsapp') {
      setDeliveryMethod(method)
    }

   const timer = setTimeout(() => {
      router.push(`/reflections/closure/${id}`)
    }, 12)

   return () => clearTimeout(timer)
  }, [searchParams, router, id])

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <svg
            className="h-10 w-10 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-medium text-white">
            {deliveryMethod === 'keep-private' ? 'Reflection saved' : 'Message sent'}
          </h1>
          <p className="text-[#cbd5e1] text-lg leading-relaxed">
            {deliveryMethod === 'keep-private'
              ? 'Your reflection has been saved privately.'
              : `Your message has been sent ${deliveryMethod === 'email' ? 'via email' : 'via WhatsApp'}.`}
          </p>
        </div>
      </div>
    </div>
  )
}
