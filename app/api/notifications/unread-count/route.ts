import { query } from "@/lib/db"
import { getServerSession } from "@/lib/session-helper"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = $1 AND read = false`,
      [user.id],
    )

    const unreadCount = Number.parseInt(result[0]?.count || "0")

    return NextResponse.json({
      unreadCount,
      hasUnread: unreadCount > 0,
    })
  } catch (error) {
    console.error("[v0] Get unread count error:", error)
    return NextResponse.json({ error: "Failed to get unread count" }, { status: 500 })
  }
}
