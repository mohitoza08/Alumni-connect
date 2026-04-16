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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const campaignId = Number.parseInt(params.id)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    const result = await query(`SELECT * FROM fundraising_campaigns WHERE id = $1`, [campaignId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaign = result[0]
    const transformedCampaign = {
      id: campaign.id,
      collegeId: campaign.college_id,
      creatorId: campaign.creator_id || campaign.created_by,
      title: campaign.title,
      description: campaign.description,
      goalAmount: Number(campaign.goal_amount) || 0,
      collectedAmount: Number(campaign.current_amount) || 0,
      currentAmount: Number(campaign.current_amount) || 0,
      currency: campaign.currency || "USD",
      campaignType: campaign.campaign_type,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      bannerImage: campaign.banner_image,
      status: campaign.status,
      donorCount: campaign.donor_count || 0,
      isFeatured: campaign.is_featured || false,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    }

    console.log("[v0] Returning campaign:", transformedCampaign.id, "Goal:", transformedCampaign.goalAmount)
    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error("[v0] Get campaign error:", error)
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const campaignId = Number.parseInt(params.id)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Check if campaign exists
    const existing = await query(`SELECT id FROM fundraising_campaigns WHERE id = $1`, [campaignId])
    if (existing.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Delete campaign (donation_requests and donations will be cascade deleted)
    await query(`DELETE FROM fundraising_campaigns WHERE id = $1`, [campaignId])

    console.log("[v0] Campaign deleted:", campaignId)
    return NextResponse.json({ message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete campaign error:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}
