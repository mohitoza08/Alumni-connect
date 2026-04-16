export type UserRole = "student" | "alumni" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  profileImage?: string
  department?: string
  graduationYear?: number
  company?: string
  jobTitle?: string
  location?: string
  higherStudies?: string
  isApproved: boolean
  status: "active" | "suspended" | "banned" | "pending"
  suspendedUntil?: Date
  banReason?: string
  lastLoginAt?: Date
  createdAt: Date
  badges: string[]
  streak: number
  points: number
}

export interface AlumniApplication {
  id: string
  userId: string
  jobRole: string
  company: string
  location: string
  higherStudies: string
  status: "pending" | "approved" | "rejected"
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

// Mock data for demonstration
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@university.edu",
    name: "Admin User",
    role: "admin",
    isApproved: true,
    status: "active",
    lastLoginAt: new Date(),
    createdAt: new Date("2023-01-01"),
    badges: ["Super Admin"],
    streak: 365,
    points: 10000,
  },
  {
    id: "2",
    email: "john.doe@university.edu",
    name: "John Doe",
    role: "student",
    department: "Computer Science",
    isApproved: true,
    status: "active",
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date("2024-01-01"),
    badges: ["Active Member"],
    streak: 30,
    points: 500,
  },
  {
    id: "3",
    email: "jane.smith@gmail.com",
    name: "Jane Smith",
    role: "alumni",
    department: "Engineering",
    graduationYear: 2020,
    company: "Tech Corp",
    jobTitle: "Senior Developer",
    location: "San Francisco, CA",
    isApproved: true,
    status: "active",
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date("2020-06-01"),
    badges: ["Mentor", "Top Contributor"],
    streak: 120,
    points: 2500,
  },
]

export const mockApplications: AlumniApplication[] = [
  {
    id: "1",
    userId: "2",
    jobRole: "Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    higherStudies: "MS Computer Science",
    status: "pending",
    submittedAt: new Date("2024-12-01"),
  },
]

// Authentication state management
let currentUser: User | null = null

export const getCurrentUser = (): User | null => {
  return currentUser
}

export const login = (email: string, password: string): User | null => {
  const user = mockUsers.find((u) => u.email === email)
  if (user) {
    currentUser = user
    updateLastLogin(user.id)
    return user
  }
  return null
}

export const logout = (): void => {
  currentUser = null
}

export const register = (userData: Partial<User>): User => {
  const newUser: User = {
    id: Date.now().toString(),
    email: userData.email!,
    name: userData.name!,
    role: "student",
    department: userData.department,
    isApproved: true,
    status: "active",
    lastLoginAt: new Date(),
    createdAt: new Date(),
    badges: [],
    streak: 0,
    points: 0,
  }
  mockUsers.push(newUser)
  return newUser
}

export const submitAlumniApplication = (
  application: Omit<AlumniApplication, "id" | "submittedAt" | "status">,
): AlumniApplication => {
  const newApplication: AlumniApplication = {
    ...application,
    id: Date.now().toString(),
    status: "pending",
    submittedAt: new Date(),
  }
  mockApplications.push(newApplication)
  return newApplication
}

export const approveAlumniApplication = (applicationId: string, adminId: string): void => {
  const application = mockApplications.find((app) => app.id === applicationId)
  const user = mockUsers.find((u) => u.id === application?.userId)

  if (application && user) {
    application.status = "approved"
    application.reviewedAt = new Date()
    application.reviewedBy = adminId

    // Convert user to alumni
    user.role = "alumni"
    user.company = application.company
    user.jobTitle = application.jobRole
    user.location = application.location
    user.higherStudies = application.higherStudies
    user.badges.push("Alumni")
  }
}

// Additional functionality for user management
export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    Object.assign(user, updates)
    return user
  }
  return null
}

export const rejectAlumniApplication = (applicationId: string, adminId: string): void => {
  const application = mockApplications.find((app) => app.id === applicationId)
  if (application) {
    application.status = "rejected"
    application.reviewedAt = new Date()
    application.reviewedBy = adminId
  }
}

export const banUser = (userId: string, reason: string, adminId: string): User | null => {
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    user.status = "banned"
    user.banReason = reason
    user.isApproved = false
    return user
  }
  return null
}

export const suspendUser = (userId: string, until: Date, reason: string, adminId: string): User | null => {
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    user.status = "suspended"
    user.suspendedUntil = until
    user.banReason = reason
    user.isApproved = false
    return user
  }
  return null
}

export const activateUser = (userId: string, adminId: string): User | null => {
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    user.status = "active"
    user.isApproved = true
    user.suspendedUntil = undefined
    user.banReason = undefined
    return user
  }
  return null
}

export const deleteUser = (userId: string, adminId: string): boolean => {
  const index = mockUsers.findIndex((u) => u.id === userId)
  if (index !== -1) {
    mockUsers.splice(index, 1)
    return true
  }
  return false
}

export const updateLastLogin = (userId: string): void => {
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    user.lastLoginAt = new Date()
  }
}
