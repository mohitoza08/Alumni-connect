import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth/login", "/api/auth/register"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/auth") || pathname.startsWith("/api/ai"))

  // If accessing protected route without session, redirect to login
  if (!isPublicRoute && !sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
