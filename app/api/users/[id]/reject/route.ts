import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { rejectUser } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can reject users" }, { status: 403 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await rejectUser(userId)
    return NextResponse.json({ message: "User rejected successfully" })
  } catch (error) {
    console.error("[v0] Reject user error:", error)
    return NextResponse.json({ error: "Failed to reject user" }, { status: 500 })
  }
}
