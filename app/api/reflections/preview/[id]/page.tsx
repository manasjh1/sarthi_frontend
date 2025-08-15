'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit3, RotateCcw, Check } from 'lucide-react'
import { CleanCardTemplate } from "@/components/message-templates/clean-card"
import { HandwrittenTemplate } from "@/components/message-templates/handwritten"
import { MinimalTemplate } from "@/components/message-templates/minimal"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { authFetch } from "@/lib/api"

export default function ReflectionPreviewPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedMessage, setEditedMessage] = useState('')
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'chat' | 'template-selection'>('chat')

  useEffect(() => {
    const fetchReflection = async () => {
      setLoading(true)
      try {
        const res = await authFetch("/api/reflection/history", {
          method: "POST",
          body: JSON.stringify({
            data: {
              mode: "get_reflections",
              reflection_id: id,
            },
          }),
        })

        const json = await res.json()
        if (json.success) {
          setEditedMessage(json.data.summary || '')
          setCurrentStep('template-selection')
        } else {
          setError(json.message || "Failed to fetch reflection.")
        }
      } catch (err) {
        setError("Something went wrong while fetching reflection.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchReflection()
  }, [id])

  const handleEditMessage = async () => {
    setIsEditingMessage(true)
  }

  const handleCancelEdit = () => {
    setIsEditingMessage(false)
  }

  const handleSaveEditedMessage = async () => {
    setIsEditingMessage(false)
    try {
      const res = await authFetch('/api/reflection', {
        method: 'POST',
        body: JSON.stringify({
          reflection_id: id,
          message: editedMessage,
          data: [{ edit_mode: 'edit' }]
        })
      })

      const json = await res.json()
      console.log('Edit response:', json)
    } catch (err) {
      console.error('Failed to edit:', err)
    }
  }

  const handleRegenerateMessage = async () => {
    setIsEditingMessage(false)
    setLoading(true)
    try {
      const res = await authFetch('/api/reflection', {
        method: 'POST',
        body: JSON.stringify({
          reflection_id: id,
          message: "",
          data: [{ edit_mode: 'regenerate' }]
        })
      })

      const json = await res.json()
      console.log('Regenerate response:', json)
      if (json.success && json.data[0].summary) {
        setEditedMessage(json.data[0].summary)
      } else {
        setError("Failed to regenerate message")
      }
    } catch (err) {
      setError("Error occurred while regenerating")
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithTemplate = () => {
    console.log("📝 Reflection ID:", id)
    console.log("✍️ Selected Template:", selectedTemplate)
    console.log("📄 Final Message:", editedMessage)
     window.dispatchEvent(new Event("reflection-completed"))
      router.push(`/reflections/sender/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading your reflection...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#121212]">
      <div className="max-w-6xl mx-auto p-4 pb-20 md:p-8">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-light text-white">How would you like this to look?</h2>
            <p className="text-sm md:text-base text-white/60">Choose a style that feels right for your message</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-base md:text-lg font-medium text-white">Your message</h3>
              <div className="flex items-center gap-2 md:gap-4">
                <button onClick={handleEditMessage} className="flex items-center gap-1 md:gap-2 text-white/60 hover:text-white transition-colors text-xs md:text-sm">
                  <Edit3 size={14} className="md:size-16" />
                  Edit
                </button>
                <button onClick={handleRegenerateMessage} className="flex items-center gap-1 md:gap-2 text-white/60 hover:text-white transition-colors text-xs md:text-sm">
                  <RotateCcw size={14} className="md:size-16" />
                  Regenerate
                </button>
              </div>
            </div>

            {isEditingMessage ? (
              <div className="space-y-4">
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-4 text-white resize-none focus:border-white/20 focus:outline-none text-sm md:text-base"
                  rows={6}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <SarthiButton onClick={handleSaveEditedMessage} className="flex items-center justify-center gap-2 w-full">
                    <Check size={16} />
                    Save changes
                  </SarthiButton>
                  <SarthiButton variant="secondary" onClick={handleCancelEdit} className="w-full">
                    Cancel
                  </SarthiButton>
                </div>
              </div>
            ) : (
              <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-4">
                <p className="text-white leading-relaxed text-sm md:text-base">{editedMessage}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-4">
              <h4 className="text-center text-white font-medium text-sm md:text-base">Clean & Modern</h4>
              <div onClick={() => setSelectedTemplate("clean-card")}>
                <CleanCardTemplate
                  message={editedMessage}
                  fromName="You"
                  isSelected={selectedTemplate === "clean-card"}
                  onClick={() => setSelectedTemplate("clean-card")}
                />
              </div>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h4 className="text-center text-white font-medium text-sm md:text-base">Handwritten Note</h4>
              <div onClick={() => setSelectedTemplate("handwritten")}>
                <HandwrittenTemplate
                  message={editedMessage}
                  fromName="You"
                  isSelected={selectedTemplate === "handwritten"}
                  onClick={() => setSelectedTemplate("handwritten")}
                />
              </div>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h4 className="text-center text-white font-medium text-sm md:text-base">Minimal Dark</h4>
              <div onClick={() => setSelectedTemplate("minimal")}>
                <MinimalTemplate
                  message={editedMessage}
                  fromName="You"
                  isSelected={selectedTemplate === "minimal"}
                  onClick={() => setSelectedTemplate("minimal")}
                />
              </div>
            </div>
          </div>

          {selectedTemplate && (
            <div className="text-center py-4 md:py-8">
              <SarthiButton onClick={handleContinueWithTemplate} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 text-sm md:text-base">
                Continue with this style
              </SarthiButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}