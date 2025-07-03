"use client"

import type React from "react"

import { useState } from "react"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#2A2A2A] bg-[#1b1b1b] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xl font-bold">Sarthi</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{/* Sidebar content */}</div>
          <div className="p-4 border-t border-[#2A2A2A]">{/* Footer */}</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-72">
        {/* Toggle button for mobile */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1b1b1b]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  return (
    <button className={`p-2 rounded-md hover:bg-white/5 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </button>
  )
}

// Simplified stubs for the other components
export const Sidebar = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b border-[#2A2A2A]">{children}</div>
)
export const SidebarContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-y-auto p-4">{children}</div>
)
export const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-t border-[#2A2A2A]">{children}</div>
)
export const SidebarMenu = ({ children }: { children: React.ReactNode }) => <div className="space-y-1">{children}</div>
export const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const SidebarMenuButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
  >
    {children}
  </button>
)
export const SidebarGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-2 py-2">{children}</div>
)
export const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-semibold">{children}</div>
)
export const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const SidebarGroupAction = ({
  children,
  title,
  onClick,
}: { children: React.ReactNode; title: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1 flex h-5 w-5 items-center justify-center rounded-md text-white/50 hover:text-white"
    title={title}
  >
    {children}
  </button>
)
export const SidebarRail = () => <div className="absolute right-0 top-0 h-full w-1 bg-transparent"></div>
