import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { likePost, unlikePost } from "@/lib/db-helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = Number.parseInt(id)

    await likePost(postId, Number(user.id))

    return NextResponse.json({ message: "Post liked" })
  } catch (error) {
    console.error("[v0] Like post error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = Number.parseInt(id)

    await unlikePost(postId, Number(user.id))

    return NextResponse.json({ message: "Post unliked" })
  } catch (error) {
    console.error("[v0] Unlike post error:", error)
    return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 })
  }
}
