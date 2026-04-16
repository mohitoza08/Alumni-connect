"use client"

import useSWR from "swr"
import Link from "next/link"
import { ResumeEnhancer } from "@/components/portal/resume-enhancer"
import { NotificationsPanel } from "@/components/portal/notifications-panel"
import { PremiumWorkshops } from "@/components/portal/premium-workshops"
import { StreakCheckin } from "@/components/portal/streak-checkin"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export default function StudentDashboard() {
  const { data: me } = useSWR("/api/users/me", fetcher)

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <Link className="text-sm underline" href="/portal/login">
          Switch account
        </Link>
      </header>

      <section className="grid gap-2">
        <h2 className="text-xl font-medium">Welcome{me?.name ? `, ${me.name}` : ""}</h2>
        <p className="text-muted-foreground text-sm">
          College: {me?.college || "—"} • Streak: {me?.streak ?? 0} days
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">AI Resume Enhancer</h3>
          <ResumeEnhancer />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Notifications</h3>
          <NotificationsPanel />
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Daily Check-in</h3>
        <StreakCheckin />
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Workshops & Events</h3>
        <PremiumWorkshops />
      </section>
    </div>
  )
}
