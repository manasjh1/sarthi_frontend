'use client'

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { CountrySelector } from "@/components/ui/country-selector" 
import { validateEmail, validatePhone} from "@/lib/validators"  
import { authFetch } from "@/lib/api"

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
  let hasError = false;

  // Validate email
  if (emailContact.trim()) {
    const error = validateEmail(emailContact);
    if (error) {
      setEmailError(error);
      hasError = true;
    }
  }

  // Validate phone
  if (phoneNumber.trim()) {
    const error = validatePhone(phoneNumber);
    if (error) {
      setPhoneError(error);
      hasError = true;
    }
  }

  // Require at least one contact method if delivery is "send"
  if (deliveryMethod !== "keep-private" && !emailContact.trim() && !phoneNumber.trim()) {
    setEmailError("Please provide at least one contact method");
    hasError = true;
  }

  if (hasError) return;

  const reflectionId = id;
  const payload: {
    reflection_id: string;
    message: string;
    data: any[];
  } = {
    reflection_id: reflectionId,
    message: "",
    data: [],
  };

  if (emailContact.trim()) {
    payload.data.push({ email: emailContact.trim() });
  }

  if (phoneNumber.trim()) {
    payload.data.push({
      phone: selectedCountry.dialCode + phoneNumber.trim(),
    });
  }

if (deliveryMethod === "send") {
  try {
    await authFetch("/api/reflection", {
      method: "POST",
     
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error submitting delivery details:", error);
    return;
  }

  // If ONLY email is submitted and no phone
  if (emailContact.trim() && !phoneNumber.trim()) {
    router.push(`/reflections/confirm/${id}?method=email`);
  } else {
    router.push(`/reflections/share/${id}`);
  }
}


  // If delivery method is "keep-private"
  if (deliveryMethod === "keep-private") {
    router.push(`/reflections/confirm/${id}`);
  }
};



  return (
    <div className="h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-normal text-white/90">How would you like to send this?</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 pb-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light text-white">How would you like to send this?</h2>
            <p className="text-white/60">You can provide both email and phone to give them options</p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  📧
                </div>
                <h3 className="text-lg font-medium text-white">Email Address</h3>
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  📱
                </div>
                <h3 className="text-lg font-medium text-white">WhatsApp Number</h3>
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
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-white/40 text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Keep Private */}
            <div className="border-t border-white/10 pt-6">
              <button
                onClick={() => setDeliveryMethod("keep-private")}
                className={`w-full p-6 rounded-3xl border text-left group ${
                  deliveryMethod === "keep-private"
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    🔒
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">Keep it private</h3>
                    <p className="text-white/60 leading-relaxed">Just between you and Sarthi</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Continue Button */}
            <div className="text-center pt-4">
              <SarthiButton onClick={handleNext} className="px-8 py-4">
                {deliveryMethod === "keep-private" ? "Save Reflection" : "Send Message"}
              </SarthiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
