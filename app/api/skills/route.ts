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

    const skills = await query(
      `SELECT 
        id,
        skill_name,
        organization,
        date_obtained,
        created_at
      FROM skills
      WHERE user_id = $1 AND college_id = $2
      ORDER BY created_at DESC`,
      [user.id, user.college_id],
    )

    const formattedSkills = skills.map((skill: any) => ({
      id: skill.id.toString(),
      name: skill.skill_name,
      organization: skill.organization,
      dateObtained: skill.date_obtained,
      createdAt: skill.created_at,
    }))

    return NextResponse.json({ skills: formattedSkills })
  } catch (error) {
    console.error("[v0] Get skills error:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, organization, dateObtained } = body

    if (!name) {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO skills (user_id, college_id, skill_name, organization, date_obtained)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, skill_name, organization, date_obtained, created_at`,
      [user.id, user.college_id, name, organization || null, dateObtained || null],
    )

    const newSkill = {
      id: result[0].id.toString(),
      name: result[0].skill_name,
      organization: result[0].organization,
      dateObtained: result[0].date_obtained,
      createdAt: result[0].created_at,
    }

    return NextResponse.json({ skill: newSkill }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create skill error:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
