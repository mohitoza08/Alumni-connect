import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
export const dynamic = "force-dynamic"
  try {
    const campaignId = Number.parseInt(params.id)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const result = await query(
      `SELECT d.*, u.first_name, u.last_name 
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       WHERE d.campaign_id = $1 AND d.status = 'verified'
       ORDER BY d.created_at DESC`,
      [campaignId],
    )

    return NextResponse.json({ items: result })
  } catch (error) {
    console.error("[v0] Get donations error:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}
