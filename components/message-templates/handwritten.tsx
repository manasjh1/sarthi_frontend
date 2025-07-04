"use client"

interface TemplateProps {
  message: string
  fromName: string
  isSelected?: boolean
  onClick?: () => void
}

/**
 * A warm, handwritten‐style template.
 */
export function HandwrittenTemplate({ message, fromName, isSelected = false, onClick }: TemplateProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? "ring-2 ring-white/30 scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800 p-8 rounded-2xl shadow-lg max-w-md mx-auto relative overflow-hidden">
        {/* Subtle paper texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-transparent" />
        </div>

        <div className="relative space-y-6">
          <p className="text-lg leading-relaxed whitespace-pre-line" style={{ fontFamily: "cursive" }}>
            {message}
          </p>
          <div className="border-t border-amber-200 pt-4 space-y-2">
            <p className="text-sm font-medium text-amber-700">From: {fromName}</p>
            <p className="text-xs text-amber-500">Crafted with emotions • Sarthi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
