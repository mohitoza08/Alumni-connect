import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { deleteUser } from "@/lib/db-helpers"
import { query } from "@/lib/db"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (Number(user.id) !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const result = await query("SELECT * FROM users WHERE id = $1", [userId])

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = {
      id: result[0].id,
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      email: result[0].email,
      phone: result[0].phone,
      bio: result[0].bio,
      role: result[0].role,
      graduationYear: result[0].graduation_year,
      degree: result[0].degree,
      major: result[0].major,
      currentCompany: result[0].current_company,
      currentPosition: result[0].current_position,
      linkedinUrl: result[0].linkedin_url,
      profilePicture: result[0].profile_picture,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (Number(user.id) !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      first_name,
      last_name,
      phone,
      bio,
      graduation_year,
      degree,
      major,
      linkedin_url,
      current_company,
      current_position,
    } = body

    const result = await query(
      `UPDATE users 
       SET first_name = $1,
           last_name = $2,
           phone = $3,
           bio = $4,
           graduation_year = $5,
           degree = $6,
           major = $7,
           linkedin_url = $8,
           current_company = $9,
           current_position = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        first_name || null,
        last_name || null,
        phone || null,
        bio || null,
        graduation_year || null,
        degree || null,
        major || null,
        linkedin_url || null,
        current_company || null,
        current_position || null,
        userId,
      ],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = {
      id: result[0].id,
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      email: result[0].email,
      phone: result[0].phone,
      bio: result[0].bio,
      role: result[0].role,
      graduationYear: result[0].graduation_year,
      degree: result[0].degree,
      major: result[0].major,
      currentCompany: result[0].current_company,
      currentPosition: result[0].current_position,
      linkedinUrl: result[0].linkedin_url,
      profilePicture: result[0].profile_picture,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json(
      { error: "Failed to update user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await deleteUser(userId)
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
