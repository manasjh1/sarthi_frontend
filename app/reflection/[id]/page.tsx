"use client"

import { useParams, useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { CleanCardTemplate } from "@/components/message-templates/clean-card"
import { HandwrittenTemplate } from "@/components/message-templates/handwritten"
import { MinimalTemplate } from "@/components/message-templates/minimal"
import { SarthiOrb } from "@/components/sarthi-orb"
import { ArrowLeft, Heart, MessageCircle, Mail, Phone } from "lucide-react"
import { ApologyIcon } from "@/components/icons/apology-icon"

// Mock data for reflection details with conversation history
const reflectionData = {
  "1": {
    id: "1",
    type: "gratitude" as const,
    recipient: "Sarah",
    relationship: "friend",
    date: "2024-01-15",
    message:
      "I wanted to take a moment to express my heartfelt gratitude. Your support as my friend has meant so much to me. When I was going through that difficult time last month, you were there with a listening ear and encouraging words. I don't think I could have gotten through it without you.",
    template: "clean-card" as const,
    senderName: "Alex",
    senderType: "name" as const, // "name" or "anonymous"
    deliveryMethod: "email" as const, // "email", "whatsapp", "both", "private"
    deliveryDetails: {
      email: "sarah@example.com",
    },
    status: "sent",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "I can feel the warmth in your heart. Who would you like to thank?",
        timestamp: "2024-01-15T10:15:00Z",
      },
      {
        sender: "user",
        content: "Sarah",
        timestamp: "2024-01-15T10:16:00Z",
      },
      {
        sender: "sarthi",
        content: "What's your relationship with Sarah?",
        timestamp: "2024-01-15T10:17:00Z",
      },
      {
        sender: "user",
        content: "friend",
        timestamp: "2024-01-15T10:18:00Z",
      },
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. Take your time and share what's been on your heart.",
        timestamp: "2024-01-15T10:19:00Z",
      },
      {
        sender: "user",
        content:
          "I've been thinking about how much Sarah has supported me. When I was going through that difficult time last month, she was always there with a listening ear and encouraging words. I don't think I could have gotten through it without her support.",
        timestamp: "2024-01-15T10:22:00Z",
      },
    ],
  },
  "2": {
    id: "2",
    type: "apologize" as const,
    recipient: "Mom",
    relationship: "mother",
    date: "2024-01-10",
    message:
      "I'm sorry for missing your birthday dinner. I know how much family gatherings mean to you, and I should have prioritized being there. I was caught up with work, but that's no excuse for letting you down on such an important day. I hope you can forgive me.",
    template: "handwritten" as const,
    senderName: "Your loving child",
    senderType: "name" as const,
    deliveryMethod: "both" as const,
    deliveryDetails: {
      email: "mom@family.com",
      whatsapp: "+1234567890",
    },
    status: "sent",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. Who is this apology for?",
        timestamp: "2024-01-10T14:30:00Z",
      },
      {
        sender: "user",
        content: "Mom",
        timestamp: "2024-01-10T14:31:00Z",
      },
      {
        sender: "sarthi",
        content: "What's your relationship with Mom?",
        timestamp: "2024-01-10T14:32:00Z",
      },
      {
        sender: "user",
        content: "mother",
        timestamp: "2024-01-10T14:33:00Z",
      },
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. Take your time and share what's been on your heart.",
        timestamp: "2024-01-10T14:34:00Z",
      },
      {
        sender: "user",
        content:
          "I missed my mom's birthday dinner last week. I was caught up with work and completely forgot about it. I know how much family gatherings mean to her, and I feel terrible about letting her down on such an important day.",
        timestamp: "2024-01-10T14:37:00Z",
      },
    ],
  },
  "3": {
    id: "3",
    type: "boundary" as const,
    recipient: "Alex",
    relationship: "colleague",
    date: "2024-01-08",
    message:
      "I wanted to talk about our project collaboration and set some boundaries around communication. I've noticed that work messages are coming in quite late in the evening and on weekends. I'd like to establish some guidelines so we can both maintain a healthy work-life balance.",
    template: "minimal" as const,
    senderName: "Jordan",
    senderType: "name" as const,
    deliveryMethod: "whatsapp" as const,
    deliveryDetails: {
      whatsapp: "+1987654321",
    },
    status: "sent",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "It takes courage to set boundaries. Who is this message for?",
        timestamp: "2024-01-08T16:20:00Z",
      },
      {
        sender: "user",
        content: "Alex",
        timestamp: "2024-01-08T16:21:00Z",
      },
      {
        sender: "sarthi",
        content: "What's your relationship with Alex?",
        timestamp: "2024-01-08T16:22:00Z",
      },
      {
        sender: "user",
        content: "colleague",
        timestamp: "2024-01-08T16:23:00Z",
      },
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. Take your time and share what's been on your heart.",
        timestamp: "2024-01-08T16:24:00Z",
      },
      {
        sender: "user",
        content:
          "I need to set some boundaries with Alex about work communication. They've been sending messages late at night and on weekends, and it's affecting my work-life balance. I want to address this professionally but firmly.",
        timestamp: "2024-01-08T16:27:00Z",
      },
    ],
  },
  "4": {
    id: "4",
    type: "gratitude" as const,
    recipient: "Dad",
    relationship: "father",
    date: "2024-01-05",
    message:
      "I've been thinking about all the ways you've supported my dreams over the years. From driving me to practice every weekend to believing in me when I didn't believe in myself, you've been my biggest champion. Thank you for everything you've done to help me become who I am today.",
    template: "clean-card" as const,
    senderName: "Anonymous",
    senderType: "anonymous" as const,
    deliveryMethod: "private" as const,
    deliveryDetails: {},
    status: "private",
    conversationHistory: [
      {
        sender: "sarthi",
        content: "I can feel the warmth in your heart. Who would you like to thank?",
        timestamp: "2024-01-05T11:10:00Z",
      },
      {
        sender: "user",
        content: "Dad",
        timestamp: "2024-01-05T11:11:00Z",
      },
      {
        sender: "sarthi",
        content: "What's your relationship with Dad?",
        timestamp: "2024-01-05T11:12:00Z",
      },
      {
        sender: "user",
        content: "father",
        timestamp: "2024-01-05T11:13:00Z",
      },
      {
        sender: "sarthi",
        content: "I can sense this feels important to you. Take your time and share what's been on your heart.",
        timestamp: "2024-01-05T11:14:00Z",
      },
      {
        sender: "user",
        content:
          "I've been reflecting on all the ways my dad has supported me over the years. From driving me to practice every weekend to believing in me when I didn't believe in myself, he's been my biggest champion. I want to thank him for everything he's done to help me become who I am today.",
        timestamp: "2024-01-05T11:18:00Z",
      },
    ],
  },
}

const getReflectionIcon = (type: string) => {
  switch (type) {
    case "apologize":
      return <ApologyIcon className="h-5 w-5" strokeWidth={1.5} />
    case "gratitude":
      return <Heart className="h-5 w-5" strokeWidth={1.5} />
    case "boundary":
      return <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
    default:
      return <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
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

const getDeliveryMethodLabel = (method: string) => {
  switch (method) {
    case "email":
      return "Email"
    case "whatsapp":
      return "WhatsApp"
    case "both":
      return "Email & WhatsApp"
    case "private":
      return "Kept Private"
    default:
      return "Unknown"
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
    case "private":
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      )
    default:
      return null
  }
}

export default function ReflectionPage() {
  const params = useParams()
  const router = useRouter()
  const reflectionId = params.id as string

  const reflection = reflectionData[reflectionId as keyof typeof reflectionData]

  if (!reflection) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light text-white">Reflection not found</h1>
          <p className="text-white/60">The reflection you're looking for doesn't exist.</p>
          <SarthiButton onClick={() => router.back()}>Go back</SarthiButton>
        </div>
      </div>
    )
  }

  const handleStartNewReflection = () => {
    router.push("/onboarding")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Determine the display name for the message card
  const getDisplayName = () => {
    if (reflection.senderType === "anonymous") {
      return "Anonymous"
    }
    return reflection.senderName
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60">
              {getReflectionIcon(reflection.type)}
            </div>
            <div>
              <h1 className="text-white font-medium">
                {getReflectionLabel(reflection.type)} to {reflection.recipient}
              </h1>
              <p className="text-white/60 text-sm">
                {new Date(reflection.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Reflection Details */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-medium">Reflection Details</h2>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      reflection.status === "sent"
                        ? "bg-green-500/20 text-green-400"
                        : reflection.status === "private"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {reflection.status === "sent" ? "Sent" : reflection.status === "private" ? "Private" : "Draft"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Recipient</p>
                    <p className="text-white">{reflection.recipient}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Relationship</p>
                    <p className="text-white">{reflection.relationship}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Type</p>
                    <p className="text-white">{getReflectionLabel(reflection.type)}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Template</p>
                    <p className="text-white capitalize">{reflection.template.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Sent as</p>
                    <p className="text-white">
                      {reflection.senderType === "anonymous" ? "Anonymous" : `With name (${reflection.senderName})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60">Delivery method</p>
                    <div className="flex items-center gap-2">
                      {getDeliveryMethodIcon(reflection.deliveryMethod)}
                      <p className="text-white">{getDeliveryMethodLabel(reflection.deliveryMethod)}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Details */}
                {reflection.deliveryDetails &&
                  (reflection.deliveryDetails.email || reflection.deliveryDetails.whatsapp) && (
                    <div className="border-t border-white/10 pt-4 space-y-2">
                      <p className="text-white/60 text-sm">Delivery details:</p>
                      {reflection.deliveryDetails.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-white/60" />
                          <span className="text-white/80">{reflection.deliveryDetails.email}</span>
                        </div>
                      )}
                      {reflection.deliveryDetails.whatsapp && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-white/60" />
                          <span className="text-white/80">{reflection.deliveryDetails.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-4">
              <h2 className="text-white font-medium">Your Message</h2>
              <div className="flex justify-center">
                {reflection.template === "clean-card" && (
                  <CleanCardTemplate message={reflection.message} fromName={getDisplayName()} />
                )}
                {reflection.template === "handwritten" && (
                  <HandwrittenTemplate message={reflection.message} fromName={getDisplayName()} />
                )}
                {reflection.template === "minimal" && (
                  <MinimalTemplate message={reflection.message} fromName={getDisplayName()} />
                )}
              </div>
            </div>

            {/* Conversation History */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Conversation history</h3>
              <div className="space-y-6">
                {reflection.conversationHistory?.map((message: any, index: number) => (
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
            <div className="flex justify-center pt-8 pb-8">
              <SarthiButton onClick={handleStartNewReflection}>Start new reflection</SarthiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
