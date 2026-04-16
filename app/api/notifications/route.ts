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

    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [user.id],
    )

    return NextResponse.json({ items: notifications })
  } catch (error) {
    console.error("[v0] Get notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, body: notifBody, scope } = body

    if (!title || !notifBody) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 })
    }

    if (scope === "all") {
      // Broadcast to all users in the same college
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         SELECT id, $1, $2, 'announcement'
         FROM users
         WHERE college_id = $3 AND status = 'active'`,
        [title, notifBody, user.college_id],
      )
    } else {
      // Send to current user only
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'announcement')`,
        [user.id, title, notifBody],
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Create notification error:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
