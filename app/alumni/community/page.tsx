"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { CommunityClient } from "@/components/community/community-client"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

export default function AlumniCommunityPage() {
  const { user, isLoading } = useAuth("alumni")
  const { data } = useSWR("/api/posts", fetcher, { refreshInterval: 15000 })

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const posts = data?.posts || []
  const userName = user.name || `${user.first_name} ${user.last_name}`

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={userName} userBadges={user.badges || []} userPoints={user.points || 0} />
      <main className="flex-1 overflow-y-auto">
        <CommunityClient initialPosts={posts} userId={Number(user.id)} />
      </main>
    </div>
  )
}
