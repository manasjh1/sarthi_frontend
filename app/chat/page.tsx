"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { SarthiOrb } from "@/components/sarthi-orb"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiThinking } from "@/components/sarthi-thinking"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, getAuthHeaders } from "@/app/actions/auth"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
// Backend API integration
interface ApiRequest {
  reflection_id: string | null;
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


  async getAuthHeaders() {
    return await getAuthHeaders();
  }

  async sendReflectionRequest(request: ApiRequest): Promise<ApiResponse> {
    console.log("Sending request to backend:", request);

    const authHeaders = await this.getAuthHeaders();
    if (!authHeaders) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/reflection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication expired');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'API request failed');
    }

    const responseData = await response.json();
    console.log("Backend response:", responseData);
    return responseData;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
  }
}

const apiService = new ApiService();

type ChatStep =
  | "loading"
  | "auth-check"
  | "intent-selection"
  | "conversation"
  | "distress-detected"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState<ChatStep>("auth-check")
  const [isThinking, setIsThinking] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [reflectionId, setReflectionId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ category_no: number, category_name: string }>>([])
  const [progress, setProgress] = useState({ current_step: 1, total_step: 4, workflow_completed: false })
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
 const inputRef = useRef<HTMLInputElement>(null)


  const intentParam = searchParams.get('intent');
  const feedback_type = intentParam ? parseInt(intentParam, 10) : null;
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    checkAuthentication()
  }, [])

  // Check authentication
 const hasStartedRef = useRef(false)

const checkAuthentication = async () => {
  try {
    const authenticated = await apiService.isAuthenticated()
    setIsAuthenticated(authenticated)

    if (authenticated && !hasStartedRef.current) {
      hasStartedRef.current = true
      startNewReflection()
    } else if (!authenticated) {
      router.push('/auth')
    }
  } catch (error) {
    router.push('/auth')
  }
}


  // Start new reflection (Stage 0)
  const startNewReflection = async () => {
    try {
      console.log("Starting new reflection...");
      setIsThinking(true)
      setCurrentStep("loading")

      const request = {
        reflection_id: null,
        message: "",
        data: [
          { start_reflection: 1 },

        ]
      };

      console.log("Sending start reflection request:", request);
      const response = await apiService.sendReflectionRequest(request)
      console.log("Got response:", response);

      if (!response.success && response.current_stage === -1) {
        console.log("Distress detected, showing distress screen");
        setCurrentStep("distress-detected")
        return
      }

      console.log("Setting reflection data:", {
        reflectionId: response.reflection_id,
        currentStage: response.current_stage,
        progress: response.progress,
        categories: response.data
      });

      setReflectionId(response.reflection_id)
      setProgress(response.progress)
      setCategories(response.data || [])

      // Add Sarthi's welcome message
      await simulateThinkingAndResponse(response.sarthi_message)

      setCurrentStep("intent-selection")
    } catch (error) {
      console.error("Failed to start reflection:", error)
      setApiError("Failed to start reflection. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }

  const addMessage = (
    content: string,
    sender: "user" | "sarthi",
    shouldStream = false,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: sender === "user" ? "user" : "assistant",
      timestamp: new Date(),
    }

    if (sender === "sarthi" && shouldStream) {
      setMessages((prev) => [...prev, { ...newMessage, content: "" }])
      setStreamingMessageId(newMessage.id)
    } else {
      setMessages((prev) => [...prev, newMessage])
    }
  }

const simulateThinkingAndResponse = async (
  content: string,
  thinkingDuration = 0,
  streamSpeed = 5,
) => {
  // Skip if last assistant message is the same
  if (messages[messages.length - 1]?.role === "assistant" &&
      messages[messages.length - 1]?.content.trim() === content.trim()) {
    return;
  }

  setIsThinking(true);
  await new Promise((resolve) => setTimeout(resolve, thinkingDuration));
  setIsThinking(false);

  const messageId = Date.now().toString();
  const newMessage: Message = {
    id: messageId,
    content: "",
    role: "assistant",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, newMessage]);
  setStreamingMessageId(messageId);

  let currentIndex = 0;
  const streamInterval = setInterval(() => {
    if (currentIndex < content.length) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: content.substring(0, currentIndex + 1) }
            : msg
        )
      );
      currentIndex++;
    } else {
      clearInterval(streamInterval);
      setStreamingMessageId(null);
    }
  }, streamSpeed);
};


  const handleIntentSelection = async (categoryNo: number) => {
    if (!reflectionId) return

    const category = categories.find(cat => cat.category_no === categoryNo)
    if (!category) return

    console.log("Selected category:", category);
    addMessage(category.category_name, "user")

    try {
      setIsThinking(true)

      const request = {
        reflection_id: reflectionId,
        message: "",
        data: [{ category_no: categoryNo }]
      };

      console.log("Sending category selection:", request);
      const response = await apiService.sendReflectionRequest(request)
      console.log("Category selection response:", response);

      if (!response.success && response.current_stage === -1) {
        setCurrentStep("distress-detected")
        return
      }

      if (response && response.success) {
        await simulateThinkingAndResponse(response.sarthi_message)
        setCurrentStep("conversation")
      }
    } catch (error) {
      console.error("Intent selection error:", error)
      setApiError("Failed to process selection. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }

  const handleChatInput = async (inputMessage: string) => {
    if (!inputMessage.trim() || !reflectionId) return

    console.log("Sending chat message:", inputMessage);
    addMessage(inputMessage, "user")

    try {
      setIsThinking(true)

      const request = {
        reflection_id: reflectionId,
        message: inputMessage,
        data: []
      };

      console.log("Sending chat request:", request);
      const response = await apiService.sendReflectionRequest(request)
      console.log("Chat response:", response);

      if (!response.success && response.current_stage === -1) {
        setCurrentStep("distress-detected")
        return
      }



      if (response && response.success) {
        await simulateThinkingAndResponse(response.sarthi_message)
        await setProgress(response.progress);
        // Check if we have a summary (conversation complete)
        const summaryItem = response.data.find(item => item.summary !== undefined)
        if (summaryItem) {
          console.log("Conversation complete, summary:", summaryItem.summary);
          // For now, just show the summary in a message
          setTimeout(() => {
            addMessage(`Here's your reflection: ${summaryItem.summary}`, "sarthi")
            router.push(`/api/reflections/preview/${response.reflection_id}`);
          }, 100)

        }
      }
    } catch (error) {
      console.error("Chat input error:", error)
      setApiError("Failed to send message. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }

  // Authentication Check Screen
  if (currentStep === "auth-check" || currentStep === "loading") {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-8 max-w-md sarthi-fade-in">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center animate-pulse">
              <SarthiIcon size="lg" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-light text-white">
                {currentStep === "auth-check" ? "Connecting..." : "Starting your reflection..."}
              </h1>
              <p className="text-white/60 text-lg">
                {currentStep === "auth-check" ? "Checking your session" : "Preparing your space"}
              </p>
            </div>

            {apiError && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {apiError}
                <button
                  onClick={() => {
                    setApiError(null)
                    checkAuthentication()
                  }}
                  className="block mx-auto mt-2 text-white/60 hover:text-white underline"
                >
                  Try again
                </button>
              </div>
            )}
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
                  startNewReflection()
                }}
                className="w-full"
              >
                Continue with Sarthi
              </SarthiButton>

              <button
                onClick={() => {
                  router.push('/auth')
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
  }

  // Intent Selection Screen
 if (currentStep === "intent-selection") {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Adjusted padding for smaller screens */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-6">
                <SarthiOrb size="md" />
              </div>
              {/* Adjusted font sizes for smaller screens */}
              <h1 className="text-2xl sm:text-3xl font-light text-white">What would you like to reflect on today?</h1>
              {/* Adjusted font size for smaller screens */}
              <p className="text-white/60 text-base sm:text-lg">Choose what feels right for you.</p>
            </div>

            {/* Categories from backend */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {categories.map((category) => {
                const iconMap: Record<number, any> = {
                  1: <svg className="h-6 w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                  </svg>,
                  2: <svg className="h-6 w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>,
                  3: <svg className="h-6 w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                }

                const titleMap: Record<number, string> = {
                  1: "Feedback or Set a Boundary",
                  2: "Gratitude",
                  3: "Apology"
                }

                const descriptionMap: Record<number, string> = {
                  1: "Share something hard, clearly and kindly.",
                  2: "Thank someone for something that mattered.",
                  3: "Say what you couldn't say before."
                }

                return (
                  <button
                    type="button"
                    key={category.category_no}
                    onClick={() => handleIntentSelection(category.category_no)}
                    disabled={isThinking}
                    className={`w-full p-4 sm:p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 focus:border-white/20 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-left group min-h-[44px] ${isThinking ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Adjusted padding for smaller screens */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                        {iconMap[category.category_no]}
                      </div>
                      <div className="flex-1">
                        {/* Adjusted font size for smaller screens */}
                        <h3 className="text-lg sm:text-xl font-medium text-white mb-1 sm:mb-2">
                          {titleMap[category.category_no] || category.category_name}
                        </h3>
                        {/* Adjusted font size for smaller screens */}
                        <p className="text-white/60 leading-snug sm:leading-relaxed text-sm">
                          {descriptionMap[category.category_no] || "Reflect on this topic."}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Progress indicator */}
            {progress && (
              <div className="text-center text-sm text-white/40">
                Step {progress.current_step} of {progress.total_step}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

  // Main Chat Interface
return (
  <div className="h-screen bg-[#121212] flex flex-col">
    {/* Header */}
    <div className="border-b border-white/10 p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white/60" />
        </button>
        <div className="flex items-center gap-3">
          <SarthiOrb size="sm" />
          <div>
            <h1 className="text-white font-medium text-lg sm:text-xl">Reflection Session</h1>
            {progress && (
              <p className="text-white/60 text-xs sm:text-sm">
                Step {progress.current_step} of {progress.total_step}
                {progress.workflow_completed && " - Complete"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto">
      {/* Adjusted padding for smaller screens */}
      <div className="p-4 sm:p-6">
        {/* Adjusted max-width for better mobile layout */}
        <div className="max-w-full sm:max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "items-start gap-4"}`}>
              {message.role === "assistant" && (
                <div className="mt-1">
                  <SarthiOrb size="sm" />
                </div>
              )}

              {/* Adjusted max-width for message bubble on smaller screens */}
              <div className={`max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                <div
                  className={`px-4 py-3 sm:px-6 sm:py-4 rounded-3xl ${message.role === "user"
                    ? "bg-[#1e1e1e] border border-[#2a2a2a]"
                    : "bg-[#2a2a2a] border border-[#3a3a3a]"
                    }`}
                >
                  <p className="text-white leading-relaxed text-sm sm:text-base">
                    {message.content}
                    {streamingMessageId === message.id && (
                      <span className="inline-block w-2 h-5 bg-white/60 ml-1 animate-pulse"></span>
                    )}
                  </p>
                </div>

                <div className="mt-2 text-xs text-white/40">
                  {message.timestamp?.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <SarthiOrb size="sm" isThinking />
              </div>
              <div className="flex-1">
                <SarthiThinking />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>

    {/* Input Area */}
    {currentStep === "conversation" && (
      <div className="border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <SarthiInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 text-sm sm:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleChatInput(input)
                  setInput("")
                  inputRef.current?.focus()
                }
              }}
              disabled={isThinking}
            />
            <SarthiButton
              onClick={() => {
                handleChatInput(input)
                setInput("")
                inputRef.current?.focus()
              }}
              disabled={!input.trim() || isThinking}
            >
              Send
            </SarthiButton>
          </div>
        </div>
      </div>
    )}

    {/* API Error Display */}
    {apiError && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-4 sm:px-6 py-2 sm:py-3 rounded-[16px] backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">{apiError}</p>
          <button
            onClick={() => setApiError(null)}
            className="ml-2 text-red-400/60 hover:text-red-400 transition-colors min-h-[24px] min-w-[24px]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )}
  </div>
)
}