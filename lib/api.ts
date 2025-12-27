// lib/api.ts
import { getCookie } from "@/app/actions/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

export async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getCookie("sarthi_session")

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
}
