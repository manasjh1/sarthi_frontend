"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SarthiIcon } from "@/components/ui/sarthi-icon"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { ApologyIcon } from "@/components/icons/apology-icon"
import { Heart, MessageCircle, User, Edit3, LogOut, X } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  userName: string
  onUserNameChange: (name: string) => void
}

interface Reflection {
  id: string
  recipient: string
  type: "gratitude" | "apology" | "boundary"
  preview: string
  date: string
}

// Mock data for past reflections
const mockReflections: Reflection[] = [
  {
    id: "1",
    recipient: "Sarah",
    type: "gratitude",
    preview: "Thank you for always being there...",
    date: "15/01/2024",
  },
  {
    id: "2",
    recipient: "Mom",
    type: "apology",
    preview: "I'm sorry for missing your birthday...",
    date: "10/01/2024",
  },
  {
    id: "3",
    recipient: "Alex",
    type: "boundary",
    preview: "I wanted to talk about our project...",
    date: "08/01/2024",
  },
  {
    id: "4",
    recipient: "Dad",
    type: "gratitude",
    preview: "I've been thinking about all the w...",
    date: "05/01/2024",
  },
]

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

  const handleStartNewReflection = () => {
    router.push("/onboarding")
  }

  const handleReflectionClick = (reflectionId: string) => {
    router.push(`/reflection/${reflectionId}`)
  }

  const handleSignOut = () => {
    // Clear any stored data
    localStorage.removeItem("sarthi-user-name")
    // Redirect to auth page
    router.push("/auth")
  }

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
        className={`fixed left-0 top-0 h-full w-80 bg-[#1a1a1a] border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
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
                  className="hidden md:block p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
                {/* Mobile close button */}
                <button onClick={onToggle} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
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
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName()
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                    />
                    <div className="flex space-x-2">
                      <button onClick={handleSaveName} className="text-xs text-green-400 hover:text-green-300">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="text-xs text-white/60 hover:text-white/80">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm">{userName || "Your name"}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit3 className="h-3 w-3 text-white/60" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Reflection Button */}
          <div className="p-6">
            <SarthiButton onClick={handleStartNewReflection} className="w-full justify-start">
              <span className="text-lg mr-2">+</span>
              Start new reflection
            </SarthiButton>
          </div>

          {/* Past Reflections */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pb-4">
              <h3 className="text-white/60 text-sm font-medium mb-4">Past reflections</h3>
              <div className="space-y-3">
                {mockReflections.map((reflection) => (
                  <button
                    key={reflection.id}
                    onClick={() => handleReflectionClick(reflection.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/15 transition-colors">
                        {getReflectionIcon(reflection.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white text-sm font-medium">{reflection.recipient}</span>
                          <span className="text-white/40 text-xs">{getReflectionTypeLabel(reflection.type)}</span>
                        </div>
                        <p className="text-white/60 text-sm truncate">{reflection.preview}</p>
                        <p className="text-white/40 text-xs mt-1">{reflection.date}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-white/60 hover:text-white/80 transition-colors w-full"
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
