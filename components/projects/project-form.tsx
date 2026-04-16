"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ProjectFormProps {
  onSuccess: () => void
}

export function ProjectForm({ onSuccess }: ProjectFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [technologies, setTechnologies] = useState("")
  const [link, setLink] = useState("")
  const [dateCompleted, setDateCompleted] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description) return

    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({
          name,
          description,
          technologies,
          link,
          dateCompleted,
        }),
      })

      if (res.ok) {
        setName("")
        setDescription("")
        setTechnologies("")
        setLink("")
        setDateCompleted("")
        onSuccess()
      }
    } catch (error) {
      console.error("Error adding project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what the project does"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Technologies Used (Optional)
        </label>
        <Input
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="e.g., React, Node.js, Python"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Project Link (Optional)
        </label>
        <Input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://github.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Date Completed (Optional)
        </label>
        <Input
          type="date"
          value={dateCompleted}
          onChange={(e) => setDateCompleted(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Project"}
      </Button>
    </form>
  )
}
