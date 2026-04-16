import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { updateUserRole } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { role } = await req.json()
    if (!["student", "alumni", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await updateUserRole(userId, role)
    return NextResponse.json({ message: "User role updated successfully" })
  } catch (error) {
    console.error("[v0] Update user role error:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}
