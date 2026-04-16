"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/components/layout/auth-checker"
import { AchievementList } from "@/components/achievements/achievement-list"
import { SkillList } from "@/components/skills/skill-list"
import { ProjectList } from "@/components/projects/project-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, FolderOpen } from "lucide-react"

export default function StudentProfileDetailsPage() {
  const { user, isLoading } = useAuth("student")

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        userRole={user.role}
        userName={user.name}
        userBadges={user.badges || []}
        userPoints={user.points || 0}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile Details</h1>
            <p className="text-muted-foreground">
              Manage your achievements, skills, and projects
            </p>
          </div>

          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements">
              <AchievementList />
            </TabsContent>

            <TabsContent value="skills">
              <SkillList />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
