import { cn } from "@/lib/utils"
import { type TextareaHTMLAttributes, forwardRef } from "react"

interface SarthiInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const SarthiInput = forwardRef<HTMLTextAreaElement, SarthiInputProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "bg-[#1E1E1E] border border-[#2A2A2A] rounded-[16px] px-4 py-3 text-white w-full transition-all duration-150",
        "focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10",
        "placeholder:text-[#9ca3af]",
        "resize-none min-h-[48px] max-h-[200px]",
        className,
      )}
      ref={ref}
      rows={1}
      {...props}
    />
  )
})
SarthiInput.displayName = "SarthiInput"

export { SarthiInput }