import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { updateMentorshipRequestStatus } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const requestId = Number.parseInt(id)
    const body = await req.json()
    const { status } = body

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await updateMentorshipRequestStatus(requestId, status)
    return NextResponse.json({ message: `Mentorship request ${status}` })
  } catch (error) {
    console.error("[v0] Update mentorship request error:", error)
    return NextResponse.json({ error: "Failed to update mentorship request" }, { status: 500 })
  }
}
