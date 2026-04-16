"use client"

import useSWR from "swr"
import Link from "next/link"
import { AdminVerifyDonations } from "@/components/portal/admin-verify-donations"
import { AdminBroadcast } from "@/components/portal/admin-broadcast"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export default function AdminDashboard() {
  const { data: me } = useSWR("/api/users/me", fetcher)

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Link className="text-sm underline" href="/portal/login">
          Switch account
        </Link>
      </header>

      <section className="grid gap-2">
        <h2 className="text-xl font-medium">Welcome{me?.name ? `, ${me.name}` : ""}</h2>
        <p className="text-muted-foreground text-sm">College: {me?.college || "—"}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Verify Donations</h3>
          <AdminVerifyDonations />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-medium">Broadcast Notification</h3>
          <AdminBroadcast />
        </div>
      </section>
    </div>
  )
}
