"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Mail, Phone, GraduationCap, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/auth-db"

interface PendingUsersClientProps {
  pendingUsers: Partial<User>[]
  onUpdate?: () => void
}

export function PendingUsersClient({ pendingUsers: initialUsers, onUpdate }: PendingUsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const handleApprove = async (userId: number) => {
    setLoading(userId)
    try {
      const token = localStorage.getItem("session_token") || ""
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
        headers: { "x-session-token": token },
      })

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast({
          title: "User Approved",
          description: "The user can now log in to the platform.",
        })
        onUpdate?.()
      } else {
        throw new Error("Failed to approve user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (userId: number) => {
    setLoading(userId)
    try {
      const token = localStorage.getItem("session_token") || ""
      const response = await fetch(`/api/users/${userId}/reject`, {
        method: "POST",
        headers: { "x-session-token": token },
      })

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast({
          title: "User Rejected",
          description: "The user registration has been rejected.",
        })
        onUpdate?.()
      } else {
        throw new Error("Failed to reject user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "alumni":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">There are no pending user approvals at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profile_picture || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {user.first_name} {user.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {user.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
              {user.graduation_year && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Class of {user.graduation_year}
                </div>
              )}
              {user.degree && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {user.degree}
                  {user.major && ` - ${user.major}`}
                </div>
              )}
              {user.created_at && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Applied: {new Date(user.created_at).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={() => handleApprove(user.id!)}
                disabled={loading === user.id}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleReject(user.id!)}
                disabled={loading === user.id}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
