"use client"

import { useState } from "react"

// Mock AI enhancer now calls API: /api/ai/enhance-resume
export function ResumeEnhancer() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [suggested, setSuggested] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnhance() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/ai/enhance-resume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to enhance")
      }
      const data = await res.json()
      setOutput(data.improved || "")
      setSkills(Array.isArray(data.skills) ? data.skills : [])
      setSuggested(Array.isArray(data.suggested) ? data.suggested : [])
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Original</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-40 rounded-md border bg-background p-2"
            placeholder="Paste resume bullet points or responsibilities here..."
            aria-label="Original resume text"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Enhanced</label>
          <pre className="min-h-40 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
            {loading ? "Enhancing..." : output || "Enhanced output will appear here."}
          </pre>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-destructive bg-destructive/10 p-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleEnhance}
          className="rounded-md bg-primary px-3 py-2 text-primary-foreground"
          disabled={loading || !input.trim()}
        >
          {loading ? "Enhancing..." : "Enhance"}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(output || "")}
          className="rounded-md border px-3 py-2"
          disabled={!output || loading}
        >
          Copy
        </button>
      </div>

      {!!(skills.length || suggested.length) && (
        <div className="grid gap-2">
          <div className="text-sm font-medium">Skills detected</div>
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 && <span className="text-sm text-muted-foreground">None detected.</span>}
            {skills.map((s) => (
              <span key={s} className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">
                {s}
              </span>
            ))}
          </div>
          <div className="text-sm font-medium">Suggested to add</div>
          <div className="flex flex-wrap gap-2">
            {suggested.length === 0 && <span className="text-sm text-muted-foreground">No suggestions.</span>}
            {suggested.map((s) => (
              <span key={s} className="rounded-md bg-muted px-2 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
