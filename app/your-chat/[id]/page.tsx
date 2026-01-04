"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { SarthiThinking } from "@/components/sarthi-thinking"
import { SarthiOrb } from "@/components/sarthi-orb"
import { ArrowLeft, Heart, MessageCircle } from "lucide-react"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { authFetch } from "@/lib/api"
import { getAuthHeaders } from "@/app/actions/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

interface Choice {
  choice: string
  label: string
}

interface Category {
  category_no: number
  category_name: string
}

interface ApiRequest {
  reflection_id: string | null
  message: string
  data: Array<{ [key: string]: any }>
}

interface ApiResponse {
  success: boolean
  reflection_id: string
  sarthi_message: string
  current_stage: number
  next_stage: number
  progress: {
    current_step: number
    total_step: number
    workflow_completed: boolean
  }
  data: Array<{ [key: string]: any }>
}

class ApiService {
  async getAuthHeaders() {
    return await getAuthHeaders();
  }

  async sendReflectionRequest(request: ApiRequest): Promise<ApiResponse> {
    const authHeaders = await this.getAuthHeaders();
    if (!authHeaders) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/chat`, {
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

    return await response.json();
  }
}

const apiService = new ApiService();
export default function ChatDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Conversation state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [choices, setChoices] = useState<Choice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [conversationCompleted, setConversationCompleted] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const userName = typeof window !== "undefined" ? localStorage.getItem("sarthi-user-name") : "You"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        console.log("check" , json)
        if (json.success && json.data) {
          setChatDetail(json.data)
          
          // Convert chat history to messages format
          const historyMessages: Message[] = json.data.chat_history.map((msg: ChatMessage, idx: number) => ({
            id: `${json.data.reflection_id}-${idx}`,
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message,
            timestamp: new Date(msg.created_at)
          }))
          
          setMessages(historyMessages)
            if (json.data.summary && json.data.summary !== "No summary available") {
  setConversationCompleted(true)
}
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

const addMessage = (content: string, role: "user" | "assistant") => {
  const newMessage: Message = {
    id: Date.now().toString(),
    content,
    role,
    timestamp: new Date(),
  }
  setMessages((prev) => [...prev, newMessage])
}

const simulateThinkingAndResponse = async (content: string) => {
  // Skip if last assistant message is the same
  if (messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content.trim() === content.trim()) {
    return;
  }

  setIsThinking(true);
  await new Promise((resolve) => setTimeout(resolve, 500));
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
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx === -1) return prev;
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], content: content.substring(0, currentIndex + 1) };
        return copy;
      });
      currentIndex++;
    } else {
      clearInterval(streamInterval);
      setStreamingMessageId(null);
    }
  }, 20);
};


const sendReflectionRequest = async (request: ApiRequest): Promise<ApiResponse> => {
  return await apiService.sendReflectionRequest(request);
}

const handleChatInput = async (inputMessage: string) => {
  if (!inputMessage.trim() || !chatDetail) return

  addMessage(inputMessage, "user")
  setInput("")

  try {
    setIsThinking(true)

    const request: ApiRequest = {
      reflection_id: chatDetail.reflection_id,
      message: inputMessage,
      data: []
    }

    const response = await sendReflectionRequest(request)

    if (response && response.success) {
      await simulateThinkingAndResponse(response.sarthi_message)

      if (response.data && response.data.length > 0) {
        const firstItem = response.data[0]
        if ('choice' in firstItem && 'label' in firstItem) {
          setChoices(response.data as Choice[])
          setCategories([])
        } else if ('category_no' in firstItem && 'category_name' in firstItem) {
          setCategories(response.data as Category[])
          setChoices([])
        } else {
          // ADD THIS BLOCK - Handle summary case
          const summaryItem = response.data.find(item => item.summary !== undefined)
          if (summaryItem) {
            setTimeout(() => {
              router.push(`/reflections-1/preview/${response.reflection_id}`)
            }, 1500)
            return
          }
        }
      }

      if (response.current_stage === 20) {
        setTimeout(() => {
          router.push(`/reflections-1/preview/${response.reflection_id}`)
        }, 1500)
      }
    }
  } catch (error) {
    console.error("Chat input error:", error)
    setApiError("Failed to send message. Please try again.")
  } finally {
    setIsThinking(false)
  }
}


const handleChoiceSelect = async (choice: string) => {
  if (!chatDetail) return

  const selectedChoice = choices.find(c => c.choice === choice)
  if (selectedChoice) {
    addMessage(selectedChoice.label, "user")
  }

  setIsThinking(true)
  try {
    const response = await sendReflectionRequest({
      reflection_id: chatDetail.reflection_id,
      message: "",
      data: [{ choice }]
    })

    if (response.success) {
      if (response.sarthi_message) {
        await simulateThinkingAndResponse(response.sarthi_message)
      }

      setChoices([])

      if (response.current_stage === 20) {
        const deliveryChoice = Number(choice) === 0 ? "keep" : "deliver"
        setTimeout(() => {
          router.push(`/reflections-1/preview/${response.reflection_id}?delivery=${deliveryChoice}`)
        }, 1500)
        return
      }

      if (response.data && response.data.length > 0) {
        const firstItem = response.data[0]
        if ("choice" in firstItem && "label" in firstItem) {
          setChoices(response.data as Choice[])
        } else if ("category_no" in firstItem && "category_name" in firstItem) {
          setCategories(response.data as Category[])
        } else {
          // ADD THIS BLOCK - Handle summary case
          const summaryItem = response.data.find(item => item.summary !== undefined)
          if (summaryItem) {
            const deliveryChoice = Number(choice) === 0 ? "keep" : "deliver"
            setTimeout(() => {
              router.push(`/reflections-1/preview/${response.reflection_id}?delivery=${deliveryChoice}`)
            }, 1500)
            return
          }
        }
      }
    }
  } catch (err) {
    console.error("Choice error:", err)
    setApiError("Failed to process choice. Please try again.")
  } finally {
    setIsThinking(false)
  }
}

  const handleIntentSelection = async (categoryNo: number) => {
    if (!chatDetail) return

    const category = categories.find(cat => cat.category_no === categoryNo)
    if (!category) return

    addMessage(category.category_name, "user")

    try {
      setIsThinking(true)

      const response = await sendReflectionRequest({
        reflection_id: chatDetail.reflection_id,
        message: "",
        data: [{ category_no: categoryNo }]
      })

      if (response && response.success) {
        await simulateThinkingAndResponse(response.sarthi_message)
        setCategories([])

        if (response.data && response.data.length > 0) {
          const firstItem = response.data[0]
          if ('choice' in firstItem && 'label' in firstItem) {
            setChoices(response.data as Choice[])
          }
        }
      }
    } catch (error) {
      console.error("Intent selection error:", error)
      setApiError("Failed to process selection. Please try again.")
    } finally {
      setIsThinking(false)
    }
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "items-start gap-4"}`}
            >
              {message.role === "assistant" && (
                <div className="mt-1">
                  <SarthiOrb size="sm" />
                </div>
              )}

              <div className={`max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
          <div
  className={`px-6 py-4 rounded-3xl ${
    message.role === "user"
      ? "bg-[#1e1e1e] border border-[#2a2a2a]"
      : "bg-[#2a2a2a] border border-[#3a3a3a]"
  }`}
>
  <p className="text-white leading-relaxed whitespace-pre-wrap">
    {message.content}
    {streamingMessageId === message.id && (
      <span className="inline-block w-2 h-5 bg-white/60 ml-1 animate-pulse" />
    )}
  </p>
</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-4">
              <div className="mt-1"></div>
              <div className="flex-1">
                <SarthiThinking />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
   
{!conversationCompleted && (
  <div className="border-t border-white/10 p-4">
    <div className="max-w-4xl mx-auto">
      {choices.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {choices.map((choice, i) => (
            <SarthiButton
              key={i}
              onClick={() => handleChoiceSelect(choice.choice)}
              disabled={isThinking}
              className="flex-1 min-w-0"
            >
              {choice.label}
            </SarthiButton>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category, i) => (
            <SarthiButton
              key={i}
              onClick={() => handleIntentSelection(category.category_no)}
              disabled={isThinking}
              className="flex-1 min-w-0"
            >
              {category.category_name}
            </SarthiButton>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 items-end">
          <SarthiInput
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              const newHeight = Math.min(e.target.scrollHeight, 150)
              e.target.style.height = newHeight + 'px'
            }}
            placeholder="Continue your reflection..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleChatInput(input)
                setInput("")
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto'
                }
              }
            }}
            disabled={isThinking}
            style={{ maxHeight: '150px', minHeight: '44px', resize: 'none' }}
          />
          <SarthiButton
            onClick={() => {
              handleChatInput(input)
              setInput("")
              if (inputRef.current) {
                inputRef.current.style.height = 'auto'
              }
            }}
            disabled={!input.trim() || isThinking}
            className="shrink-0"
          >
            Send
          </SarthiButton>
        </div>
      )}
    </div>
  </div>
)}

      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-[16px]">
          <div className="flex items-center gap-3">
            <p className="text-sm">{apiError}</p>
            <button
              onClick={() => setApiError(null)}
              className="text-red-400/60 hover:text-red-400"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}