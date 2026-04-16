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

export async function DELETE(_req: Request, { params }: { params: { id: string; requestId: string } }) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const requestId = Number.parseInt(params.requestId)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    // Check if request exists
    const existing = await query(`SELECT id FROM donation_requests WHERE id = $1`, [requestId])
    if (existing.length === 0) {
      return NextResponse.json({ error: "Donation request not found" }, { status: 404 })
    }

    // Delete the request
    await query(`DELETE FROM donation_requests WHERE id = $1`, [requestId])

    console.log("[v0] Donation request deleted:", requestId)
    return NextResponse.json({ message: "Donation request deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete donation request error:", error)
    return NextResponse.json({ error: "Failed to delete donation request" }, { status: 500 })
  }
}
