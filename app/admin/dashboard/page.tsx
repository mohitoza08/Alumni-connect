import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getServerSession } from "@/lib/session-helper"
import { Users, UserCheck, MessageSquare, Calendar, TrendingUp, BarChart3 } from "lucide-react"
import { query } from "@/lib/db"

export default async function AdminDashboard() {
  const user = await getServerSession()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  const [totalUsersStats, alumniStats, studentStats, eventsStats, pendingApplicationsStats, pendingUsersStats] =
    await Promise.all([
      query(`SELECT COUNT(*) as count FROM users WHERE college_id = $1 AND status = 'active'`, [user.college_id]),
      query(`SELECT COUNT(*) as count FROM users WHERE college_id = $1 AND role = 'alumni' AND status = 'active'`, [
        user.college_id,
      ]),
      query(`SELECT COUNT(*) as count FROM users WHERE college_id = $1 AND role = 'student' AND status = 'active'`, [
        user.college_id,
      ]),
      query(
        `SELECT COUNT(*) as count FROM events WHERE college_id = $1 AND status = 'upcoming' AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        [user.college_id],
      ),
      query(`SELECT COUNT(*) as count FROM applications WHERE college_id = $1 AND status = 'pending'`, [
        user.college_id,
      ]),
      query(`SELECT COUNT(*) as count FROM users WHERE college_id = $1 AND status = 'pending'`, [user.college_id]),
    ])

  const totalUsers = Number(totalUsersStats[0]?.count || 0)
  const alumniCount = Number(alumniStats[0]?.count || 0)
  const studentCount = Number(studentStats[0]?.count || 0)
  const activeEvents = Number(eventsStats[0]?.count || 0)
  const pendingApplications = Number(pendingApplicationsStats[0]?.count || 0)
  const pendingUsers = Number(pendingUsersStats[0]?.count || 0)

  const quickActions = [
    {
      title: "Review Applications",
      description: `Review pending applications`,
      icon: UserCheck,
      href: "/admin/applications",
      variant: "default" as const,
    },
    {
      title: "Manage Users",
      description: "User accounts & roles",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Moderate Content",
      description: "Community posts & reports",
      icon: MessageSquare,
      href: "/admin/community",
    },
    {
      title: "View Analytics",
      description: "Platform insights",
      icon: BarChart3,
      href: "/admin/analytics",
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
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Alumni Connect platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={totalUsers}
              description={`${alumniCount} alumni, ${studentCount} students`}
              icon={Users}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Pending Applications"
              value={pendingApplications}
              description="Awaiting review"
              icon={UserCheck}
              trend={{ value: 2, isPositive: false }}
            />
            <StatsCard
              title="Active Events"
              value={activeEvents}
              description="This month"
              icon={Calendar}
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Platform Growth"
              value="12%"
              description="Monthly active users"
              icon={TrendingUp}
              trend={{ value: 3, isPositive: true }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <QuickActions actions={quickActions} />
            </div>
            <div className="space-y-6">
              <RecentActivity title="Platform Activity" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
