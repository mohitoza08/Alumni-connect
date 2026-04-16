import { createUser, createSession } from "@/lib/auth-db"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { email, password, first_name, last_name, college, role, phone, graduation_year, degree, major } = body

    if (!email || !password || !first_name || !last_name || !college || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const collegeId = Number.parseInt(college)
    if (isNaN(collegeId)) {
      return NextResponse.json({ error: "Invalid college" }, { status: 400 })
    }

    // Create user
    const user = await createUser({
      college_id: collegeId,
      email,
      password,
      first_name,
      last_name,
      role: role || "student",
      phone,
      graduation_year: graduation_year ? Number.parseInt(graduation_year) : undefined,
      degree,
      major,
    })

    console.log("[v0] User created:", { id: user.id, email: user.email, status: user.status })

    if (user.status === "pending") {
      const { query } = await import("@/lib/db")

      await query(
        `INSERT INTO applications (
          college_id, student_id, full_name, email, graduation_year, degree, major, 
          status, additional_documents, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
        [
          collegeId,
          user.id,
          `${first_name} ${last_name}`,
          email,
          graduation_year ? Number.parseInt(graduation_year) : null,
          degree || null,
          major || null,
          "pending",
          JSON.stringify({}),
        ],
      )

      console.log("[v0] Application record created for user:", user.id)

      return NextResponse.json({
        message: "Registration submitted successfully. Please wait for admin approval.",
        needsApproval: true,
        user: {
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      })
    }

    // Create session for admins (they're auto-approved)
    const session = await createSession(user.id)
    console.log("[v0] Session created for admin user:", session.token)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return NextResponse.json({
      user,
      message: "Registration successful",
    })
  } catch (error: any) {
    console.error("[v0] Registration error:", error)

    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    return NextResponse.json(
      {
        error: "Registration failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
