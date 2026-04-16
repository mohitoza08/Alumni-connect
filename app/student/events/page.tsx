"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { EventsClient } from "@/components/events/events-client"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

export default function StudentEventsPage() {
  const { user, isLoading } = useAuth("student")
  const { data } = useSWR("/api/events", fetcher, { refreshInterval: 5000 })

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const events = data?.events || []
  const userName = `${user.first_name} ${user.last_name}`

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={userName} userBadges={user.badges || []} userPoints={user.points || 0} />
      <main className="flex-1 overflow-y-auto">
        <EventsClient initialEvents={events} userId={user.id} userRole={user.role} />
      </main>
    </div>
  )
}
