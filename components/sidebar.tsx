"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle, User, Edit3, LogOut, X } from "lucide-react"
import { getCookie } from "@/app/actions/auth"
import { authFetch } from "@/lib/api"
interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  userName: string
  onUserNameChange: (name: string) => void
}

interface Reflection {
  reflection_id: string
  name: string
  relation: string
  category: string
  summary: string
  created_at: string
  stage: number
}




const getReflectionIcon = (type: string) => {
  switch (type) {
    case "gratitude":
      return <Heart className="h-4 w-4" />
    case "apology":
      return <ApologyIcon className="h-4 w-4" strokeWidth={1.5} />
    case "boundary":
      return <MessageCircle className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

const getReflectionTypeLabel = (type: string) => {
  switch (type) {
    case "gratitude":
      return "Gratitude"
    case "apology":
      return "Apology"
    case "boundary":
      return "Boundary"
    default:
      return "Reflection"
  }
}

export function Sidebar({ isOpen, onToggle, userName, onUserNameChange }: SidebarProps) {
  const router = useRouter()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(userName)
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userContact, setUserContact] = useState<string | null>(null);

  useEffect(() => {
    const fetchReflections = async () => {
      setLoading(true);
      try {
        // Fetch reflections
        const res = await fetch("/api/reflections", {
          method: "POST",
          body: JSON.stringify({ data: { mode: "get_reflections" } }),
        });
        const json = await res.json();
        if (json.success) {
          setReflections(json.data.reflections);
        } else {
          setError(json.message || "Failed to fetch reflections.");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }

      // Additionally fetch user's name
      try {
        const res = await authFetch("/api/user/me", {
          credentials: "include",
        });
        const user = await res.json();
        console.log(user);
        if (user?.name) {
          setEditedName(user.name);
          onUserNameChange(user.name);
          localStorage.setItem("sarthi-user-name", user.name);
          window.dispatchEvent(new CustomEvent("sarthi-name-updated", { detail: user.name }));
        }
        if (user?.email || user?.phone) {
          setUserContact(user.email || user.phone);
        }
      } catch (err) {
        console.error("Failed to fetch user name from /api/user/me:", err);
      }
    };

    fetchReflections();
  }, []);






  const renderReflection = (reflection: Reflection) => (
    <button
      key={reflection.reflection_id}
      onClick={() => handleReflectionClick(reflection.reflection_id)}
      className="w-full text-left p-3 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors group min-h-[44px]"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
          {getReflectionIcon(reflection.category.toLowerCase())}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white text-sm font-medium">{reflection.name}</span>
            <span className="text-white/40 text-xs">{getReflectionTypeLabel(reflection.relation.toLowerCase())}</span>
          </div>
          <p className="text-white/60 text-sm truncate">{reflection.summary}</p>
          <p className="text-white/40 text-xs mt-1">
            {new Date(reflection.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </button>
  )


  // Listen for name updates from onboarding
  useEffect(() => {
    const handleNameUpdate = (event: CustomEvent) => {
      const newName = event.detail
      onUserNameChange(newName)
      setEditedName(newName)
    }

    window.addEventListener("sarthi-name-updated", handleNameUpdate as EventListener)

    return () => {
      window.removeEventListener("sarthi-name-updated", handleNameUpdate as EventListener)
    }
  }, [onUserNameChange])

  const handleStartNewReflection = () => {
    router.push("/onboarding")
  }

  const handleReflectionClick = (reflectionId: string) => {
    router.push(`/reflection/${reflectionId}`)
  }
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Sign out failed")
      }

      console.log("Successfully signed out.")
    } catch (error) {
      console.warn("Error signing out:", error)
    } finally {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/auth"
    }
  };

  const handleSaveName = () => {
    onUserNameChange(editedName.trim())
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setEditedName(userName)
    setIsEditingName(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-[100dvh] md:h-screen w-80 bg-[#1a1a1a] border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 ${isOpen ? "md:block" : "md:hidden"}`}
      >

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <SarthiIcon size="sm" />
                </div>
                <div>
                  <h2 className="text-white font-medium">Sarthi</h2>
                  <p className="text-white/60 text-sm">Your reflection space</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Desktop collapse button */}
                <button
                  onClick={onToggle}
                  className="hidden md:block p-2 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
                {/* Mobile close button */}
                <button
                  onClick={onToggle}
                  className="md:hidden p-2 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white/60" />
              </div>
              <div className="flex-1">
                {isEditingName ? (
                  <div className="space-y-2">
                    <SarthiInput
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Your name"
                      className="text-sm auth-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName()
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveName}
                        className="text-xs text-green-400 hover:text-green-300 transition-colors min-h-[32px] min-w-[32px] px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-400/20"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-white/60 hover:text-white/80 transition-colors min-h-[32px] min-w-[32px] px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/80 text-sm">{editedName || "Your name"}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 rounded transition-colors min-h-[24px] min-w-[24px]"
                      >
                        <Edit3 className="h-3 w-3 text-white/60" />
                      </button>
                    </div>
                    {userContact && (
                      <span className="text-white/40 text-xs mt-1 truncate">
                        {userContact}
                      </span>
                    )}
                  </div>

                )}
              </div>
            </div>
          </div>

          {/* New Reflection Button */}
          <div className="p-6">
            <SarthiButton
              onClick={handleStartNewReflection}
              className="w-full justify-start auth-button rounded-[16px]"
            >
              <span className="text-lg mr-2">+</span>
              Start new reflection
            </SarthiButton>
          </div>


          {/* Past Reflections */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pb-4">
              <h3 className="text-white/60 text-sm font-medium mb-4">Your Reflections</h3>

              {loading ? (
                <p className="text-white/50 text-sm">Loading...</p>
              ) : error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : reflections.length === 0 ? (
                <p className="text-white/40 text-sm">No reflections yet.</p>
              ) : (
                <>
                  {/* Current reflection */}
                  <div className="mb-6">
                    <p className="text-white text-sm font-semibold mb-2">Current Reflection</p>
                    {renderReflection(reflections[0])}
                  </div>

                  {/* Past reflections */}
                  {reflections.length > 1 && (
                    <div className="space-y-3">
                      <p className="text-white/60 text-sm font-medium mb-2">Past Reflections</p>
                      {reflections.slice(1).map(renderReflection)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>


          {/* Sign Out */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-white/60 hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors w-full min-h-[44px] p-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )



}