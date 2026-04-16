"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  type: "user_signup" | "post_created" | "event_created" | "comment" | "post_like"
  userId: number
  userName: string
  userAvatar?: string
  description: string
  timestamp: string
}

interface RecentActivityProps {
  title?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function RecentActivity({ title = "Platform Activity", autoRefresh = true, refreshInterval = 30000 }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchActivities = async () => {
    try {
      setError(null)
      const response = await fetch("/api/admin/activity")
      if (!response.ok) throw new Error("Failed to fetch activities")
      const data = await response.json()
      setActivities(data.activities || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()

    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "user_signup":
        return "👤"
      case "post_created":
        return "📝"
      case "event_created":
        return "📅"
      case "comment":
        return "💬"
      case "post_like":
        return "❤️"
      default:
        return "📌"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Loading activities...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Failed to load activities</CardDescription>
            </div>
            <button onClick={fetchActivities} className="p-2 hover:bg-accent rounded-md">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {lastUpdated ? `Last updated ${formatTime(lastUpdated.toISOString())}` : "Real-time updates"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Live
              </span>
            )}
            <button onClick={fetchActivities} className="p-2 hover:bg-accent rounded-md" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="text-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.userName}</p>
                    <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-[10px]">{activity.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
