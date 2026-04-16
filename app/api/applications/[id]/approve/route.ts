import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const applicationId = Number.parseInt(id)

    console.log("[v0] Approving application:", applicationId)

    await query(
      `UPDATE applications 
       SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [applicationId],
    )

    const application = await query(`SELECT student_id FROM applications WHERE id = $1`, [applicationId])

    if (application.length > 0 && application[0].student_id) {
      await query(
        `UPDATE users 
         SET status = 'active', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [application[0].student_id],
      )

      await query(
        `INSERT INTO notifications (user_id, type, title, message, created_at)
         VALUES ($1, 'application', 'Application Approved', 'Your application has been approved! You can now access the platform.', CURRENT_TIMESTAMP)`,
        [application[0].student_id],
      )

      console.log("[v0] Application approved and user activated:", application[0].student_id)
    }

    return NextResponse.json({ message: "Application approved successfully" })
  } catch (error) {
    console.error("[v0] Approve application error:", error)
    return NextResponse.json({ error: "Failed to approve application" }, { status: 500 })
  }
}
