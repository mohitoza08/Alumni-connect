"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"

export function StreakCheckin() {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "checked" | "already" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  async function handleCheckin() {
    try {
      setLoading(true)
      setMessage(null)
      const res = await fetch("/api/streak/checkin", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-session-token": localStorage.getItem("session_token") || "",
        },
      })
      if (!res.ok) {
        setStatus("error")
        setMessage("Unable to check in. Try again.")
        return
      }
      const data = (await res.json()) as { alreadyCheckedIn: boolean; streak: number }
      if (data.alreadyCheckedIn) {
        setStatus("already")
        setMessage("You’ve already checked in today.")
      } else {
        setStatus("checked")
        setMessage(`Great job! Your streak is now ${data.streak} day(s).`)
      }
      // Refresh the user info shown on dashboard headers
      mutate("/api/users/me")
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <button
        onClick={handleCheckin}
        disabled={loading}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        aria-label="Daily streak check-in"
      >
        {loading ? "Checking in..." : "Daily Check-in"}
      </button>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">Come back every day to maintain and grow your streak.</p>
    </div>
  )
}
