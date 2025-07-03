interface ApologyIconProps {
  className?: string
  strokeWidth?: number
}

export function ApologyIcon({ className = "h-4 w-4", strokeWidth = 1.5 }: ApologyIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Olive branch - symbol of peace and reconciliation */}
      <path d="M12 2C8 2 5 5 5 9c0 2 1 4 3 5l4-4 4 4c2-1 3-3 3-5 0-4-3-7-7-7z" />
      <path d="M8 11c-1 1-2 3-2 5 0 3 2 5 5 5s5-2 5-5c0-2-1-4-2-5" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  )
}
