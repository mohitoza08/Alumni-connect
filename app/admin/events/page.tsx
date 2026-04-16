"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Users, MapPin, DollarSign, Plus, Search, Eye, Edit, Trash2, MoreVertical } from "lucide-react"
import { EventRegistrationVerification } from "@/components/admin/event-registration-verification"
import { AuthChecker } from "@/components/layout/auth-checker"
import { Sidebar } from "@/components/layout/sidebar"
import useSWR from "swr"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : ""
  return fetch(url, {
    headers: { "x-session-token": token || "" },
  }).then((r) => r.json())
}

interface Event {
  id: number | string
  title: string
  description: string
  type: string
  date: Date | string
  endDate?: Date | string
  location: string
  isVirtual: boolean
  meetingLink?: string
  capacity: number
  registeredCount: number
  organizerId: string | number
  organizerName: string
  organizerRole: string
  tags: string[]
  registrationDeadline: Date | string
  isRegistrationOpen: boolean
  attendees: any[]
  isPremium: boolean
  price?: number
  paymentRequired: boolean
}

export default function AdminEventsPage() {
  const { data: sessionData } = useSWR("/api/session", fetcher)
  const user = sessionData?.user

  const { data: eventsData, mutate: mutateEvents } = useSWR("/api/events", fetcher, {
    refreshInterval: 5000, // Use consistent 5 second refresh interval for real-time updates
  })
  const events: Event[] = eventsData?.events || []

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [location, setLocation] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [isVirtual, setIsVirtual] = useState(false)
  const [virtualLink, setVirtualLink] = useState("")
  const [eventType, setEventType] = useState("networking")

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowViewDialog(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setTitle(event.title)
    setDescription(event.description)
    setStartDate(
      typeof event.date === "string" ? event.date.split("T")[0] + "T" + event.date.split("T")[1].substring(0, 5) : "",
    )
    setLocation(event.location)
    setMaxAttendees(event.capacity.toString())
    setIsVirtual(event.isVirtual)
    setVirtualLink(event.meetingLink || "")
    setEventType(event.type)
    setShowEditDialog(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return

    setLoading(true)
    console.log("[v0] Deleting event:", selectedEvent.id)

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      })

      console.log("[v0] Delete response status:", response.status)

      if (response.ok) {
        await mutateEvents()
        setShowDeleteDialog(false)
        setSelectedEvent(null)
      } else {
        const error = await response.json()
        console.error("[v0] Delete error:", error)
        alert(error.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("[v0] Delete event error:", error)
      alert("Failed to delete event")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    setLoading(true)
    console.log("[v0] Updating event:", selectedEvent.id)

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date: startDate,
          location,
          capacity: Number.parseInt(maxAttendees) || 100,
          isVirtual,
          meetingLink: virtualLink,
          type: eventType,
        }),
      })

      console.log("[v0] Update response status:", response.status)

      if (response.ok) {
        await mutateEvents()
        setShowEditDialog(false)
        setSelectedEvent(null)
        resetForm()
      } else {
        const error = await response.json()
        console.error("[v0] Update error:", error)
        alert(error.error || "Failed to update event")
      }
    } catch (error) {
      console.error("[v0] Update event error:", error)
      alert("Failed to update event")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          start_date: startDate,
          location,
          max_attendees: maxAttendees ? Number.parseInt(maxAttendees) : null,
          is_virtual: isVirtual,
          virtual_link: virtualLink || null,
          event_type: eventType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to create event")
        setCreating(false)
        return
      }

      await mutateEvents() // Refresh events list
      setShowCreateDialog(false)

      setTitle("")
      setDescription("")
      setStartDate("")
      setLocation("")
      setMaxAttendees("")
      setIsVirtual(false)
      setVirtualLink("")
      setEventType("networking")
    } catch (error) {
      console.error("Create event error:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "open" && event.isRegistrationOpen) ||
      (filterStatus === "closed" && !event.isRegistrationOpen) ||
      (filterStatus === "full" && event.registeredCount >= event.capacity)

    return matchesSearch && matchesType && matchesStatus
  })

  const getEventStatusBadge = (event: Event) => {
    if (event.registeredCount >= event.capacity) {
      return <Badge variant="destructive">Full</Badge>
    }
    if (!event.isRegistrationOpen) {
      return <Badge variant="secondary">Closed</Badge>
    }
    return <Badge variant="default">Open</Badge>
  }

  const getEventTypeBadge = (type: string) => {
    const colors = {
      networking: "bg-blue-100 text-blue-800",
      workshop: "bg-green-100 text-green-800",
      seminar: "bg-purple-100 text-purple-800",
      social: "bg-pink-100 text-pink-800",
      "career-fair": "bg-orange-100 text-orange-800",
      fundraising: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type.replace("-", " ")}
      </Badge>
    )
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate("")
    setLocation("")
    setMaxAttendees("")
    setIsVirtual(false)
    setVirtualLink("")
    setEventType("networking")
  }

  if (!user) {
    return (
      <AuthChecker requiredRole="admin">
        <div className="p-6">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AuthChecker>
    )
  }

  return (
    <AuthChecker requiredRole="admin">
      <div className="flex h-screen bg-background">
        <Sidebar
          userRole={user.role}
          userName={`${user.first_name} ${user.last_name}`}
          userBadges={[]}
          userPoints={0}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Event Management</h1>
                <p className="text-muted-foreground">Manage events, registrations, and verifications</p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>Fill in the details to create a new event for your community.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Annual Alumni Meetup"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what the event is about..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="career-fair">Career Fair</SelectItem>
                          <SelectItem value="fundraising">Fundraising</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Main Auditorium or https://zoom.us/..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={maxAttendees}
                        onChange={(e) => setMaxAttendees(e.target.value)}
                        placeholder="100"
                        min="1"
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="isVirtual"
                        checked={isVirtual}
                        onChange={(e) => setIsVirtual(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isVirtual" className="cursor-pointer">
                        Virtual Event
                      </Label>
                    </div>
                  </div>
                  {isVirtual && (
                    <div className="space-y-2">
                      <Label htmlFor="virtualLink">Virtual Meeting Link</Label>
                      <Input
                        id="virtualLink"
                        value={virtualLink}
                        onChange={(e) => setVirtualLink(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                  <DialogDescription>Update the event details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateEvent} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Event Title</Label>
                    <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-startDate">Start Date & Time</Label>
                      <Input
                        id="edit-startDate"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-eventType">Event Type</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="career-fair">Career Fair</SelectItem>
                          <SelectItem value="fundraising">Fundraising</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-maxAttendees">Max Attendees</Label>
                      <Input
                        id="edit-maxAttendees"
                        type="number"
                        value={maxAttendees}
                        onChange={(e) => setMaxAttendees(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="edit-isVirtual"
                        checked={isVirtual}
                        onChange={(e) => setIsVirtual(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-isVirtual" className="cursor-pointer">
                        Virtual Event
                      </Label>
                    </div>
                  </div>
                  {isVirtual && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-virtualLink">Virtual Meeting Link</Label>
                      <Input
                        id="edit-virtualLink"
                        value={virtualLink}
                        onChange={(e) => setVirtualLink(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Update Event"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedEvent?.title}</DialogTitle>
                  <DialogDescription>Event Details</DialogDescription>
                </DialogHeader>
                {selectedEvent && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">Type</h3>
                        {getEventTypeBadge(selectedEvent.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Status</h3>
                        {getEventStatusBadge(selectedEvent)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Date</h3>
                      <p className="text-muted-foreground">{new Date(selectedEvent.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                    {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                      <div>
                        <h3 className="font-semibold mb-1">Virtual Link</h3>
                        <a
                          href={selectedEvent.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selectedEvent.meetingLink}
                        </a>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold mb-1">Capacity</h3>
                      <p className="text-muted-foreground">
                        {selectedEvent.registeredCount} / {selectedEvent.capacity} registered
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Organizer</h3>
                      <p className="text-muted-foreground">
                        {selectedEvent.organizerName} ({selectedEvent.organizerRole})
                      </p>
                    </div>
                    {selectedEvent.isPremium && (
                      <div>
                        <h3 className="font-semibold mb-1">Price</h3>
                        <p className="text-muted-foreground">${selectedEvent.price}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone and will
                    remove all registrations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    disabled={loading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading ? "Deleting..." : "Delete Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registrations</p>
                      <p className="text-2xl font-bold">{events.reduce((sum, e) => sum + e.registeredCount, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Open Events</p>
                      <p className="text-2xl font-bold">{events.filter((e) => e.isRegistrationOpen).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Premium Events</p>
                      <p className="text-2xl font-bold">{events.filter((e) => e.isPremium).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="events" className="space-y-4">
              <TabsList>
                <TabsTrigger value="events">All Events</TabsTrigger>
                <TabsTrigger value="registrations">Registration Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="career-fair">Career Fair</SelectItem>
                          <SelectItem value="fundraising">Fundraising</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              {getEventTypeBadge(event.type)}
                              {event.isPremium && <Badge variant="outline">Premium</Badge>}
                            </div>
                          </div>
                          {getEventStatusBadge(event)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {event.registeredCount} / {event.capacity} registered
                            </span>
                          </div>
                          {event.isPremium && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${event.price}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewEvent(event)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          {/* Event Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEvent(event)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No events found matching your criteria.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="registrations">
                <EventRegistrationVerification />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthChecker>
  )
}
