"use client"

import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function PremiumWorkshops() {
  const { data: me } = useSWR("/api/users/me", fetcher)
  const { data } = useSWR("/api/workshops", fetcher)

  const premium = !!me?.premium
  const workshops = data?.items || []

  async function upgrade() {
    // External payment link followed by confirm
    window.open("https://example.com/pay?product=premium", "_blank", "noopener,noreferrer")
    const ok = confirm("After completing the payment, click OK to activate premium.")
    if (ok) {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-session-token": localStorage.getItem("session_token") || "" },
        body: JSON.stringify({ premium: true }),
      })
      location.reload()
    }
  }

  return (
    <div className="grid gap-3">
      {!premium && (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-sm">Unlock premium workshops and events.</p>
          <button onClick={upgrade} className="rounded-md bg-primary px-3 py-2 text-primary-foreground">
            Upgrade to Premium
          </button>
        </div>
      )}
      <ul className="grid gap-3">
        {workshops.map((w: any) => (
          <li key={w.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{w.title}</h4>
              <time className="text-xs text-muted-foreground">{new Date(w.date).toLocaleDateString()}</time>
            </div>
            <p className="text-sm text-muted-foreground">{w.description || ""}</p>
            {w.premium && !premium && <p className="mt-2 text-xs text-amber-600">Premium required</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
