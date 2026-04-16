import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"

export const dynamic = "force-dynamic"
import { createComment, getComments } from "@/lib/db-helpers"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = Number.parseInt(id)

    const comments = await getComments(postId)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("[v0] Get comments error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = Number.parseInt(id)
    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("[v0] Creating comment on post:", { userId: user.id, postId })

    const comment = await createComment(postId, user.id, content)

    console.log("[v0] Comment created successfully")
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create comment error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
