// lib/validators.ts

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address"
  }
  return null
}

export function validatePhone(phone: string): string | null {
  const phoneDigitsOnly = phone.replace(/\D/g, "")
  if (phoneDigitsOnly.length < 8 || phoneDigitsOnly.length > 15) {
    return "Please enter a valid phone number"
  }
  return null
}
