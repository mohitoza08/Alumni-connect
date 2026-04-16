"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationsPanel } from "./notifications-panel"
import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: countData, mutate: mutateCount } = useSWR("/api/notifications/unread-count", fetcher, {
    refreshInterval: 10000, // Check every 10 seconds
  })

  const unreadCount = countData?.unreadCount || 0

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "x-session-token": localStorage.getItem("session_token") || "",
        },
      })

      if (response.ok) {
        // Refresh unread count
        mutateCount()
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationsPanel onMarkAllRead={handleMarkAllRead} onNotificationRead={() => mutateCount()} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
