import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getServerSession } from "@/lib/session-helper"
import { Users, Calendar, BookOpen, Heart, MessageSquare, DollarSign } from "lucide-react"
import { query } from "@/lib/db"

export default async function AlumniDashboard() {
  const user = await getServerSession()

  if (!user || user.role !== "alumni") {
    redirect("/")
  }

  const [mentorshipStats, eventsStats, postsStats, donationStats] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM mentorships WHERE mentor_id = $1 AND status = 'active'`, [user.id]),
    query(
      `SELECT COUNT(*) as count FROM events WHERE organizer_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [user.id],
    ),
    query(`SELECT COUNT(*) as count FROM community_posts WHERE author_id = $1`, [user.id]),
    query(`SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE donor_id = $1 AND status = 'completed'`, [
      user.id,
    ]),
  ])

  const studentsMentored = Number(mentorshipStats[0]?.count || 0)
  const eventsHosted = Number(eventsStats[0]?.count || 0)
  const communityPosts = Number(postsStats[0]?.count || 0)
  const donationsTotal = Number(donationStats[0]?.total || 0)

  const recentActivities = [
    {
      id: "1",
      type: "mentorship" as const,
      title: "New Mentorship Request",
      description: "John Doe wants to connect with you",
      timestamp: new Date("2024-12-15"),
      user: { name: "John Doe", avatar: "" },
      status: "pending" as const,
    },
    {
      id: "2",
      type: "event" as const,
      title: "Alumni Networking Event",
      description: "Monthly networking meetup",
      timestamp: new Date("2024-12-12"),
      status: "completed" as const,
    },
    {
      id: "3",
      type: "post" as const,
      title: "Shared Career Advice",
      description: "Your post got 15 likes",
      timestamp: new Date("2024-12-10"),
    },
    {
      id: "4",
      type: "achievement" as const,
      title: "Mentor Badge Earned",
      description: "Completed 10 mentorship sessions",
      timestamp: new Date("2024-12-08"),
      status: "completed" as const,
    },
  ]

  const quickActions = [
    {
      title: "Mentor Students",
      description: "Guide the next generation",
      icon: BookOpen,
      href: "/alumni/mentorship",
      variant: "default" as const,
    },
    {
      title: "Create Post",
      description: "Share your experience",
      icon: MessageSquare,
      href: "/alumni/community",
    },
    {
      title: "Donate to Fund",
      description: "Support your alma mater",
      icon: Heart,
      href: "/alumni/fundraising",
    },
    {
      title: "Host Event",
      description: "Organize networking events",
      icon: Calendar,
      href: "/alumni/events",
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
            <p className="text-muted-foreground">
              {user.current_position && user.current_company
                ? `${user.current_position} at ${user.current_company}`
                : "Alumni Member"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Students Mentored"
              value={studentsMentored}
              description="Active mentorships"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Events Hosted"
              value={eventsHosted}
              description="This year"
              icon={Calendar}
              trend={{ value: 1, isPositive: true }}
            />
            <StatsCard
              title="Community Posts"
              value={communityPosts}
              description="Total contributions"
              icon={MessageSquare}
            />
            <StatsCard
              title="Donations Made"
              value={`$${donationsTotal.toLocaleString()}`}
              description="Total contributed"
              icon={DollarSign}
              trend={{ value: 25, isPositive: true }}
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
