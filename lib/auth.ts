"use client"

export function logout() {
  // Clear all possible session data
  document.cookie = "sarthi_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  document.cookie = "sarthi_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname
  document.cookie =
    "sarthi_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname

  // Clear all storage
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    // Handle cases where storage is not available
    console.log("Storage not available")
  }

  // Force redirect to auth page
  window.location.href = "/auth"
}
