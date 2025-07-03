"use client"

import Image from "next/image"

interface SarthiIconProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function SarthiIcon({ size = "md", className = "" }: SarthiIconProps) {
  const sizeMap = {
    sm: 32,
    md: 42,
    lg: 60,
    xl: 72,
  }

  const iconSize = sizeMap[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/sarthi-s-only-white.png"
        alt="Sarthi"
        width={iconSize}
        height={iconSize}
        className="object-contain"
      />
    </div>
  )
}
