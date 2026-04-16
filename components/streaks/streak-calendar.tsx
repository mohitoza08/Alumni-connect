"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

interface StreakDay {
  date: string
  checkedIn: boolean
}

interface StreakStats {
  currentStreak: number
  longestStreak: number
  averageStreak: number
  maxStreak: number
  rank: number
  totalUsers: number
  lastCheckin?: string
  streakHistory: StreakDay[]
}

export function StreakCalendar() {
  const [stats, setStats] = useState<StreakStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakStats()
  }, [])

  async function fetchStreakStats() {
    try {
      const token = localStorage.getItem("session_token")
      const res = await fetch("/api/streak/stats", {
        headers: { "x-session-token": token || "" },
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch streak stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Unable to load streak data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">#{stats.rank}</p>
                <p className="text-sm text-muted-foreground">Your Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageStreak}</p>
                <p className="text-sm text-muted-foreground">Community Avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            30-Day Streak History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {stats.streakHistory.map((day, index) => {
              const date = new Date(day.date)
              const dayNumber = date.getDate()
              const isToday = day.date === new Date().toISOString().split("T")[0]

              return (
                <div
                  key={day.date}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                    ${day.checkedIn ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}
                    ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
                  `}
                  title={`${day.date} - ${day.checkedIn ? "Checked in" : "No check-in"}`}
                >
                  {dayNumber}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Checked in</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Missed</span>
              </div>
            </div>
            {stats.lastCheckin && <span>Last check-in: {new Date(stats.lastCheckin).toLocaleDateString()}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { days: 7, name: "Week Warrior", points: 100, icon: "🔥" },
              { days: 30, name: "Streak Master", points: 300, icon: "⚡" },
              { days: 100, name: "Century Club", points: 500, icon: "💯" },
              { days: 365, name: "Year Champion", points: 1000, icon: "👑" },
            ].map((milestone) => {
              const achieved = stats.currentStreak >= milestone.days
              const progress = Math.min((stats.currentStreak / milestone.days) * 100, 100)

              return (
                <div key={milestone.days} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{milestone.icon}</span>
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {milestone.days} day streak • {milestone.points} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {achieved ? (
                      <Badge variant="default" className="bg-green-500">
                        Achieved
                      </Badge>
                    ) : (
                      <Badge variant="outline">{Math.round(progress)}%</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
