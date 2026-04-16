import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getServerSession } from "@/lib/session-helper"
import { Users, Calendar, BookOpen, Trophy, UserCheck, MessageSquare } from "lucide-react"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function StudentDashboard() {
  const user = await getServerSession()

  if (!user || user.role !== "student") {
    redirect("/")
  }

  let mentorshipCount = 0
  try {
    const mentorshipStats = await query(
      `SELECT COUNT(*) as count FROM mentorship_requests WHERE mentee_id = $1 AND status = 'accepted'`,
      [user.id],
    )
    mentorshipCount = Number(mentorshipStats[0]?.count || 0)
  } catch (error) {
    console.log("[v0] mentorship_requests table not found, defaulting to 0")
  }

  let eventsCount = 0
  try {
    const eventsStats = await query(
      `SELECT COUNT(*) as count FROM event_registrations WHERE user_id = $1 AND status = 'registered'`,
      [user.id],
    )
    eventsCount = Number(eventsStats[0]?.count || 0)
  } catch (error) {
    console.log("[v0] event_registrations query error, defaulting to 0")
  }

  const networkConnections = 0 // Will be calculated from connections table
  const eventsAttended = eventsCount
  const mentorshipSessions = mentorshipCount

  const recentActivities = [
    {
      id: "1",
      type: "post" as const,
      title: "Welcome to Alumni Connect!",
      description: "Join our community and start networking",
      timestamp: new Date("2024-12-15"),
      user: { name: "Admin", avatar: "" },
    },
    {
      id: "2",
      type: "event" as const,
      title: "Career Fair 2024",
      description: "Connect with top employers",
      timestamp: new Date("2024-12-10"),
      status: "pending" as const,
    },
    {
      id: "3",
      type: "mentorship" as const,
      title: "Mentorship Program",
      description: "Find your perfect mentor",
      timestamp: new Date("2024-12-08"),
    },
  ]

  const quickActions = [
    {
      title: "Apply for Alumni Status",
      description: "Submit your application",
      icon: UserCheck,
      href: "/student/apply",
      variant: "default" as const,
    },
    {
      title: "Find a Mentor",
      description: "Connect with alumni",
      icon: BookOpen,
      href: "/student/mentorship",
    },
    {
      title: "Join Community",
      description: "Participate in discussions",
      icon: MessageSquare,
      href: "/student/community",
    },
    {
      title: "Browse Events",
      description: "Discover upcoming events",
      icon: Calendar,
      href: "/student/events",
    },
  ]

  const userName = `${user.first_name} ${user.last_name}`

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={userName} userBadges={[]} userPoints={0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Here's what's happening in your alumni network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Network Connections"
              value={networkConnections}
              description="Active connections"
              icon={Users}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Events Attended"
              value={eventsAttended}
              description="This semester"
              icon={Calendar}
              trend={{ value: 2, isPositive: true }}
            />
            <StatsCard
              title="Mentorship Sessions"
              value={mentorshipSessions}
              description="Completed sessions"
              icon={BookOpen}
            />
            <StatsCard
              title="Achievement Points"
              value={0}
              description="Total points earned"
              icon={Trophy}
              trend={{ value: 15, isPositive: true }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <QuickActions actions={quickActions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
