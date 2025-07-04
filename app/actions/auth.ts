"use server"

import { cookies } from "next/headers"

// Mock user database - in real app, this would be a proper database
const mockUsers = [{ id: 1, email: "welcome@example.com", phone: "+17503523923" }]

// Mock invite codes - in real app, this would be in database
const validInviteCodes = ["1234567"]

export async function checkUserExists(contact: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = mockUsers.find((u) => u.email === contact || u.phone === contact)
  return { exists: !!user, userId: user?.id }
}

export async function validateInviteCode(code: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return { valid: validInviteCodes.includes(code.toLowerCase()) }
}

export async function sendOTP(contact: string, isNewUser: boolean) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In real app, this would send actual OTP via email/SMS
  console.log(`Sending OTP to ${contact} for ${isNewUser ? "new" : "existing"} user`)
  console.log(`Development OTP: 141414`) // Log for development

  // Mock OTP generation - using hardcoded for development
  const otp = "141414"

  return { success: true, message: "OTP sent successfully" }
}

// Update the verifyOTP function to redirect to onboarding
export async function verifyOTP(contact: string, otp: string, isNewUser: boolean) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock OTP verification - using hardcoded OTP for development
  if (otp === "141414") {
    // Create session
    const sessionToken = `session_${Date.now()}_${Math.random()}`

    // Set cookie
    cookies().set("sarthi_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (isNewUser) {
      // In real app, create new user in database
      console.log(`Creating new user for ${contact}`)
    }

    return { success: true, isNewUser, redirectTo: "/onboarding" } // Redirect to onboarding
  }

  return { success: false, error: "Invalid OTP" }
}

export async function resendOTP(contact: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In real app, this would resend OTP
  console.log(`Resending OTP to ${contact}`)

  return { success: true, message: "OTP resent successfully" }
}
