import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sarthi - Find the words you've been holding back",
  description: "A safe space for reflection and emotional support",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#0f0f0f] text-white antialiased`}
        style={{ "--font-inter": inter.style.fontFamily } as React.CSSProperties}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
