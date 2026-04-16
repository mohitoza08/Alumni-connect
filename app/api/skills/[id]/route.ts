import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 })
    }

    await query(
      `DELETE FROM skills WHERE id = $1 AND user_id = $2`,
      [id, user.id],
    )

    return NextResponse.json({ message: "Skill deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete skill error:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}
