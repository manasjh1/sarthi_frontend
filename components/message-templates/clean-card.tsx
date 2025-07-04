"use client"

interface TemplateProps {
  message: string
  fromName: string
  isSelected?: boolean
  onClick?: () => void
}

/**
 * A clean, modern card template.
 */
export function CleanCardTemplate({ message, fromName, isSelected = false, onClick }: TemplateProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <div className="bg-gradient-to-br from-white to-gray-50 text-gray-800 p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-normal whitespace-pre-line">{message}</p>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">From: {fromName}</p>
            <p className="text-xs text-gray-400">Crafted with emotions • Sarthi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
