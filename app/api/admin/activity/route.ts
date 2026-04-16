import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export interface Activity {
  id: string
  type: "user_signup" | "post_created" | "event_created" | "comment"
  userId: number
  userName: string
  userAvatar?: string
  description: string
  timestamp: string
}

export async function GET() {
  try {
    const activities: Activity[] = []

    const recentUsers = await query<{
      id: number
      first_name: string
      last_name: string
      profile_picture: string | null
      created_at: Date
    }>(`
      SELECT id, first_name, last_name, profile_picture, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `)

    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.id}`,
        type: "user_signup",
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`.trim(),
        userAvatar: user.profile_picture || undefined,
        description: "registered as new member",
        timestamp: user.created_at.toISOString(),
      })
    }

    const recentPosts = await query<{
      id: number
      author_id: number
      content: string
      first_name: string
      last_name: string
      profile_picture: string | null
      created_at: Date
    }>(`
      SELECT p.id, p.author_id, p.content, u.first_name, u.last_name, u.profile_picture, p.created_at
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `)

    for (const post of recentPosts) {
      activities.push({
        id: `post-${post.id}`,
        type: "post_created",
        userId: post.author_id,
        userName: `${post.first_name} ${post.last_name}`.trim(),
        userAvatar: post.profile_picture || undefined,
        description: post.content.length > 50 ? `${post.content.substring(0, 50)}...` : post.content,
        timestamp: post.created_at.toISOString(),
      })
    }

    const recentEvents = await query<{
      id: number
      organizer_id: number
      title: string
      first_name: string
      last_name: string
      profile_picture: string | null
      created_at: Date
    }>(`
      SELECT e.id, e.organizer_id, e.title, u.first_name, u.last_name, u.profile_picture, e.created_at
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `)

    for (const event of recentEvents) {
      activities.push({
        id: `event-${event.id}`,
        type: "event_created",
        userId: event.organizer_id,
        userName: `${event.first_name} ${event.last_name}`.trim(),
        userAvatar: event.profile_picture || undefined,
        description: `created event: ${event.title}`,
        timestamp: event.created_at.toISOString(),
      })
    }

    const recentComments = await query<{
      id: number
      author_id: number
      post_id: number
      content: string
      first_name: string
      last_name: string
      profile_picture: string | null
      created_at: Date
    }>(`
      SELECT c.id, c.author_id, c.post_id, c.content, u.first_name, u.last_name, u.profile_picture, c.created_at
      FROM post_comments c
      JOIN users u ON c.author_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `)

    for (const comment of recentComments) {
      activities.push({
        id: `comment-${comment.id}`,
        type: "comment",
        userId: comment.author_id,
        userName: `${comment.first_name} ${comment.last_name}`.trim(),
        userAvatar: comment.profile_picture || undefined,
        description: `commented: ${comment.content.length > 40 ? `${comment.content.substring(0, 40)}...` : comment.content}`,
        timestamp: comment.created_at.toISOString(),
      })
    }

    const sortedActivities = activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50)

    return NextResponse.json({ activities: sortedActivities })
  } catch (error) {
    console.error("[v0] Error fetching activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
