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

    const items = await query(`
      SELECT 
        dr.*,
        fc.title as campaign_title,
        u.first_name,
        u.last_name,
        u.email as user_email
      FROM donation_requests dr
      JOIN fundraising_campaigns fc ON dr.campaign_id = fc.id
      LEFT JOIN users u ON dr.donor_id = u.id
      ORDER BY 
        CASE dr.status 
          WHEN 'pending' THEN 0 
          WHEN 'verified' THEN 1 
          ELSE 2 
        END,
        dr.created_at DESC
    `)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("[v0] Get all donation requests error:", error)
    return NextResponse.json({ error: "Failed to fetch donation requests" }, { status: 500 })
  }
}
