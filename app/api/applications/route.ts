import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session-helper"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const applications = await query(
      `SELECT 
        a.id,
        a.student_id,
        a.full_name,
        a.email,
        a.graduation_year,
        a.degree,
        a.major,
        a.status,
        a.additional_documents,
        a.created_at,
        a.updated_at,
        u.first_name,
        u.last_name,
        u.profile_picture,
        u.role,
        u.phone
      FROM applications a
      LEFT JOIN users u ON a.student_id = u.id
      WHERE a.college_id = $1
      ORDER BY a.created_at DESC`,
      [user.college_id],
    )

    const formattedApplications = applications.map((app: any) => ({
      id: app.id.toString(),
      studentId: app.student_id?.toString(),
      name: app.full_name,
      email: app.email,
      role: app.role || "student",
      department: app.major,
      graduationYear: app.graduation_year,
      degree: app.degree,
      status: app.status,
      profileImage: app.profile_picture,
      phone: app.phone,
      additionalDocuments:
        typeof app.additional_documents === "string" ? JSON.parse(app.additional_documents) : app.additional_documents,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      isApproved: app.status === "approved",
    }))

    console.log("[v0] Fetched applications:", formattedApplications.length)

    return NextResponse.json({ applications: formattedApplications })
  } catch (error) {
    console.error("[v0] Get applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
