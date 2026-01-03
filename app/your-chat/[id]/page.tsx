"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { ArrowLeft, Heart, MessageCircle } from "lucide-react"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { authFetch } from "@/lib/api"

interface ChatMessage {
  sender: string
  message: string
  stage: number
  is_distress: boolean
  created_at: string
}

interface ChatDetail {
  reflection_id: string
  summary: string
  to: string
  from: string
  type: string
  status: string
  created_at: string
  chat_history: ChatMessage[]
}

export default function ChatDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userName = typeof window !== "undefined" ? localStorage.getItem("sarthi-user-name") : "You"

  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!id) return

      setLoading(true)
      try {
        const res = await authFetch(`/reflection/detail/${id}`, { 
          method: "GET",
          credentials: "include"
        })
        const json = await res.json()
        console.log(json);
        if (json.success && json.data) {
          setChatDetail(json.data)
        } else {
          setError(json.message || "Failed to fetch chat details.")
        }
      } catch (err) {
        console.error("Error fetching chat:", err)
        setError("Something went wrong while fetching chat details.")
      } finally {
        setLoading(false)
      }
    }

    fetchChatDetail()
  }, [id])

  const getReflectionIcon = (type: string) => {
    const flowType = type?.split('_')[0]?.toLowerCase() || ''
    switch (flowType) {
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
    const flowType = type?.split('_')[0]?.toLowerCase() || ''
    switch (flowType) {
      case "apologize":
      case "apology":
        return "Apology"
      case "gratitude":
        return "Gratitude"
      case "boundary":
        return "Boundary Setting"
      default:
        return "Reflection"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (error || !chatDetail) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light text-white">Chat not found</h1>
          <p className="text-white/60">{error || "The chat you're looking for doesn't exist."}</p>
          <SarthiButton onClick={() => router.back()}>Go back</SarthiButton>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60">
              {getReflectionIcon(chatDetail.type)}
            </div>
            <div>
              <h1 className="text-white font-medium">{chatDetail.to}</h1>
              <p className="text-white/60 text-sm">{formatDate(chatDetail.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Chat Details Card */}
          <div className="bg-white/5 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60">Recipient</p>
                <p className="text-white">{chatDetail.to}</p>
              </div>
              <div>
                <p className="text-white/60">From</p>
                <p className="text-white">{chatDetail.from}</p>
              </div>
              <div>
                <p className="text-white/60">Type</p>
                <p className="text-white">{getReflectionLabel(chatDetail.type)}</p>
              </div>
              <div>
                <p className="text-white/60">Status</p>
                <p className="text-white capitalize">{chatDetail.status}</p>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-4">
            <h2 className="text-white font-medium">Summary</h2>
            <div className="bg-white/5 rounded-2xl p-6">
              <p className="text-white/80 leading-relaxed">{chatDetail.summary}</p>
            </div>
          </div>

          {/* Chat History */}
          <div className="space-y-4">
            <h2 className="text-white font-medium">Conversation History</h2>
            <div className="space-y-3">
              {chatDetail.chat_history.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <p className="text-white/40 text-xs mt-2">
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-8 pb-8">
            <SarthiButton onClick={() => router.push("/chat")}>
              Start new reflection
            </SarthiButton>
          </div>
        </div>
      </div>
    </div>
  )
}