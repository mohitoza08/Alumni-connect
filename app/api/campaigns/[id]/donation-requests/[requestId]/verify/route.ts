import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
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

export async function POST(req: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const requestId = Number.parseInt(params.requestId)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    // Get donation request details
    const requests = await query(
      `SELECT dr.*, fc.title as campaign_title 
       FROM donation_requests dr
       JOIN fundraising_campaigns fc ON dr.campaign_id = fc.id
       WHERE dr.id = $1`,
      [requestId]
    )

    if (requests.length === 0) {
      return NextResponse.json({ error: "Donation request not found" }, { status: 404 })
    }

    const donationRequest = requests[0]

    if (donationRequest.status !== "pending") {
      return NextResponse.json({ error: "Donation request already processed" }, { status: 400 })
    }

    // Use transaction to ensure atomicity
    await transaction(async (client) => {
      // 1. Update donation request status
      await client.query(
        `UPDATE donation_requests 
         SET status = 'verified', verified_at = CURRENT_TIMESTAMP, verified_by = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [user.id, requestId]
      )

      // 2. Insert into donations table with full details
      await client.query(
        `INSERT INTO donations (campaign_id, donor_id, donor_name, donor_email, amount, currency, is_anonymous, payment_method, transaction_id, message, status, donated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed', CURRENT_TIMESTAMP)`,
        [
          donationRequest.campaign_id,
          donationRequest.donor_id,
          donationRequest.is_anonymous ? null : donationRequest.donor_name,
          donationRequest.is_anonymous ? null : donationRequest.donor_email,
          donationRequest.amount,
          donationRequest.currency || 'USD',
          donationRequest.is_anonymous || false,
          donationRequest.payment_method,
          donationRequest.transaction_reference,
          donationRequest.message,
        ]
      )

      // 3. Update campaign current_amount and donor_count
      await client.query(
        `UPDATE fundraising_campaigns 
         SET current_amount = current_amount + $1, donor_count = donor_count + 1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [donationRequest.amount, donationRequest.campaign_id]
      )

      // 4. Create notification for donor
      if (donationRequest.donor_id) {
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, link_url)
           VALUES ($1, 'donation', 'Donation Approved', $2, $3)`,
          [
            donationRequest.donor_id,
            `Your donation of $${Number(donationRequest.amount).toLocaleString()} to "${donationRequest.campaign_title}" has been approved. Thank you for your contribution!`,
            `/alumni/fundraising`,
          ]
        )
      }
    })

    return NextResponse.json({ message: "Donation verified successfully" })
  } catch (error) {
    console.error("[v0] Verify donation error:", error)
    return NextResponse.json({ error: "Failed to verify donation" }, { status: 500 })
  }
}
