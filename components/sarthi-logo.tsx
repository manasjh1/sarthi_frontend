"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface SarthiLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function SarthiLogo({ size = "md", className = "", onClick }: SarthiLogoProps) {
  const router = useRouter()

  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  const logoSize = sizeMap[size]

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: go to home page
      router.push("/")
    }
  }

  return (
    <button onClick={handleClick} className={`hover:opacity-80 transition-opacity ${className}`}>
      <Image
        src="/images/sarthi-s-only-white.png"
        alt="Sarthi"
        width={logoSize}
        height={logoSize}
        className="object-contain"
      />
    </button>
  )
}
