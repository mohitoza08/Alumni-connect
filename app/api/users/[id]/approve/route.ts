import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { approveUser } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can approve users" }, { status: 403 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    console.log("[v0] Admin approving user:", userId)
    await approveUser(userId)
    console.log("[v0] User approved successfully:", userId)

    return NextResponse.json({ message: "User approved successfully" })
  } catch (error) {
    console.error("[v0] Approve user error:", error)
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
  }
}
