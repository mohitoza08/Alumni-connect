"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Role = "student" | "alumni" | "admin"

const COLLEGES = [
  "Saffrony University",
]

export default function PortalLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [college, setCollege] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password || !college || !role) {
      setError("Please fill all fields.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, role, college }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Login failed")
      }
      const { token } = await res.json()
      localStorage.setItem("session_token", token)
      router.push(`/portal/${role}/dashboard`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold text-balance">College Login</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border bg-background px-3 py-2"
            placeholder="you@college.edu"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border bg-background px-3 py-2"
            placeholder="Enter your password"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm">College</span>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="rounded-md border bg-background px-3 py-2"
            required
          >
            <option value="" disabled>
              Select your college
            </option>
            {COLLEGES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Donors: please complete payment externally. After payment, your donation will be marked verified by Admin.
      </p>
    </div>
  )
}
