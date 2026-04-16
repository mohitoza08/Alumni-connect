"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/components/layout/auth-checker"
import { PortfolioView } from "@/components/portfolio/portfolio-view"

export default function StudentAchievementsPage() {
  const { user, isLoading } = useAuth("student")

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={user.name} userBadges={user.badges || []} userPoints={user.points || 0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
            <p className="text-muted-foreground">View your achievements, skills, and projects</p>
          </div>

          <PortfolioView />
        </div>
      </main>
    </div>
  )
}
