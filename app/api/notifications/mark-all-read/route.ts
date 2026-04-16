import { query } from "@/lib/db"
import { getServerSession } from "@/lib/session-helper"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `UPDATE notifications 
       SET read = true 
       WHERE user_id = $1 AND read = false
       RETURNING id`,
      [user.id],
    )

    return NextResponse.json({
      success: true,
      markedCount: result.length,
      message: `Marked ${result.length} notifications as read`,
    })
  } catch (error) {
    console.error("[v0] Mark all notifications read error:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
