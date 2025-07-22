import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("sarthi_session")
  cookieStore.delete("sarthi_user_id")

  return NextResponse.json({ success: true })
}
