"use client"

import { useEffect, useState } from "react"
import { SkillForm } from "./skill-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Award } from "lucide-react"

interface Skill {
  id: string
  name: string
  organization: string | null
  dateObtained: string | null
  createdAt: string
}

interface SkillListProps {
  readOnly?: boolean
}

export function SkillList({ readOnly = false }: SkillListProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSkills = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch("/api/skills", {
        headers: { "x-session-token": token || "" },
      })
      const data = await res.json()
      if (data.skills) {
        setSkills(data.skills)
      }
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch(`/api/skills?id=${id}`, {
        method: "DELETE",
        headers: { "x-session-token": token || "" },
      })

      if (res.ok) {
        setSkills(skills.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  if (loading) {
    return <div>Loading skills...</div>
  }

  return (
    <div className="space-y-6">
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Add Skill or Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillForm onSuccess={fetchSkills} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Skills & Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No skills added yet. Start by adding your first skill!
            </p>
          ) : (
            <div className="space-y-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="text-sm">
                        {skill.name}
                      </Badge>
                    </div>
                    {skill.organization && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {skill.organization}
                      </p>
                    )}
                    {skill.dateObtained && (
                      <p className="text-xs text-muted-foreground">
                        Obtained: {formatDate(skill.dateObtained)}
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(skill.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
