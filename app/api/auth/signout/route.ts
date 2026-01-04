import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Delete cookies exactly as they were set (without domain parameter)
    cookieStore.delete({
      name: "sarthi_session",
      path: "/",
    })

    cookieStore.delete({
      name: "sarthi_user_id",
      path: "/",
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    )
  }
}