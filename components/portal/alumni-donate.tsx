"use client"

import useSWR from "swr"
import { useState } from "react"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function AlumniDonate() {
  const { data: me } = useSWR("/api/users/me", fetcher)
  const { data, mutate } = useSWR("/api/fundraising/donations", fetcher)
  const [amount, setAmount] = useState<number>(50)
  const [message, setMessage] = useState("")

  async function create() {
    // External payment then record intent
    window.open(`https://example.com/donate?amount=${amount}`, "_blank", "noopener,noreferrer")
    const ok = confirm(
      "After completing the payment externally, click OK to submit your donation for admin verification.",
    )
    if (!ok) return

    await fetch("/api/fundraising/donations", {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-token": localStorage.getItem("session_token") || "" },
      body: JSON.stringify({ amount, message }),
    })
    await mutate()
  }

  const list = data?.items || []
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm">Amount (USD)</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="rounded-md border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Message (optional)</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Why you're donating"
            />
          </label>
        </div>
        <div className="flex items-end">
          <button onClick={create} className="h-10 rounded-md bg-primary px-4 text-primary-foreground">
            Donate
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        After payment, Admin will verify your donation. Status will be reflected below.
      </p>

      <ul className="grid gap-3">
        {list.length === 0 && <li className="text-sm text-muted-foreground">No donations yet.</li>}
        {list.map((d: any) => (
          <li key={d.id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>
                ${d.amount} • {d.message || "—"}
              </span>
              <span
                className={
                  d.status === "verified"
                    ? "rounded bg-green-600 px-2 py-1 text-white"
                    : "rounded bg-yellow-600 px-2 py-1 text-white"
                }
              >
                {d.status}
              </span>
            </div>
            <time className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</time>
          </li>
        ))}
      </ul>
    </div>
  )
}
