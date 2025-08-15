"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { CleanCardTemplate } from "@/components/message-templates/clean-card"
import { HandwrittenTemplate } from "@/components/message-templates/handwritten"
import { MinimalTemplate } from "@/components/message-templates/minimal"
import { SarthiOrb } from "@/components/sarthi-orb"
import { ArrowLeft, Heart, MessageCircle, Mail, Phone } from "lucide-react"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { authFetch } from "@/lib/api"

export default function ReflectionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [reflection, setReflection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  

  useEffect(() => {
    const fetchReflection = async () => {
      setLoading(true)
      try {
        const res = await authFetch("/api/reflection/history", {
          method: "POST",
          body: JSON.stringify({
            data: {
              mode: "get_reflections",
              reflection_id: id,
            },
          }),
        })
        
        const json = await res.json()
          console.log("History Response:", json)
        if (json.success) {
          setReflection(json.data)
        } else {
          setError(json.message || "Failed to fetch reflection.")
        }
      } catch (err) {
        setError("Something went wrong while fetching reflection.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchReflection()
  }, [id])

const getReflectionIcon = (type: string) => {
  switch (type) {
    case "gratitude":
      return <Heart className="h-4 w-4" />
    case "apology":
      return <ApologyIcon className="h-4 w-4" strokeWidth={1.5} />
    case "boundary":
      return <MessageCircle className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}


  const getReflectionLabel = (type: string) => {
    switch (type) {
      case "apologize":
        return "Apology"
      case "gratitude":
        return "Gratitude"
      case "boundary":
        return "Boundary Setting"
      default:
        return "Reflection"
    }
  }

  const getDeliveryMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "whatsapp":
        return <Phone className="h-4 w-4" />
      case "both":
        return (
          <div className="flex gap-1">
            <Mail className="h-4 w-4" />
            <Phone className="h-4 w-4" />
          </div>
        )
      default:
        return null
    }
  }

  const getDisplayName = () => {
    if (reflection?.senderType === "anonymous") {
      return "Anonymous"
    }
    return reflection?.senderName || "User"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleStartNewReflection = () => {
    router.push("/onboarding")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  if (error || !reflection) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light text-white">Reflection not found</h1>
          <p className="text-white/60">{error || "The reflection you're looking for doesn't exist."}</p>
          <SarthiButton onClick={() => router.back()}>Go back</SarthiButton>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60">
               {getReflectionIcon(reflection.category.toLowerCase())}
            </div>
            <div>
              <h1 className="text-white font-medium">
                {getReflectionLabel(reflection.type)} to {reflection.name}
              </h1>
              <p className="text-white/60 text-sm">{formatDate(reflection.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Reflection Details */}
          <div className="bg-white/5 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60">Recipient</p>
                <p className="text-white">{reflection.name}</p>
              </div>
              <div>
                <p className="text-white/60">Relationship</p>
                <p className="text-white">{reflection.relation}</p>
              </div>
              <div>
                <p className="text-white/60">Type</p>
                <p className="text-white">{getReflectionLabel(reflection.type)}</p>
              </div>
             
              <div>
                <p className="text-white/60">Category</p>
                <p className="text-white">{reflection.category}</p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-4">
            <h2 className="text-white font-medium">Your Message</h2>
            <div className="flex justify-center">
              <MinimalTemplate message={reflection.summary} fromName={getDisplayName()} />
            </div>
          </div>

  
       

          {/* Action */}
          <div className="flex justify-center pt-8 pb-8">
            <SarthiButton onClick={handleStartNewReflection}>Start new reflection</SarthiButton>
          </div>
        </div>
      </div>
    </div>
  )
}
