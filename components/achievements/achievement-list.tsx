"use client"

import { useEffect, useState } from "react"
import { AchievementForm, ACHIEVEMENT_TYPES } from "./achievement-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Trash2, Building2, Calendar, ExternalLink, CheckCircle, Star } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  achievementType: string | null
  date: string | null
  organization: string | null
  verificationUrl: string | null
  isVerified: boolean
  isFeatured: boolean
  createdAt: string
}

const typeColors: Record<string, string> = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  career: "bg-green-100 text-green-800 border-green-200",
  award: "bg-amber-100 text-amber-800 border-amber-200",
  publication: "bg-purple-100 text-purple-800 border-purple-200",
  patent: "bg-indigo-100 text-indigo-800 border-indigo-200",
  leadership: "bg-red-100 text-red-800 border-red-200",
  community_service: "bg-teal-100 text-teal-800 border-teal-200",
  entrepreneurship: "bg-pink-100 text-pink-800 border-pink-200",
}

const typeIcons: Record<string, string> = {
  academic: "🎓",
  career: "💼",
  award: "🏆",
  publication: "📄",
  patent: "💡",
  leadership: "👑",
  community_service: "🤝",
  entrepreneurship: "🚀",
}

interface AchievementListProps {
  readOnly?: boolean
}

export function AchievementList({ readOnly = false }: AchievementListProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAchievements = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch("/api/achievements", {
        headers: { "x-session-token": token || "" },
      })
      const data = await res.json()
      if (data.achievements) {
        setAchievements(data.achievements)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
      const res = await fetch(`/api/achievements?id=${id}`, {
        method: "DELETE",
        headers: { "x-session-token": token || "" },
      })

      if (res.ok) {
        setAchievements(achievements.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error deleting achievement:", error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getTypeLabel = (type: string | null) => {
    if (!type) return null
    return ACHIEVEMENT_TYPES.find((t) => t.value === type)?.label || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Add New Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementForm onSuccess={fetchAchievements} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            My Achievements ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground mb-2">
                No achievements added yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start by adding your first achievement above!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    achievement.isFeatured ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {typeIcons[achievement.achievementType || ""] && (
                          <span className="text-2xl">
                            {typeIcons[achievement.achievementType || ""]}
                          </span>
                        )}
                        <h3 className="font-semibold text-lg">
                          {achievement.title}
                        </h3>
                        {achievement.isFeatured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {achievement.achievementType && (
                          <Badge
                            className={`${typeColors[achievement.achievementType]} border`}
                          >
                            {getTypeLabel(achievement.achievementType)}
                          </Badge>
                        )}
                        {achievement.organization && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {achievement.organization}
                          </Badge>
                        )}
                        {achievement.isVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {achievement.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(achievement.date)}
                          </span>
                        )}
                        {achievement.verificationUrl && (
                          <a
                            href={achievement.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View Certificate
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(achievement.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
