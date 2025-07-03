"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { SarthiInput } from "@/components/ui/sarthi-input"
import { SarthiButton } from "@/components/ui/sarthi-button"
import { Check, X } from "lucide-react"

// Mock database of recipients - in a real app, this would come from an API call
const mockRecipients = [
  "Alex Johnson",
  "Samantha Williams",
  "Michael Brown",
  "Amanda Davis",
  "Christopher Wilson",
  "Jessica Martinez",
  "David Anderson",
  "Jennifer Taylor",
  "Robert Thomas",
  "Elizabeth Garcia",
  "Aman Sharma",
  "Amandeep Singh",
  "Amanda Lee",
  "Amani Jackson",
]

interface RecipientAutocompleteProps {
  onSubmit: (recipient: string) => void
  placeholder?: string
}

export function RecipientAutocomplete({ onSubmit, placeholder = "Type their name..." }: RecipientAutocompleteProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // In a real app, this would be an API call to fetch recipients
  const fetchRecipients = async (query: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!query.trim()) return []

    // Filter recipients that match the query
    return mockRecipients.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
  }

  useEffect(() => {
    const getSuggestions = async () => {
      if (inputValue.trim()) {
        const results = await fetchRecipients(inputValue)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    getSuggestions()
  }, [inputValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0) {
        setInputValue(suggestions[selectedIndex])
        setShowSuggestions(false)
      } else if (inputValue.trim()) {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue)
      setInputValue("")
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearInput = () => {
    setInputValue("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SarthiInput
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="text-lg py-6 px-6 pr-12 w-full min-w-[320px]"
          />
          {inputValue && (
            <button
              onClick={clearInput}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <SarthiButton
          onClick={handleSubmit}
          className="px-4 py-6 h-auto w-[72px] flex items-center justify-center shrink-0"
        >
          <Check size={18} />
        </SarthiButton>
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-[#1b1b1b] border border-[#2a2a2a] rounded-[16px] shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-5 py-3 cursor-pointer hover:bg-[#2a2a2a] ${index === selectedIndex ? "bg-[#2a2a2a]" : ""}`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
