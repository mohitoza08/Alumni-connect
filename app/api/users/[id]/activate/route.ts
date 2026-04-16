import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { activateUser } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getServerSession()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    await activateUser(userId)

    return NextResponse.json({
      message: "User activated successfully",
    })
  } catch (error) {
    console.error("[v0] Error activating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
