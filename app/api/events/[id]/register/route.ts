import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { registerForEvent, unregisterFromEvent } from "@/lib/db-helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const eventId = Number.parseInt(id)

    const body = await req.json().catch(() => ({}))
    const { paymentReference, paymentProof } = body

    await registerForEvent(eventId, Number(user.id), paymentReference, paymentProof)

    return NextResponse.json({
      message: "Successfully registered for event",
      requiresVerification: !!paymentReference,
    })
  } catch (error) {
    console.error("[v0] Event registration error:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const eventId = Number.parseInt(id)

    await unregisterFromEvent(eventId, Number(user.id))

    return NextResponse.json({ message: "Successfully unregistered from event" })
  } catch (error) {
    console.error("[v0] Event unregistration error:", error)
    return NextResponse.json({ error: "Failed to unregister from event" }, { status: 500 })
  }
}
