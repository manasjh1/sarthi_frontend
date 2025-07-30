'use client'


import { useRouter, useParams } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiIcon } from "@/components/ui/sarthi-icon"


const ClosureFeelingPage = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const handleFeelingSelect = (feeling: string) => {
   router.push(`/reflections/closure/response/${id}?feeling=${encodeURIComponent(feeling)}`)

  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto mb-6">
            <SarthiIcon size="lg" />
          </div>
          <h1 className="text-3xl font-light text-white">You did something brave today.</h1>
          <p className="text-white/60">Thank you for trusting me with your words. How do you feel now?</p>
        </div>

        <div className="space-y-3">
          {["I feel lighter", "I feel the same", "I feel more clear", "I feel more stuck", "I'm not sure yet"].map(
            (feeling) => (
              <button
                key={feeling}
                onClick={() => handleFeelingSelect(feeling)}
                className="w-full p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left text-white"
              >
                {feeling}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ClosureFeelingPage
