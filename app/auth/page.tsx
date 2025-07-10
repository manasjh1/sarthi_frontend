"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SarthiLogo } from "@/components/sarthi-logo"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { CountrySelector } from "@/components/ui/country-selector"
import { validateInviteCode, verifyOTP } from "@/app/actions/auth"
import { SarthiIcon } from "@/components/ui/sarthi-icon"

type AuthStep = "entry" | "invite-code" | "otp-verification" | "success" | "welcome" | "redirecting"
type UserType = "new" | "existing" | null
type ContactType = "email" | "phone"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const defaultCountry: Country = { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" }

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>("entry")
  const [userType, setUserType] = useState<UserType>(null)
  const [contactType, setContactType] = useState<ContactType>("email")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)
  const [inviteCode, setInviteCode] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentContact, setCurrentContact] = useState("") // Store the contact used for OTP
  const [redirectProgress, setRedirectProgress] = useState(0)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | undefined>(undefined)

  const getFullContact = () => {
    if (contactType === "email") {
      return email.trim()
    } else {
      return `${selectedCountry.dialCode}${phoneNumber.trim()}`
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const isValidPhone = (phone: string) => {
    return /^\d{7,15}$/.test(phone.trim())
  }

  // Remove unused imports and mock functions since we're not using them
  // const checkUserExists = async (contact: string) => {
  //   return { exists: true }
  // }

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const data = await response.json();
          console.log('Backend connection successful:', data);
        } else {
          console.error('Backend health check failed:', response.status);
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
      }
    };
    
    testConnection();
  }, []);

  const handleContinue = async () => {
    console.log("handleContinue called")
    console.log("contactType:", contactType)
    console.log("email:", email)
    console.log("phoneNumber:", phoneNumber)

    const contact = getFullContact()
    console.log("Full contact:", contact)

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
      // Since your backend doesn't have send-otp endpoint, we'll simulate sending OTP
      // and go directly to verification step
      setCurrentContact(contact) // Store the contact for OTP verification

      console.log("Simulating OTP send - moving to verification step")
      
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000) // Auto-dismiss after 3 seconds

      console.log("Moving to OTP verification step")
      setStep("otp-verification")
    } catch (err) {
      console.error("Error in handleContinue:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter your invite code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await validateInviteCode(inviteCode)
      console.log("Invite validation result:", result)

      if (result.success && result.valid) {
        // Store invite token for later use
        setInviteToken(result.inviteToken)
        
        // Show success message for invite code validation
        setStep("success")
        setTimeout(() => {
          setStep("entry")
          setInviteCode("")
          setError("")
        }, 2000)
      } else {
        setError(result.message || "That code doesn't seem to be valid. Please check it and try again.")
      }
    } catch (err) {
      console.error("Error in handleInviteCode:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced OTP verification with smooth transition
  const handleOtpVerification = async () => {
    console.log("handleOtpVerification called")
    console.log("OTP entered:", otp)
    console.log("Current contact:", currentContact)
    console.log("User type:", userType)
    console.log("Invite token:", inviteToken)

    if (!otp.trim()) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Verifying OTP...")
      const result = await verifyOTP(currentContact, otp, inviteToken)
      console.log("OTP verification result:", result)

      if (result.success) {
        console.log("OTP verification successful, starting smooth transition")
        
        // Update user type based on response
        if (result.isNewUser !== undefined) {
          setUserType(result.isNewUser ? "new" : "existing")
        }

        // Show success state
        setStep("success")

        // After showing success, start the redirecting animation
        setTimeout(() => {
          setStep("redirecting")

          // Animate progress bar
          const progressInterval = setInterval(() => {
            setRedirectProgress((prev) => {
              if (prev >= 100) {
                clearInterval(progressInterval)
                // Use Next.js router for smooth client-side navigation
                router.push(result.redirectTo || "/onboarding")
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
      console.error("Error in handleOtpVerification:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      // Since your backend doesn't have send-otp endpoint, just simulate success
      console.log("Simulating OTP resend for:", currentContact)
      
      setError("")
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err) {
      console.error("Error in handleResendOTP:", err)
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetToEntry = () => {
    setStep("entry")
    setEmail("")
    setPhoneNumber("")
    setOtp("")
    setError("")
    setCurrentContact("")
    setUserType(null)
    setInviteToken(undefined)
  }

  const renderEntryStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center sarthi-fade-in">
        <h1 className="text-3xl font-medium mb-8">I'm Sarthi, your personal confidant</h1>
        <p className="text-[#cbd5e1] mb-6">
          To get started, enter the email or phone where you received your message. I'll send you a one-time code to
          sign in.
        </p>
      </div>

      <div className="sarthi-card p-6 space-y-6 rounded-[16px]">
        {/* Contact Type Toggle */}
        <div className="flex bg-[#2a2a2a] rounded-[16px] p-1">
          <button
            type="button"
            onClick={() => {
              console.log("Switching to email")
              setContactType("email")
              setError("")
            }}
            className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              contactType === "email" ? "bg-white text-[#0f0f0f]" : "text-[#cbd5e1] hover:text-white hover:bg-white/10"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              console.log("Switching to phone")
              setContactType("phone")
              setError("")
            }}
            className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              contactType === "phone" ? "bg-white text-[#0f0f0f]" : "text-[#cbd5e1] hover:text-white hover:bg-white/10"
            }`}
          >
            Phone
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="contact" className="block text-sm text-[#cbd5e1] text-left">
              {contactType === "email" ? "Email address" : "Phone number"}
            </label>

            {contactType === "email" ? (
              <SarthiInput
                id="contact"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  console.log("Email changed to:", e.target.value)
                  setEmail(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("Enter pressed on email input")
                    handleContinue()
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
                  console.log("Phone changed to:", phone)
                  setPhoneNumber(phone)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("Enter pressed on phone input")
                    handleContinue()
                  }
                }}
              />
            )}

            {/* Helper text */}
            <p className="text-xs text-[#9ca3af]">
              You'll receive a one-time code at this {contactType === "email" ? "address" : "number"}.
            </p>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm" role="alert" aria-live="polite" tabIndex={-1}>
            {error}
          </div>
        )}

        <div className="pt-2">
          <SarthiButton
            className="w-full auth-button rounded-[16px]"
            onClick={(e) => {
              e.preventDefault()
              console.log("Send my code button clicked")
              handleContinue()
            }}
            disabled={isLoading}
          >
            {isLoading ? "Sending code…" : "Send my code"}
          </SarthiButton>
        </div>

        <div className="text-center text-sm text-[#cbd5e1]">
          <p>Take a deep breath. I'm here when you are.</p>
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={(e) => {
            e.preventDefault()
            setStep("invite-code")
          }}
          className="text-[#cbd5e1] hover:text-white transition-colors text-sm underline min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Have an invite code?
        </button>
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
            <p className="text-sm">Great! I've sent your code. I'll be right here when you enter it.</p>
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
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2 sarthi-fade-in">
        <h1 className="text-3xl font-medium">
          Enter verification code
        </h1>
        <p className="text-[#cbd5e1]">
          A secure code has been sent to <span className="text-white">{currentContact}</span>. 
          Please enter the verification code below.
        </p>
      </div>

      <div className="sarthi-card p-6 space-y-6 rounded-[16px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm text-[#cbd5e1] text-left">
              Verification code
            </label>
            <SarthiInput
              id="otp"
              type="text"
              placeholder="Enter the 6-digit code (Dev: 141414)"
              value={otp}
              onChange={(e) => {
                console.log("OTP changed to:", e.target.value)
                setOtp(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  console.log("Enter pressed on OTP input")
                  handleOtpVerification()
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
            onClick={(e) => {
              e.preventDefault()
              console.log("Verify button clicked")
              handleOtpVerification()
            }}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify and continue"}
          </SarthiButton>
        </div>

        <div className="text-center">
          <button
            onClick={(e) => {
              e.preventDefault()
              handleResendOTP()
            }}
            disabled={isLoading}
            className="text-[#cbd5e1] hover:text-white transition-colors text-sm disabled:opacity-50 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Didn't receive it yet? Try again
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={(e) => {
            e.preventDefault()
            resetToEntry()
          }}
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
        {/* Success Animation with new S-only icon */}
        <div className="relative mx-auto">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
              <SarthiIcon size="md" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-medium text-green-400">
            {userType ? "Authentication successful!" : "Invite code accepted!"}
          </h1>
          <p className="text-[#cbd5e1]">
            {userType
              ? userType === "existing"
                ? "Welcome back to your space"
                : "Your account has been created successfully"
              : "Your invite is accepted. Welcome"}
          </p>
        </div>
      </div>
    </div>
  )

  // Enhanced redirecting step with new S icon
  const renderRedirectingStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-6 sarthi-fade-in">
        {/* Sarthi S Logo with enhanced glow animation */}
        <div className="relative mx-auto">
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

          {/* Logo container with new S-only icon */}
          <div className="relative w-24 h-24 mx-auto bg-[#1A1A1A] rounded-full border border-[#2A2A2A] flex items-center justify-center">
            <SarthiIcon size="lg" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-medium text-white">Setting up your space...</h1>
          <p className="text-[#cbd5e1]">
            {userType === "existing"
              ? "Welcome back. Preparing your reflections..."
              : "Creating your personal sanctuary..."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-300 ease-out"
              style={{ width: `${redirectProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-[#cbd5e1]">{Math.round(redirectProgress)}% complete</p>
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )

  const renderWelcomeStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4 sarthi-fade-in">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <SarthiIcon size="md" />
        </div>
        <h1 className="text-3xl font-medium">
          {userType === "existing" ? "Welcome back to your space" : "Your private space is ready"}
        </h1>
        <p className="text-[#cbd5e1]">
          {userType === "existing"
            ? "Your reflections are waiting for you"
            : "This is a safe space. Say what's on your mind"}
        </p>
      </div>

      <div className="sarthi-card p-6 space-y-6 rounded-[16px]">
        <SarthiButton className="w-full auth-button rounded-[16px]" onClick={() => router.push("/chat")}>
          {userType === "existing" ? "Continue to your reflections" : "Start your first reflection"}
        </SarthiButton>

        <div className="text-center text-sm text-[#cbd5e1]">
          <p>You don't have to be perfect, just honest</p>
        </div>
      </div>
    </div>
  )

  const renderInviteCodeStep = () => (
    <div className="w-full max-w-md space-y-8">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={(e) => {
            e.preventDefault()
            setStep("entry")
          }}
          className="text-[#cbd5e1] hover:text-white transition-colors min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
        <span className="text-[#cbd5e1] text-sm">Back</span>
      </div>

      <div className="text-center space-y-2 sarthi-fade-in">
        <h1 className="text-3xl font-medium">Enter your invite code</h1>
        <p className="text-[#cbd5e1]">We're honored to have you here</p>
      </div>

      <div className="sarthi-card p-6 space-y-6 rounded-[16px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="inviteCode" className="block text-sm text-[#cbd5e1] text-left">
              Invite code
            </label>
            <SarthiInput
              id="inviteCode"
              type="text"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInviteCode()}
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
            onClick={(e) => {
              e.preventDefault()
              handleInviteCode()
            }} 
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Apply"}
          </SarthiButton>
        </div>
      </div>
    </div>
  )

  // Debug info (remove in production)
  console.log("Current state:", {
    step,
    contactType,
    email,
    phoneNumber,
    currentContact,
    userType,
    otp,
    isLoading,
    error,
    redirectProgress,
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <button onClick={() => window.location.reload()} className="hover:opacity-80 transition-opacity">
          <SarthiLogo size="md" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {step === "entry" && renderEntryStep()}
        {step === "invite-code" && renderInviteCodeStep()}
        {step === "otp-verification" && renderOtpStep()}
        {step === "success" && renderSuccessStep()}
        {step === "redirecting" && renderRedirectingStep()}
        {step === "welcome" && renderWelcomeStep()}
      </div>
    </div>
  )
}