"use client"

import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiOrb } from "@/components/sarthi-orb"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle, ArrowLeft, Mail, PhoneIcon as WhatsApp, Lock } from "lucide-react"

// Mock conversation data (in real app, this would come from API)
const conversationData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Apology to Alex",
    type: "apologize",
    recipient: "Alex",
    date: "Today",
    status: "sent",
    deliveryMethod: "with-name",
    deliveryDetails: {
      email: "alex@company.com",
      sentAt: "2024-01-15T10:30:00Z",
    },
    finalMessage:
      "Alex, I wanted to share some feedback. During the Q3 planning session yesterday, when I was explaining the budget, I was interrupted mid-sentence. The impact was that I lost my train of thought and felt my contribution was devalued.",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. What's been weighing on your heart about Alex?",
        timestamp: "2024-01-15T10:15:00Z",
      },
      {
        sender: "user",
        content:
          "I've been feeling frustrated about how our meetings go. Alex keeps interrupting me when I'm trying to explain important points.",
        timestamp: "2024-01-15T10:16:00Z",
      },
      {
        sender: "sarthi",
        content:
          "That sounds really heavy. I can feel how much this matters to you. It takes courage to address something like this. Let's ground this in a specific moment so Alex can understand clearly. Can you think of one recent time this happened?",
        timestamp: "2024-01-15T10:17:00Z",
      },
      {
        sender: "user",
        content:
          "Yes, yesterday during the Q3 planning session. I was explaining the budget breakdown and Alex cut me off mid-sentence.",
        timestamp: "2024-01-15T10:18:00Z",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Gratitude to Sarah",
    type: "gratitude",
    recipient: "Sarah",
    date: "Yesterday",
    status: "draft",
    deliveryMethod: "keep-private",
    finalMessage:
      "Sarah, I wanted to express my heartfelt gratitude for your incredible support during the project launch. Your guidance and encouragement made all the difference.",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "What's bringing gratitude to your heart today?",
        timestamp: "2024-01-14T15:30:00Z",
      },
      {
        sender: "user",
        content: "I want to thank Sarah for all her help during the project launch. She really went above and beyond.",
        timestamp: "2024-01-14T15:31:00Z",
      },
    ],
  },
}

const getTypeIcon = (type: string, className = "h-5 w-5") => {
  switch (type) {
    case "apologize":
      return <ApologyIcon className={className} strokeWidth={1.5} />
    case "gratitude":
      return <Heart className={className} strokeWidth={1.5} />
    case "boundary":
      return <MessageCircle className={className} strokeWidth={1.5} />
    default:
      return <MessageCircle className={className} strokeWidth={1.5} />
  }
}

const getDeliveryIcon = (method: string, details?: any) => {
  switch (method) {
    case "with-name":
      return details?.email ? <Mail className="h-4 w-4" /> : <WhatsApp className="h-4 w-4" />
    case "anonymous":
      return details?.email ? <Mail className="h-4 w-4" /> : <WhatsApp className="h-4 w-4" />
    case "keep-private":
      return <Lock className="h-4 w-4" />
    default:
      return null
  }
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const conversation = conversationData[conversationId]

  if (!conversation) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl text-white mb-4">Conversation not found</h1>
              <SarthiButton onClick={() => router.push("/chat")}>Go back to chat</SarthiButton>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#121212] flex flex-col">
          {/* Header */}
          <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white/60 hover:text-white" />
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              </div>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-3">
                  {getTypeIcon(conversation.type)}
                  <h1 className="text-lg font-normal text-white/90">{conversation.title}</h1>
                </div>
              </div>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Delivery Status Card */}
              <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getDeliveryIcon(conversation.deliveryMethod, conversation.deliveryDetails)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Delivery status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Method:</span>
                        <span className="text-white">
                          {conversation.deliveryMethod === "with-name" && "Sent with your name"}
                          {conversation.deliveryMethod === "anonymous" && "Sent anonymously"}
                          {conversation.deliveryMethod === "keep-private" && "Kept private"}
                        </span>
                        {conversation.status === "sent" && <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />}
                        {conversation.status === "draft" && <div className="w-2 h-2 bg-yellow-500 rounded-full ml-2" />}
                      </div>

                      {conversation.deliveryDetails && (
                        <div className="space-y-1">
                          {conversation.deliveryDetails.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Email:</span>
                              <span className="text-white">{conversation.deliveryDetails.email}</span>
                            </div>
                          )}
                          {conversation.deliveryDetails.whatsapp && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">WhatsApp:</span>
                              <span className="text-white">{conversation.deliveryDetails.whatsapp}</span>
                            </div>
                          )}
                          {conversation.deliveryDetails.sentAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">Sent:</span>
                              <span className="text-white">{formatDate(conversation.deliveryDetails.sentAt)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Message */}
              <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl">
                <h3 className="text-lg font-medium text-white mb-4">Final message</h3>
                <div className="p-4 bg-[#2a2a2a] rounded-2xl">
                  <p className="text-white leading-relaxed">{conversation.finalMessage}</p>
                </div>
              </div>

              {/* Conversation History */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Conversation history</h3>
                <div className="space-y-6">
                  {conversation.conversationHistory?.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === "user" ? "justify-end" : "items-start gap-4"}`}
                    >
                      {message.sender === "sarthi" && (
                        <div className="mt-1">
                          <SarthiOrb size="sm" />
                        </div>
                      )}

                      <div className={`max-w-[85%] ${message.sender === "user" ? "flex flex-col items-end" : ""}`}>
                        <div
                          className={`px-6 py-4 rounded-3xl ${
                            message.sender === "user"
                              ? "bg-[#1e1e1e] border border-[#2a2a2a]"
                              : "bg-[#2a2a2a] border border-[#3a3a3a]"
                          }`}
                        >
                          <p className="text-white leading-relaxed">{message.content}</p>
                        </div>
                        <div className="mt-2 text-xs text-white/40">{formatDate(message.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-12 flex gap-4 justify-center">
                <SarthiButton variant="secondary" onClick={() => router.push("/chat")}>
                  Start new reflection
                </SarthiButton>
                {conversation.status === "draft" && (
                  <SarthiButton onClick={() => router.push(`/chat?continue=${conversation.id}`)}>
                    Continue this reflection
                  </SarthiButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
