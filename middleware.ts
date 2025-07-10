import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/auth', '/']

// Define protected routes that require authentication
const protectedRoutes = ['/onboarding', '/chat', '/dashboard', '/journal', '/conversation', '/reflection']

// Simple JWT validation (basic check - not cryptographic verification)
function isValidJWT(token: string): boolean {
  try {
    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Try to decode the payload to check if it's valid JSON
    const payload = JSON.parse(atob(parts[1]))
    
    // Check if token has required fields and isn't expired
    if (!payload.sub || !payload.exp) return false
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return false
    
    return true
  } catch (error) {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('sarthi_session')?.value

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth')

  // Validate JWT token if it exists
  const hasValidToken = sessionToken && isValidJWT(sessionToken)

  // If trying to access a protected route without a valid session
  if (isProtectedRoute && !hasValidToken) {
    const authUrl = new URL('/auth', request.url)
    return NextResponse.redirect(authUrl)
  }

  // If trying to access auth routes with a valid session, redirect to onboarding
  if (isPublicRoute && hasValidToken && pathname !== '/') {
    const onboardingUrl = new URL('/onboarding', request.url)
    return NextResponse.redirect(onboardingUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}