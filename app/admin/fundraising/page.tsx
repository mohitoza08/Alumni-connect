"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { AuthChecker } from "@/components/layout/auth-checker"
import { AdminCampaignVerify } from "@/components/portal/admin-campaign-verify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, DollarSign } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

export default function AdminFundraisingPage() {
  const { data: sessionData } = useSWR("/api/session", fetcher)
  const user = sessionData?.user

  const { data: statsData } = useSWR("/api/admin/fundraising-stats", fetcher, {
    refreshInterval: 10000,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [endDate, setEndDate] = useState("")
  const [creating, setCreating] = useState(false)
  const { mutate } = useSWR("/api/campaigns", fetcher, {
    refreshInterval: 10000,
  })

  const stats = statsData || { activeCampaigns: 0, totalRaised: 0, pendingRequests: 0 }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    console.log("[v0] Submitting campaign:", { title, description, goalAmount, endDate })

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          goal_amount: Number.parseFloat(goalAmount),
          end_date: endDate,
        }),
      })

      const data = await response.json()
      console.log("[v0] Campaign creation response:", data)

      if (response.ok) {
        await mutate()
        setShowCreateDialog(false)
        setTitle("")
        setDescription("")
        setGoalAmount("")
        setEndDate("")
        alert("Campaign created successfully!")
      } else {
        console.error("[v0] Campaign creation failed:", data)
        alert(data.error || "Failed to create campaign")
      }
    } catch (error) {
      console.error("[v0] Create campaign error:", error)
      alert("Failed to create campaign. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <AuthChecker requiredRole="admin">
      <div className="flex h-screen bg-background">
        <Sidebar
          userRole={user?.role || "admin"}
          userName={user ? `${user.first_name} ${user.last_name}` : "Admin"}
          userBadges={[]}
          userPoints={0}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Fundraising</h1>
                <p className="text-muted-foreground mt-1">Manage campaigns and verify donation requests</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Create Fundraising Campaign
                    </DialogTitle>
                    <DialogDescription>
                      Set up a new campaign to collect donations from alumni.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Annual Scholarship Fund"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Help support students in need..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="goalAmount">Goal Amount ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="goalAmount"
                            type="number"
                            step="0.01"
                            value={goalAmount}
                            onChange={(e) => setGoalAmount(e.target.value)}
                            placeholder="50000"
                            className="pl-8"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
                        {creating ? "Creating..." : "Create Campaign"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold">${Number(stats.totalRaised || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <Plus className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="rounded-lg border bg-card">
              <AdminCampaignVerify />
            </div>
          </div>
        </main>
      </div>
    </AuthChecker>
  )
}
