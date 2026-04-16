import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { createFundraisingCampaign, getFundraisingCampaigns } from "@/lib/db-helpers"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await getFundraisingCampaigns(user.college_id)
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("[v0] Get campaigns error:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create fundraising campaigns" }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, goal_amount, start_date, end_date } = body

    if (!title || !description || !goal_amount || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const campaign = await createFundraisingCampaign({
      college_id: user.college_id,
      creator_id: user.id,
      title,
      description,
      goal_amount: Number.parseFloat(goal_amount),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create campaign error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
