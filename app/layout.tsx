import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarLayout } from "@/components/sidebar-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sarthi - Emotional Reflection & Communication",
  description:
    "Express what matters most with thoughtful reflection and meaningful communication.",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "https://sarthi-assets.s3.ap-south-1.amazonaws.com/Sarthi-S-Icon-Filled.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarLayout>{children}</SidebarLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
