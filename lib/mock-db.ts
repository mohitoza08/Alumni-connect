// Simple in-memory "database" for demo purposes.
// Data resets on reload; do not use in production.
type Role = "student" | "alumni" | "admin"

export type User = {
  id: string
  email: string
  name: string
  role: Role
  college: string
  premium: boolean
  streak: number
  lastActiveISO?: string
}

export type Donation = {
  id: string
  alumniId: string
  amount: number
  message?: string
  status: "pending" | "verified"
  createdAt: string
  campaignId?: string
}

export type Notification = {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export type Workshop = {
  id: string
  title: string
  date: string
  premium: boolean
  description?: string
}

export type Campaign = {
  id: string
  title: string
  description?: string
  goalAmount: number
  collectedAmount: number
  active: boolean
  createdAt: string
}

export type DonationRequest = {
  id: string
  campaignId: string
  alumniId: string
  amount: number
  message?: string
  transactionRef: string
  receiptDataUrl?: string
  status: "pending" | "rejected"
  adminNote?: string
  createdAt: string
}

export type EventRegistrationRequest = {
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

type Session = { token: string; userId: string; createdAt: string }

function genId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

class MockDB {
  users = new Map<string, User>()
  sessions = new Map<string, Session>()
  donations: Donation[] = []
  notifications: Notification[] = []
  workshops: Workshop[] = [
    {
      id: "ws_101",
      title: "Resume Workshop",
      date: new Date(Date.now() + 86400000).toISOString(),
      premium: false,
      description: "Improve your resume basics.",
    },
    {
      id: "ws_201",
      title: "Mock Interview Marathon",
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      premium: true,
      description: "Premium mock interviews with alumni.",
    },
    {
      id: "ws_301",
      title: "LinkedIn Mastery",
      date: new Date(Date.now() + 9 * 86400000).toISOString(),
      premium: true,
      description: "Premium profile review and strategy.",
    },
  ]

  campaigns: Campaign[] = [
    {
      id: "cmp_100",
      title: "Scholarship Fund 2025",
      description: "Help fund need-based scholarships for outstanding students.",
      goalAmount: 50000,
      collectedAmount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "cmp_200",
      title: "Women in STEM Initiative",
      description: "Support workshops and mentorship for women in STEM.",
      goalAmount: 30000,
      collectedAmount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ]

  donationRequests: DonationRequest[] = []
  eventRegistrationRequests: EventRegistrationRequest[] = []

  upsertUser(email: string, role: Role, college: string, name?: string): User {
    let user = Array.from(this.users.values()).find((u) => u.email === email)
    if (!user) {
      user = {
        id: genId("usr"),
        email,
        name: name || email.split("@")[0],
        role,
        college,
        premium: false,
        streak: 0,
        lastActiveISO: undefined,
      }
      this.users.set(user.id, user)
    } else {
      // keep role/college aligned with latest login choice
      user.role = role
      user.college = college
      this.users.set(user.id, user)
    }
    this.bumpStreak(user)
    return user
  }

  bumpStreak(user: User) {
    const today = new Date().toDateString()
    if (!user.lastActiveISO) {
      user.streak = 1
      user.lastActiveISO = new Date().toISOString()
    } else {
      const last = new Date(user.lastActiveISO).toDateString()
      if (last === today) {
        // already counted today
      } else {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        user.streak = last === yesterday ? user.streak + 1 : 1
        user.lastActiveISO = new Date().toISOString()
      }
    }
    this.users.set(user.id, user)
  }

  createSession(userId: string): Session {
    const token = genId("sess")
    const session: Session = { token, userId, createdAt: new Date().toISOString() }
    this.sessions.set(token, session)
    return session
  }

  getUserBySession(token?: string): User | null {
    if (!token) return null
    const sess = this.sessions.get(token)
    if (!sess) return null
    const user = this.users.get(sess.userId)
    if (!user) return null
    return user
  }

  addDonation(alumniId: string, amount: number, message?: string, campaignId?: string): Donation {
    const d: Donation = {
      id: genId("don"),
      alumniId,
      amount,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
      campaignId,
    }
    this.donations.unshift(d)
    return d
  }

  verifyDonation(donationId: string): Donation | null {
    const idx = this.donations.findIndex((d) => d.id === donationId)
    if (idx === -1) return null
    this.donations[idx].status = "verified"
    return this.donations[idx]
  }

  notify(userId: string, title: string, body: string) {
    const n: Notification = { id: genId("ntf"), userId, title, body, createdAt: new Date().toISOString(), read: false }
    this.notifications.unshift(n)
    return n
  }

  markNotificationAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find((n) => n.id === notificationId && n.userId === userId)
    if (notification && !notification.read) {
      notification.read = true
      return true
    }
    return false
  }

  markAllNotificationsAsRead(userId: string): number {
    let count = 0
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true
        count++
      }
    })
    return count
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length
  }

  broadcast(title: string, body: string) {
    for (const user of this.users.values()) {
      this.notify(user.id, title, body)
    }
  }

  addDonationRequest(params: {
    campaignId: string
    alumniId: string
    amount: number
    message?: string
    transactionRef: string
    receiptDataUrl?: string
  }): DonationRequest {
    const req: DonationRequest = {
      id: genId("drq"),
      campaignId: params.campaignId,
      alumniId: params.alumniId,
      amount: params.amount,
      message: params.message,
      transactionRef: params.transactionRef,
      receiptDataUrl: params.receiptDataUrl,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    this.donationRequests.unshift(req)
    return req
  }

  verifyDonationRequest(requestId: string, adminNote?: string): Donation | null {
    const idx = this.donationRequests.findIndex((r) => r.id === requestId)
    if (idx === -1) return null
    const req = this.donationRequests[idx]
    // Remove request
    this.donationRequests.splice(idx, 1)

    // Create verified donation
    const donation: Donation = {
      id: genId("don"),
      alumniId: req.alumniId,
      amount: req.amount,
      message: req.message,
      status: "verified",
      createdAt: new Date().toISOString(),
      campaignId: req.campaignId,
    }
    this.donations.unshift(donation)

    // Update campaign collected amount
    const camp = this.campaigns.find((c) => c.id === req.campaignId)
    if (camp) camp.collectedAmount += req.amount

    return donation
  }

  rejectDonationRequest(requestId: string, adminNote?: string): DonationRequest | null {
    const req = this.donationRequests.find((r) => r.id === requestId)
    if (!req) return null
    req.status = "rejected"
    req.adminNote = adminNote
    return req
  }

  getCampaign(id: string): Campaign | null {
    return this.campaigns.find((c) => c.id === id) || null
  }

  createCampaign(userId: string, payload: { title: string; description?: string; goalAmount: number }): Campaign {
    const camp: Campaign = {
      id: genId("cmp"),
      title: payload.title,
      description: payload.description,
      goalAmount: Math.max(0, payload.goalAmount || 0),
      collectedAmount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    }
    this.campaigns.unshift(camp)
    // Optional: notify admins or creator; keeping minimal per spec
    return camp
  }

  addEventRegistrationRequest(params: {
    eventId: string
    userId: string
    userName: string
    userRole: "student" | "alumni" | "admin"
    paymentReference: string
    paymentProof?: string
  }): EventRegistrationRequest {
    const req: EventRegistrationRequest = {
      id: genId("evr"),
      eventId: params.eventId,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      paymentReference: params.paymentReference,
      paymentProof: params.paymentProof,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    this.eventRegistrationRequests.unshift(req)
    return req
  }

  verifyEventRegistration(requestId: string, adminNote?: string): boolean {
    const idx = this.eventRegistrationRequests.findIndex((r) => r.id === requestId)
    if (idx === -1) return false

    const req = this.eventRegistrationRequests[idx]
    // Remove request from pending list
    this.eventRegistrationRequests.splice(idx, 1)

    // Notify user of verification
    this.notify(
      req.userId,
      "Event Registration Confirmed",
      `Your registration for the event has been verified and confirmed. You will receive event details soon.`,
    )

    return true
  }

  rejectEventRegistration(requestId: string, adminNote?: string): EventRegistrationRequest | null {
    const req = this.eventRegistrationRequests.find((r) => r.id === requestId)
    if (!req) return null

    req.status = "rejected"
    req.adminNote = adminNote

    // Notify user of rejection
    this.notify(
      req.userId,
      "Event Registration Rejected",
      `Your registration for the event was not approved. ${adminNote ? `Reason: ${adminNote}` : ""}`,
    )

    return req
  }

  getEventRegistrationRequests(): EventRegistrationRequest[] {
    return this.eventRegistrationRequests.filter((r) => r.status === "pending")
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __MOCK_DB__: MockDB | undefined
}

export const db = globalThis.__MOCK_DB__ ?? (globalThis.__MOCK_DB__ = new MockDB())
