"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SkillFormProps {
  onSuccess: () => void
}

export function SkillForm({ onSuccess }: SkillFormProps) {
  const [name, setName] = useState("")
  const [organization, setOrganization] = useState("")
  const [dateObtained, setDateObtained] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({ name, organization, dateObtained }),
      })

      if (res.ok) {
        setName("")
        setOrganization("")
        setDateObtained("")
        onSuccess()
      }
    } catch (error) {
      console.error("Error adding skill:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Skill Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., JavaScript, Python, Project Management"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Organization (Optional)
        </label>
        <Input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="e.g., Coursera, Udemy, Company Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Date Obtained (Optional)
        </label>
        <Input
          type="date"
          value={dateObtained}
          onChange={(e) => setDateObtained(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Skill"}
      </Button>
    </form>
  )
}
