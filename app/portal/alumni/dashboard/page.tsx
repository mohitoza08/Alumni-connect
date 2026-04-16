"use client"

import useSWR from "swr"
import Link from "next/link"
import { NotificationsPanel } from "@/components/portal/notifications-panel"
import { AlumniDonate } from "@/components/portal/alumni-donate"
import { StreakCheckin } from "@/components/portal/streak-checkin"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export default function AlumniDashboard() {
  const { data: me } = useSWR("/api/users/me", fetcher)

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Alumni Dashboard</h1>
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

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Fundraising</h3>
        <AlumniDonate />
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Daily Check-in</h3>
        <StreakCheckin />
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Achievements & Badges</h3>
        <p className="text-sm text-muted-foreground">Track your badges and leaderboard position.</p>
        <Link
          href="/portal/alumni/achievements"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          View Achievements
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">Notifications</h3>
        <NotificationsPanel />
      </section>
    </div>
  )
}
