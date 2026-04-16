"use client"

import { useState } from "react"

export function AdminBroadcast() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  async function send() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-token": localStorage.getItem("session_token") || "" },
      body: JSON.stringify({ title, body, scope: "all" }),
    })
    setTitle("")
    setBody("")
    alert("Sent!")
  }

  return (
    <div className="grid gap-2">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border bg-background px-3 py-2"
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-24 rounded-md border bg-background p-2"
      />
      <button onClick={send} className="rounded-md bg-primary px-3 py-2 text-primary-foreground">
        Broadcast to All
      </button>
    </div>
  )
}
