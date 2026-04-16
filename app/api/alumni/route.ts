import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { getUsersByCollege } from "@/lib/db-helpers"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const alumni = await getUsersByCollege(user.college_id, "alumni", limit)
    return NextResponse.json({ alumni })
  } catch (error) {
    console.error("[v0] Get alumni error:", error)
    return NextResponse.json({ error: "Failed to fetch alumni" }, { status: 500 })
  }
}
