import { deleteSession } from "@/lib/auth-db"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (token) {
      await deleteSession(token)
      cookieStore.delete("session")
    }

    return NextResponse.json({
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
