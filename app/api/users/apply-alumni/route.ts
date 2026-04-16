import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const user = await getServerSession()
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { jobRole, company, location, higherStudies, workExperience, achievements } = body

    await query(
      `INSERT INTO applications (
        college_id, student_id, full_name, email, graduation_year, 
        degree, major, additional_documents, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [
        user.college_id,
        user.id,
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.graduation_year || new Date().getFullYear(),
        higherStudies || "Bachelor's",
        user.major || "Not Specified",
        JSON.stringify({
          jobRole,
          company,
          location,
          higherStudies,
          workExperience,
          achievements,
        }),
      ],
    )

    const admins = await query(`SELECT id FROM users WHERE college_id = $1 AND role = 'admin'`, [user.college_id])

    for (const admin of admins) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'application', $2, $3)`,
        [
          admin.id,
          "New Alumni Application",
          `${user.first_name} ${user.last_name} has submitted an alumni application`,
        ],
      )
    }

    console.log("[v0] Alumni application submitted successfully for user:", user.id)

    return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Apply alumni error:", error)
    return NextResponse.json({ error: "Failed to submit application", details: error.message }, { status: 500 })
  }
}
