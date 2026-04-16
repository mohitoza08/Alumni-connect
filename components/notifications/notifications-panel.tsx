"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck, Clock } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

interface NotificationsPanelProps {
  onMarkAllRead?: () => void
  onNotificationRead?: () => void
}

export function NotificationsPanel({ onMarkAllRead, onNotificationRead }: NotificationsPanelProps) {
  const { data, isLoading, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 8000,
  })

  const notifications = data?.items || []
  const unreadNotifications = notifications.filter((n: any) => !n.read)

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          "x-session-token": localStorage.getItem("session_token") || "",
        },
      })

      if (response.ok) {
        // Refresh notifications list
        mutate()
        // Notify parent component
        onNotificationRead?.()
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await onMarkAllRead?.()
      // Refresh notifications list
      mutate()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes("achievement") || title.toLowerCase().includes("badge")) {
      return "🏆"
    }
    if (title.toLowerCase().includes("streak") || title.toLowerCase().includes("check-in")) {
      return "🔥"
    }
    if (title.toLowerCase().includes("donation") || title.toLowerCase().includes("campaign")) {
      return "💰"
    }
    if (title.toLowerCase().includes("event") || title.toLowerCase().includes("workshop")) {
      return "📅"
    }
    if (title.toLowerCase().includes("mentor") || title.toLowerCase().includes("mentorship")) {
      return "🎓"
    }
    return "📢"
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
          {unreadNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-7 px-2">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">You'll see updates about your activities here</p>
            </div>
          ) : (
            <div className="space-y-1 p-3">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`
                    flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer
                    ${
                      notification.read
                        ? "bg-background hover:bg-muted/50"
                        : "bg-primary/5 border border-primary/10 hover:bg-primary/10"
                    }
                  `}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {getNotificationIcon(notification.title)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4
                        className={`text-sm font-medium truncate ${
                          notification.read ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p
                      className={`text-xs mt-1 line-clamp-2 ${
                        notification.read ? "text-muted-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {notification.body}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                      {notification.read && (
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
