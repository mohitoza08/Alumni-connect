"use client"

import useSWR from "swr"
import { BadgeShowcase } from "@/components/gamification/badge-showcase"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { StatsOverview } from "@/components/gamification/stats-overview"
import { getAvailableBadges, getLeaderboard, getUserBadges, getUserStats } from "@/lib/gamification"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export default function PortalAlumniAchievementsPage() {
  const { data: me } = useSWR("/api/users/me", fetcher)

  // Bridge session user to mock gamification data:
  // If the session user's ID isn't present in mockUserStats, fallback to a demo user ("3")
  const demoUserId = "3"
  const rawStats = me?.id ? getUserStats(me.id) : null
  const effectiveUserId = rawStats ? me.id : demoUserId

  const userStats = getUserStats(effectiveUserId)
  const userBadges = getUserBadges(effectiveUserId)
  const availableBadges = getAvailableBadges(effectiveUserId)
  const leaderboard = getLeaderboard()

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Achievements</h1>
        <p className="text-muted-foreground text-sm">Track your badges, points, and streak — and see where you rank.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <BadgeShowcase badges={userBadges} userId={effectiveUserId} title="Your Earned Badges" />
          <BadgeShowcase badges={availableBadges} userId={effectiveUserId} showProgress title="Badges to Unlock" />
        </div>

        <div className="grid gap-6">
          {userStats ? <StatsOverview stats={userStats} /> : null}
          <Leaderboard entries={leaderboard} currentUserId={effectiveUserId} showTop={5} />
        </div>
      </div>

      {!rawStats && (
        <p className="text-xs text-muted-foreground">
          Note: Using demo data for achievements until your account accrues activity.
        </p>
      )}
    </div>
  )
}
