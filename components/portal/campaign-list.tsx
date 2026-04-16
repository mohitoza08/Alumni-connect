"use client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CampaignList({ onSelect }: { onSelect?: (id: string) => void }) {
  const { data, error } = useSWR("/api/campaigns", fetcher, {
    refreshInterval: 5000,
  })

  if (error) {
    console.log("[v0] Campaign list error:", error)
    return <div className="text-sm text-muted-foreground">Failed to load campaigns</div>
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Loading campaigns...</div>
  }

  const items = Array.isArray(data) ? data : data?.items || []
  console.log("[v0] Campaign list data:", items.length, "campaigns")

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((c: any) => {
        const collected = Number(c.collectedAmount || c.currentAmount || c.current_amount || 0)
        const goal = Number(c.goalAmount || c.goal_amount || 0)
        const progress = goal ? Math.min(100, Math.round((collected / goal) * 100)) : 0

        console.log("[v0] Campaign:", c.id, "Collected:", collected, "Goal:", goal, "Progress:", progress)

        return (
          <button
            key={c.id}
            onClick={() => onSelect?.(c.id)}
            className="rounded-lg border bg-card p-4 text-left hover:bg-accent hover:text-accent-foreground"
            aria-label={`Open campaign ${c.title}`}
          >
            <div className="mb-1 text-sm text-muted-foreground">
              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
            </div>
            <h3 className="text-balance text-lg font-semibold">{c.title}</h3>
            {c.description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-3 text-sm">
              <div className="flex items-center justify-between">
                <span>${collected.toLocaleString()} raised</span>
                <span>Goal ${goal.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-muted">
                <div className="h-2 rounded bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </button>
        )
      })}
      {items.length === 0 && <div className="text-sm text-muted-foreground">No campaigns yet.</div>}
    </div>
  )
}
