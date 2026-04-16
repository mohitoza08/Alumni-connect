export interface Event {
  id: string
  title: string
  description: string
  type: "networking" | "workshop" | "seminar" | "social" | "career-fair" | "fundraising"
  date: Date
  endDate?: Date
  location: string
  isVirtual: boolean
  meetingLink?: string
  capacity: number
  registeredCount: number
  organizerId: string
  organizerName: string
  organizerRole: "admin" | "alumni" | "student"
  imageUrl?: string
  tags: string[]
  registrationDeadline: Date
  isRegistrationOpen: boolean
  attendees: EventAttendee[]
  createdAt: Date
  isPremium: boolean
  price?: number
  paymentRequired: boolean
}

export interface EventAttendee {
  id: string
  eventId: string
  userId: string
  userName: string
  userRole: "student" | "alumni" | "admin"
  registeredAt: Date
  attended?: boolean
  feedback?: {
    rating: number
    comment: string
  }
  paymentStatus: "pending" | "verified" | "rejected"
  paymentProof?: string
  paymentReference?: string
  verifiedBy?: string
  verifiedAt?: Date
  adminNote?: string
}

export interface EventRegistrationRequest {
  id: string
  eventId: string
  userId: string
  userName: string
  userRole: "student" | "alumni" | "admin"
  paymentReference: string
  paymentProof?: string
  status: "pending" | "rejected"
  adminNote?: string
  createdAt: string
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Career Fair 2024",
    description:
      "Connect with top employers and explore career opportunities. Over 50 companies will be present with job openings.",
    type: "career-fair",
    date: new Date("2024-12-20"),
    endDate: new Date("2024-12-20"),
    location: "University Main Hall",
    isVirtual: false,
    capacity: 500,
    registeredCount: 234,
    organizerId: "1",
    organizerName: "Admin User",
    organizerRole: "admin",
    tags: ["career", "jobs", "networking"],
    registrationDeadline: new Date("2024-12-18"),
    isRegistrationOpen: true,
    attendees: [],
    createdAt: new Date("2024-11-15"),
    isPremium: false,
    paymentRequired: false,
  },
  {
    id: "2",
    title: "Alumni Networking Night",
    description: "Casual networking event for alumni and current students. Food and drinks provided.",
    type: "networking",
    date: new Date("2024-12-25"),
    location: "Downtown Conference Center",
    isVirtual: false,
    capacity: 100,
    registeredCount: 67,
    organizerId: "3",
    organizerName: "Jane Smith",
    organizerRole: "alumni",
    tags: ["networking", "social", "alumni"],
    registrationDeadline: new Date("2024-12-23"),
    isRegistrationOpen: true,
    attendees: [],
    createdAt: new Date("2024-11-20"),
    isPremium: false,
    paymentRequired: false,
  },
  {
    id: "3",
    title: "Tech Talk: AI in Industry",
    description: "Learn about the latest AI trends and applications in various industries from industry experts.",
    type: "seminar",
    date: new Date("2024-12-30"),
    location: "Virtual Event",
    isVirtual: true,
    meetingLink: "https://zoom.us/j/example",
    capacity: 200,
    registeredCount: 89,
    organizerId: "3",
    organizerName: "Jane Smith",
    organizerRole: "alumni",
    tags: ["tech", "AI", "seminar"],
    registrationDeadline: new Date("2024-12-28"),
    isRegistrationOpen: true,
    attendees: [],
    createdAt: new Date("2024-11-25"),
    isPremium: false,
    paymentRequired: false,
  },
  {
    id: "4",
    title: "Premium Mock Interview Bootcamp",
    description:
      "Intensive 1-on-1 mock interview sessions with industry professionals. Limited to 20 participants for personalized attention.",
    type: "workshop",
    date: new Date("2025-01-15"),
    location: "Business Center Conference Room",
    isVirtual: false,
    capacity: 20,
    registeredCount: 0,
    organizerId: "3",
    organizerName: "Jane Smith",
    organizerRole: "alumni",
    tags: ["interview", "career", "premium", "workshop"],
    registrationDeadline: new Date("2025-01-10"),
    isRegistrationOpen: true,
    attendees: [],
    createdAt: new Date("2024-12-01"),
    isPremium: true,
    price: 50,
    paymentRequired: true,
  },
]

export const registerForEvent = (eventId: string, userId: string, userName: string, userRole: string): void => {
  const event = mockEvents.find((e) => e.id === eventId)
  if (event && event.registeredCount < event.capacity && event.isRegistrationOpen) {
    const attendee: EventAttendee = {
      id: `att${Date.now()}`,
      eventId,
      userId,
      userName,
      userRole: userRole as "student" | "alumni" | "admin",
      registeredAt: new Date(),
      paymentStatus: event.paymentRequired ? "pending" : "verified",
    }
    event.attendees.push(attendee)
    if (!event.paymentRequired) {
      event.registeredCount += 1
    }
  }
}

export const unregisterFromEvent = (eventId: string, userId: string): void => {
  const event = mockEvents.find((e) => e.id === eventId)
  if (event) {
    const attendee = event.attendees.find((a) => a.userId === userId)
    event.attendees = event.attendees.filter((a) => a.userId !== userId)
    if (attendee && attendee.paymentStatus === "verified") {
      event.registeredCount = Math.max(0, event.registeredCount - 1)
    }
  }
}

export const createEvent = (eventData: Omit<Event, "id" | "registeredCount" | "attendees" | "createdAt">): void => {
  const newEvent: Event = {
    ...eventData,
    id: `evt${Date.now()}`,
    registeredCount: 0,
    attendees: [],
    createdAt: new Date(),
  }
  mockEvents.push(newEvent)
}
