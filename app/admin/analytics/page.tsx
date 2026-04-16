"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, TrendingUp, Activity } from "lucide-react"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth("admin")

  const { data: usersData } = useSWR("/api/users", fetcher)
  const { data: postsData } = useSWR("/api/posts", fetcher)
  const { data: eventsData } = useSWR("/api/events", fetcher)

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const users = usersData?.users || []
  const posts = postsData?.posts || []
  const events = eventsData?.events || []

  const totalUsers = users.length
  const totalPosts = posts.length
  const totalEvents = events.length
  const activeUsers = users.filter((u: any) => u.is_approved).length
  const totalEngagement = posts.reduce((sum: number, post: any) => sum + (post.likes_count || 0), 0)

  const usersByRole = {
    students: users.filter((u: any) => u.role === "student").length,
    alumni: users.filter((u: any) => u.role === "alumni").length,
    admins: users.filter((u: any) => u.role === "admin").length,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={user.name} userBadges={user.badges || []} userPoints={user.points || 0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform insights and performance metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-green-600">Real-time data</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                    <p className="text-xs text-green-600">Approved accounts</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">{totalPosts}</p>
                    <p className="text-xs text-green-600">Community engagement</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                    <p className="text-2xl font-bold">{totalEngagement}</p>
                    <p className="text-xs text-green-600">Likes & interactions</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Students</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{usersByRole.students}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({totalUsers > 0 ? ((usersByRole.students / totalUsers) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Alumni</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{usersByRole.alumni}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({totalUsers > 0 ? ((usersByRole.alumni / totalUsers) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Admins</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{usersByRole.admins}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({totalUsers > 0 ? ((usersByRole.admins / totalUsers) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
                <CardDescription>Events and participation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Events</span>
                    <span className="font-medium">{totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Community Posts</span>
                    <span className="font-medium">{totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Likes</span>
                    <span className="font-medium">{totalEngagement}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
