import type React from "react"

// Simple portal layout wrapper with container
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </main>
  )
}
