"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AchievementFormProps {
  onSuccess: () => void
}

const ACHIEVEMENT_TYPES = [
  { value: "academic", label: "Academic", color: "text-blue-600" },
  { value: "career", label: "Career", color: "text-green-600" },
  { value: "award", label: "Award", color: "text-amber-600" },
  { value: "publication", label: "Publication", color: "text-purple-600" },
  { value: "patent", label: "Patent", color: "text-indigo-600" },
  { value: "leadership", label: "Leadership", color: "text-red-600" },
  { value: "community_service", label: "Community Service", color: "text-teal-600" },
  { value: "entrepreneurship", label: "Entrepreneurship", color: "text-pink-600" },
]

export function AchievementForm({ onSuccess }: AchievementFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [achievementType, setAchievementType] = useState("")
  const [organization, setOrganization] = useState("")
  const [date, setDate] = useState("")
  const [verificationUrl, setVerificationUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !achievementType) return

    setLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({
          title,
          description,
          achievementType,
          organization,
          date,
          verificationUrl,
        }),
      })

      if (res.ok) {
        setTitle("")
        setDescription("")
        setAchievementType("")
        setOrganization("")
        setDate("")
        setVerificationUrl("")
        onSuccess()
      }
    } catch (error) {
      console.error("Error adding achievement:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Best Developer Award"
          required
        />
      </div>

      <div>
        <Label htmlFor="achievementType">Achievement Type *</Label>
        <Select value={achievementType} onValueChange={setAchievementType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select achievement type" />
          </SelectTrigger>
          <SelectContent>
            {ACHIEVEMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your achievement in detail..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="organization">Organization (Optional)</Label>
        <Input
          id="organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="e.g., Google, IEEE, ACM"
        />
      </div>

      <div>
        <Label htmlFor="date">Date Achieved (Optional)</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="verificationUrl">Verification URL (Optional)</Label>
        <Input
          id="verificationUrl"
          type="url"
          value={verificationUrl}
          onChange={(e) => setVerificationUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Achievement"}
      </Button>
    </form>
  )
}

export { ACHIEVEMENT_TYPES }
