"use client"

import { useState, useRef, useEffect } from "react"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SarthiOrb } from "@/components/sarthi-orb"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { RecipientAutocomplete } from "@/components/recipient-autocomplete"
import { SarthiMessageFeedback } from "@/components/sarthi-message-feedback"
import { SarthiThinking } from "@/components/sarthi-thinking"
import { Edit3, Check } from "lucide-react"
import { CountrySelector } from "@/components/ui/country-selector"
import { useRouter } from "next/navigation"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const defaultCountry: Country = { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" }
// import { CleanCardTemplate } from "@/components/message-templates/clean-card"
// import { HandwrittenTemplate } from "@/components/message-templates/handwritten"
// import { MinimalTemplate } from "@/components/message-templates/minimal"

type ChatStep =
  | "welcome"
  | "intent-selection"
  | "recipient-input"
  | "relationship-input"
  | "conversation"
  | "template-selection"
  | "delivery-modal"
  | "confirmation"
  | "closure-feeling"
  | "closure-response"
  | "closure-share"
  | "reflection"
  | "post-reflection"

type Intent = "apologize" | "gratitude" | "boundary" | null
type DeliveryMethod = "with-name" | "anonymous" | "keep-private" | null
type MessageTemplate = "clean-card" | "handwritten" | "minimal" | null
type Emotion = "neutral" | "calm" | "empathetic" | "supportive"

interface Message {
  id: string
  content: string
  sender: "user" | "sarthi"
  timestamp: Date
  emotion?: Emotion
  buttons?: Array<{
    text: string
    action: () => void
    variant?: "primary" | "secondary"
    isSelected?: boolean
  }>
  showInput?: boolean
  inputField?: {
    placeholder: string
    onSubmit: (value: string) => void
    type?: "text" | "email" | "tel"
  }
  showRecipientInput?: boolean
  isTyping?: boolean
  isRegenerating?: boolean
}

interface ConversationFlow {
  intent: Intent
  recipient: string
  exchanges: Array<{
    sarthiMessage: string
    emotion?: Emotion
    buttons?: Array<{
      text: string
      action: string
    }>
    nextStep?: string
  }>
  finalMessage: string
}

// Enhanced conversation flows with more emotional intelligence
const mockConversationFlows: Record<string, ConversationFlow> = {
  "boundary-alex": {
    intent: "boundary",
    recipient: "Alex",
    exchanges: [
      {
        sarthiMessage: "I can sense this feels important to you. What's been weighing on your heart about Alex?",
        emotion: "empathetic",
      },
      {
        sarthiMessage:
          "That sounds really heavy. I can feel how much this matters to you. It takes courage to address something like this.\n\nLet's ground this in a specific moment so Alex can understand clearly. Can you think of one recent time this happened?",
        emotion: "supportive",
      },
      {
        sarthiMessage:
          "Thank you for sharing that. What exactly did you observe in that moment? What did you see or hear Alex do?",
        emotion: "calm",
      },
      {
        sarthiMessage: "I hear you. And how did that impact you and the situation?",
        emotion: "empathetic",
      },
      {
        sarthiMessage:
          "We've crafted something really clear and fair together. Here are a couple of ways to express it. Which one feels most like you?",
        emotion: "supportive",
        buttons: [
          {
            text: "Alex, I wanted to share some feedback. During the Q3 planning session yesterday, when I was explaining the budget, I was interrupted mid-sentence. The impact was that I lost my train of thought and felt my contribution was devalued.",
            action: "select-message-1",
          },
          {
            text: "I'd like to find a way for us to collaborate better in meetings. I've noticed that sometimes I can be interrupted, and yesterday during the budget discussion was an example. To ensure my points are heard, I'd appreciate the space to finish my thoughts.",
            action: "select-message-2",
          },
        ],
        nextStep: "expression",
      },
    ],
    finalMessage:
      "Alex, I wanted to share some feedback. During the Q3 planning session yesterday, when I was explaining the budget, I was interrupted mid-sentence. The impact was that I lost my train of thought and felt my contribution was devalued.",
  },
}

// Alternative responses for regeneration
const alternativeResponses: Record<string, string[]> = {
  "intent-selection": [
    "What's on your heart today?",
    "What would you like to express today?",
    "What's been weighing on your mind?",
    "How can I help you find the right words today?",
  ],
  empathetic: [
    "I can sense this feels important to you. What's been weighing on your heart?",
    "This sounds like something that really matters to you. Tell me more about what's happening.",
    "I can feel the weight of this situation. What's been on your mind?",
    "It sounds like you're carrying something heavy. What would you like to share?",
  ],
  supportive: [
    "That sounds really heavy. I can feel how much this matters to you. It takes courage to address something like this.",
    "I hear the importance of this in your words. You're being so brave by wanting to address this.",
    "This clearly means a lot to you. It takes strength to want to have these conversations.",
    "I can sense how much thought you've put into this. You're showing real courage.",
  ],
  calm: [
    "Thank you for sharing that. What exactly did you observe in that moment?",
    "I appreciate you opening up about this. Can you walk me through what happened?",
    "That helps me understand. What specifically did you notice in that situation?",
    "Thank you for trusting me with this. What details stood out to you?",
  ],
}

// Template Card Components
const CleanCardTemplate = ({ message, fromName, isSelected, onClick }: any) => (
  <div
    onClick={() => {
      console.log("Clean card clicked")
      onClick()
    }}
    className={`cursor-pointer transition-all duration-300 ${
      isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-102"
    }`}
  >
    <div className="bg-gradient-to-br from-white to-gray-50 text-gray-800 p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed font-normal">{message}</p>
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <p className="text-sm font-medium text-gray-600">From: {fromName}</p>
          <p className="text-xs text-gray-400">Crafted with emotions • Sarthi</p>
        </div>
      </div>
    </div>
  </div>
)

const HandwrittenTemplate = ({ message, fromName, isSelected, onClick }: any) => (
  <div
    onClick={() => {
      console.log("Handwritten clicked")
      onClick()
    }}
    className={`cursor-pointer transition-all duration-300 ${
      isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-102"
    }`}
  >
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800 p-8 rounded-2xl shadow-lg max-w-md mx-auto relative overflow-hidden">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-transparent"></div>
      </div>
      <div className="relative space-y-6">
        <p className="text-lg leading-relaxed font-handwriting" style={{ fontFamily: "cursive" }}>
          {message}
        </p>
        <div className="border-t border-amber-200 pt-4 space-y-2">
          <p className="text-sm font-medium text-amber-700">From: {fromName}</p>
          <p className="text-xs text-amber-500">Crafted with emotions • Sarthi</p>
        </div>
      </div>
    </div>
  </div>
)

const MinimalTemplate = ({ message, fromName, isSelected, onClick }: any) => (
  <div
    onClick={() => {
      console.log("Minimal clicked")
      onClick()
    }}
    className={`cursor-pointer transition-all duration-300 ${
      isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-102"
    }`}
  >
    <div className="bg-gray-900 border border-gray-700 text-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <div className="space-y-6">
        <p className="text-lg leading-relaxed font-light">{message}</p>
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-sm font-medium text-gray-300">From: {fromName}</p>
          <p className="text-xs text-gray-500">Crafted with emotions • Sarthi</p>
        </div>
      </div>
    </div>
  </div>
)

export default function ChatPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<ChatStep>("welcome")
  const [intent, setIntent] = useState<Intent>(null)
  const [recipient, setRecipient] = useState("")
  const [relationship, setRelationship] = useState("") // Add this line
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [finalMessage, setFinalMessage] = useState("")
  const [editedMessage, setEditedMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(null)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null)
  const [currentFlow, setCurrentFlow] = useState<ConversationFlow | null>(null)
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [emotionalState, setEmotionalState] = useState<"neutral" | "emotional">("neutral")
  const [emailContact, setEmailContact] = useState("")
  const [whatsappContact, setWhatsappContact] = useState("")
  const [selectedIntentButton, setSelectedIntentButton] = useState<string | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [isThinking, setIsThinking] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [thinkingEmotion, setThinkingEmotion] = useState<Emotion>("neutral")
  const [userName, setUserName] = useState("") // This would come from user profile/onboarding
  const [closureFeeling, setClosureFeeling] = useState<string | null>(null)
  const [showClosureResponse, setShowClosureResponse] = useState(false)

  const router = useRouter()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if this is a new reflection request or coming from onboarding
    const urlParams = new URLSearchParams(window.location.search)
    const isNew = urlParams.get("new")
    const intentFromOnboarding = urlParams.get("intent") as Intent

    if (isNew) {
      // Reset all state for a fresh start
      setStep("welcome")
      setIntent(null)
      setRecipient("")
      setRelationship("") // Add this line
      setMessages([])
      setCurrentInput("")
      setIsTyping(false)
      setFinalMessage("")
      setEditedMessage("")
      setSelectedTemplate(null)
      setIsEditingMessage(false)
      setDeliveryMethod(null)
      setCurrentFlow(null)
      setCurrentExchangeIndex(0)
      setShowConfetti(false)
      setEmotionalState("neutral")
      setEmailContact("")
      setWhatsappContact("")
      setSelectedIntentButton(null)
      setCurrentEmotion("neutral")
      setIsThinking(false)
      setStreamingMessageId(null)
      setThinkingEmotion("neutral")

      // Clean up the URL
      window.history.replaceState({}, "", "/chat")
    } else if (intentFromOnboarding) {
      // Coming from onboarding with a selected intent
      setStep("recipient-input")
      setIntent(intentFromOnboarding)
      setSelectedIntentButton(intentFromOnboarding)

      // Clean up the URL
      window.history.replaceState({}, "", "/chat")

      // Start with the recipient selection message
      setTimeout(async () => {
        await simulateThinkingAndResponse(
          "Who is this message for?",
          "empathetic",
          undefined,
          false,
          undefined,
          true,
          1200,
          25,
        )
      }, 500)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Focus input when appropriate
    if (step === "conversation" && !isTyping && inputRef.current) {
      inputRef.current.focus()
    }
  }, [step, isTyping, messages])

  const addMessage = (
    content: string,
    sender: "user" | "sarthi",
    emotion: Emotion = "neutral",
    buttons?: Array<{ text: string; action: () => void; variant?: "primary" | "secondary"; isSelected?: boolean }>,
    showInput?: boolean,
    inputField?: { placeholder: string; onSubmit: (value: string) => void; type?: "text" | "email" | "tel" },
    showRecipientInput?: boolean,
    shouldStream = false,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      emotion,
      timestamp: new Date(),
      buttons,
      showInput,
      inputField,
      showRecipientInput,
    }

    if (sender === "sarthi" && shouldStream) {
      // Add empty message first, then stream content
      setMessages((prev) => [...prev, { ...newMessage, content: "" }])
      setStreamingMessageId(newMessage.id)
    } else {
      setMessages((prev) => [...prev, newMessage])
    }

    if (sender === "sarthi") {
      setCurrentEmotion(emotion)
    }
  }

  const handleStreamComplete = (messageId: string) => {
    setStreamingMessageId(null)
  }

  const handleMessageFeedback = async (messageId: string, type: "positive" | "negative" | "regenerate") => {
    console.log(`Feedback for message ${messageId}: ${type}`)

    if (type === "regenerate") {
      // Find the message to regenerate
      const messageIndex = messages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) return

      const messageToRegenerate = messages[messageIndex]

      // Mark message as regenerating and show thinking
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isRegenerating: true } : msg)))
      setIsThinking(true)
      setThinkingEmotion(messageToRegenerate.emotion || "neutral")

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsThinking(false)

      // Get alternative response and stream it
      let newContent = messageToRegenerate.content
      const emotion = messageToRegenerate.emotion || "neutral"

      if (alternativeResponses[emotion]) {
        const alternatives = alternativeResponses[emotion]
        const currentIndex = alternatives.findIndex((alt) => alt === messageToRegenerate.content)
        const nextIndex = (currentIndex + 1) % alternatives.length
        newContent = alternatives[nextIndex]
      } else if (step === "intent-selection" && alternativeResponses["intent-selection"]) {
        const alternatives = alternativeResponses["intent-selection"]
        const currentIndex = alternatives.findIndex((alt) => alt === messageToRegenerate.content)
        const nextIndex = (currentIndex + 1) % alternatives.length
        newContent = alternatives[nextIndex]
      } else {
        newContent =
          messageToRegenerate.content.replace(/\./g, ".") + " Let me know if you'd like to explore this differently."
      }

      // Start streaming the new content
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: "", isRegenerating: false } : msg)),
      )
      setStreamingMessageId(messageId)

      // Simulate streaming by updating content gradually
      let currentIndex = 0
      const streamInterval = setInterval(() => {
        if (currentIndex < newContent.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, content: newContent.substring(0, currentIndex + 1) } : msg,
            ),
          )
          currentIndex++
        } else {
          clearInterval(streamInterval)
          setStreamingMessageId(null)
        }
      }, 25)
    }

    // In a real app, you would send this feedback to your analytics/improvement system
    // For now, we'll just log it
    if (type !== "regenerate") {
      console.log(`User ${type === "positive" ? "liked" : "disliked"} message: ${messageId}`)
    }
  }

  const simulateThinkingAndResponse = async (
    content: string,
    emotion: Emotion = "neutral",
    buttons?: Array<{ text: string; action: () => void; variant?: "primary" | "secondary"; isSelected?: boolean }>,
    showInput?: boolean,
    inputField?: { placeholder: string; onSubmit: (value: string) => void; type?: "text" | "email" | "tel" },
    showRecipientInput?: boolean,
    thinkingDuration = 1500,
    streamSpeed = 25,
  ) => {
    // Show thinking state
    setIsThinking(true)
    setThinkingEmotion(emotion)

    // Wait for thinking duration
    await new Promise((resolve) => setTimeout(resolve, thinkingDuration))

    // Hide thinking and start streaming response
    setIsThinking(false)

    // Create message with empty content first
    const messageId = Date.now().toString()
    const newMessage: Message = {
      id: messageId,
      content: "",
      sender: "sarthi",
      emotion,
      timestamp: new Date(),
      buttons,
      showInput,
      inputField,
      showRecipientInput,
    }

    setMessages((prev) => [...prev, newMessage])
    setStreamingMessageId(messageId)
    setCurrentEmotion(emotion)

    // Stream the content character by character
    let currentIndex = 0
    const streamInterval = setInterval(() => {
      if (currentIndex < content.length) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: content.substring(0, currentIndex + 1) } : msg)),
        )
        currentIndex++
      } else {
        clearInterval(streamInterval)
        setStreamingMessageId(null)
      }
    }, streamSpeed)
  }

  const handleWelcomeStart = async () => {
    setStep("intent-selection")
    // Don't show the old button-style message, go directly to the card selection
  }

  const handleIntentSelection = async (selectedIntent: Intent) => {
    setIntent(selectedIntent)
    setSelectedIntentButton(selectedIntent || "")

    const intentMessages = {
      apologize: "Apologize",
      gratitude: "Express gratitude",
      boundary: "Set a boundary / give feedback",
    }

    if (selectedIntent) {
      // Add user's selection as a message
      addMessage(intentMessages[selectedIntent], "user")
      await simulateThinkingAndResponse(
        "Who is this message for?",
        "empathetic",
        undefined,
        false,
        undefined,
        true,
        1200,
        25,
      )
      setStep("recipient-input")
    }
  }

  const handleRecipientSubmit = async (recipientName: string) => {
    if (!recipientName.trim()) return

    setRecipient(recipientName)
    addMessage(recipientName, "user")

    // Remove the recipient input field
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.showRecipientInput) {
          return { ...msg, showRecipientInput: false }
        }
        return msg
      }),
    )

    // Move to relationship input step
    setStep("relationship-input")
    await simulateThinkingAndResponse(
      "What's your relationship with them?",
      "calm",
      undefined,
      false,
      undefined,
      false,
      1000,
      25,
    )
  }

  const handleRelationshipSubmit = async (relationshipValue: string) => {
    setRelationship(relationshipValue)

    if (relationshipValue.trim()) {
      addMessage(relationshipValue, "user")
    } else {
      addMessage("I'd prefer not to specify", "user")
    }

    const intentLabels = {
      apologize: "Apology",
      gratitude: "Gratitude",
      boundary: "Feedback",
    }

    const emotionalConfirmation = relationship
      ? `${intentLabels[intent!]} to ${recipient} (${relationshipValue})`
      : `${intentLabels[intent!]} to ${recipient}`

    await simulateThinkingAndResponse(emotionalConfirmation, "calm", undefined, false, undefined, false, 1000, 30)

    // Start conversation flow
    const flowKey = `${intent}-${recipient.toLowerCase()}`
    const flow = mockConversationFlows[flowKey]

    if (flow) {
      setCurrentFlow(flow)
      setCurrentExchangeIndex(0)
      const emotion = flow.exchanges[0].emotion || "neutral"
      await simulateThinkingAndResponse(
        flow.exchanges[0].sarthiMessage,
        emotion,
        undefined,
        true,
        undefined,
        false,
        1500,
        25,
      )
    } else {
      await simulateThinkingAndResponse(
        "I can sense this feels important to you. Take your time and share what's been on your heart.",
        "empathetic",
        undefined,
        true,
        undefined,
        false,
        1400,
        25,
      )
    }
    setStep("conversation")
  }

  const handleSkipRelationship = () => {
    handleRelationshipSubmit("")
  }

  const handleEditMessage = () => {
    setIsEditingMessage(true)
    setEditedMessage(finalMessage)
  }

  const handleSaveEditedMessage = () => {
    setFinalMessage(editedMessage)
    setIsEditingMessage(false)
  }

  const handleCancelEdit = () => {
    setIsEditingMessage(false)
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    console.log("Template selected:", template)
    setSelectedTemplate(template)
  }

  const handleContinueWithTemplate = () => {
    console.log("Continue with template clicked, selectedTemplate:", selectedTemplate)
    // Move to delivery step
    setStep("delivery-modal")
  }

  const handleChatInput = async (input: string) => {
    if (!input.trim()) return

    addMessage(input, "user")

    // Build the final message based on collected information
    const generatedMessage = generateMessageFromInput(input)
    setFinalMessage(generatedMessage)
    setEditedMessage(generatedMessage)

    // Instead of complex flow, go directly to template selection
    await simulateThinkingAndResponse(
      "Perfect. I've crafted your message. Let me show you how it could look.",
      "supportive",
      undefined,
      false,
      undefined,
      false,
      1400,
      25,
    )

    setTimeout(() => {
      setStep("template-selection")
    }, 2000)
  }

  // Add this helper function to generate messages based on intent and input
  const generateMessageFromInput = (userInput: string) => {
    const intentTemplates = {
      apologize: `${recipient}, I wanted to reach out about something that's been on my mind. ${userInput} I value our ${relationship || "relationship"} and wanted to address this directly with you.`,
      gratitude: `${recipient}, I wanted to take a moment to express my heartfelt gratitude. ${userInput} Your ${relationship ? `support as my ${relationship}` : "support"} has meant so much to me.`,
      boundary: `${recipient}, I wanted to share some feedback with you. ${userInput} I hope we can work together to improve our ${relationship ? `${relationship} relationship` : "communication"} going forward.`,
    }

    return intentTemplates[intent!] || userInput
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const isValidPhone = (phone: string) => {
    return /^\d{7,15}$/.test(phone.trim())
  }

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Email address is required"
    }
    if (!isValidEmail(email)) {
      return "Please enter a valid email address"
    }
    return ""
  }

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return "Phone number is required"
    }
    if (!isValidPhone(phone)) {
      return "Please enter a valid phone number (7-15 digits)"
    }
    return ""
  }

  const getDeliveryMethods = () => {
    const methods = []
    if (emailContact && emailContact !== "placeholder@email.com") methods.push("email")
    if (phoneNumber) methods.push("WhatsApp")
    return methods.join(" and ")
  }

  // Auto-transition from the confirmation screen to the closure flow
  useEffect(() => {
    if (step !== "confirmation") return
    const timer = setTimeout(() => setStep("closure-feeling"), 3000)
    return () => clearTimeout(timer)
  }, [step])

  // NEW: Relationship Input Step
  if (step === "relationship-input") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <SidebarTrigger className="text-white/60 hover:text-white" />
                <div className="flex-1 text-center">
                  <h1 className="text-lg font-normal text-white/90">Your relationship</h1>
                </div>
                <div className="w-10"></div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-8">
                {isThinking && (
                  <SarthiThinking emotion={thinkingEmotion} onComplete={() => setIsThinking(false)} duration={1500} />
                )}
                <div className="space-y-8">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`message-bubble ${message.sender === "user" ? "user flex justify-end" : ""}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`${message.sender === "user" ? "flex flex-col items-end" : "flex items-start gap-4"}`}
                      >
                        {message.sender === "sarthi" && (
                          <div className="mt-1">
                            <SarthiOrb
                              emotion={message.emotion || "neutral"}
                              size="sm"
                              isTyping={message.isRegenerating || streamingMessageId === message.id}
                            />
                          </div>
                        )}

                        <div>
                          <div
                            className={`max-w-[85%] message-bubble-content ${
                              message.sender === "user" ? "message-bubble-user" : "message-bubble-sarthi"
                            } px-6 py-5 shadow-lg`}
                          >
                            <p className="text-white text-lg leading-relaxed whitespace-pre-line font-normal">
                              {message.content}
                              {streamingMessageId === message.id && (
                                <span className="animate-pulse text-white/60 ml-1">|</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Relationship Input Form */}
                  {!isThinking && (
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <SarthiOrb emotion="calm" size="sm" />
                      </div>
                      <div className="flex-1 max-w-[85%]">
                        <div className="message-bubble-content message-bubble-sarthi px-6 py-5 shadow-lg">
                          <div className="space-y-4">
                            <p className="text-white text-lg leading-relaxed">
                              This helps me understand the context better.
                            </p>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                const input = e.currentTarget.elements.namedItem("relationship") as HTMLInputElement
                                handleRelationshipSubmit(input.value)
                              }}
                              className="space-y-4"
                            >
                              <SarthiInput
                                name="relationship"
                                type="text"
                                placeholder="Your relationship (e.g., sister, friend, manager)"
                                className="text-lg py-4"
                                autoFocus
                              />
                              <div className="flex gap-3">
                                <SarthiButton type="submit" className="flex-1">
                                  Continue
                                </SarthiButton>
                                <SarthiButton
                                  type="button"
                                  variant="secondary"
                                  onClick={handleSkipRelationship}
                                  className="px-6"
                                >
                                  Skip
                                </SarthiButton>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Template Selection Step
  if (step === "template-selection") {
    const displayName = deliveryMethod === "anonymous" ? "Anonymous" : userName || "Your name"

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <SidebarTrigger className="text-white/60 hover:text-white" />
                <div className="flex-1 text-center">
                  <h1 className="text-lg font-normal text-white/90">Choose your message style</h1>
                </div>
                <div className="w-10"></div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-light text-white">How would you like this to look?</h2>
                  <p className="text-white/60">Choose a style that feels right for your message</p>
                </div>

                {/* Message Editor */}
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Your message</h3>
                    <button
                      onClick={handleEditMessage}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </div>

                  {isEditingMessage ? (
                    <div className="space-y-4">
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        className="w-full bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-4 text-white resize-none focus:border-white/20 focus:outline-none"
                        rows={6}
                      />
                      <div className="flex gap-3">
                        <SarthiButton onClick={handleSaveEditedMessage} className="flex items-center gap-2">
                          <Check size={16} />
                          Save changes
                        </SarthiButton>
                        <SarthiButton variant="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </SarthiButton>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-4">
                      <p className="text-white leading-relaxed">{editedMessage}</p>
                    </div>
                  )}
                </div>

                {/* Template Options */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-center text-white font-medium">Clean & Modern</h4>
                    <CleanCardTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "clean-card"}
                      onClick={() => {
                        console.log("Clean card clicked")
                        handleTemplateSelect("clean-card")
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-center text-white font-medium">Handwritten Note</h4>
                    <HandwrittenTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "handwritten"}
                      onClick={() => {
                        console.log("Handwritten clicked")
                        handleTemplateSelect("handwritten")
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-center text-white font-medium">Minimal Dark</h4>
                    <MinimalTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "minimal"}
                      onClick={() => {
                        console.log("Minimal clicked")
                        handleTemplateSelect("minimal")
                      }}
                    />
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="text-center">
                    <SarthiButton
                      onClick={() => {
                        console.log("Button clicked, selectedTemplate:", selectedTemplate)
                        handleContinueWithTemplate()
                      }}
                      className="px-8 py-4"
                    >
                      Continue with this style
                    </SarthiButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Delivery Step - Enhanced with country selector and validation
  if (step === "delivery-modal") {
    const canSendMessage = () => {
      const hasValidEmail = emailContact && emailContact !== "placeholder@email.com" && !emailError
      const hasValidPhone = phoneNumber && !phoneError
      return hasValidEmail || hasValidPhone
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <SidebarTrigger className="text-white/60 hover:text-white" />
                <div className="flex-1 text-center">
                  <h1 className="text-lg font-normal text-white/90">How should we send this?</h1>
                </div>
                <div className="w-10"></div>
              </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-light text-white">Choose delivery method</h2>
                  <p className="text-white/60">How would you like to send your message?</p>
                </div>

                <div className="space-y-6">
                  {/* Send to Someone Section */}
                  <div className="space-y-4">
                    <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider">Send to {recipient}</h3>

                    <div className="sarthi-card p-6 space-y-6">
                      {/* Email Option */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-white text-lg font-medium flex items-center gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white/60"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-10 5L2 7" />
                            </svg>
                            Email
                          </label>
                          <input
                            type="checkbox"
                            checked={!!emailContact}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEmailContact("placeholder@email.com")
                                setEmailError("")
                              } else {
                                setEmailContact("")
                                setEmailError("")
                              }
                            }}
                            className="h-5 w-5 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
                          />
                        </div>
                        {emailContact && (
                          <div className="space-y-2">
                            <SarthiInput
                              type="email"
                              placeholder="Enter recipient's email"
                              value={emailContact === "placeholder@email.com" ? "" : emailContact}
                              onChange={(e) => {
                                const value = e.target.value
                                setEmailContact(value)
                                if (value) {
                                  setEmailError(validateEmail(value))
                                } else {
                                  setEmailError("")
                                }
                              }}
                              className={`w-full ${emailError ? "border-red-500" : ""}`}
                              autoFocus
                            />
                            {emailError && <div className="text-red-400 text-sm">{emailError}</div>}
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10"></div>

                      {/* WhatsApp Option */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-white text-lg font-medium flex items-center gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white/60"
                            >
                              <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                              <circle cx="12" cy="12" r="4" />
                            </svg>
                            WhatsApp
                          </label>
                          <input
                            type="checkbox"
                            checked={!!whatsappContact}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWhatsappContact("placeholder-phone")
                                setPhoneError("")
                              } else {
                                setWhatsappContact("")
                                setPhoneNumber("")
                                setPhoneError("")
                              }
                            }}
                            className="h-5 w-5 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
                          />
                        </div>
                        {whatsappContact && (
                          <div className="space-y-2">
                            <CountrySelector
                              selectedCountry={selectedCountry}
                              onCountrySelect={setSelectedCountry}
                              phoneNumber={phoneNumber}
                              onPhoneNumberChange={(phone) => {
                                setPhoneNumber(phone)
                                setWhatsappContact(`${selectedCountry.dialCode}${phone}`)
                                if (phone) {
                                  setPhoneError(validatePhone(phone))
                                } else {
                                  setPhoneError("")
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && canSendMessage()) {
                                  setStep("confirmation")
                                }
                              }}
                            />
                            {phoneError && <div className="text-red-400 text-sm">{phoneError}</div>}
                          </div>
                        )}
                      </div>

                      {/* Send Button - only show when at least one valid contact method is filled */}
                      {canSendMessage() && (
                        <div className="pt-4 border-t border-white/10">
                          <SarthiButton onClick={() => setStep("confirmation")} className="w-full py-4 text-lg">
                            Send Message
                            {emailContact &&
                            phoneNumber &&
                            emailContact !== "placeholder@email.com" &&
                            !emailError &&
                            !phoneError
                              ? " via Email & WhatsApp"
                              : emailContact && emailContact !== "placeholder@email.com" && !emailError
                                ? " via Email"
                                : " via WhatsApp"}
                          </SarthiButton>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#121212] px-4 text-white/40 text-sm">or</span>
                    </div>
                  </div>

                  {/* Keep Private Section */}
                  <div className="space-y-4">
                    <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider">Personal Reflection</h3>

                    <button
                      onClick={() => {
                        setDeliveryMethod("keep-private")
                        setStep("confirmation")
                      }}
                      className="w-full sarthi-card p-6 text-left hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white/80"
                            >
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <circle cx="12" cy="16" r="1" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-white text-lg font-medium mb-1">Keep it private</div>
                            <div className="text-white/60 text-sm">Save this reflection for yourself</div>
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/40 group-hover:text-white/60 transition-colors"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Also update the confirmation screen to auto-transition to closure:

  if (step === "confirmation") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Confetti animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-white/10 rounded-full confetti-burst"></div>
                </div>
              </div>
            )}

            <div className="text-center space-y-8 z-10 sarthi-fade-in">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <SarthiIcon size="lg" />
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-light text-white">
                  {deliveryMethod === "keep-private"
                    ? "Your reflection has been saved."
                    : `Your message has been sent${emailContact && whatsappContact ? " via " + getDeliveryMethods() : ""}.`}
                </h1>
                <p className="text-white/60 text-xl max-w-md mx-auto leading-relaxed">
                  You took a courageous step today.
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Closure Feeling Check-in Step
  if (step === "closure-feeling") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 sarthi-fade-in">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-light text-white">You did something brave today.</h1>
                <p className="text-white/60 text-xl">Thank you for trusting me with your words. How do you feel now?</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: "lighter", label: "I feel lighter" },
                  { id: "same", label: "I feel the same" },
                  { id: "clear", label: "I feel more clear" },
                  { id: "stuck", label: "I feel more stuck" },
                  { id: "unsure", label: "I'm not sure yet" },
                ].map((feeling) => (
                  <SarthiButton
                    key={feeling.id}
                    onClick={() => {
                      setClosureFeeling(feeling.id)
                      setTimeout(() => {
                        setShowClosureResponse(true)
                        setStep("closure-response")
                      }, 500)
                    }}
                    variant="secondary"
                    className="w-full py-4 text-lg font-normal hover:bg-white/10 transition-all"
                  >
                    {feeling.label}
                  </SarthiButton>
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Closure Response Step
  if (step === "closure-response") {
    const getResponseMessage = () => {
      switch (closureFeeling) {
        case "lighter":
        case "clear":
          return "I'm really glad I could help you feel that way. If you'd like, you can share this feeling with someone else — or just carry it with you quietly. It's your moment."
        case "same":
          return "Thank you for telling me. Sometimes reflection takes time. I'm always here when you're ready to try again."
        case "stuck":
          return "Thank you for telling me. This can be hard work — and it's okay to feel that way. I'm here whenever you want to try again or see things differently."
        case "unsure":
          return "That's completely okay. Reflection can take time to settle. Take it slow — I'm here whenever you want to talk again."
        default:
          return ""
      }
    }

    const showShareOption = closureFeeling === "lighter" || closureFeeling === "clear"

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 sarthi-fade-in">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <SarthiIcon size="md" />
                </div>

                <p className="text-white/90 text-xl leading-relaxed">{getResponseMessage()}</p>
              </div>

              <div className="space-y-4">
                {showShareOption && (
                  <SarthiButton onClick={() => setStep("closure-share")} className="w-full py-4 text-lg">
                    Share how I feel
                  </SarthiButton>
                )}

                <SarthiButton
                  onClick={() => {
                    // Reset all state for a fresh start
                    setStep("intent-selection")
                    setIntent(null)
                    setRecipient("")
                    setRelationship("")
                    setMessages([])
                    setCurrentInput("")
                    setIsTyping(false)
                    setFinalMessage("")
                    setEditedMessage("")
                    setSelectedTemplate(null)
                    setIsEditingMessage(false)
                    setDeliveryMethod(null)
                    setCurrentFlow(null)
                    setCurrentExchangeIndex(0)
                    setShowConfetti(false)
                    setEmotionalState("neutral")
                    setEmailContact("")
                    setWhatsappContact("")
                    setSelectedIntentButton(null)
                    setCurrentEmotion("neutral")
                    setIsThinking(false)
                    setStreamingMessageId(null)
                    setThinkingEmotion("neutral")
                    setClosureFeeling(null)
                    setShowClosureResponse(false)
                    setPhoneNumber("")
                    setEmailError("")
                    setPhoneError("")
                  }}
                  variant="secondary"
                  className="w-full py-4 text-lg"
                >
                  Start new reflection
                </SarthiButton>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Closure Share Step
  if (step === "closure-share") {
    const shareMessage = `I just completed a meaningful reflection with Sarthi and I'm feeling ${closureFeeling === "lighter" ? "lighter" : "more clear"}. Sometimes taking a moment to express what's on your heart can make all the difference. 💙`

    const handleShare = (method: string) => {
      switch (method) {
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank")
          break
        case "email":
          window.open(`mailto:?subject=A moment of reflection&body=${encodeURIComponent(shareMessage)}`, "_blank")
          break
        case "copy":
          navigator.clipboard.writeText(shareMessage)
          break
      }

      // Show completion step
      setTimeout(() => {
        setStep("post-reflection")
      }, 500)
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 sarthi-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-light text-white">Who would you like to share this with?</h2>
              </div>

              <div className="space-y-4">
                <SarthiButton
                  onClick={() => handleShare("whatsapp")}
                  variant="secondary"
                  className="w-full py-4 text-lg flex items-center justify-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  Share via WhatsApp
                </SarthiButton>

                <SarthiButton
                  onClick={() => handleShare("email")}
                  variant="secondary"
                  className="w-full py-4 text-lg flex items-center justify-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-10 5L2 7" />
                  </svg>
                  Share via Email
                </SarthiButton>

                <SarthiButton
                  onClick={() => handleShare("copy")}
                  variant="secondary"
                  className="w-full py-4 text-lg flex items-center justify-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy Link
                </SarthiButton>
              </div>

              <div className="space-y-4">
                <SarthiButton
                  onClick={() => {
                    // Go to the same completion step as sharing
                    setTimeout(() => {
                      setStep("post-reflection")
                    }, 500)
                  }}
                  variant="secondary"
                  className="w-full py-4 text-lg"
                >
                  Skip sharing
                </SarthiButton>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // NEW: Post-Reflection Completion Step
  if (step === "post-reflection") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 sarthi-fade-in">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <SarthiIcon size="lg" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl font-light text-white">You've completed your reflection.</h1>
                  <p className="text-white/60 text-xl leading-relaxed">
                    Take a moment to appreciate what you've accomplished today. Your courage to reflect and express
                    yourself matters.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <SarthiButton
                  onClick={() => {
                    // Reset all state for a fresh start
                    setStep("intent-selection")
                    setIntent(null)
                    setRecipient("")
                    setRelationship("")
                    setMessages([])
                    setCurrentInput("")
                    setIsTyping(false)
                    setFinalMessage("")
                    setEditedMessage("")
                    setSelectedTemplate(null)
                    setIsEditingMessage(false)
                    setDeliveryMethod(null)
                    setCurrentFlow(null)
                    setCurrentExchangeIndex(0)
                    setShowConfetti(false)
                    setEmotionalState("neutral")
                    setEmailContact("")
                    setWhatsappContact("")
                    setSelectedIntentButton(null)
                    setCurrentEmotion("neutral")
                    setIsThinking(false)
                    setStreamingMessageId(null)
                    setThinkingEmotion("neutral")
                    setClosureFeeling(null)
                    setShowClosureResponse(false)
                    setPhoneNumber("")
                    setEmailError("")
                    setPhoneError("")
                  }}
                  className="w-full py-4 text-lg"
                >
                  Start another reflection
                </SarthiButton>
              </div>

              <div className="text-center text-sm text-white/40">
                <p>Remember: growth happens one reflection at a time.</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Main Chat Interface (rest of the component remains the same...)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#121212] flex flex-col">
          {/* Header */}
          <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <SidebarTrigger className="text-white/60 hover:text-white" />
              <div className="flex-1 text-center">
                <h1 className="text-lg font-normal text-white/90">
                  {step === "intent-selection" && "What's on your heart?"}
                  {step === "recipient-input" && "Who is this for?"}
                  {step === "relationship-input" && "Your relationship"}
                  {step === "conversation" && recipient && `Conversation with ${recipient}`}
                  {step === "reflection" && "Reflection"}
                </h1>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              {isThinking && (
                <SarthiThinking emotion={thinkingEmotion} onComplete={() => setIsThinking(false)} duration={1500} />
              )}
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`message-bubble ${message.sender === "user" ? "user flex justify-end" : ""}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`${message.sender === "user" ? "flex flex-col items-end" : "flex items-start gap-4"}`}
                    >
                      {message.sender === "sarthi" && (
                        <div className="mt-1">
                          <SarthiOrb
                            emotion={message.emotion || "neutral"}
                            size="sm"
                            isTyping={message.isRegenerating || streamingMessageId === message.id}
                          />
                        </div>
                      )}

                      <div>
                        <div
                          className={`max-w-[85%] message-bubble-content ${
                            message.sender === "user" ? "message-bubble-user" : "message-bubble-sarthi"
                          } px-6 py-5 shadow-lg`}
                        >
                          {/* Replace the existing streaming text section with this */}
                          <p className="text-white text-lg leading-relaxed whitespace-pre-line font-normal">
                            {message.content}
                            {streamingMessageId === message.id && (
                              <span className="animate-pulse text-white/60 ml-1">|</span>
                            )}
                          </p>

                          {message.buttons && streamingMessageId !== message.id && (
                            <div className="mt-6 space-y-3">
                              {message.buttons.map((button, index) => (
                                <SarthiButton
                                  key={index}
                                  onClick={button.action}
                                  variant={button.variant || "secondary"}
                                  className={`w-full text-left justify-start text-base py-4 transition-all font-normal ${
                                    button.isSelected ? "bg-white/10 border-white/20 text-white" : ""
                                  }`}
                                >
                                  {button.text}
                                </SarthiButton>
                              ))}
                            </div>
                          )}

                          {message.inputField && streamingMessageId !== message.id && (
                            <div className="mt-6">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  const input = e.currentTarget.elements.namedItem("input") as HTMLInputElement
                                  message.inputField!.onSubmit(input.value)
                                  input.value = ""
                                }}
                                className="flex gap-3"
                              >
                                <SarthiInput
                                  name="input"
                                  type={message.inputField.type || "text"}
                                  placeholder={message.inputField.placeholder}
                                  className="flex-1 text-lg py-4"
                                />
                                <SarthiButton type="submit" className="px-6">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="m22 2-7 20-4-9-9-4Z" />
                                    <path d="M22 2 11 13" />
                                  </svg>
                                </SarthiButton>
                              </form>
                            </div>
                          )}

                          {message.showRecipientInput && streamingMessageId !== message.id && (
                            <div className="mt-6">
                              <RecipientAutocomplete onSubmit={handleRecipientSubmit} />
                            </div>
                          )}

                          {/* Add feedback component for Sarthi messages */}
                          {message.sender === "sarthi" &&
                            !message.buttons &&
                            !message.inputField &&
                            !message.showRecipientInput && (
                              <SarthiMessageFeedback messageId={message.id} onFeedback={handleMessageFeedback} />
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="message-bubble flex items-start gap-4">
                    <div className="mt-1">
                      <SarthiOrb isTyping={true} emotion={currentEmotion} size="sm" />
                    </div>
                    <div className="message-bubble-content message-bubble-sarthi typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area */}
          {step === "conversation" &&
            !isTyping &&
            messages.length > 0 &&
            !messages[messages.length - 1]?.buttons &&
            !messages[messages.length - 1]?.inputField &&
            !messages[messages.length - 1]?.showRecipientInput && (
              <div className="border-t border-white/5 backdrop-blur-sm bg-black/20 p-4">
                <div className="max-w-4xl mx-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleChatInput(currentInput)
                      setCurrentInput("")
                    }}
                    className="flex gap-4"
                  >
                    <SarthiInput
                      ref={inputRef}
                      className={`flex-1 text-lg py-4 ${emotionalState === "emotional" ? "emotional-glow" : ""}`}
                      placeholder="Type your thoughts..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                    />
                    <SarthiButton type="submit" className="px-6 py-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </SarthiButton>
                  </form>
                </div>
              </div>
            )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
