import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { banUser } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getServerSession()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Ban reason is required" }, { status: 400 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await banUser(userId, reason)

    return NextResponse.json({
      message: "User banned successfully",
    })
  } catch (error) {
    console.error("[v0] Error banning user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
