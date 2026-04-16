import { query } from "@/lib/db"
import { getServerSession } from "@/lib/session-helper"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await query(
      `SELECT er.*, e.title as event_title, e.start_date as event_date, 
              u.first_name, u.last_name, u.email, u.role as user_role
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       JOIN users u ON er.user_id = u.id
       WHERE er.status = 'pending' AND e.college_id = $1
       ORDER BY er.created_at DESC`,
      [user.college_id],
    )

    return NextResponse.json({
      requests,
      total: requests.length,
    })
  } catch (error) {
    console.error("[v0] Get event registrations error:", error)
    return NextResponse.json({ error: "Failed to fetch event registrations" }, { status: 500 })
  }
}
