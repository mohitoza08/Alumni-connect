import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { getUserBySession } from "@/lib/auth-db"

export async function GET(req: NextRequest) {
  try {
    // Try cookie-based session first
    let user = await getServerSession()

    // If no cookie session, try header-based token
    if (!user) {
      const token = req.headers.get("x-session-token")
      if (token) {
        user = await getUserBySession(token)
      }
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Session fetch error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
