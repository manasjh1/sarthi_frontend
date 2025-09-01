'use client'

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { CountrySelector } from "@/components/ui/country-selector"
import { validateEmail, validatePhone } from "@/lib/validators"
import { authFetch } from "@/lib/api"
import mixpanel, { initMixpanel } from "@/lib/mixpanel";
import { useEffect } from "react";

type Country = {
  name: string
  code: string
  dialCode: string
  flag: string
}

export default function DeliveryMethodPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const [emailContact, setEmailContact] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: "India",
    code: "IN",
    dialCode: "+91",
    flag: "🇮🇳",
  })
  const [deliveryMethod, setDeliveryMethod] = useState<"keep-private" | "send">("send")

const handleNext = async () => {
  let hasError = false

  // Validate email
  if (emailContact.trim()) {
    const error = validateEmail(emailContact)
    if (error) {
      setEmailError(error)
      hasError = true
    }
  }

  // Validate phone
  if (phoneNumber.trim()) {
    const error = validatePhone(phoneNumber)
    if (error) {
      setPhoneError(error)
      hasError = true
    }
  }

  // Require at least one contact method if delivery is "send"
  if (deliveryMethod !== "keep-private" && !emailContact.trim() && !phoneNumber.trim()) {
    setEmailError("Please provide at least one contact method")
    hasError = true
  }

  if (hasError) return

  const reflectionId = id

  if (deliveryMethod === "send") {
    // Decide delivery mode
    let deliveryMode = 0
    if (emailContact.trim() && phoneNumber.trim()) {
      deliveryMode = 2
    } else if (phoneNumber.trim()) {
      deliveryMode = 1
    } else {
      deliveryMode = 0
    }

    // 🔹 Track delivery channel selected
    mixpanel.track("delivery_channel_selected", {
      channel:
        deliveryMode === 0
          ? "email"
          : deliveryMode === 1
          ? "whatsapp"
          : "email+whatsapp",
      reflection_id: reflectionId,
    })

  const payload = {
  reflection_id: reflectionId,
  message:
    deliveryMode === 0
      ? "Send my reflection via email"
      : deliveryMode === 1
      ? "Send my reflection via WhatsApp"
      : deliveryMode === 2
      ? "Send via both channels"
      : "Keep private",
  data: [
    {
      delivery_mode: deliveryMode,
      ...(emailContact.trim() ? { recipient_email: emailContact.trim() } : {}),
      ...(phoneNumber.trim()
        ? { recipient_phone: selectedCountry.dialCode + phoneNumber.trim() }
        : {}),
    },
  ],
};


    try {
      await authFetch("/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      // 🔹 Track send successful
      mixpanel.track("send_successful", {
        reflection_id: reflectionId,
        channel:
          deliveryMode === 0
            ? "email"
            : deliveryMode === 1
            ? "whatsapp"
            : "email+whatsapp",
      })

      // 🔔 Let sidebar know a new reflection is ready
      window.dispatchEvent(new Event("reflection-completed"))
    } catch (error) {
      console.error("Error submitting delivery details:", error)

      // 🔹 Track send failed
      mixpanel.track("send_failed", {
        reflection_id: reflectionId,
        channel:
          deliveryMode === 0
            ? "email"
            : deliveryMode === 1
            ? "whatsapp"
            : "email+whatsapp",
        error: String(error),
      })

      return
    }

    if (deliveryMode === 0) {
      router.push(`/reflections/confirm/${id}?method=email`)
    } else if (deliveryMode === 1) {
      router.push(`/reflections/confirm/${id}?method=phone`)
    } else {
      router.push(`/reflections/share/${id}`)
    }
  }

  if (deliveryMethod === "keep-private") {
    // 🔹 Track delivery channel selected (keep private)
    mixpanel.track("delivery_channel_selected", {
      channel: "keep-private",
      reflection_id: reflectionId,
    })

    // 🔔 Even for private reflections, trigger the update
    window.dispatchEvent(new Event("reflection-completed"))
    router.push(`/reflections/confirm/${id}`)
  }
}


  useEffect(() => {
  initMixpanel();
}, []);


  return (
    <div className="h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Back button visible only on desktop */}
          <button
            onClick={() => router.back()}
            className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="w-20"></div>
          {/* Back button for mobile */}
          <button
            onClick={() => router.back()}
            className="md:hidden flex items-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 pb-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-light text-white">
              How would you like to send this?
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              You can provide both email and phone to give them options
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-sm sm:text-base">
                  📧
                </div>
                <h3 className="text-base sm:text-lg font-medium text-white">Email Address</h3>
              </div>
              <SarthiInput
                type="email"
                placeholder="Enter their email address"
                value={emailContact}
                onChange={(e) => {
                  setEmailContact(e.target.value)
                  setEmailError("")
                }}
              />
              {emailError && <div className="text-red-400 text-sm">{emailError}</div>}
            </div>

            {/* WhatsApp Input */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-sm sm:text-base">
                  📱
                </div>
                <h3 className="text-base sm:text-lg font-medium text-white">WhatsApp Number</h3>
              </div>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={(val) => {
                  setPhoneNumber(val)
                  setPhoneError("")
                }}
              />
              {phoneError && <div className="text-red-400 text-sm">{phoneError}</div>}
            </div>

            {/* OR Separator */}
            <div className="flex items-center gap-4 py-2 sm:py-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-white/40 text-xs sm:text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Keep Private */}
            <div className="border-t border-white/10 pt-4 sm:pt-6">
              <button
                onClick={() => setDeliveryMethod("keep-private")}
                className={`w-full p-4 sm:p-6 rounded-3xl border text-left group ${
                  deliveryMethod === "keep-private"
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center">
                    🔒
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-medium text-white mb-1 sm:mb-2">
                      Keep it private
                    </h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                      Just between you and Sarthi
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Continue Button */}
            <div className="text-center pt-2 sm:pt-4">
              <SarthiButton onClick={handleNext} className="w-full px-6 py-3 sm:px-8 sm:py-4">
                {deliveryMethod === "keep-private" ? "Save Reflection" : "Send Message"}
              </SarthiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}