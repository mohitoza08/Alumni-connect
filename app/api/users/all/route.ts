import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { getAllUsers } from "@/lib/db-helpers"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view all users" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined

    const users = await getAllUsers(user.college_id, status)
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get all users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
