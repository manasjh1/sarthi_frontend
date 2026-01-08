"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SarthiLogo } from "@/components/sarthi-logo"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { CountrySelector } from "@/components/ui/country-selector"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { authFetch } from "@/lib/api"
import { setAuthCookies } from "@/app/actions/auth"

type ContactType = "email" | "phone"
type Step = "contact" | "otp" | "success" | "redirecting"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const defaultCountry: Country = { 
  name: "India", 
  code: "IN", 
  dialCode: "+91", 
  flag: "🇮🇳" 
}

export default function ELSLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("contact")
  const [contactType, setContactType] = useState<ContactType>("email")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [otp, setOtp] = useState("")
  const [currentContact, setCurrentContact] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [redirectProgress, setRedirectProgress] = useState(0)

  const getFullContact = () => {
    return contactType === "email" 
      ? email.trim() 
      : `${selectedCountry.dialCode}${phoneNumber.trim()}`
  }

  const isValidEmail = (email: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const isValidPhone = (phone: string) => 
    /^\d{7,15}$/.test(phone.trim())

  const handleSendOTP = async () => {
    const contact = getFullContact()

    // Validation
    if (contactType === "email") {
      if (!email.trim()) {
        setError("Please enter your email address")
        return
      }
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address")
        return
      }
    } else {
      if (!phoneNumber.trim()) {
        setError("Please enter your phone number")
        return
      }
      if (!isValidPhone(phoneNumber)) {
        setError("Please enter a valid phone number")
        return
      }
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await authFetch("/api/els-auth/login", {
        method: "POST",
        body: JSON.stringify({ contact })
      })

      if (response.status === 429) {
        setError("Too many attempts. Please wait a few minutes before trying again.")
        return
      }

      const result = await response.json()

      if (result.success) {
        setCurrentContact(contact)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
        setStep("otp")
      } else {
        setError(result.message || "Failed to send code")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code")
      return
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await authFetch("/api/els-auth/verify", {
        method: "POST",
        body: JSON.stringify({ 
          contact: currentContact, 
          otp: otp.trim() 
        })
      })

      const result = await response.json()

      if (result.success) {
        // Set cookies using server action
        await setAuthCookies(result.access_token, result.user_id)

        setStep("success")

        // Start redirecting animation
        setTimeout(() => {
          setStep("redirecting")

          // Animate progress bar
          const progressInterval = setInterval(() => {
            setRedirectProgress((prev) => {
              if (prev >= 100) {
                clearInterval(progressInterval)
                router.push("/ELS-Test")
                router.refresh()
                return 100
              }
              return prev + 2
            })
          }, 30)
        }, 1000)
      } else {
        setError(result.message || "The code doesn't match. Please check and try again.")
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!currentContact) {
      setError("Contact information missing")
      return
    }

    setOtp("")
    setIsLoading(true)
    setError("")

    try {
      const response = await authFetch("/api/els-auth/login", {
        method: "POST",
        body: JSON.stringify({ contact: currentContact })
      })

      if (response.status === 429) {
        setError("You've requested too many codes. Please wait a few minutes before retrying.")
        return
      }

      const result = await response.json()

      if (result.success) {
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      } else {
        setError(result.message || "Failed to resend OTP")
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetToContact = () => {
    setStep("contact")
    setEmail("")
    setPhoneNumber("")
    setOtp("")
    setError("")
    setCurrentContact("")
  }

  const renderContactStep = () => (
    <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
      <div className="text-center sarthi-fade-in">
        <h1 className="text-3xl font-medium mb-4 sm:mb-6">
          Take the Emotional Load Test
        </h1>
        <p className="text-[#cbd5e1] mb-4 sm:mb-6">
          Enter your email or phone number to get started. We'll send you a one-time code to verify.
        </p>
      </div>

      <div className="sarthi-card p-4 sm:p-6 space-y-4 rounded-[16px]">
        {/* Contact Type Toggle */}
        <div className="flex bg-[#2a2a2a] rounded-[16px] p-1">
          <button
            type="button"
            onClick={() => {
              setContactType("email")
              setError("")
            }}
            className={`flex-1 py-2 px-3 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              contactType === "email" 
                ? "bg-white text-[#0f0f0f]" 
                : "text-[#cbd5e1] hover:text-white hover:bg-white/10"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setContactType("phone")
              setError("")
            }}
            className={`flex-1 py-2 px-3 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              contactType === "phone" 
                ? "bg-white text-[#0f0f0f]" 
                : "text-[#cbd5e1] hover:text-white hover:bg-white/10"
            }`}
          >
            WhatsApp
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="block text-sm text-[#cbd5e1] text-left">
            {contactType === "email" ? "Email address" : "WhatsApp number"}
          </label>

          {contactType === "email" ? (
            <SarthiInput
              id="contact"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendOTP()
                }
              }}
              className="auth-input"
            />
          ) : (
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={(phone) => {
                setPhoneNumber(phone)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendOTP()
                }
              }}
            />
          )}

          <p className="text-xs text-[#9ca3af]">
            You'll receive a one-time code at this {contactType === "email" ? "address" : "number"}.
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="pt-2">
          <SarthiButton
            className="w-full auth-button rounded-[16px]"
            onClick={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? "Sending code…" : "Send my code"}
          </SarthiButton>
        </div>

        <div className="text-center text-sm text-[#cbd5e1]">
          <p>Ready to understand your emotional load?</p>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-[16px] backdrop-blur-sm shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm">Code sent! Please check your {contactType}.</p>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-green-400/60 hover:text-green-400 transition-colors min-h-[24px] min-w-[24px]"
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

  const renderOtpStep = () => (
    <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
      <div className="text-center space-y-2 sarthi-fade-in">
        <h1 className="text-2xl sm:text-3xl font-medium">
          Enter verification code
        </h1>
        <p className="text-[#cbd5e1] text-sm sm:text-base">
          A secure code has been sent to <span className="text-white">{currentContact}</span>.
          Please enter the verification code below.
        </p>
      </div>

      <div className="sarthi-card p-4 sm:p-6 space-y-6 rounded-[16px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm text-[#cbd5e1] text-left">
              Verification code
            </label>
            <SarthiInput
              id="otp"
              type="text"
              placeholder="Enter the 6-digit code"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerifyOTP()
                }
              }}
              maxLength={6}
              className="auth-input"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="pt-2">
          <SarthiButton
            className="w-full auth-button rounded-[16px]"
            onClick={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify and continue"}
          </SarthiButton>
        </div>

        <div className="text-center">
          <button
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-[#cbd5e1] hover:text-white transition-colors text-sm disabled:opacity-50 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Didn't receive it yet? Try again
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={resetToContact}
          className="text-[#cbd5e1] hover:text-white transition-colors text-sm min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Use a different {contactType === "email" ? "email" : "phone number"}
        </button>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-6 sarthi-fade-in">
        <div className="relative mx-auto">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
              <SarthiIcon size="md" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-medium text-green-400">
            Verification successful!
          </h1>
          <p className="text-[#cbd5e1]">
            You're all set to take the test
          </p>
        </div>
      </div>
    </div>
  )

  const renderRedirectingStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-6 sarthi-fade-in">
        <div className="relative mx-auto">
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

          <div className="relative w-24 h-24 mx-auto bg-[#1A1A1A] rounded-full border border-[#2A2A2A] flex items-center justify-center">
            <SarthiIcon size="lg" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-medium text-white">Preparing your test...</h1>
          <p className="text-[#cbd5e1]">
            Taking you to the Emotional Load Test
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-300 ease-out"
              style={{ width: `${redirectProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-[#cbd5e1]">{Math.round(redirectProgress)}% complete</p>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <button onClick={() => window.location.reload()} className="hover:opacity-80 transition-opacity">
          <SarthiLogo size="md" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {step === "contact" && renderContactStep()}
        {step === "otp" && renderOtpStep()}
        {step === "success" && renderSuccessStep()}
        {step === "redirecting" && renderRedirectingStep()}
      </div>
    </div>
  )
}