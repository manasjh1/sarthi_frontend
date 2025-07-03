"use client"

import { useState, useEffect } from "react"
import { SarthiIcon } from "./sarthi-icon"

interface SarthiOrbProps {
  isTyping?: boolean
  emotion?: "neutral" | "calm" | "empathetic" | "supportive"
  size?: "sm" | "md" | "lg"
}

export function SarthiOrb({ isTyping = false, emotion = "neutral", size = "md" }: SarthiOrbProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0)

  // Size mapping - increased all sizes
  const sizeMap = {
    sm: 32,
    md: 42,
    lg: 52,
  }

  // Emotion color mapping
  const glowColor = {
    neutral: "rgba(255, 255, 255, 0.15)",
    calm: "rgba(134, 239, 172, 0.15)",
    empathetic: "rgba(147, 197, 253, 0.15)",
    supportive: "rgba(252, 211, 77, 0.15)",
  }

  // Pulse animation when typing
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setPulseIntensity((prev) => (prev >= 1 ? 0 : prev + 0.1))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setPulseIntensity(0)
    }
  }, [isTyping])

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className={`absolute rounded-full transition-all duration-700 ease-in-out ${isTyping ? "animate-pulse" : ""}`}
        style={{
          width: sizeMap[size] * 2.2,
          height: sizeMap[size] * 2.2,
          background: `radial-gradient(circle, ${glowColor[emotion]} 0%, transparent 70%)`,
          opacity: isTyping ? 0.6 + pulseIntensity * 0.4 : 0.3,
        }}
      ></div>

      {/* Inner glow */}
      <div
        className={`absolute rounded-full transition-all duration-500 ${isTyping ? "animate-pulse" : ""}`}
        style={{
          width: sizeMap[size] * 1.6,
          height: sizeMap[size] * 1.6,
          background: `radial-gradient(circle, ${glowColor[emotion]} 0%, transparent 70%)`,
          opacity: isTyping ? 0.8 + pulseIntensity * 0.2 : 0.5,
        }}
      ></div>

      {/* Logo container */}
      <div
        className="relative flex items-center justify-center rounded-full bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden"
        style={{
          width: sizeMap[size] + 8,
          height: sizeMap[size] + 8,
        }}
      >
        {/* S-only icon - using the same size as the container for better fill */}
        <SarthiIcon size={size} />
      </div>
    </div>
  )
}
