"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not set in your environment variables")
}

// ==================== TYPE DEFINITIONS ====================

interface InviteValidateResponse {
  valid: boolean
  message: string
  invite_id?: string
  invite_token?: string
}

interface VerifyOTPResponse {
  success: boolean
  access_token?: string
  user_id?: string
  is_new_user?: boolean
  message: string
}

interface UserProfileResponse {
  user_id: string
  name: string
  email: string
  phone_number: number
  is_verified: boolean
  user_type: string
  proficiency_score: number
  created_at: string
  updated_at: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user_id: string
  message: string
}

// ==================== HELPER FUNCTIONS ====================

async function makeAPICall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const responseData = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        await deleteCookie("sarthi_session")
        await deleteCookie("sarthi_user_id")
      }

      throw new Error(responseData.detail || responseData.message || `API call failed: ${response.status}`)
    }

    return responseData
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error)
    throw error
  }
}

async function setCookie(name: string, value: string, maxAge: number = 60 * 60 * 24 * 7) {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/"
  })
}

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

async function deleteCookie(name: string) {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

// ==================== AUTH FUNCTIONS ====================

export async function validateInviteCode(code: string): Promise<{
  success: boolean
  valid: boolean
  message: string
  inviteToken?: string
  inviteId?: string
}> {
  try {
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        valid: false,
        message: "Please enter an invite code"
      }
    }

    const response: InviteValidateResponse = await makeAPICall("/api/invite/validate", {
      method: "POST",
      body: JSON.stringify({ invite_code: code.trim().toUpperCase() }),
    })

    return {
      success: true,
      valid: response.valid,
      message: response.message,
      inviteToken: response.invite_token,
      inviteId: response.invite_id
    }
  } catch (error) {
    return {
      success: false,
      valid: false,
      message: error instanceof Error ? error.message : "Failed to validate invite code"
    }
  }
}

export async function sendOTP(contact: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    if (!contact || contact.trim().length === 0) {
      return {
        success: false,
        message: "Please enter your email or phone number"
      }
    }

    const response = await makeAPICall("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ contact: contact.trim() }),
    })

    return {
      success: true,
      message: response.message || "OTP sent successfully"
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send OTP"
    }
  }
}

export async function verifyOTP(
  contact: string, 
  otp: string, 
  inviteToken?: string
): Promise<{
  success: boolean
  isNewUser?: boolean
  userId?: string
  message: string
  redirectTo?: string
}> {
  try {
    if (!contact || contact.trim().length === 0) {
      return {
        success: false,
        message: "Please enter your email or phone number"
      }
    }

    if (!otp || otp.trim().length === 0) {
      return {
        success: false,
        message: "Please enter the OTP"
      }
    }

    const response: VerifyOTPResponse = await makeAPICall("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        contact: contact.trim(),
        otp: otp.trim(),
        invite_token: inviteToken || undefined
      }),
    })

    if (response.success && response.access_token && response.user_id) {
      await setCookie("sarthi_session", response.access_token)
      await setCookie("sarthi_user_id", response.user_id)

      return {
        success: true,
        isNewUser: response.is_new_user,
        userId: response.user_id,
        message: response.message,
        redirectTo: response.is_new_user ? "/onboarding" : "/chat"
      }
    }

    return {
      success: false,
      message: response.message || "Authentication failed"
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to verify OTP"
    }
  }
}

// NEW: Backend login function using email - SERVER ACTION
export async function loginWithEmailAction(formData: FormData) {
  const email = formData.get('email') as string
  
  try {
    if (!email || email.trim().length === 0) {
      throw new Error("Please enter your email address")
    }

    const response: LoginResponse = await makeAPICall("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })

    if (response.access_token && response.user_id) {
      await setCookie("sarthi_session", response.access_token)
      await setCookie("sarthi_user_id", response.user_id)
      
      // Redirect to chat after successful login
      redirect("/chat")
    } else {
      throw new Error(response.message || "Login failed")
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to login")
  }
}

// Client-side compatible login function
export async function loginWithEmail(email: string): Promise<{
  success: boolean
  userId?: string
  message: string
  redirectTo?: string
}> {
  try {
    if (!email || email.trim().length === 0) {
      return {
        success: false,
        message: "Please enter your email address"
      }
    }

    const response: LoginResponse = await makeAPICall("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })

    if (response.access_token && response.user_id) {
      await setCookie("sarthi_session", response.access_token)
      await setCookie("sarthi_user_id", response.user_id)

      return {
        success: true,
        userId: response.user_id,
        message: response.message,
        redirectTo: "/chat"
      }
    }

    return {
      success: false,
      message: response.message || "Login failed"
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to login"
    }
  }
}

export async function getCurrentUser(): Promise<UserProfileResponse | null> {
  try {
    const sessionToken = await getCookie("sarthi_session")
    const userId = await getCookie("sarthi_user_id")

    if (!sessionToken || !userId) {
      return null
    }

    const response: UserProfileResponse = await makeAPICall("/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    return response
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const sessionToken = await getCookie("sarthi_session")
  return !!sessionToken
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  await deleteCookie("sarthi_session")
  await deleteCookie("sarthi_user_id")
  return { success: true, message: "Logged out successfully" }
}

export async function getAuthHeaders(): Promise<{ Authorization: string } | null> {
  const sessionToken = await getCookie("sarthi_session")
  if (!sessionToken) return null
  return { Authorization: `Bearer ${sessionToken}` }
}

export async function testBackendConnection(): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const response = await makeAPICall("/health", { method: "GET" })
    return {
      success: true,
      message: `Connected to ${response.service || 'Sarthi API'} v${response.version || '1.0.0'}`,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to backend"
    }
  }
}

export async function authenticateUser(
  contact: string, 
  otp: string, 
  inviteToken?: string
): Promise<{
  success: boolean
  isNewUser?: boolean
  userId?: string
  redirectTo?: string
  message: string
}> {
  const result = await verifyOTP(contact, otp, inviteToken)
  return result
}

export async function checkEnvironment(): Promise<{
  success: boolean
  message: string
  config: {
    apiUrl: string
    environment: string
  }
}> {
  const config = {
    apiUrl: API_BASE_URL,
    environment: process.env.NODE_ENV || 'development'
  }

  const backendTest = await testBackendConnection()

  return {
    success: backendTest.success,
    message: backendTest.message,
    config
  }
}