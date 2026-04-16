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

    const achievements = await query(
      `SELECT 
        id,
        title,
        description,
        achievement_type,
        achievement_date,
        organization,
        verification_url,
        is_verified,
        is_featured,
        created_at
      FROM achievements
      WHERE user_id = $1 AND college_id = $2
      ORDER BY is_featured DESC, achievement_date DESC, created_at DESC`,
      [user.id, user.college_id],
    )

    const formattedAchievements = achievements.map((ach: any) => ({
      id: ach.id.toString(),
      title: ach.title,
      description: ach.description,
      achievementType: ach.achievement_type,
      date: ach.achievement_date,
      organization: ach.organization,
      verificationUrl: ach.verification_url,
      isVerified: ach.is_verified,
      isFeatured: ach.is_featured,
      createdAt: ach.created_at,
    }))

    return NextResponse.json({ achievements: formattedAchievements })
  } catch (error) {
    console.error("[v0] Get achievements error:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, achievementType, date, organization, verificationUrl } = body

    if (!title || !description || !achievementType) {
      return NextResponse.json({ error: "Title, description, and achievement type are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO achievements (user_id, college_id, title, description, achievement_type, achievement_date, organization, verification_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, achievement_type, achievement_date, organization, verification_url, is_verified, is_featured, created_at`,
      [user.id, user.college_id, title, description, achievementType, date || null, organization || null, verificationUrl || null],
    )

    const newAchievement = {
      id: result[0].id.toString(),
      title: result[0].title,
      description: result[0].description,
      achievementType: result[0].achievement_type,
      date: result[0].achievement_date,
      organization: result[0].organization,
      verificationUrl: result[0].verification_url,
      isVerified: result[0].is_verified,
      isFeatured: result[0].is_featured,
      createdAt: result[0].created_at,
    }

    return NextResponse.json({ achievement: newAchievement }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create achievement error:", error)
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 })
  }
}
