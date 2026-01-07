"use client"

import React, { useState, useRef, useEffect, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { SarthiOrb } from "@/components/sarthi-orb"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiThinking } from "@/components/sarthi-thinking"
import { ArrowLeft } from "lucide-react"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle } from "lucide-react"
import { getCurrentUser, getAuthHeaders, logout } from "@/app/actions/auth"
//import mixpanel, { initMixpanel } from "@/lib/mixpanel"
import { authFetch } from "@/lib/api"

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

    const responseData = await response.json();
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
  | "welcome"
  | "conversation"
  | "distress-detected"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

interface Choice {
  choice: string;
  label: string;
}

interface Category {
  category_no: number;
  category_name: string;
}


const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming,
}: {
  message: Message
  isStreaming: boolean
}) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "items-start gap-4"}`}>
      {message.role === "assistant" && (
        <div className="mt-1">
          <SarthiOrb size="sm" />
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
    <div
  className={`px-4 py-3 sm:px-6 sm:py-4 rounded-3xl ${message.role === "user"
    ? "bg-[#1e1e1e] border border-[#2a2a2a]"
    : "bg-[#2a2a2a] border border-[#3a3a3a]"
    }`}
>
  <p className="text-white leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
    {message.content ?? ""}
    {isStreaming && (
      <span className="inline-block w-2 h-5 bg-white/60 ml-1 animate-pulse" />
    )}
  </p>
</div>

        <div className="mt-2 text-xs text-white/40">
          {message.timestamp?.toLocaleTimeString?.()}
        </div>
      </div>
    </div>
  )
})


export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
const [currentStep, setCurrentStep] = useState<ChatStep>("conversation");

  const [isThinking, setIsThinking] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [reflectionId, setReflectionId] = useState<string | null>(null)
  const [progress, setProgress] = useState({ current_step: 1, total_step: 4, workflow_completed: false })
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [continueChoice, setContinueChoice] = useState<"ask" | "continue" | "new" | null>(null)
  const [choices, setChoices] = useState<Choice[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [isFetchingHistory, setIsFetchingHistory] = useState(false);
const prevLengthRef = useRef<number>(0);

 const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
const messagesContainerRef = useRef<HTMLDivElement>(null);
const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

 useEffect(() => {
//initMixpanel();

const inviteCode = searchParams.get("invite");
if (inviteCode) {
// mixpanel.track("invite_link_opened", {
// invite_code_source: "direct", 
// sender_detail: inviteCode,
// });
}


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
        await initializeChat()
      } else if (!authenticated) {
        router.push('/auth')
      }
    } catch (error) {
      router.push('/auth')
    }
  }

// helper: convert backend sender → UI role
const senderToRole = (sender: any): "user" | "assistant" => {
  // Backend: 1 = assistant (Sarthi), 0 = user
  return sender === 1 || sender === "assistant" || sender === "sarthi"
    ? "assistant"
    : "user";
};


// const fetchHistory = async (pageNum: number) => {
//   try {
//     setIsFetchingHistory(true);
//     setIsLoadingOlderMessages(true); // 👈 Add this flag

//     // Store scroll height before loading older messages
//     if (messagesContainerRef.current) {
//       setPreviousScrollHeight(messagesContainerRef.current.scrollHeight);
//     }

//     const res = await authFetch(`/reflection/history?page=${pageNum}&limit=10`);
//     if (!res.ok) throw new Error("Failed to fetch history");

//     const result = await res.json();
//     console.log("Fetched history:", result);

//     const reflections = Array.isArray(result?.data) ? result.data : [];

//     // Flatten, sanitize, and sort by time (oldest→newest) for this batch
//     const batch: Message[] = reflections.flatMap((r: any) => {
//       const chats = Array.isArray(r.chat_history) ? r.chat_history : [];
//       return chats
//         .filter(
//           (c: any) =>
//             typeof c?.message === "string" && c.message.trim().length > 0
//         )
//         .map((c: any, idx: number) => ({
//           id: `${r.reflection_id}-${c.created_at}-${idx}-${Math.random()
//             .toString(36)
//             .slice(2, 8)}`,
//           role: senderToRole(c.sender),
//           content: c.message.trim(),
//           timestamp: new Date(c.created_at),
//         }));
//     });

//     batch.sort(
//       (a, b) => (a.timestamp?.getTime() ?? 0) - (b.timestamp?.getTime() ?? 0)
//     );

//     // Prepend older batch at the top
//     setMessages((prev) => [...batch, ...prev]);

//     // Update pagination state
//     setHasMore(reflections.length === 10);
    
//   } catch (err) {
//     console.error("History fetch error:", err);
//     setHasMore(false);
//   } finally {
//     setIsFetchingHistory(false);
//     // 👈 Don't reset the flag here, let useEffect handle it
//   }
// };





  const formatDateDivider = (date: Date) => {
    const today = new Date().toDateString()
    const messageDate = date.toDateString()
    if (today === messageDate) return "Today"
    return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
  }

  // Initialize chat - only called once
const initializeChat = async () => {
  if (hasInitialized) return

  try {
    setIsThinking(true)
    setCurrentStep("loading")

    const user = await getCurrentUser()
    setUserName(user?.name || "there")

   // Check if user is coming from ELS test
const fromELS = searchParams.get("from") === "els";

const initialRequest = fromELS
  ? {
      reflection_id: "",
      message: "",
      data: [
        {
          type: "els_transition",
          els_to_reflection: 1
        }
      ]
    }
  : {
      reflection_id: "",
      message: "",
      data: [{ choice: "0" }] // Force "start new"
    };

    const response = await apiService.sendReflectionRequest(initialRequest)

    // Case 1: distress flag
    if (!response.success && checkForDistress(response.data)) {
      setCurrentStep("distress-detected")
      return
    }

    // Save reflection id
    if (response.reflection_id) {
      setReflectionId(response.reflection_id)
    }

    setProgress({
      current_step: response.current_stage ?? 0,
      total_step: 100,
      workflow_completed: response.progress?.workflow_completed ?? false
    })

    // Handle response data
    if (response.data && response.data.length > 0) {
      const firstItem = response.data[0]
      if ('choice' in firstItem && 'label' in firstItem) {
        setChoices(response.data as Choice[])
        setCategories([])
      } else if ('category_no' in firstItem && 'category_name' in firstItem) {
        setCategories(response.data as Category[])
        setChoices([])
      }
    }

    // Add Sarthi's welcome message ONLY ONCE
    if (response.sarthi_message) {
      addMessage(response.sarthi_message, "assistant")
    }

    setCurrentStep("conversation")
    setHasInitialized(true)
  } catch (error) {
    console.error("Failed to initialize chat:", error)
    setApiError("Failed to start reflection. Please try again.")
  } finally {
    setIsThinking(false)
  }
}

  const addMessage = (
    content: string,
    sender: "user" | "sarthi" | "assistant",
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


const handleSignOut = async () => {
  try {
    await logout()
    console.log("Successfully signed out.")
  } catch (error) {
    console.warn("Error signing out:", error)
  } finally {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = "/auth"
  }
}
  const simulateThinkingAndResponse = async (
    content: string,
    thinkingDuration = 0,
    streamSpeed = 0,
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
    }, streamSpeed);
  };

  const handleIntentSelection = async (categoryNo: number) => {
    if (!reflectionId) return

    const category = categories.find(cat => cat.category_no === categoryNo)
    if (!category) return

    addMessage(category.category_name, "user")

    try {
      setIsThinking(true)

      const request = {
        reflection_id: reflectionId,
        message: "",
        data: [{ category_no: categoryNo }]
      };

      const response = await apiService.sendReflectionRequest(request)

      if (!response.success && checkForDistress(response.data)) {
        setCurrentStep("distress-detected")
        return
      }

      if (response && response.success) {
        //mixpanel.track("profile_name_set", { name_setup: true });
        await simulateThinkingAndResponse(response.sarthi_message)

        // Clear categories after selection
        setCategories([])

        // Handle new data from response
        if (response.data && response.data.length > 0) {
          const firstItem = response.data[0]
          if ('choice' in firstItem && 'label' in firstItem) {
            setChoices(response.data as Choice[])
          }
        }

        setCurrentStep("conversation")
      }
    } catch (error) {
      console.error("Intent selection error:", error)
      setApiError("Failed to process selection. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }



const handleChoiceSelect = async (choice: string) => {
  console.log(choice);
  const selectedChoice = choices.find(c => c.choice === choice);
  if (selectedChoice) {
    addMessage(selectedChoice.label, "user");
  }

  setIsThinking(true);
  try {
    const isContinuePrompt =
      choices.length === 2 &&
      choices.some(c => c.label.toLowerCase() === "yes") &&
      choices.some(c => c.label.toLowerCase() === "no");

    const response = await apiService.sendReflectionRequest({
      reflection_id: isContinuePrompt ? "" : reflectionId,
      message: "",
      data: [{ choice }]
    });

    console.log("Choice response:", response);

      if (response.reflection_id) {
      setReflectionId(response.reflection_id);
    }

    if (response.data?.some(item => item.session_closed === true || item.session_end === true)) {
      handleSessionEnd();
      return;
    }

    if (response.success) {
      if (response.sarthi_message) {
        await simulateThinkingAndResponse(response.sarthi_message);
      }

      setChoices([]);

if (response.current_stage === 20) {
  // Get the delivery choice from the selected choice
  const deliveryChoice = Number(choice) === 0 ? "keep" : "deliver";
  setTimeout(() => {
    router.push(`/reflections-1/preview/${response.reflection_id}?delivery=${deliveryChoice}`)
  }, 1500);
  return;
}
      if (response.data && response.data.length > 0) {
        const firstItem = response.data[0];
        if ("choice" in firstItem && "label" in firstItem) {
          setChoices(response.data as Choice[]);
        } else if ("category_no" in firstItem && "category_name" in firstItem) {
          setCategories(response.data as Category[]);
        } else {
         const summaryItem = response.data.find(item => item.summary !== undefined);
if (summaryItem) {
  const deliveryChoice = Number(choice) === 0 ? "keep" : "deliver";
  setTimeout(() => {
    addMessage(`Here's your reflection: ${summaryItem.summary}`, "sarthi");
    router.push(`/reflections-1/preview/${response.reflection_id}?delivery=${deliveryChoice}`);
  }, 100);
}
        }
      }

      setProgress({
        current_step: response.current_stage ?? 0,
        total_step: 100,
        workflow_completed: response.progress?.workflow_completed ?? false
      });
    }
  } catch (err) {
    console.error("Choice error:", err);
    setApiError("Failed to process choice. Please try again.");
  } finally {
    setIsThinking(false);
  }
};




  const handleSessionEnd = () => {
  setReflectionId(null);
  setProgress({ current_step: 1, total_step: 100, workflow_completed: false });
  setChoices([]);
  setCategories([]);
  setMessages([]);
  setShowWelcome(true);
  setCurrentStep("welcome");
  setContinueChoice("ask"); 
};


// Add this helper function near the top of your component, after the interfaces
const checkForDistress = (data: Array<{ [key: string]: any }>) => {
  if (!data || !Array.isArray(data)) return false;
  return data.some(item => item.distress_level === "critical");
};
  const handleChatInput = async (inputMessage: string) => {
    if (!inputMessage.trim()) return

    addMessage(inputMessage, "user")

    try {
      setIsThinking(true)

      const request: ApiRequest = {
        reflection_id: reflectionId,
        message: inputMessage,
        data: []
      }

      const response = await apiService.sendReflectionRequest(request);
      console.log("Chat response:", response)

    if (response.data?.some(item => item.session_closed === true || item.session_end === true)) {
  handleSessionEnd();
  return;
}


      if (checkForDistress(response.data)) {
        setCurrentStep("distress-detected");
        return;
      }

      if (response && response.success) {
        await simulateThinkingAndResponse(response.sarthi_message)

        setProgress({
          current_step: response.current_stage ?? 1,
          total_step: 100,
          workflow_completed: response.progress?.workflow_completed ?? false
        })

     if (response.current_stage === 20) {
  setTimeout(() => {
    router.push(`/reflections-1/preview/${response.reflection_id}`)
  }, 1500);
  return;
}


        if (response.data && response.data.length > 0) {
          const firstItem = response.data[0]
          if ('choice' in firstItem && 'label' in firstItem) {
            setChoices(response.data as Choice[])
            setCategories([])
          } else if ('category_no' in firstItem && 'category_name' in firstItem) {
            setCategories(response.data as Category[])
            setChoices([])
          } else {
      
            const summaryItem = response.data.find(item => item.summary !== undefined);
if (summaryItem) {
  setTimeout(() => {
    addMessage(`Here's your reflection: ${summaryItem.summary}`, "sarthi");
    router.push(`/reflections-1/preview/${response.reflection_id}`);
  }, 100);
}
          }
        }
      }
    } catch (error) {
      console.error("Chat input error:", error)
      setApiError("Failed to send message. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }



// useEffect(() => {
//   const prevLen = prevLengthRef.current;
//   const currLen = messages.length;

//   // If we're loading older messages, maintain scroll position
//   if (isLoadingOlderMessages && messagesContainerRef.current) {
//     const container = messagesContainerRef.current;
//     const newScrollHeight = container.scrollHeight;
//     const scrollDiff = newScrollHeight - previousScrollHeight;
    
//     // Maintain relative scroll position after older messages are loaded
//     container.scrollTop = container.scrollTop + scrollDiff;
    
//     setIsLoadingOlderMessages(false); // Reset the flag
//     return;
//   }

//   // Only scroll to bottom for new messages (length increased) or when streaming ends
//   if (currLen > prevLen) {
//     scrollToBottom();
//   } else if (prevLengthRef.current === currLen && streamingMessageId === null) {
//     scrollToBottom();
//   }

//   prevLengthRef.current = currLen;
// }, [messages.length, streamingMessageId, isLoadingOlderMessages, previousScrollHeight]);
useEffect(() => {
  scrollToBottom()
}, [messages.length])


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
    window.location.reload()
  }}
  className="w-full"
>
  Continue with Sarthi
</SarthiButton>

            <button
  onClick={handleSignOut}
  className="w-full p-3 text-white/60 hover:text-white transition-colors"
>
  Sign out
</button>
            </div>

            <div className="text-xs text-white/40 leading-relaxed">
              <p>To get in touch with Counsellor: Dial 14416 or 1-800 891 4416</p>
              <p>Crisis resources: National Suicide Prevention Lifeline: 988</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Chat Interface
  return (
    <div className="h-[100dvh] bg-[#121212] flex flex-col safe-bottom">
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
            <SarthiOrb size="sm" />
            <div>
              <h1 className="text-white font-medium text-lg sm:text-xl">
                Reflection Session
              </h1>
              {progress && (
                <p className="text-white/60 text-xs sm:text-sm">
                {progress.workflow_completed && " - Complete"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
        <div className="p-4 sm:p-6">
          <div className="max-w-full sm:max-w-4xl mx-auto space-y-6">
   {messages.map((message, i) => {
  const prevMsg = messages[i - 1]
  const prevDate = prevMsg?.timestamp
    ? new Date(prevMsg.timestamp).toDateString()
    : null
  const currDate = message.timestamp 
    ? new Date(message.timestamp).toDateString() 
    : new Date().toDateString()
  const showDivider = prevDate !== currDate

  return (
    <div key={message.id}>
      {showDivider && (
        <div className="text-center text-xs text-gray-400 my-4">
          ---{" "}
          {currDate === new Date().toDateString()
            ? "Today"
            : currDate}
          ---
        </div>
      )}
      <ChatMessage message={message} isStreaming={streamingMessageId === message.id} />
    </div>
  )
})}
            {/* Thinking indicator */}
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
      </div>

      {/* Input / Choices */}
    {currentStep === "conversation" && (
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
            placeholder="Share what's on your mind..."
            className="flex-1 text-base sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleChatInput(input)
                setInput("")
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto'
                }
                inputRef.current?.focus()
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
              inputRef.current?.focus()
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
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>)
}
