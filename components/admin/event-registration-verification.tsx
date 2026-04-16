"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, User, DollarSign, Check, X } from "lucide-react"

interface RegistrationRequest {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventPrice: number
  userId: string
  userName: string
  userRole: string
  paymentReference: string
  paymentProof?: string
  createdAt: string
}

export function EventRegistrationVerification() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("session_token")
      const response = await fetch("/api/events/registrations", {
        headers: { "x-session-token": token || "" },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Failed to fetch registration requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const token = localStorage.getItem("session_token")
      const response = await fetch(`/api/events/registrations/${requestId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({
          adminNote: adminNotes[requestId] || "",
        }),
      })

      if (response.ok) {
        // Remove from list
        setRequests(requests.filter((r) => r.id !== requestId))
        setAdminNotes({ ...adminNotes, [requestId]: "" })
      }
    } catch (error) {
      console.error("Failed to verify registration:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const token = localStorage.getItem("session_token")
      const response = await fetch(`/api/events/registrations/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token || "",
        },
        body: JSON.stringify({
          adminNote: adminNotes[requestId] || "Registration rejected",
        }),
      })

      if (response.ok) {
        // Remove from list
        setRequests(requests.filter((r) => r.id !== requestId))
        setAdminNotes({ ...adminNotes, [requestId]: "" })
      }
    } catch (error) {
      console.error("Failed to reject registration:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Registration Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Registration Verification
          {requests.length > 0 && <Badge variant="destructive">{requests.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending event registrations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{request.eventTitle}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {request.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.eventDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />${request.eventPrice}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {request.userRole}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Reference</Label>
                    <p className="text-sm bg-muted p-2 rounded mt-1">{request.paymentReference}</p>
                  </div>
                  {request.paymentProof && (
                    <div>
                      <Label className="text-sm font-medium">Payment Proof</Label>
                      <p className="text-sm bg-muted p-2 rounded mt-1">{request.paymentProof}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor={`note-${request.id}`} className="text-sm font-medium">
                    Admin Note (Optional)
                  </Label>
                  <Textarea
                    id={`note-${request.id}`}
                    value={adminNotes[request.id] || ""}
                    onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                    placeholder="Add a note about this registration..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => handleVerify(request.id)}
                    disabled={processingId === request.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {processingId === request.id ? "Verifying..." : "Verify & Approve"}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {processingId === request.id ? "Rejecting..." : "Reject"}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
