"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"

interface SarthiMessageFeedbackProps {
  messageId: string
  onFeedback: (messageId: string, type: "positive" | "negative" | "regenerate") => void
  className?: string
}

export function SarthiMessageFeedback({ messageId, onFeedback, className = "" }: SarthiMessageFeedbackProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleFeedback = (type: "positive" | "negative" | "regenerate") => {
    if (type === "regenerate") {
      setIsRegenerating(true)
      onFeedback(messageId, type)
      // Reset regenerating state after a delay
      setTimeout(() => setIsRegenerating(false), 2000)
    } else {
      setFeedback(type)
      onFeedback(messageId, type)
    }
  }

  return (
    <div className={`flex items-center gap-2 mt-3 ${className}`}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFeedback("positive")}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 ${
            feedback === "positive" ? "bg-green-500/20 text-green-400" : "text-white/40 hover:text-white/60"
          }`}
          title="This response was helpful"
        >
          <ThumbsUp size={14} />
        </button>

        <button
          onClick={() => handleFeedback("negative")}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 ${
            feedback === "negative" ? "bg-red-500/20 text-red-400" : "text-white/40 hover:text-white/60"
          }`}
          title="This response was not helpful"
        >
          <ThumbsDown size={14} />
        </button>

        <button
          onClick={() => handleFeedback("regenerate")}
          disabled={isRegenerating}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 text-white/40 hover:text-white/60 ${
            isRegenerating ? "animate-spin" : ""
          }`}
          title="Regenerate this response"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {feedback && (
        <span className="text-xs text-white/50 ml-2">
          {feedback === "positive" ? "Thanks for the feedback!" : "We'll improve this response"}
        </span>
      )}
    </div>
  )
}
