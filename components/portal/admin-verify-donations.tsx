"use client"

import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function AdminVerifyDonations() {
  const { data, mutate } = useSWR("/api/fundraising/donations", fetcher)

  async function verify(id: string) {
    await fetch(`/api/fundraising/donations/${id}/verify`, {
      method: "POST",
      headers: { "x-session-token": localStorage.getItem("session_token") || "" },
    })
    await mutate()
  }

  const items = data?.items || []
  return (
    <ul className="grid gap-3">
      {items.length === 0 && <li className="text-sm text-muted-foreground">No donations yet.</li>}
      {items.map((d: any) => (
        <li key={d.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div>
                ${d.amount} • {d.message || "—"}
              </div>
              <div className="text-xs text-muted-foreground">By Alumni: {d.alumniId}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">{d.status}</span>
              {d.status !== "verified" && (
                <button
                  onClick={() => verify(d.id)}
                  className="rounded-md bg-primary px-3 py-1 text-primary-foreground"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
