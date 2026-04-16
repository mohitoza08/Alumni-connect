import { getServerSession } from "@/lib/session-helper"
import { createSession } from "@/lib/auth-db"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    // Create new session token
    const newSession = await createSession(user.id)

    // Set new cookie
    const cookieStore = await cookies()
    cookieStore.set("session", newSession.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return NextResponse.json({
      token: newSession.token,
      user,
      message: "Token refreshed successfully",
    })
  } catch (error) {
    console.error("[v0] Refresh token error:", error)
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 })
  }
}
