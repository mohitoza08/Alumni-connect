import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const users = await query("SELECT id, email, status, college_id, role FROM users WHERE email = $1", ["admin@saffrony.ac.in"])
    const colleges = await query("SELECT id, name FROM colleges LIMIT 5")
    
    return NextResponse.json({
      status: "connected",
      adminUser: users,
      colleges: colleges,
      userCount: users.length,
      collegeCount: colleges.length
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message
    }, { status: 500 })
  }
}
