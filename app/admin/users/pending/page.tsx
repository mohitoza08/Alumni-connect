"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { PendingUsersClient } from "@/components/admin/pending-users-client"
import { UserCheck, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import type { User } from "@/lib/auth-db"

interface PendingUser extends Partial<User> {
  id: number
}

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  const res = await fetch(url, {
    headers: { "x-session-token": token || "" },
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export default function PendingUsersPage() {
  const { data: sessionData } = useSWR("/api/session", fetcher)
  const user = sessionData?.user
  
  const { data: pendingData, mutate: mutatePending } = useSWR("/api/users/pending", fetcher, {
    refreshInterval: 5000,
  })
  
  const pendingUsers: PendingUser[] = pendingData?.users || []
  const [manualRefresh, setManualRefresh] = useState(false)

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim()

  const handleRefresh = () => {
    setManualRefresh(true)
    mutatePending()
    setTimeout(() => setManualRefresh(false), 500)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={userName} userBadges={[]} userPoints={0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pending User Approvals</h1>
              <p className="text-muted-foreground">Review and approve new user registrations</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={manualRefresh}>
              <RefreshCw className={`h-4 w-4 mr-2 ${manualRefresh ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold">{pendingUsers.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alumni Requests</p>
                    <p className="text-2xl font-bold">{pendingUsers.filter((u) => u.role === "alumni").length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student Requests</p>
                    <p className="text-2xl font-bold">{pendingUsers.filter((u) => u.role === "student").length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <PendingUsersClient pendingUsers={pendingUsers} onUpdate={handleRefresh} />
        </div>
      </main>
    </div>
  )
}
