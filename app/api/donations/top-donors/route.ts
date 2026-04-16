import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const items = await query(`
      SELECT 
        donor_id,
        donor_name,
        donor_email,
        is_anonymous,
        SUM(amount) as total_amount,
        COUNT(*) as donation_count,
        MAX(donated_at) as last_donation
      FROM donations
      WHERE status = 'completed'
      GROUP BY donor_id, donor_name, donor_email, is_anonymous
      ORDER BY total_amount DESC
      LIMIT 20
    `)

    return NextResponse.json(items)
  } catch (error) {
    console.error("[v0] Get top donors error:", error)
    return NextResponse.json({ error: "Failed to fetch top donors" }, { status: 500 })
  }
}
