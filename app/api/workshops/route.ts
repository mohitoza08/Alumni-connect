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

    const workshops = await query(
      `SELECT * FROM workshops 
       WHERE college_id = $1 AND status = 'active'
       ORDER BY date ASC`,
      [user.college_id],
    )

    return NextResponse.json({ items: workshops })
  } catch (error) {
    console.error("[v0] Get workshops error:", error)
    return NextResponse.json({ error: "Failed to fetch workshops" }, { status: 500 })
  }
}
