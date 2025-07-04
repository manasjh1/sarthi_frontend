"use client"

interface TemplateProps {
  message: string
  fromName: string
  isSelected?: boolean
  onClick?: () => void
}

/**
 * A sleek minimal dark template.
 */
export function MinimalTemplate({ message, fromName, isSelected = false, onClick }: TemplateProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <div className="bg-gray-900 border border-gray-700 text-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-light whitespace-pre-line">{message}</p>
          <div className="border-t border-gray-700 pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-300">From: {fromName}</p>
            <p className="text-xs text-gray-500">Crafted with emotions • Sarthi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
