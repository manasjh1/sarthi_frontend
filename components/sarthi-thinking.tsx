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
  const [currentThought, setCurrentThought] = useState("")
  const [dotCount, setDotCount] = useState(0)

  const thinkingPhrases = [
    "thinking",
    "reflecting",
    "considering your words",
    "finding the right response",
    "processing",
    "understanding",
  ]

  useEffect(() => {
    // Cycle through thinking phrases
    const phraseInterval = setInterval(() => {
      const randomPhrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)]
      setCurrentThought(randomPhrase)
    }, 100)

    // Animate dots
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4)
    }, 100)

    // Complete after duration
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, duration)

    return () => {
      clearInterval(phraseInterval)
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
          <span className="text-sm italic">{currentThought}</span>
          <span className="text-sm">{"•".repeat(dotCount)}</span>
        </div>
      </div>
    </div>
  )
}
