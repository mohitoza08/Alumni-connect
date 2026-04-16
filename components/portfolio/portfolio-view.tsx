"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AchievementList } from "@/components/achievements/achievement-list"
import { SkillList } from "@/components/skills/skill-list"
import { ProjectList } from "@/components/projects/project-list"
import { Award, BookOpen, FolderOpen } from "lucide-react"

export function PortfolioView() {
  return (
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
        <AchievementList readOnly />
      </TabsContent>

      <TabsContent value="skills">
        <SkillList readOnly />
      </TabsContent>

      <TabsContent value="projects">
        <ProjectList readOnly />
      </TabsContent>
    </Tabs>
  )
}
