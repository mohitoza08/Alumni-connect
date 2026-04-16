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

    const leaderboard = await query(
      `SELECT us.*, u.first_name, u.last_name, u.role, u.profile_picture,
              ROW_NUMBER() OVER (ORDER BY us.total_points DESC) as rank
       FROM user_streaks us
       JOIN users u ON us.user_id = u.id
       WHERE u.college_id = $1 AND us.current_streak > 0
       ORDER BY us.total_points DESC
       LIMIT 100`,
      [user.college_id],
    )

    const entries = leaderboard.map((row: any) => ({
      userId: row.user_id,
      userName: `${row.first_name} ${row.last_name}`,
      userRole: row.role,
      streak: row.current_streak,
      points: row.total_points,
      rank: row.rank,
      profileImage: row.profile_picture,
    }))

    return NextResponse.json({
      entries,
      currentUser: user.id,
      totalUsers: entries.length,
    })
  } catch (error) {
    console.error("[v0] Get leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
