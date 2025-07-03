import { cn } from "@/lib/utils"
import { type InputHTMLAttributes, forwardRef } from "react"

interface SarthiInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const SarthiInput = forwardRef<HTMLInputElement, SarthiInputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "bg-[#1E1E1E] border border-[#2A2A2A] rounded-[16px] px-4 py-3 text-white w-full focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all duration-300",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SarthiInput.displayName = "SarthiInput"

export { SarthiInput }
