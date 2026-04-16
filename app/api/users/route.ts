import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { getAllUsers, getUsersByCollege } from "@/lib/db-helpers"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") || undefined
    const status = searchParams.get("status") || undefined

    if (role === "alumni") {
      if (!user.college_id) {
        return NextResponse.json({ users: [] })
      }

      const rawUsers = await getUsersByCollege(user.college_id, "alumni", 100)

      const filteredUsers = status === "active" ? rawUsers.filter((u) => u.status === "active") : rawUsers

      const users = filteredUsers.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        role: u.role,
        profile_picture: u.profile_picture,
        major: u.major,
        graduation_year: u.graduation_year,
        current_company: u.current_company,
        current_position: u.current_position,
        linkedin_url: u.linkedin_url,
        location: u.location,
        status: u.status,
      }))

      return NextResponse.json({ users })
    }

    // Admin-only access for full user management
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const rawUsers = await getAllUsers(user.college_id, status)

    const users = rawUsers.map((u) => ({
      id: u.id?.toString() || "",
      name: `${u.first_name} ${u.last_name}`,
      email: u.email || "",
      role: u.role || "student",
      status: u.status || "pending",
      profileImage: u.profile_picture,
      department: u.major,
      graduationYear: u.graduation_year,
      company: u.current_company,
      points: 0,
      streak: 0,
      badges: [],
      lastLoginAt: u.last_login,
      isApproved: u.status === "active",
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
