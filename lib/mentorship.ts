export interface MentorshipRequest {
  id: string
  studentId: string
  studentName: string
  mentorId: string
  mentorName: string
  status: "pending" | "accepted" | "declined" | "completed"
  subject: string
  description: string
  preferredMeetingType: "virtual" | "in-person" | "both"
  createdAt: Date
  acceptedAt?: Date
  completedAt?: Date
  sessions: MentorshipSession[]
}

export interface MentorshipSession {
  id: string
  requestId: string
  scheduledAt: Date
  duration: number // in minutes
  meetingType: "virtual" | "in-person"
  meetingLink?: string
  location?: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  feedback?: {
    studentRating: number
    mentorRating: number
    studentFeedback: string
    mentorFeedback: string
  }
}

export interface Mentor {
  id: string
  name: string
  email: string
  company: string
  jobTitle: string
  department: string
  graduationYear: number
  expertise: string[]
  bio: string
  availability: string
  profileImage?: string
  rating: number
  totalSessions: number
  isAvailable: boolean
}

export const mockMentors: Mentor[] = [
  {
    id: "3",
    name: "Jane Smith",
    email: "jane.smith@gmail.com",
    company: "Tech Corp",
    jobTitle: "Senior Developer",
    department: "Computer Science",
    graduationYear: 2020,
    expertise: ["Software Development", "Career Guidance", "Technical Interviews"],
    bio: "Passionate about helping students transition into tech careers. 4+ years experience in full-stack development.",
    availability: "Weekends and evenings",
    rating: 4.8,
    totalSessions: 25,
    isAvailable: true,
  },
  {
    id: "4",
    name: "Mike Johnson",
    email: "mike.j@company.com",
    company: "StartupXYZ",
    jobTitle: "Product Manager",
    department: "Business",
    graduationYear: 2018,
    expertise: ["Product Management", "Entrepreneurship", "Business Strategy"],
    bio: "Former startup founder turned PM. Love sharing insights about product development and business strategy.",
    availability: "Flexible schedule",
    rating: 4.9,
    totalSessions: 18,
    isAvailable: true,
  },
]

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: "1",
    studentId: "2",
    studentName: "John Doe",
    mentorId: "3",
    mentorName: "Jane Smith",
    status: "pending",
    subject: "Career Transition to Tech",
    description: "Looking for guidance on transitioning from academia to industry software development.",
    preferredMeetingType: "virtual",
    createdAt: new Date("2024-12-10"),
    sessions: [],
  },
]

export const requestMentorship = (request: Omit<MentorshipRequest, "id" | "createdAt" | "sessions">): void => {
  const newRequest: MentorshipRequest = {
    ...request,
    id: `req${Date.now()}`,
    createdAt: new Date(),
    sessions: [],
  }
  mockMentorshipRequests.push(newRequest)
}

export const acceptMentorshipRequest = (requestId: string): void => {
  const request = mockMentorshipRequests.find((r) => r.id === requestId)
  if (request) {
    request.status = "accepted"
    request.acceptedAt = new Date()
  }
}

export const declineMentorshipRequest = (requestId: string): void => {
  const request = mockMentorshipRequests.find((r) => r.id === requestId)
  if (request) {
    request.status = "declined"
  }
}
