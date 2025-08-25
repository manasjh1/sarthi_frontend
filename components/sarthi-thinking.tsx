"use client"

import { useState, useEffect } from "react"
import { SarthiOrb } from "./sarthi-orb"

interface SarthiThinkingProps {
  emotion?: "neutral" | "calm" | "empathetic" | "supportive"
  thinkingText?: string
  onComplete?: () => void
  duration?: number
}

export function SarthiThinking({
  emotion = "neutral",
  thinkingText = "thinking",
  onComplete,
  duration = 100,
}: SarthiThinkingProps) {
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    // Animate dots
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4)
    }, 100)

    // Complete after duration
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, duration)

    return () => {
      clearInterval(dotInterval)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  return (
    <div className="flex items-start gap-4 message-bubble">
      <div className="mt-1">
        <SarthiOrb isTyping={true} emotion={emotion} size="sm" />
      </div>
      <div className="message-bubble-content message-bubble-sarthi px-6 py-4">
        <div className="flex items-center gap-2 text-white/60">
          <span className="text-sm italic">{thinkingText}</span>
          <span className="text-sm">{"•".repeat(dotCount)}</span>
        </div>
      </div>
    </div>
  )
}
