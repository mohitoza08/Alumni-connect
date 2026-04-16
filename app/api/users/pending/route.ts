import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { getPendingUsers } from "@/lib/db-helpers"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view pending users" }, { status: 403 })
    }

    const pendingUsers = await getPendingUsers(user.college_id)
    return NextResponse.json({ users: pendingUsers })
  } catch (error) {
    console.error("[v0] Get pending users error:", error)
    return NextResponse.json({ error: "Failed to fetch pending users" }, { status: 500 })
  }
}
