import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { LeaderboardEntry } from "@/lib/gamification"
import { Trophy, Medal, Award, Flame } from "lucide-react"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  title?: string
  showTop?: number
}

export function Leaderboard({ entries, currentUserId, title = "Leaderboard", showTop = 10 }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "alumni":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const topEntries = entries.slice(0, showTop)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>Top contributors in the alumni community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topEntries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center space-x-4 p-3 rounded-lg ${
                entry.userId === currentUserId ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.profileImage || "/placeholder.svg"} />
                <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{entry.userName}</span>
                  <Badge variant="secondary" className={`text-xs ${getRoleColor(entry.userRole)}`}>
                    {entry.userRole}
                  </Badge>
                  {entry.userId === currentUserId && (
                    <Badge variant="default" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span className="font-semibold text-primary">{entry.points.toLocaleString()} pts</span>
                  <span>{entry.badges} badges</span>
                  <div className="flex items-center space-x-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{entry.streak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentUserId && !topEntries.some((entry) => entry.userId === currentUserId) && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Your position:</p>
            {(() => {
              const userEntry = entries.find((entry) => entry.userId === currentUserId)
              if (!userEntry) return null

              return (
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-center w-8">
                    <span className="text-sm font-bold text-muted-foreground">#{userEntry.rank}</span>
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userEntry.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>{userEntry.userName.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{userEntry.userName}</span>
                      <Badge variant="secondary" className={`text-xs ${getRoleColor(userEntry.userRole)}`}>
                        {userEntry.userRole}
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        You
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="font-semibold text-primary">{userEntry.points.toLocaleString()} pts</span>
                      <span>{userEntry.badges} badges</span>
                      <div className="flex items-center space-x-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{userEntry.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
