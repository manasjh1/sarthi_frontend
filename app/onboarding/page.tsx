"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle } from "lucide-react"

type OnboardingStep = "success" | "name-entry" | "space-setup" | "reflection-prompt" | "complete"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("success")
  const [name, setName] = useState("")
  const [stayAnonymous, setStayAnonymous] = useState(false)
  const [selectedReflection, setSelectedReflection] = useState<string | null>(null)
  const [setupProgress, setSetupProgress] = useState(0)
  const [nameError, setNameError] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)

  // Auto-progress from success to name entry
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        setStep("name-entry")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Space setup progress animation
  useEffect(() => {
    if (step === "space-setup") {
      const progressInterval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setStep("reflection-prompt")
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(progressInterval)
    }
  }, [step])

  const validateName = (inputName: string) => {
    if (inputName.length < 2) {
      return "Name should be at least 2 characters"
    }
    if (inputName.length > 32) {
      return "Name should be no more than 32 characters"
    }
    if (!/^[a-zA-Z\s'-]+$/.test(inputName)) {
      return "Please use only letters, spaces, hyphens, and apostrophes"
    }
    return ""
  }

  const handleNameSubmit = () => {
    if (stayAnonymous) {
      setStep("space-setup")
      return
    }

    const error = validateName(name.trim())
    if (error) {
      setNameError(error)
      return
    }

    setNameError("")
    // In real app, save name to database/storage
    console.log("Saving name:", name.trim())
    setStep("space-setup")
  }

  const handleReflectionSelect = (reflectionType: string) => {
    setSelectedReflection(reflectionType)
    setIsNavigating(true)

    // Add a smooth transition before navigating
    setTimeout(() => {
      // Navigate to chat with the selected reflection type
      router.push(`/chat?intent=${reflectionType}`)
    }, 300)
  }

  const handleContinueFromSuccess = () => {
    setStep("name-entry")
  }

  // STEP 1: Success Message
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-gentle-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-gentle-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="text-center space-y-8 z-10 sarthi-fade-in">
          {/* Sarthi logo with soft glow */}
          <div className="mb-6 relative">
            {/* Outer glow */}
            <div
              className="absolute rounded-full animate-gentle-pulse"
              style={{
                width: 120,
                height: 120,
                top: -10,
                left: -10,
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)",
              }}
            ></div>

            {/* Inner glow */}
            <div
              className="absolute rounded-full animate-gentle-pulse"
              style={{
                width: 100,
                height: 100,
                top: 0,
                left: 0,
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                animationDelay: "0.5s",
              }}
            ></div>

            {/* Logo container */}
            <div className="relative w-24 h-24 mx-auto bg-[#1A1A1A] rounded-full border border-[#2A2A2A] flex items-center justify-center">
              <SarthiIcon size="lg" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-light text-white">You're in.</h1>
            <p className="text-white/60 text-xl max-w-md mx-auto leading-relaxed">
              Let's make this space feel more like you.
            </p>
          </div>

          <SarthiButton onClick={handleContinueFromSuccess} className="px-8 py-4 text-lg font-medium">
            Continue
          </SarthiButton>
        </div>
      </div>
    )
  }

  // STEP 2: Name Entry
  if (step === "name-entry") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 sarthi-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-white">What should we call you?</h1>
          </div>

          <div className="sarthi-card p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <SarthiInput
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !stayAnonymous) {
                      handleNameSubmit()
                    }
                  }}
                  disabled={stayAnonymous}
                  className={stayAnonymous ? "opacity-50" : ""}
                />
                {nameError && <div className="text-red-400 text-sm">{nameError}</div>}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="stay-anonymous"
                  checked={stayAnonymous}
                  onChange={(e) => {
                    setStayAnonymous(e.target.checked)
                    if (e.target.checked) {
                      setName("")
                      setNameError("")
                    }
                  }}
                  className="rounded-sm bg-[#1b1b1b] border-[#2a2a2a] text-white focus:ring-white/20"
                />
                <label htmlFor="stay-anonymous" className="text-white/80 text-sm cursor-pointer">
                  Stay anonymous
                </label>
              </div>
            </div>

            <div className="text-center text-sm text-[#cbd5e1]">
              <p>This name appears if you choose to sign messages with it.</p>
            </div>

            <div className="pt-2">
              <SarthiButton
                className="w-full"
                onClick={handleNameSubmit}
                disabled={!stayAnonymous && (!name.trim() || !!nameError)}
              >
                Save and continue
              </SarthiButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3: Safe Space Setup
  if (step === "space-setup") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-gentle-pulse"></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-gentle-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="text-center space-y-8 z-10 sarthi-fade-in">
          {/* Pulsing logo */}
          <div className="relative mx-auto">
            <div
              className="absolute rounded-full animate-gentle-pulse"
              style={{
                width: 140,
                height: 140,
                top: -20,
                left: -20,
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)",
              }}
            ></div>

            <div
              className="absolute rounded-full animate-gentle-pulse"
              style={{
                width: 120,
                height: 120,
                top: -10,
                left: -10,
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%)",
                animationDelay: "0.7s",
              }}
            ></div>

            <div className="relative w-24 h-24 mx-auto bg-[#1A1A1A] rounded-full border border-[#2A2A2A] flex items-center justify-center">
              <SarthiIcon size="lg" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-light text-white">Creating your quiet space…</h1>
            <p className="text-white/60 text-lg">This won't take long.</p>
          </div>

          {/* Progress indicator */}
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="w-full bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-300 ease-out"
                style={{ width: `${setupProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Ambient dots */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  // STEP 4: Reflection Prompt Selector
  if (step === "reflection-prompt") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 sarthi-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-white">What would you like to reflect on today?</h1>
          </div>

          <div className="space-y-4">
            {/* Apology Option */}
            <button
              onClick={() => handleReflectionSelect("apologize")}
              disabled={isNavigating}
              className={`w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group ${
                isNavigating ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedReflection === "apologize" ? "border-white/30 bg-white/10" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <ApologyIcon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-2">Apology</h3>
                  <p className="text-white/60 leading-relaxed">Say what you couldn't say before.</p>
                </div>
              </div>
            </button>

            {/* Gratitude Option */}
            <button
              onClick={() => handleReflectionSelect("gratitude")}
              disabled={isNavigating}
              className={`w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group ${
                isNavigating ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedReflection === "gratitude" ? "border-white/30 bg-white/10" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Heart className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-2">Gratitude</h3>
                  <p className="text-white/60 leading-relaxed">Thank someone for something that mattered.</p>
                </div>
              </div>
            </button>

            {/* Feedback/Boundary Option */}
            <button
              onClick={() => handleReflectionSelect("boundary")}
              disabled={isNavigating}
              className={`w-full p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group ${
                isNavigating ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedReflection === "boundary" ? "border-white/30 bg-white/10" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <MessageCircle className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-2">Feedback or Set a Boundary</h3>
                  <p className="text-white/60 leading-relaxed">Share something hard, clearly and kindly.</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-[#cbd5e1]">
            <p>Choose what feels right for you today. You can always explore other reflections later.</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
