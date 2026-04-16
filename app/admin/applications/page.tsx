"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, User, Building, MapPin, GraduationCap, Briefcase } from "lucide-react"
import { useAuth } from "@/components/layout/auth-checker"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  const res = await fetch(url, {
    headers: { "x-session-token": token || "" },
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export default function ApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth("admin")

  const { data: applicationsData, mutate } = useSWR("/api/applications", fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
  })

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  const applications = applicationsData?.applications || []
  const pendingApplications = applications.filter((app: any) => app.status === "pending")
  const approvedApplications = applications.filter((app: any) => app.status === "approved")
  const rejectedApplications = applications.filter((app: any) => app.status === "rejected")

  const handleApprove = async (applicationId: string) => {
    try {
      const token = localStorage.getItem("session_token") || ""
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: "POST",
        headers: { "x-session-token": token },
      })

      if (response.ok) {
        await mutate() // Refresh the list
        console.log("[v0] Application approved successfully")
      } else {
        const error = await response.json()
        console.error("[v0] Failed to approve application:", error)
        alert("Failed to approve application. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Approve application error:", error)
      alert("Failed to approve application. Please check your connection.")
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const token = localStorage.getItem("session_token") || ""
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "x-session-token": token },
      })

      if (response.ok) {
        await mutate() // Refresh the list
        console.log("[v0] Application rejected successfully")
      } else {
        const error = await response.json()
        console.error("[v0] Failed to reject application:", error)
        alert("Failed to reject application. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Reject application error:", error)
      alert("Failed to reject application. Please check your connection.")
    }
  }

  const ApplicationCard = ({ application }: { application: any }) => {
    const additionalDocs = application.additionalDocuments || {}

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={application.profileImage || "/placeholder.svg"} />
                <AvatarFallback>{application.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{application.name || "Unknown User"}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {application.department} • {application.degree}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {application.status === "approved" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </>
              ) : application.status === "rejected" ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{application.email}</span>
              </div>
              {additionalDocs.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Company:</span>
                  <span>{additionalDocs.company}</span>
                </div>
              )}
              {additionalDocs.jobRole && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Job Role:</span>
                  <span>{additionalDocs.jobRole}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {additionalDocs.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{additionalDocs.location}</span>
                </div>
              )}
              {application.graduationYear && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Graduation Year:</span>
                  <span>{application.graduationYear}</span>
                </div>
              )}
              {additionalDocs.higherStudies && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Higher Studies:</span>
                  <span>{additionalDocs.higherStudies}</span>
                </div>
              )}
            </div>
          </div>

          {additionalDocs.workExperience && (
            <div className="mb-3 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Work Experience:</p>
              <p className="text-sm text-muted-foreground">{additionalDocs.workExperience}</p>
            </div>
          )}

          {additionalDocs.achievements && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Achievements:</p>
              <p className="text-sm text-muted-foreground">{additionalDocs.achievements}</p>
            </div>
          )}

          {application.status === "pending" && (
            <div className="flex space-x-2">
              <Button onClick={() => handleApprove(application.id)} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(application.id)}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} userName={user.name} userBadges={user.badges || []} userPoints={user.points || 0} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Alumni Applications</h1>
            <p className="text-muted-foreground">Review and manage student alumni application requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingApplications.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{approvedApplications.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold">{rejectedApplications.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                  </div>
                  <User className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No pending applications</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApplications.map((application: any) => (
                  <ApplicationCard key={application.id} application={application} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No approved applications</p>
                  </CardContent>
                </Card>
              ) : (
                approvedApplications.map((application: any) => (
                  <ApplicationCard key={application.id} application={application} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No rejected applications</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedApplications.map((application: any) => (
                  <ApplicationCard key={application.id} application={application} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
