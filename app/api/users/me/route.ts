import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { updateUserProfile } from "@/lib/auth-db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Get current user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const allowedFields = [
      "first_name",
      "last_name",
      "phone",
      "bio",
      "profile_picture",
      "graduation_year",
      "degree",
      "major",
      "current_company",
      "current_position",
      "linkedin_url",
    ]

    const updates: any = {}
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = body[key]
      }
    })

    const updatedUser = await updateUserProfile(user.id, updates)
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
