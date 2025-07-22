import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

 response.cookies.set("sarthi_session", "", {
  path: "/",                   // MUST match
  expires: new Date(0),        // MUST expire
  httpOnly: true,
  secure: false,               // Only use true on HTTPS
  sameSite: "lax"
});

  return response;
}
