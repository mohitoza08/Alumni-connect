import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { getUserBySession } from "@/lib/auth-db"

async function getSessionUser() {
  let user = await getServerSession()
  if (!user) {
    const headers = await import("next/headers")
    const headersList = await headers.headers()
    const token = headersList.get("x-session-token")
    if (token) {
      user = await getUserBySession(token)
    }
  }
  return user
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get count of active campaigns
    const campaignsResult = await query(
      `SELECT COUNT(*) as count FROM fundraising_campaigns WHERE college_id = $1 AND status = 'active'`,
      [user.college_id]
    )
    const activeCampaigns = Number(campaignsResult[0]?.count || 0)

    // Get total raised (sum of current_amount from all campaigns)
    const raisedResult = await query(
      `SELECT COALESCE(SUM(current_amount), 0) as total FROM fundraising_campaigns WHERE college_id = $1`,
      [user.college_id]
    )
    const totalRaised = Number(raisedResult[0]?.total || 0)

    // Get count of pending donation requests
    const pendingResult = await query(
      `SELECT COUNT(*) as count 
       FROM donation_requests dr
       JOIN fundraising_campaigns fc ON dr.campaign_id = fc.id
       WHERE fc.college_id = $1 AND dr.status = 'pending'`,
      [user.college_id]
    )
    const pendingRequests = Number(pendingResult[0]?.count || 0)

    return NextResponse.json({
      activeCampaigns,
      totalRaised,
      pendingRequests,
    })
  } catch (error) {
    console.error("[v0] Get fundraising stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
