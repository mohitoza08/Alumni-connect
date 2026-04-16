"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, Linkedin, Briefcase, GraduationCap, Building, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AlumniProfilePage() {
  const { toast } = useToast()
  const { data: session } = useSWR("/api/session", fetcher)
  const { data: profile, isLoading } = useSWR(session?.user?.id ? `/api/users/${session.user.id}` : null, fetcher, {
    refreshInterval: 30000,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    graduationYear: "",
    degree: "",
    major: "",
    currentCompany: "",
    currentPosition: "",
    linkedinUrl: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || profile.first_name || "",
        lastName: profile.lastName || profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        graduationYear: profile.graduationYear || profile.graduation_year || "",
        degree: profile.degree || "",
        major: profile.major || "",
        currentCompany: profile.currentCompany || profile.current_company || "",
        currentPosition: profile.currentPosition || profile.current_position || "",
        linkedinUrl: profile.linkedinUrl || profile.linkedin_url || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          graduation_year: formData.graduationYear ? Number.parseInt(formData.graduationYear) : null,
          degree: formData.degree,
          major: formData.major,
          current_company: formData.currentCompany,
          current_position: formData.currentPosition,
          linkedin_url: formData.linkedinUrl,
        }),
      })

      if (response.ok) {
        await mutate(`/api/users/${session.user.id}`)
        setIsEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEnhanceBio = async () => {
    if (!formData.bio || formData.bio.trim().length === 0) {
      toast({
        title: "Bio required",
        description: "Please write a bio first before enhancing it.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    try {
      console.log("[v0] Requesting bio enhancement...")

      const response = await fetch("/api/ai/enhance-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: formData.bio,
          degree: formData.degree,
          major: formData.major,
          graduationYear: formData.graduationYear,
          currentCompany: formData.currentCompany,
          currentPosition: formData.currentPosition,
          isAlumni: true,
        }),
      })

      const data = await response.json()
      console.log("[v0] Enhancement response:", data)

      if (response.ok && data.enhancedBio) {
        setFormData((prev) => ({ ...prev, bio: data.enhancedBio }))
        toast({
          title: "Bio enhanced",
          description: data.message || "Your bio has been enhanced with AI suggestions.",
        })
      } else {
        throw new Error(data.error || data.message || "Failed to enhance bio")
      }
    } catch (error) {
      console.error("[v0] Enhancement error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to enhance bio. Make sure GROQ_API_KEY is configured in environment variables.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your professional information and resume</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.profilePicture || profile?.profile_picture} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {formData.firstName} {formData.lastName}
                </CardTitle>
                <CardDescription>
                  {formData.currentPosition && formData.currentCompany ? (
                    <p className="mt-1">
                      {formData.currentPosition} at {formData.currentCompany}
                    </p>
                  ) : null}
                  <Badge variant="secondary" className="mt-1">
                    Alumni
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" value={formData.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentCompany"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Google"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPosition">Current Position</Label>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPosition"
                  value={formData.currentPosition}
                  onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Senior Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                disabled={!isEditing}
                placeholder="2020"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Professional Bio / Resume Summary</Label>
              {isEditing && (
                <Button size="sm" variant="outline" onClick={handleEnhanceBio} disabled={isEnhancing || !formData.bio}>
                  {isEnhancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enhance with AI
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Write a professional summary highlighting your experience, achievements, and expertise..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use AI enhancement to improve your bio with professional language and structure
            </p>
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  if (profile) {
                    setFormData({
                      firstName: profile.firstName || profile.first_name || "",
                      lastName: profile.lastName || profile.last_name || "",
                      email: profile.email || "",
                      phone: profile.phone || "",
                      bio: profile.bio || "",
                      graduationYear: profile.graduationYear || profile.graduation_year || "",
                      degree: profile.degree || "",
                      major: profile.major || "",
                      currentCompany: profile.currentCompany || profile.current_company || "",
                      currentPosition: profile.currentPosition || profile.current_position || "",
                      linkedinUrl: profile.linkedinUrl || profile.linkedin_url || "",
                    })
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
