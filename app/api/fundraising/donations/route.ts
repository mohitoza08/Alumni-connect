import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { createDonation } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    const body = await req.json()
    const { campaign_id, amount, donor_name, donor_email, is_anonymous } = body

    if (!campaign_id || !amount) {
      return NextResponse.json({ error: "Campaign ID and amount are required" }, { status: 400 })
    }

    // Anonymous donations don't require authentication
    if (!user && !donor_name && !donor_email) {
      return NextResponse.json({ error: "Donor information required for anonymous donations" }, { status: 400 })
    }

    await createDonation({
      campaign_id: Number.parseInt(campaign_id),
      donor_id: user?.id,
      amount: Number.parseFloat(amount),
      donor_name,
      donor_email,
      is_anonymous: is_anonymous || false,
    })

    return NextResponse.json({ message: "Donation submitted successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create donation error:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}
