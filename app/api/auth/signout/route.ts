import { NextResponse } from "next/server"
import { cookies } from "next/headers"

async function deleteCookie(name: string) {
  const cookieStore = await cookies() 

  cookieStore.delete({
    name,
    domain: ".sarthi.me",
    path: "/",
  })
}

export async function POST() {
  await deleteCookie("sarthi_session")
  await deleteCookie("sarthi_user_id")

  return NextResponse.json({ success: true })
}