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

    const projects = await query(
      `SELECT 
        id,
        project_name,
        description,
        technologies,
        project_link,
        date_completed,
        created_at
      FROM projects
      WHERE user_id = $1 AND college_id = $2
      ORDER BY created_at DESC`,
      [user.id, user.college_id],
    )

    const formattedProjects = projects.map((proj: any) => ({
      id: proj.id.toString(),
      name: proj.project_name,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.project_link,
      dateCompleted: proj.date_completed,
      createdAt: proj.created_at,
    }))

    return NextResponse.json({ projects: formattedProjects })
  } catch (error) {
    console.error("[v0] Get projects error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, technologies, link, dateCompleted } = body

    if (!name || !description) {
      return NextResponse.json({ error: "Project name and description are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO projects (user_id, college_id, project_name, description, technologies, project_link, date_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, project_name, description, technologies, project_link, date_completed, created_at`,
      [user.id, user.college_id, name, description, technologies || null, link || null, dateCompleted || null],
    )

    const newProject = {
      id: result[0].id.toString(),
      name: result[0].project_name,
      description: result[0].description,
      technologies: result[0].technologies,
      link: result[0].project_link,
      dateCompleted: result[0].date_completed,
      createdAt: result[0].created_at,
    }

    return NextResponse.json({ project: newProject }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create project error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
