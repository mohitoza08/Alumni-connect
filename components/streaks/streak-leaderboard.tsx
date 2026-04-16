"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Flame, Trophy, Medal, Award } from "lucide-react"
import { useState, useEffect } from "react"

interface StreakLeaderboardEntry {
  userId: string
  userName: string
  userRole: "student" | "alumni" | "admin"
  streak: number
  rank: number
  profileImage?: string
}

export function StreakLeaderboard({ currentUserId }: { currentUserId?: string }) {
  const [entries, setEntries] = useState<StreakLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    try {
      const token = localStorage.getItem("session_token")
      const res = await fetch("/api/streak/leaderboard", {
        headers: { "x-session-token": token || "" },
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      console.error("Failed to fetch streak leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "alumni":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No streak data available</p>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center space-x-4 p-3 rounded-lg ${
                  entry.userId === currentUserId ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profileImage || "/placeholder.svg"} />
                  <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entry.userName}</span>
                    <Badge variant="secondary" className={`text-xs ${getRoleColor(entry.userRole)}`}>
                      {entry.userRole}
                    </Badge>
                    {entry.userId === currentUserId && (
                      <Badge variant="default" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="font-semibold text-orange-600">{entry.streak} day streak</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
