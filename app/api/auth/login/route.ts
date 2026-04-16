import { authenticateUser, createSession } from "@/lib/auth-db"
import { query } from "@/lib/db"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, college, role } = body

    if (!email || !password || !college) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let collegeId: number | null = null

    if (!isNaN(Number(college))) {
      collegeId = Number(college)
    } else {
      const collegeResult = await query<{ id: number }>(
        "SELECT id FROM colleges WHERE name = $1 OR code = $1",
        [college]
      )
      if (collegeResult.length > 0) {
        collegeId = collegeResult[0].id
      }
    }

    if (collegeId === null) {
      return NextResponse.json({ error: "Invalid college" }, { status: 400 })
    }

    const user = await authenticateUser(email, password, collegeId)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password, or account not yet approved" }, { status: 401 })
    }

    // Create session
    const session = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("[v0] Login successful for user:", user.id)

    return NextResponse.json({
      user,
      token: session.token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
