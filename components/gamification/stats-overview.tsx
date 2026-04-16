import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UserStats } from "@/lib/gamification"
import { TrendingUp, Flame, Trophy, Target } from "lucide-react"

interface StatsOverviewProps {
  stats: UserStats
  title?: string
}

export function StatsOverview({ stats, title = "Your Stats" }: StatsOverviewProps) {
  const nextMilestone = Math.ceil(stats.totalPoints / 1000) * 1000
  const progressToNext = ((stats.totalPoints % 1000) / 1000) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>Track your engagement and achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Points Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.totalPoints.toLocaleString()} / {nextMilestone.toLocaleString()}
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          <p className="text-xs text-muted-foreground">{nextMilestone - stats.totalPoints} points to next milestone</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
            <div className="text-xs text-muted-foreground mt-1">Best: {stats.longestStreak} days</div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.badges.length}</div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Activity Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Posts Created</span>
              <span className="font-medium">{stats.postsCreated}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Comments Posted</span>
              <span className="font-medium">{stats.commentsPosted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Likes Received</span>
              <span className="font-medium">{stats.likesReceived}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Events Attended</span>
              <span className="font-medium">{stats.eventsAttended}</span>
            </div>
            {stats.mentorshipsSessions > 0 && (
              <div className="flex justify-between text-sm">
                <span>Mentorship Sessions</span>
                <span className="font-medium">{stats.mentorshipsSessions}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
