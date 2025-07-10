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

// Backend API integration
interface ApiRequest {
  reflection_id?: string;
  message: string;
  data: Array<{ [key: string]: any }>;
}

interface ApiResponse {
  success: boolean;
  reflection_id: string;
  sarthi_message: string;
  current_stage: number;
  next_stage: number;
  progress: {
    current_step: number;
    total_step: number;
    workflow_completed: boolean;
  };
  data: Array<{ [key: string]: any }>;
}

// API Service class
class ApiService {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  async login(email: string) {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    this.token = data.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  }

  async sendReflectionRequest(request: ApiRequest): Promise<ApiResponse> {
    if (!this.token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/api/reflection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        throw new Error('Authentication expired');
      }
      throw new Error('API request failed');
    }

    return await response.json();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}

const apiService = new ApiService();

// Intent to category mapping (matches your backend)
const INTENT_TO_CATEGORY_MAP = {
  "apologize": 1,
  "gratitude": 2,
  "boundary": 3
};

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const defaultCountry: Country = { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" }

type ChatStep =
  | "login"
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
  | "distress-detected"

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
  const [currentStep, setCurrentStep] = useState<ChatStep>("login")
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
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
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

  // New backend-related state
  const [reflectionId, setReflectionId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [isInDistress, setIsInDistress] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check authentication on component mount
    if (apiService.isAuthenticated()) {
      setIsAuthenticated(true)
      setCurrentStep("intent-selection")
    } else {
      setCurrentStep("login")
    }
  }, [])

  useEffect(() => {
    // Check if this is a new conversation or has intent from onboarding
    const intentParam = searchParams.get("intent")
    const isNew = searchParams.get("new")

    if (intentParam && messages.length === 0 && !intent && isAuthenticated) {
      handleIntentSelectionFromParam(intentParam as Intent)
    } else if (isNew === "true" && !intentParam && !intent && isAuthenticated) {
      setCurrentStep("intent-selection")
      setMessages([])
    }
  }, [searchParams, messages.length, intent, currentStep, isAuthenticated])

  // Handle login
  const handleLogin = async () => {
    if (!userEmail.trim()) {
      setApiError("Please enter your email")
      return
    }

    try {
      setApiError(null)
      setIsThinking(true)
      await apiService.login(userEmail.trim())
      setIsAuthenticated(true)
      setCurrentStep("intent-selection")
    } catch (error) {
      setApiError("Login failed. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsThinking(false)
    }
  }

  // Handle intent selection from URL param
  const handleIntentSelectionFromParam = async (selectedIntent: Intent) => {
    try {
      setIntent(selectedIntent)
      setIsThinking(true)

      // Create initial reflection and send category selection
      const response = await apiService.sendReflectionRequest({
        message: selectedIntent || "",
        data: [{ 
          category_no: INTENT_TO_CATEGORY_MAP[selectedIntent!], 
          category_name: selectedIntent 
        }]
      })

      setReflectionId(response.reflection_id)
      setCurrentStage(response.current_stage)
      
      await simulateThinkingAndResponse(
        response.sarthi_message,
        "empathetic",
        undefined,
        false,
        undefined,
        true,
        1200,
        25,
      )
      setCurrentStep("recipient-input")
    } catch (error) {
      console.error("Intent selection error:", error)
      setApiError("Failed to process intent selection")
    } finally {
      setIsThinking(false)
    }
  }

  // API call wrapper with error handling
  const makeApiCall = async (request: ApiRequest): Promise<ApiResponse | null> => {
    try {
      setApiError(null)
      const response = await apiService.sendReflectionRequest(request)
      
      // Check for distress response
      if (!response.success || response.current_stage === -1) {
        setIsInDistress(true)
        setCurrentStep("distress-detected")
        return response
      }

      setCurrentStage(response.current_stage)
      return response
    } catch (error) {
      console.error("API call error:", error)
      setApiError("Something went wrong. Please try again.")
      return null
    }
  }

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
    if (!selectedIntent) return

    setIntent(selectedIntent)
    setSelectedIntentButton(selectedIntent)

    const intentMessages = {
      apologize: "Apologize",
      gratitude: "Express gratitude",
      boundary: "Set a boundary / give feedback",
    }

    addMessage(intentMessages[selectedIntent], "user")

    try {
      setIsThinking(true)
      
      // Create initial reflection if none exists, otherwise send category selection
      const request: ApiRequest = reflectionId ? {
        reflection_id: reflectionId,
        message: selectedIntent,
        data: [{ 
          category_no: INTENT_TO_CATEGORY_MAP[selectedIntent], 
          category_name: selectedIntent 
        }]
      } : {
        message: selectedIntent,
        data: [{ 
          category_no: INTENT_TO_CATEGORY_MAP[selectedIntent], 
          category_name: selectedIntent 
        }]
      }

      const response = await makeApiCall(request)
      
      if (response && !isInDistress) {
        setReflectionId(response.reflection_id)
        await simulateThinkingAndResponse(
          response.sarthi_message,
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
    } catch (error) {
      console.error("Intent selection error:", error)
    } finally {
      setIsThinking(false)
    }
  }

  const handleRecipientSubmit = async (recipientName: string) => {
    if (!recipientName.trim() || !reflectionId) return

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

    try {
      const response = await makeApiCall({
        reflection_id: reflectionId,
        message: recipientName,
        data: []
      })

      if (response && !isInDistress) {
        setCurrentStep("relationship-input")
        await simulateThinkingAndResponse(
          response.sarthi_message,
          "calm",
          undefined,
          false,
          undefined,
          false,
          1000,
          25,
        )
      }
    } catch (error) {
      console.error("Recipient submit error:", error)
    }
  }

  const handleRelationshipSubmit = async (relationshipValue: string) => {
    if (!reflectionId) return

    setRelationship(relationshipValue)

    if (relationshipValue.trim()) {
      addMessage(relationshipValue, "user")
    } else {
      addMessage("I'd prefer not to specify", "user")
    }

    try {
      const response = await makeApiCall({
        reflection_id: reflectionId,
        message: relationshipValue || "prefer not to specify",
        data: []
      })

      if (response && !isInDistress) {
        await simulateThinkingAndResponse(
          response.sarthi_message,
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
    } catch (error) {
      console.error("Relationship submit error:", error)
    }
  }

  const handleSkipRelationship = () => {
    handleRelationshipSubmit("")
  }

  const handleChatInput = async (inputMessage: string) => {
    if (!inputMessage.trim() || !reflectionId) return

    addMessage(inputMessage, "user")
    setUserInputForMessage(inputMessage)

    try {
      const response = await makeApiCall({
        reflection_id: reflectionId,
        message: inputMessage,
        data: []
      })

      if (response && !isInDistress) {
        // Check if conversation is complete (has summary)
        const summaryItem = response.data.find(item => item.summary !== undefined)
        
        if (summaryItem) {
          setFinalMessage(summaryItem.summary)
          setEditedMessage(summaryItem.summary)
          
          await simulateThinkingAndResponse(
            response.sarthi_message,
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
        } else {
          // Continue conversation
          await simulateThinkingAndResponse(
            response.sarthi_message,
            "empathetic",
            undefined,
            true,
            undefined,
            false,
            1000,
            25,
          )
        }
      }
    } catch (error) {
      console.error("Chat input error:", error)
    }
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

  const mapDeliveryMethod = (emailContact: string, phoneNumber: string, deliveryMethod: string | null): number => {
    if (deliveryMethod === "keep-private") return 3;
    
    const hasEmail = emailContact && emailContact.trim() !== "";
    const hasPhone = phoneNumber && phoneNumber.trim() !== "";
    
    if (hasEmail && hasPhone) return 2; // Both
    if (hasEmail) return 0; // Email only
    if (hasPhone) return 1; // WhatsApp only
    
    return 3; // Default to private
  }

  const handleDeliverySubmit = async () => {
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

    if (hasError) return

    try {
      const deliveryModeNumber = mapDeliveryMethod(emailContact, phoneNumber, deliveryMethod)
      
      const response = await makeApiCall({
        reflection_id: reflectionId!,
        message: "Delivery preferences set",
        data: [{ delivery_mode: deliveryModeNumber }]
      })

      if (response && !isInDistress) {
        setCurrentStep("confirmation")
      }
    } catch (error) {
      console.error("Delivery submit error:", error)
    }
  }

  useEffect(() => {
    if (currentStep === "confirmation") {
      const timer = setTimeout(() => setCurrentStep("closure-feeling"), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Login Screen
  if (currentStep === "login") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 sarthi-fade-in">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-6">
                <SarthiIcon size="lg" />
              </div>
              <h1 className="text-3xl font-light text-white">Welcome to Sarthi</h1>
              <p className="text-white/60 text-lg">Please enter your email to continue</p>
            </div>

            <div className="space-y-4">
              <SarthiInput
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleLogin()
                  }
                }}
                autoFocus
              />
              
              {apiError && (
                <div className="text-red-400 text-sm text-center">{apiError}</div>
              )}

              <SarthiButton
                onClick={handleLogin}
                disabled={!userEmail.trim() || isThinking}
                className="w-full"
              >
                {isThinking ? "Signing in..." : "Continue"}
              </SarthiButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Distress Detection Screen
  if (currentStep === "distress-detected") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="h-10 w-10 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-medium text-white">We're here for you</h1>
              <p className="text-[#cbd5e1] text-lg leading-relaxed">
                I noticed you might be going through a difficult time. Your wellbeing is important to us.
              </p>
              <p className="text-white/60">
                If you're in crisis, please reach out to a mental health professional or crisis helpline immediately.
              </p>
            </div>

            <div className="space-y-4">
              <SarthiButton
                onClick={() => {
                  setIsInDistress(false)
                  setCurrentStep("intent-selection")
                  setMessages([])
                }}
                className="w-full"
              >
                Continue with Sarthi
              </SarthiButton>
              
              <button
                onClick={() => {
                  apiService.logout()
                  setIsAuthenticated(false)
                  setCurrentStep("login")
                }}
                className="w-full p-3 text-white/60 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>

            <div className="text-xs text-white/40 leading-relaxed">
              <p>Crisis resources: National Suicide Prevention Lifeline: 988</p>
            </div>
          </div>
        </div>
      </div>
    )
  }}