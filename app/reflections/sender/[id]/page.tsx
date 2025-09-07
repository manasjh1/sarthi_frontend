'use client'

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { authFetch } from "@/lib/api"

export default function SenderSelectionPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [senderName, setSenderName] = useState("")
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchName = async () => {
      try {
        const res = await authFetch("/api/user/me")
        const json = await res.json()

        if (json?.name) {
          setUserName(json.name)
          setSenderName(json.name) // Set senderName by default
        }
      } catch (err) {
        console.error("Failed to fetch user name:", err)
      }
    }

    fetchName()
  }, [])

  const handleSenderSelection = async (mode: "name" | "anonymous", name?: string) => {
    setIsLoading(true) // ⬅️ start loading
    let payload;

    if (mode === "anonymous") {
      payload = {
        reflection_id: id,
        message: "",
        data: [{ reveal_name: false }]
      };
    } else {
      payload = {
        reflection_id: id,
        message: "",
        data: [{ reveal_name: true, name: (name || userName || "").trim() }]
      };
    }

    try {
      const res = await authFetch("/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        console.error("Failed to save sender name:", json.message);
        return;
      }

      router.push(`/reflections/delivery/${id}`);
    } catch (error) {
      console.error("Error saving sender name:", error);
    } finally {
      setIsLoading(false)
    }
  };



  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Back button for desktop */}
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

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            {/* Responsive font sizes */}
            <h2 className="text-xl sm:text-2xl font-light text-white">How would you like to sign this?</h2>
            <p className="text-sm sm:text-base text-white/60">Choose how you'd like to identify yourself</p>
          </div>

          <div className="space-y-4">
            {/* With Name */}
            <div className="w-full p-4 sm:p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Responsive icon container size */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {/* Responsive title font size */}
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-2">With your name</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">Sign with your name</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <SarthiInput
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Your name"
                        className="flex-1"
                      />
                      <button
                        onClick={() => setSenderName(userName)}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors px-2"
                      >
                        Reset
                      </button>
                    </div>

                    <SarthiButton
                      onClick={() => handleSenderSelection("name", senderName || userName)}
                      disabled={!senderName?.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Saving..." : "Continue with this name"}
                    </SarthiButton>

                  </div>
                </div>
              </div>
            </div>

            {/* Anonymous */}
         <button
  onClick={() => handleSenderSelection("anonymous")}
  disabled={isLoading}
  className="w-full p-4 sm:p-6 rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left group"
>
  <div className="flex items-start gap-3 sm:gap-4">
    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    </div>
    <div className="flex-1">
      <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
        {isLoading ? "Saving..." : "Send anonymously"}
      </h3>
      <p className="text-white/60 text-sm leading-relaxed">Don't include your name</p>
    </div>
  </div>
</button>

          </div>

          {/* Disclaimer */}
          <div className="text-center text-xs text-white/40 leading-relaxed px-2 sm:px-4">
            <p>
              Please use your real name or a name you're comfortable being identified by. Do not impersonate others
              when sharing this message.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}