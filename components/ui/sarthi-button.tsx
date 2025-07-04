import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface SarthiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

const SarthiButton = forwardRef<HTMLButtonElement, SarthiButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "rounded-[16px] px-6 py-3 font-medium transition-all duration-150",
          variant === "primary"
            ? "bg-white text-[#0f0f0f] hover:brightness-105 hover:shadow-lg focus:brightness-105 focus:shadow-lg active:brightness-95"
            : "bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20 focus:bg-white/5 focus:border-white/20",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)
SarthiButton.displayName = "SarthiButton"

export { SarthiButton }
