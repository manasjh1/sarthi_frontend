"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { SarthiOrb } from "@/components/sarthi-orb"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiThinking } from "@/components/sarthi-thinking"
import { Edit3, Check, ArrowLeft, RotateCcw } from "lucide-react"
import { CleanCardTemplate } from "@/components/message-templates/clean-card"
import { HandwrittenTemplate } from "@/components/message-templates/handwritten"
import { MinimalTemplate } from "@/components/message-templates/minimal"
import { CountrySelector } from "@/components/ui/country-selector"
import { RecipientAutocomplete } from "@/components/recipient-autocomplete"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const defaultCountry: Country = { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" }

type ChatStep =
  | "greeting"
  | "situation"
  | "feelings"
  | "impact"
  | "responsibility"
  | "commitment"
  | "closure-share"
  | "post-reflection"
  | "intent-selection"
  | "recipient-input"
  | "relationship-input"
  | "conversation"
  | "template-selection"
  | "sender-selection"
  | "delivery-modal"
  | "confirmation"
  | "closure-feeling"
  | "closure-response"
  | "share-feeling"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  step?: ChatStep
  showFeedback?: boolean
  isRegenerating?: boolean
  emotion?: Emotion
  timestamp?: Date
  buttons?: Array<{ text: string; action: () => void; variant?: "primary" | "secondary"; isSelected?: boolean }>
  showInput?: boolean
  inputField?: { placeholder: string; onSubmit: (value: string) => void; type?: "text" | "email" | "tel" }
  showRecipientInput?: boolean
}

type Intent = "apologize" | "gratitude" | "boundary" | null
type MessageTemplate = "clean-card" | "handwritten" | "minimal"
type DeliveryMethod = "email" | "whatsapp" | "anonymous" | "keep-private" | null
type ConversationFlow = {
  exchanges: {
    sarthiMessage: string
    userOptions?: string[]
    emotion?: Emotion
  }[]
}
type Emotion = "neutral" | "empathetic" | "calm" | "supportive"

const alternativeResponses: { [key: string]: string[] } = {
  empathetic: [
    "I understand this is difficult. Let's explore this further.",
    "It's okay to feel this way. What else is on your mind?",
    "I'm here to listen. Tell me more about what happened.",
  ],
  calm: [
    "Let's take a deep breath and think this through.",
    "It's important to stay calm in these situations. What are your options?",
    "I'm here to help you find a solution. Let's start by...",
  ],
  supportive: [
    "You're doing great. Keep going!",
    "I believe in you. You can get through this.",
    "I'm here to support you every step of the way.",
  ],
  "intent-selection": [
    "I'm here to help you find the right words. What's on your mind today?",
    "Let's start by identifying the intent of your message.",
    "What do you want to achieve with this message?",
  ],
}

const mockConversationFlows: { [key: string]: ConversationFlow } = {
  "apologize-john": {
    exchanges: [
      {
        sarthiMessage:
          "I understand you want to apologize to John. What specific actions or words are you apologizing for?",
        userOptions: ["My tone", "Being late", "Not listening"],
        emotion: "empathetic",
      },
      {
        sarthiMessage: "Okay, let's focus on your tone. How did your tone affect John?",
        userOptions: ["Made him feel disrespected", "Made him feel unheard", "Made him angry"],
        emotion: "calm",
      },
      {
        sarthiMessage:
          "I see. It's important to acknowledge the impact of your tone. What would you like to say to John to show you understand?",
        userOptions: ["I'm sorry for my tone", "I didn't mean to disrespect you", "I'll be more mindful in the future"],
        emotion: "supportive",
      },
    ],
  },
}

const stepQuestions = {
  greeting:
    "Hi there! I'm Sarthi, and I'm here to help you reflect and find the right words. What's on your mind today?",
  situation: "Can you tell me more about what happened? I'd like to understand the situation better.",
  feelings: "How are you feeling about this situation? It's okay to take your time.",
  impact: "How do you think this situation has affected you or others involved?",
  responsibility:
    "What role do you feel you played in this situation? Remember, this is a safe space for honest reflection.",
  commitment:
    "What would you like to do differently moving forward? What commitment would you like to make to yourself?",
  "closure-share":
    "You've done some meaningful reflection today. Would you like to share your thoughts with someone or keep them private for now?",
}

// Alternative message templates for regeneration
const messageTemplates = {
  apologize: [
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I wanted to reach out about something that's been on my mind. ${userInput} I value our ${relationship || "relationship"} and wanted to address this directly with you.`,
    (recipient: string, userInput: string, relationship: string) =>
      `Dear ${recipient}, I've been reflecting on our recent interaction and I owe you an apology. ${userInput} Your ${relationship ? `role as my ${relationship}` : "presence in my life"} means a lot to me, and I want to make things right.`,
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I need to apologize for something. ${userInput} I respect you and our ${relationship || "relationship"} too much to let this go unaddressed.`,
  ],
  gratitude: [
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I wanted to take a moment to express my heartfelt gratitude. ${userInput} Your ${relationship ? `support as my ${relationship}` : "support"} has meant so much to me.`,
    (recipient: string, userInput: string, relationship: string) =>
      `Dear ${recipient}, I've been thinking about how grateful I am for you. ${userInput} Having you as my ${relationship || "friend"} has made such a difference in my life.`,
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I wanted to share something with you. ${userInput} I'm so thankful for our ${relationship || "connection"} and everything you bring to my life.`,
  ],
  boundary: [
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I wanted to share some feedback with you. ${userInput} I hope we can work together to improve our ${relationship ? `${relationship} relationship` : "communication"} going forward.`,
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I'd like to discuss something important with you. ${userInput} I value our ${relationship || "relationship"} and believe open communication will help us both.`,
    (recipient: string, userInput: string, relationship: string) =>
      `${recipient}, I need to share something that's been on my mind. ${userInput} I hope we can find a way to move forward that works for both of us in our ${relationship || "relationship"}.`,
  ],
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState<ChatStep>("intent-selection")
  const [isThinking, setIsThinking] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [intent, setIntent] = useState<Intent>(null)
  const [recipient, setRecipient] = useState("")
  const [relationship, setRelationship] = useState("")
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [thinkingEmotion, setThinkingEmotion] = useState<Emotion>("neutral")
  const [userName, setUserName] = useState("")
  const [closureFeeling, setClosureFeeling] = useState<string | null>(null)
  const [showClosureResponse, setShowClosureResponse] = useState(false)
  const [senderType, setSenderType] = useState<"name" | "anonymous" | null>(null)
  const [senderName, setSenderName] = useState("")
  const [userInputForMessage, setUserInputForMessage] = useState("")
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [isRegeneratingMessage, setIsRegeneratingMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check if this is a new conversation or has intent from onboarding
    const intentParam = searchParams.get("intent")
    const isNew = searchParams.get("new")

    console.log("Intent param:", intentParam, "Current intent:", intent, "Messages length:", messages.length)

    // Only run this effect once when the component mounts
    if (intentParam && messages.length === 0 && !intent) {
      // Coming from onboarding with specific intent
      setIntent(intentParam as Intent)
      setCurrentStep("recipient-input")

      const intentMessages = {
        apologize: "I can sense this feels important to you. Who is this apology for?",
        gratitude: "I can feel the warmth in your heart. Who would you like to thank?",
        boundary: "It takes courage to set boundaries. Who is this message for?",
      }

      const initialMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: intentMessages[intentParam as Intent] || "Who is this message for?",
        emotion: "empathetic",
        showRecipientInput: true,
      }
      setMessages([initialMessage])
    } else if (
      (isNew === "true" || (messages.length === 0 && currentStep === "intent-selection")) &&
      !intentParam &&
      !intent
    ) {
      // Start with intent selection only if no messages exist and no intent is set
      console.log("Setting to intent selection")
      setCurrentStep("intent-selection")
      setMessages([])
    }
  }, [searchParams, messages.length, intent, currentStep]) // Add all dependencies

  useEffect(() => {
    // Focus input when appropriate
    if (currentStep === "conversation" && !isTyping && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentStep, isTyping])

  useEffect(() => {
    if (currentStep === "confirmation") {
      const timer = setTimeout(() => setCurrentStep("closure-feeling"), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

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
      role: sender === "user" ? "user" : "assistant",
      emotion,
      timestamp: new Date(),
      buttons,
      showInput,
      inputField,
      showRecipientInput,
    }

    if (sender === "sarthi" && shouldStream) {
      setMessages((prev) => [...prev, { ...newMessage, content: "" }])
      setStreamingMessageId(newMessage.id)
    } else {
      setMessages((prev) => [...prev, newMessage])
    }

    if (sender === "sarthi") {
      setCurrentEmotion(emotion)
    }
  }

  const handleMessageFeedback = async (messageId: string, type: "positive" | "negative" | "regenerate") => {
    console.log(`Feedback for message ${messageId}: ${type}`)

    if (type === "regenerate") {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) return

      const messageToRegenerate = messages[messageIndex]

      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isRegenerating: true } : msg)))
      setIsThinking(true)
      setThinkingEmotion(messageToRegenerate.emotion || "neutral")

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsThinking(false)

      let newContent = messageToRegenerate.content
      const emotion = messageToRegenerate.emotion || "neutral"

      if (alternativeResponses[emotion]) {
        const alternatives = alternativeResponses[emotion]
        const currentIndex = alternatives.findIndex((alt) => alt === messageToRegenerate.content)
        const nextIndex = (currentIndex + 1) % alternatives.length
        newContent = alternatives[nextIndex]
      } else {
        newContent = messageToRegenerate.content + " Let me know if you'd like to explore this differently."
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: "", isRegenerating: false } : msg)),
      )
      setStreamingMessageId(messageId)

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
    setIsThinking(true)
    setThinkingEmotion(emotion)

    await new Promise((resolve) => setTimeout(resolve, thinkingDuration))

    setIsThinking(false)

    const messageId = Date.now().toString()
    const newMessage: Message = {
      id: messageId,
      content: "",
      role: "assistant",
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

  const handleIntentSelection = async (selectedIntent: Intent) => {
    setIntent(selectedIntent)
    setSelectedIntentButton(selectedIntent || "")

    const intentMessages = {
      apologize: "Apologize",
      gratitude: "Express gratitude",
      boundary: "Set a boundary / give feedback",
    }

    if (selectedIntent) {
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
      setCurrentStep("recipient-input")
    }
  }

  const handleRecipientSubmit = async (recipientName: string) => {
    if (!recipientName.trim()) return

    setRecipient(recipientName)
    addMessage(recipientName, "user")

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.showRecipientInput) {
          return { ...msg, showRecipientInput: false }
        }
        return msg
      }),
    )

    setCurrentStep("relationship-input")
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
    setCurrentStep("conversation")
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

  const handleRegenerateMessage = async () => {
    if (!intent || !userInputForMessage) return

    setIsRegeneratingMessage(true)

    // Simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const templates = messageTemplates[intent]
    if (templates) {
      // Get next template in rotation
      const nextIndex = (currentTemplateIndex + 1) % templates.length
      setCurrentTemplateIndex(nextIndex)

      const newMessage = templates[nextIndex](recipient, userInputForMessage, relationship)
      setFinalMessage(newMessage)
      setEditedMessage(newMessage)
    }

    setIsRegeneratingMessage(false)
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template)
  }

  const handleContinueWithTemplate = () => {
    setCurrentStep("sender-selection")
  }

  const handleSenderSelection = (type: "name" | "anonymous", name?: string) => {
    setSenderType(type)
    if (type === "name" && name) {
      setSenderName(name)
      setUserName(name)
    } else if (type === "anonymous") {
      setSenderName("Anonymous")
    }
    setCurrentStep("delivery-modal")
  }

  const handleChatInput = async (input: string) => {
    if (!input.trim()) return

    addMessage(input, "user")
    setUserInputForMessage(input) // Store for regeneration

    const generatedMessage = generateMessageFromInput(input)
    setFinalMessage(generatedMessage)
    setEditedMessage(generatedMessage)

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
      setCurrentStep("template-selection")
    }, 2000)
  }

  const generateMessageFromInput = (userInput: string) => {
    const templates = messageTemplates[intent!]
    if (templates) {
      return templates[currentTemplateIndex](recipient, userInput, relationship)
    }

    // Fallback to original logic
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

  useEffect(() => {
    if (currentStep === "confirmation") {
      const timer = setTimeout(() => setCurrentStep("closure-feeling"), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Intent Selection Screen
  if (currentStep === "intent-selection") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-8 sarthi-fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-6">
                <SarthiIcon size="lg" />
              </div>
              <h1 className="text-3xl font-light text-white">What would you like to reflect on?</h1>
              <p className="text-white/60 text-lg">Choose what feels right for you today.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleIntentSelection("apologize")}
                className="w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg
                      className="h-6 w-6 text-white/80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path d="M12 2C8 2 5 5 5 9c0 2 1 4 3 5l4-4 4 4c2-1 3-3 3-5 0-4-3-7-7-7z" />
                      <path d="M8 11c-1 1-2 3-2 5 0 3 2 5 5 5s5-2 5-5c0-2-1-4-2-5" />
                      <circle cx="12" cy="16" r="1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">Apology</h3>
                    <p className="text-white/60 leading-relaxed">Say what you couldn't say before.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleIntentSelection("gratitude")}
                className="w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg
                      className="h-6 w-6 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">Gratitude</h3>
                    <p className="text-white/60 leading-relaxed">Thank someone for something that mattered.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleIntentSelection("boundary")}
                className="w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg
                      className="h-6 w-6 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">Feedback or Set a Boundary</h3>
                    <p className="text-white/60 leading-relaxed">Share something hard, clearly and kindly.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Post Reflection Screen
  if (currentStep === "post-reflection") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <SarthiIcon size="lg" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-medium text-white">You've completed your reflection.</h1>
              <p className="text-[#cbd5e1] text-lg leading-relaxed">
                Take a moment to appreciate what you've accomplished today. Your courage to reflect and express yourself
                matters.
              </p>
            </div>

            <div className="space-y-4">
              <SarthiButton
                onClick={() => {
                  // Reset all state and go to intent selection
                  setMessages([])
                  setIntent(null)
                  setRecipient("")
                  setRelationship("")
                  setFinalMessage("")
                  setEditedMessage("")
                  setSelectedTemplate(null)
                  setSenderType(null)
                  setSenderName("")
                  setEmailContact("")
                  setWhatsappContact("")
                  setPhoneNumber("")
                  setClosureFeeling(null)
                  setCurrentStep("intent-selection")
                }}
                className="w-full"
              >
                Start another reflection
              </SarthiButton>
            </div>

            <p className="text-sm text-[#666] mt-8">Remember: growth happens one reflection at a time.</p>
          </div>
        </div>
      </div>
    )
  }

  // Relationship Input Step
  if (currentStep === "relationship-input") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep("recipient-input")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-normal text-white/90">Your relationship</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {isThinking && (
              <SarthiThinking emotion={thinkingEmotion} onComplete={() => setIsThinking(false)} duration={1500} />
            )}
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`message-bubble ${message.role === "user" ? "user flex justify-end" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`${message.role === "user" ? "flex flex-col items-end" : "flex items-start gap-4"}`}>
                    {message.role === "assistant" && (
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
                          message.role === "user" ? "message-bubble-user" : "message-bubble-sarthi"
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

              {!isThinking && (
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <SarthiOrb emotion="calm" size="sm" />
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div className="message-bubble-sarthi px-6 py-5 shadow-lg">
                      <p className="text-white text-lg leading-relaxed mb-6">
                        What's your relationship with {recipient}?
                      </p>
                      <div className="space-y-3">
                        <SarthiInput
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder="e.g., colleague, friend, family member..."
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleRelationshipSubmit(currentInput)
                              setCurrentInput("")
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <SarthiButton
                            onClick={() => {
                              handleRelationshipSubmit(currentInput)
                              setCurrentInput("")
                            }}
                            disabled={!currentInput.trim()}
                            className="px-6"
                          >
                            Continue
                          </SarthiButton>
                          <button
                            onClick={handleSkipRelationship}
                            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Recipient Input Step
  if (currentStep === "recipient-input") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep("intent-selection")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-normal text-white/90">Who is this for?</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-bubble ${message.role === "user" ? "user flex justify-end" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${message.role === "user" ? "flex flex-col items-end" : "flex items-start gap-4"}`}>
                  {message.role === "assistant" && (
                    <div className="mt-1">
                      <SarthiOrb
                        emotion={message.emotion || "empathetic"}
                        size="sm"
                        isTyping={message.isRegenerating || streamingMessageId === message.id}
                      />
                    </div>
                  )}

                  <div>
                    <div
                      className={`max-w-[85%] message-bubble-content ${
                        message.role === "user" ? "message-bubble-user" : "message-bubble-sarthi"
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

            {!isThinking && (
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <SarthiOrb emotion="empathetic" size="sm" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="message-bubble-sarthi px-6 py-5 shadow-lg">
                    <p className="text-white text-lg leading-relaxed mb-6">Who is this message for?</p>
                    <RecipientAutocomplete onSubmit={handleRecipientSubmit} placeholder="Type their name..." />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Template Selection Step
  if (currentStep === "template-selection") {
    const displayName = senderType === "anonymous" ? "Anonymous" : senderName || userName || "Your name"

    return (
      <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
        <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentStep("conversation")}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-normal text-white/90">Choose your message style</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-4 pb-20">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-light text-white">How would you like this to look?</h2>
                <p className="text-white/60">Choose a style that feels right for your message</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Your message</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleEditMessage}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={handleRegenerateMessage}
                      disabled={isRegeneratingMessage}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm disabled:opacity-50"
                    >
                      <RotateCcw size={16} className={isRegeneratingMessage ? "animate-spin" : ""} />
                      {isRegeneratingMessage ? "Regenerating..." : "Regenerate"}
                    </button>
                  </div>
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

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-center text-white font-medium">Clean & Modern</h4>
                  <div onClick={() => setSelectedTemplate("clean-card")}>
                    <CleanCardTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "clean-card"}
                      onClick={() => setSelectedTemplate("clean-card")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-center text-white font-medium">Handwritten Note</h4>
                  <div onClick={() => setSelectedTemplate("handwritten")}>
                    <HandwrittenTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "handwritten"}
                      onClick={() => setSelectedTemplate("handwritten")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-center text-white font-medium">Minimal Dark</h4>
                  <div onClick={() => setSelectedTemplate("minimal")}>
                    <MinimalTemplate
                      message={editedMessage}
                      fromName={displayName}
                      isSelected={selectedTemplate === "minimal"}
                      onClick={() => setSelectedTemplate("minimal")}
                    />
                  </div>
                </div>
              </div>

              {selectedTemplate && (
                <div className="text-center py-8">
                  <SarthiButton onClick={handleContinueWithTemplate} className="px-8 py-4">
                    Continue with this style
                  </SarthiButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sender Selection Step
  if (currentStep === "sender-selection") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep("template-selection")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-normal text-white/90">How would you like to sign this?</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-white">How would you like to sign this?</h2>
              <p className="text-white/60">Choose how you'd like to identify yourself</p>
            </div>

            <div className="space-y-4">
              {/* With Name Option */}
              <div className="w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">With your name</h3>
                    <p className="text-white/60 leading-relaxed mb-4">Sign with your name</p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <SarthiInput
                          value={senderName || userName || ""}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Your name"
                          className="flex-1"
                        />
                        <button
                          onClick={() => setSenderName(userName || "")}
                          className="text-xs text-white/60 hover:text-white/80 transition-colors px-2"
                        >
                          Reset
                        </button>
                      </div>

                      <SarthiButton
                        onClick={() => handleSenderSelection("name", senderName || userName || "Your name")}
                        disabled={!senderName?.trim() && !userName?.trim()}
                        className="w-full"
                      >
                        Continue with this name
                      </SarthiButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anonymous Option */}
              <button
                onClick={() => handleSenderSelection("anonymous")}
                className="w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <svg
                      className="h-6 w-6 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">Send anonymously</h3>
                    <p className="text-white/60 leading-relaxed">Don't include your name</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs text-white/40 leading-relaxed px-4">
              <p>
                Please use your real name or a name you're comfortable being identified by. Do not impersonate others
                when sharing this message.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Delivery Modal Step
  if (currentStep === "delivery-modal") {
    return (
      <div className="h-screen bg-[#121212] flex flex-col">
        <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep("sender-selection")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-normal text-white/90">How would you like to send this?</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 pb-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light text-white">How would you like to send this?</h2>
              <p className="text-white/60">You can provide both email and phone to give them options</p>
            </div>

            <div className="space-y-6">
              {/* Email Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">Email Address</h3>
                </div>
                <SarthiInput
                  type="email"
                  placeholder="Enter their email address"
                  value={emailContact}
                  onChange={(e) => {
                    setEmailContact(e.target.value)
                    setEmailError("")
                  }}
                  className="w-full"
                />
                {emailError && <div className="text-red-400 text-sm">{emailError}</div>}
              </div>

              {/* WhatsApp Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 0 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">WhatsApp Number</h3>
                </div>
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={(phone) => {
                    setPhoneNumber(phone)
                    setPhoneError("")
                  }}
                />
                {phoneError && <div className="text-red-400 text-sm">{phoneError}</div>}
              </div>

              {/* Instruction message */}
              <div className="text-center text-sm text-white/60 py-4">
                <p>Please provide at least one contact method above</p>
              </div>

              {/* OR Separator */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="text-white/40 text-sm font-medium">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Keep Private Option */}
              <div className="border-t border-white/10 pt-6">
                <button
                  onClick={() => setDeliveryMethod("keep-private")}
                  className={`w-full p-6 rounded-3xl border transition-all text-left group ${
                    deliveryMethod === "keep-private"
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <svg
                        className="h-6 w-6 text-white/80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-white mb-2">Keep it private</h3>
                      <p className="text-white/60 leading-relaxed">Keep between you and Sarthi</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <SarthiButton
                onClick={() => {
                  // Validate inputs
                  let hasError = false

                  if (emailContact.trim()) {
                    const error = validateEmail(emailContact)
                    if (error) {
                      setEmailError(error)
                      hasError = true
                    }
                  }

                  if (phoneNumber.trim()) {
                    const error = validatePhone(phoneNumber)
                    if (error) {
                      setPhoneError(error)
                      hasError = true
                    }
                  }

                  // Check if at least one contact method is provided (unless keeping private)
                  if (deliveryMethod !== "keep-private" && !emailContact.trim() && !phoneNumber.trim()) {
                    setEmailError("Please provide at least one contact method")
                    hasError = true
                  }

                  if (!hasError) {
                    setCurrentStep("confirmation")
                  }
                }}
                className="px-8 py-4"
                disabled={deliveryMethod !== "keep-private" && !emailContact.trim() && !phoneNumber.trim()}
              >
                {deliveryMethod === "keep-private" ? "Save reflection" : "Send message"}
              </SarthiButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation Step
  if (currentStep === "confirmation") {
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
              {deliveryMethod === "keep-private" ? "Reflection saved" : "Message sent"}
            </h1>
            <p className="text-[#cbd5e1] text-lg leading-relaxed">
              {deliveryMethod === "keep-private"
                ? "Your reflection has been saved privately."
                : `Your message has been sent ${deliveryMethod === "email" ? "via email" : "via WhatsApp"}.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Closure Feeling Step
  if (currentStep === "closure-feeling") {
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
                  onClick={() => {
                    setClosureFeeling(feeling)
                    setCurrentStep("closure-response")
                  }}
                  className="w-full p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left text-white"
                >
                  {feeling}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    )
  }

  // Closure Response Step
  if (currentStep === "closure-response") {
    const getResponseMessage = (feeling: string) => {
      switch (feeling) {
        case "I feel lighter":
        case "I feel more clear":
          return "I'm really glad I could help you feel that way. If you'd like, you can share this feeling with someone else — or just carry it with you quietly. It's your moment."
        case "I feel the same":
          return "Thank you for telling me. Sometimes reflection takes time. I'm always here when you're ready to try again."
        case "I feel more stuck":
          return "Thank you for telling me. This can be hard work — and it's okay to feel that way. I'm here whenever you want to try again or see things differently."
        case "I'm not sure yet":
          return "That's completely okay. Reflection can take time to settle. Take it slow - I'm here whenever you want to talk again."
        default:
          return "Thank you for sharing how you feel. Your honesty helps me understand how to better support you."
      }
    }

    const showShareOption = closureFeeling === "I feel lighter" || closureFeeling === "I feel more clear"

    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto mb-6">
              <SarthiIcon size="lg" />
            </div>
            <h1 className="text-3xl font-light text-white">{closureFeeling && getResponseMessage(closureFeeling)}</h1>
          </div>

          <div className="space-y-4">
            {showShareOption ? (
              <div className="space-y-4">
                <SarthiButton onClick={() => setCurrentStep("share-feeling")} className="px-8 py-4">
                  Share how I feel
                </SarthiButton>
                <SarthiButton
                  onClick={() => setCurrentStep("post-reflection")}
                  variant="secondary"
                  className="px-8 py-4"
                >
                  Keep it to myself
                </SarthiButton>
              </div>
            ) : (
              <SarthiButton onClick={() => setCurrentStep("post-reflection")} className="px-8 py-4">
                Complete reflection
              </SarthiButton>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Share Feeling Step
  if (currentStep === "share-feeling") {
    const shareMessage = `I just used Sarthi to help me reflect and express something important. It really helped me feel ${closureFeeling?.toLowerCase()}. You might find it helpful too.`
    const inviteLink = "https://sarthi.me/invite" // Replace with actual invite link

    const handleShare = (method: string) => {
      switch (method) {
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage + "\n\n" + inviteLink)}`, "_blank")
          break
        case "email":
          window.open(
            `mailto:?subject=I found something helpful&body=${encodeURIComponent(shareMessage + "\n\n" + inviteLink)}`,
            "_blank",
          )
          break
        case "copy":
          navigator.clipboard.writeText(shareMessage + "\n\n" + inviteLink)
          // You could add a toast notification here
          break
      }
      setCurrentStep("post-reflection")
    }

    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-6">
              <SarthiIcon size="lg" />
            </div>
            <h1 className="text-3xl font-light text-white">Share your experience</h1>
            <p className="text-white/60">Let others know how Sarthi helped you</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleShare("whatsapp")}
              className="w-full p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 0 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white">Share on WhatsApp</h3>
                  <p className="text-white/60">Recommend Sarthi to your contacts</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleShare("email")}
              className="w-full p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white">Share via Email</h3>
                  <p className="text-white/60">Send an email to your friends</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleShare("copy")}
              className="w-full p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h2m0 0h2m-2 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 0V9a1.5 1.5 0 0 1 3 0v3m-3 0h2m1.992 0a1.5 1.5 0 0 1-1.101 1.748l-.717 1.075a4.5 4.5 0 0 0-1.484 2.032 .75.75 0 0 1-.522.294m-4.5 0a.75.75 0 0 1-.522-.294 4.5 4.5 0 0 0-1.484-2.032l-.717-1.075a1.5 1.5 0 0 1-1.101-1.748h10.984z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white">Copy Link</h3>
                  <p className="text-white/60">Share the link directly</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default Chat UI
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-normal text-white/90">Sarthi</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {isThinking && <SarthiThinking emotion={thinkingEmotion} onComplete={() => setIsThinking(false)} />}
          <div className="space-y-8">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-bubble ${message.role === "user" ? "user flex justify-end" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${message.role === "user" ? "flex flex-col items-end" : "flex items-start gap-4"}`}>
                  {message.role === "assistant" && (
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
                        message.role === "user" ? "message-bubble-user" : "message-bubble-sarthi"
                      } px-6 py-5 shadow-lg`}
                    >
                      <p className="text-white text-lg leading-relaxed whitespace-pre-line font-normal">
                        {message.content}
                        {streamingMessageId === message.id && (
                          <span className="animate-pulse text-white/60 ml-1">|</span>
                        )}
                      </p>

                      {message.buttons && message.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {message.buttons.map((button, buttonIndex) => (
                            <SarthiButton
                              key={buttonIndex}
                              variant={button.variant || "primary"}
                              onClick={button.action}
                              className={`text-sm px-4 py-2 ${button.isSelected ? "bg-blue-600" : ""}`}
                            >
                              {button.text}
                            </SarthiButton>
                          ))}
                        </div>
                      )}

                      {message.showFeedback && (
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => handleMessageFeedback(message.id, "positive")}
                            className="text-green-500 hover:text-green-400 transition-colors"
                          >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMessageFeedback(message.id, "negative")}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMessageFeedback(message.id, "regenerate")}
                            disabled={message.isRegenerating}
                            className={`text-white/60 hover:text-white/80 transition-colors ${
                              message.isRegenerating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <RotateCcw className={`h-5 w-5 ${message.isRegenerating ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {currentStep === "conversation" && (
        <div className="border-t border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <SarthiInput
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleChatInput(input)
                  setInput("")
                }
              }}
              className="flex-1"
            />
            <SarthiButton
              onClick={() => {
                handleChatInput(input)
                setInput("")
              }}
            >
              Send
            </SarthiButton>
          </div>
        </div>
      )}
    </div>
  )
}
