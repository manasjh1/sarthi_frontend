// app/api/reflections/route.ts
import { cookies } from "next/headers"
import { authFetch } from "@/lib/api"

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("sarthi_session")?.value

  const body = await req.json()

  const res = await authFetch("/api/reflection/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return Response.json(data)
}
