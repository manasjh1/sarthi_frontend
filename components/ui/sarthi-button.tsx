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
          "rounded-[16px] px-6 py-3 font-medium transition-all duration-300",
          variant === "primary"
            ? "bg-white text-[#0f0f0f] hover:bg-[#e0e0e0]"
            : "bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20",
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
