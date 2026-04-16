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

    const registrationId = Number.parseInt(params.id)
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { adminNote } = body

    // Update registration status
    const result = await query(
      `UPDATE event_registrations 
       SET status = 'confirmed', admin_note = $1, verified_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [adminNote || null, registrationId],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const registration = result[0]

    // Send notification to user
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'event')`,
      [
        registration.user_id,
        "Event Registration Confirmed",
        "Your event registration has been verified and confirmed.",
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Registration verified successfully",
      registration,
    })
  } catch (error) {
    console.error("[v0] Verify event registration error:", error)
    return NextResponse.json({ error: "Failed to verify registration" }, { status: 500 })
  }
}
