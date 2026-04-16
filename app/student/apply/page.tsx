"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, FileText, Building, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

export default function ApplyPage() {
  const { user, isLoading } = useAuth("student")
  const { mutate } = useSWR("/api/session", fetcher)
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    jobRole: "",
    company: "",
    location: "",
    higherStudies: "",
    workExperience: "",
    achievements: "",
  })

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    console.log("[v0] Submitting alumni application:", formData)

    try {
      const response = await fetch("/api/users/apply-alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      })

      const data = await response.json()
      console.log("[v0] Application response:", data)

      if (response.ok) {
        await mutate()
        setIsSubmitted(true)
      } else {
        console.error("[v0] Application submission failed:", data)
        alert(data.error || "Failed to submit application. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Application submission error:", error)
      alert("Failed to submit application. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
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
            <div className="max-w-2xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Application Submitted Successfully!</h1>
                  <p className="text-muted-foreground mb-6">
                    Your alumni application has been submitted for review. You'll receive notification once it's
                    processed.
                  </p>
                  <Button onClick={() => router.push("/student/dashboard")}>Return to Dashboard</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={user.name} userBadges={user.badges || []} userPoints={user.points || 0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Apply for Alumni Status</h1>
              <p className="text-muted-foreground">Share your professional journey and join our alumni network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                  <CardDescription>Tell us about your current professional status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobRole">Current Job Role *</Label>
                      <Input
                        id="jobRole"
                        value={formData.jobRole}
                        onChange={(e) => handleInputChange("jobRole", e.target.value)}
                        placeholder="e.g., Software Engineer, Marketing Manager"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="e.g., Google, Microsoft, Startup Inc."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Work Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., San Francisco, CA or Remote"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workExperience">Work Experience</Label>
                    <Textarea
                      id="workExperience"
                      value={formData.workExperience}
                      onChange={(e) => handleInputChange("workExperience", e.target.value)}
                      placeholder="Briefly describe your work experience and key responsibilities..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Higher Education
                  </CardTitle>
                  <CardDescription>Share details about your higher studies (if applicable)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="higherStudies">Higher Studies</Label>
                    <Select onValueChange={(value) => handleInputChange("higherStudies", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your highest qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="other">Other Professional Certification</SelectItem>
                        <SelectItem value="none">No Higher Studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Achievements & Contributions
                  </CardTitle>
                  <CardDescription>
                    Highlight your notable achievements and how you plan to contribute to the alumni network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="achievements">Notable Achievements</Label>
                    <Textarea
                      id="achievements"
                      value={formData.achievements}
                      onChange={(e) => handleInputChange("achievements", e.target.value)}
                      placeholder="Share your professional achievements, awards, publications, or significant projects..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="px-8" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
