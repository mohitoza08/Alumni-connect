import { query } from "@/lib/db"
import { createSession, createUser } from "@/lib/auth-db"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { college: string } }) {
  try {
    const { college } = params
    const url = new URL(req.url)
    const provider = url.searchParams.get("provider") || "saml"
    const state = url.searchParams.get("state")

    if (!state) {
      return NextResponse.json({ error: "Invalid SSO state" }, { status: 400 })
    }

    // Get college ID
    const colleges = await query(`SELECT id FROM colleges WHERE name ILIKE $1`, [`%${college}%`])

    if (colleges.length === 0) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    const college_id = colleges[0].id

    // Mock SSO user data - in real implementation, validate SSO response
    const ssoEmail = `sso.user@${college.toLowerCase().replace(/\s+/g, "")}.edu`

    // Check if user exists
    const users = await query(`SELECT * FROM users WHERE email = $1 AND college_id = $2`, [ssoEmail, college_id])

    let user
    if (users.length === 0) {
      // Create new user
      user = await createUser({
        college_id,
        email: ssoEmail,
        password: Math.random().toString(36), // Random password for SSO users
        first_name: "SSO",
        last_name: "User",
        role: "student",
      })
    } else {
      user = users[0]
    }

    // Create session
    const session = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return NextResponse.json({
      token: session.token,
      user,
      provider,
      message: "SSO authentication successful",
    })
  } catch (error) {
    console.error("[v0] SSO callback error:", error)
    return NextResponse.json({ error: "SSO authentication failed" }, { status: 500 })
  }
}
