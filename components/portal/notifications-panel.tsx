"use client"

import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function NotificationsPanel() {
  const { data, isLoading } = useSWR("/api/notifications", fetcher, { refreshInterval: 8000 })

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading notifications…</p>

  const items = data?.items || []

  return (
    <ul className="grid gap-3">
      {items.length === 0 && <li className="text-sm text-muted-foreground">No notifications yet.</li>}
      {items.map((n: any) => (
        <li key={n.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{n.title}</h4>
            <time className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</time>
          </div>
          <p className="text-sm">{n.body}</p>
        </li>
      ))}
    </ul>
  )
}
