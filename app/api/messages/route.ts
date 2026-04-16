import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { createMessage, getMessages } from "@/lib/db-helpers"

export const dynamic = "force-dynamic"
export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { recipient_id, mentorship_id, subject, content } = body

    if (!recipient_id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const messageData = {
      sender_id: Number(user.id),
      recipient_id: Number(recipient_id),
      mentorship_id: mentorship_id ? Number(mentorship_id) : undefined,
      subject,
      content,
    }

    const message = await createMessage(messageData)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("[v0] Create message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const other_user_id = searchParams.get("other_user_id")
    const mentorship_id = searchParams.get("mentorship_id")

    if (!other_user_id) {
      return NextResponse.json({ error: "Missing other_user_id" }, { status: 400 })
    }

    const messages = await getMessages(
      Number(user.id),
      Number(other_user_id),
      mentorship_id ? Number(mentorship_id) : undefined,
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Get messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
