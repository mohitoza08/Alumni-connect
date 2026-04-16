import { query } from "@/lib/db"
import { getServerSession } from "@/lib/session-helper"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const donationId = Number.parseInt(params.id)
    if (isNaN(donationId)) {
      return NextResponse.json({ error: "Invalid donation ID" }, { status: 400 })
    }

    const result = await query(
      `UPDATE donations 
       SET status = 'verified'
       WHERE id = $1
       RETURNING *`,
      [donationId],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    const donation = result[0]

    // Update campaign amount
    await query(
      `UPDATE fundraising_campaigns 
       SET current_amount = current_amount + $1
       WHERE id = $2`,
      [donation.amount, donation.campaign_id],
    )

    // Send notification
    if (donation.donor_id) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'donation')`,
        [donation.donor_id, "Donation verified", `Your donation of $${donation.amount} has been verified. Thank you!`],
      )
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("[v0] Verify donation error:", error)
    return NextResponse.json({ error: "Failed to verify donation" }, { status: 500 })
  }
}
