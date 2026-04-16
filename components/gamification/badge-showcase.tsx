import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Badge as BadgeType } from "@/lib/gamification"
import { checkBadgeProgress } from "@/lib/gamification"

interface BadgeShowcaseProps {
  badges: BadgeType[]
  userId: string
  showProgress?: boolean
  title?: string
}

export function BadgeShowcase({ badges, userId, showProgress = false, title = "Badges" }: BadgeShowcaseProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "engagement":
        return "bg-green-100 text-green-800"
      case "mentorship":
        return "bg-blue-100 text-blue-800"
      case "community":
        return "bg-orange-100 text-orange-800"
      case "events":
        return "bg-purple-100 text-purple-800"
      case "special":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {showProgress ? "Track your progress towards earning new badges" : "Your earned achievements"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {showProgress ? "All badges earned!" : "No badges earned yet"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const progress = showProgress ? checkBadgeProgress(userId, badge.id) : null

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 ${getRarityColor(badge.rarity)} ${
                    showProgress ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{badge.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(badge.category)}`}>
                          {badge.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {badge.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  {progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {progress.current} / {progress.required}
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
