"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { CommunityClient } from "@/components/community/community-client"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StudentCommunityPage() {
  const { user, isLoading } = useAuth("student")
  const { data } = useSWR("/api/posts", fetcher, { refreshInterval: 15000 })

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const posts = data?.posts || []

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={user.name} userBadges={user.badges || []} userPoints={user.points || 0} />
      <main className="flex-1 overflow-y-auto">
        <CommunityClient initialPosts={posts} userId={Number(user.id)} />
      </main>
    </div>
  )
}
