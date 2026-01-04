import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ALLOWED_ORIGIN = "https://app.sarthi.me"

function deleteCookie(name: string) {
  const cookieStore = cookies()

  cookieStore.delete({
    name,
    domain: ".sarthi.me",
    path: "/",
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function POST() {
  deleteCookie("sarthi_session")
  deleteCookie("sarthi_user_id")

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Credentials": "true",
      },
    }
  )
}
