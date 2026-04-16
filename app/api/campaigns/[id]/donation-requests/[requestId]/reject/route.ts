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

    const body = await req.json().catch(() => ({}))
    const adminNote = body.note || "Donation request rejected"

    // Get donation request details for notification
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

    // Update donation request status
    await query(
      `UPDATE donation_requests 
       SET status = 'rejected', admin_notes = $1, verified_at = CURRENT_TIMESTAMP, verified_by = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [adminNote, user.id, requestId],
    )

    // Create notification for donor
    if (donationRequest.donor_id) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, link_url)
         VALUES ($1, 'donation', 'Donation Rejected', $2, $3)`,
        [
          donationRequest.donor_id,
          `Your donation of $${Number(donationRequest.amount).toLocaleString()} to "${donationRequest.campaign_title}" was rejected. Reason: ${adminNote}`,
          `/alumni/fundraising`,
        ]
      )
    }

    return NextResponse.json({ message: "Donation request rejected" })
  } catch (error) {
    console.error("[v0] Reject donation error:", error)
    return NextResponse.json({ error: "Failed to reject donation" }, { status: 500 })
  }
}
