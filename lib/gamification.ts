export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "engagement" | "mentorship" | "community" | "events" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: {
    type: "posts" | "comments" | "likes" | "events" | "mentorships" | "streak" | "special"
    count: number
    description: string
  }
  points: number
  unlockedBy: string[]
}

export interface Achievement {
  id: string
  userId: string
  badgeId: string
  unlockedAt: Date
  progress?: number
  maxProgress?: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userRole: "student" | "alumni" | "admin"
  points: number
  badges: number
  streak: number
  rank: number
  profileImage?: string
}

export interface UserStats {
  userId: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  postsCreated: number
  commentsPosted: number
  likesReceived: number
  eventsAttended: number
  mentorshipsSessions: number
  lastActivity: Date
  badges: string[]
}

export const mockBadges: Badge[] = [
  {
    id: "welcome",
    name: "Welcome Aboard",
    description: "Complete your profile setup",
    icon: "🎉",
    category: "special",
    rarity: "common",
    requirements: {
      type: "special",
      count: 1,
      description: "Complete profile setup",
    },
    points: 50,
    unlockedBy: ["1", "2", "3"],
  },
  {
    id: "first-post",
    name: "First Post",
    description: "Create your first community post",
    icon: "✍️",
    category: "community",
    rarity: "common",
    requirements: {
      type: "posts",
      count: 1,
      description: "Create 1 post",
    },
    points: 100,
    unlockedBy: ["2", "3"],
  },
  {
    id: "active-contributor",
    name: "Active Contributor",
    description: "Create 10 community posts",
    icon: "📝",
    category: "community",
    rarity: "rare",
    requirements: {
      type: "posts",
      count: 10,
      description: "Create 10 posts",
    },
    points: 500,
    unlockedBy: ["3"],
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Complete your first mentorship session",
    icon: "🎓",
    category: "mentorship",
    rarity: "rare",
    requirements: {
      type: "mentorships",
      count: 1,
      description: "Complete 1 mentorship session",
    },
    points: 300,
    unlockedBy: ["3"],
  },
  {
    id: "super-mentor",
    name: "Super Mentor",
    description: "Complete 10 mentorship sessions",
    icon: "🏆",
    category: "mentorship",
    rarity: "epic",
    requirements: {
      type: "mentorships",
      count: 10,
      description: "Complete 10 mentorship sessions",
    },
    points: 1000,
    unlockedBy: ["3"],
  },
  {
    id: "event-enthusiast",
    name: "Event Enthusiast",
    description: "Attend 5 events",
    icon: "🎪",
    category: "events",
    rarity: "rare",
    requirements: {
      type: "events",
      count: 5,
      description: "Attend 5 events",
    },
    points: 400,
    unlockedBy: ["2", "3"],
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintain a 30-day activity streak",
    icon: "🔥",
    category: "engagement",
    rarity: "epic",
    requirements: {
      type: "streak",
      count: 30,
      description: "30-day activity streak",
    },
    points: 800,
    unlockedBy: ["3"],
  },
  {
    id: "community-favorite",
    name: "Community Favorite",
    description: "Receive 100 likes on your posts",
    icon: "❤️",
    category: "community",
    rarity: "epic",
    requirements: {
      type: "likes",
      count: 100,
      description: "Receive 100 likes",
    },
    points: 600,
    unlockedBy: ["3"],
  },
  {
    id: "legend",
    name: "Alumni Legend",
    description: "Reach 5000 total points",
    icon: "👑",
    category: "special",
    rarity: "legendary",
    requirements: {
      type: "special",
      count: 5000,
      description: "Reach 5000 points",
    },
    points: 1000,
    unlockedBy: ["3"],
  },
]

export const mockUserStats: UserStats[] = [
  {
    userId: "1",
    totalPoints: 10000,
    currentStreak: 365,
    longestStreak: 365,
    postsCreated: 50,
    commentsPosted: 200,
    likesReceived: 500,
    eventsAttended: 25,
    mentorshipsSessions: 0,
    lastActivity: new Date(),
    badges: ["welcome", "legend"],
  },
  {
    userId: "2",
    totalPoints: 500,
    currentStreak: 30,
    longestStreak: 45,
    postsCreated: 2,
    commentsPosted: 15,
    likesReceived: 25,
    eventsAttended: 3,
    mentorshipsSessions: 0,
    lastActivity: new Date(),
    badges: ["welcome", "first-post", "event-enthusiast"],
  },
  {
    userId: "3",
    totalPoints: 2500,
    currentStreak: 120,
    longestStreak: 150,
    postsCreated: 15,
    commentsPosted: 80,
    likesReceived: 150,
    eventsAttended: 8,
    mentorshipsSessions: 25,
    lastActivity: new Date(),
    badges: [
      "welcome",
      "first-post",
      "active-contributor",
      "mentor",
      "super-mentor",
      "event-enthusiast",
      "streak-master",
      "community-favorite",
    ],
  },
]

export const getLeaderboard = (): LeaderboardEntry[] => {
  const leaderboard = mockUserStats
    .map((stats, index) => ({
      userId: stats.userId,
      userName: stats.userId === "1" ? "Admin User" : stats.userId === "2" ? "John Doe" : "Jane Smith",
      userRole: (stats.userId === "1" ? "admin" : stats.userId === "2" ? "student" : "alumni") as
        | "student"
        | "alumni"
        | "admin",
      points: stats.totalPoints,
      badges: stats.badges.length,
      streak: stats.currentStreak,
      rank: index + 1,
    }))
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  return leaderboard
}

export const getUserStats = (userId: string): UserStats | null => {
  return mockUserStats.find((stats) => stats.userId === userId) || null
}

export const getUserBadges = (userId: string): Badge[] => {
  const userStats = getUserStats(userId)
  if (!userStats) return []

  return mockBadges.filter((badge) => userStats.badges.includes(badge.id))
}

export const getAvailableBadges = (userId: string): Badge[] => {
  const userStats = getUserStats(userId)
  if (!userStats) return []

  return mockBadges.filter((badge) => !userStats.badges.includes(badge.id))
}

export const checkBadgeProgress = (
  userId: string,
  badgeId: string,
): { current: number; required: number; percentage: number } => {
  const badge = mockBadges.find((b) => b.id === badgeId)
  const userStats = getUserStats(userId)

  if (!badge || !userStats) {
    return { current: 0, required: 1, percentage: 0 }
  }

  let current = 0
  switch (badge.requirements.type) {
    case "posts":
      current = userStats.postsCreated
      break
    case "comments":
      current = userStats.commentsPosted
      break
    case "likes":
      current = userStats.likesReceived
      break
    case "events":
      current = userStats.eventsAttended
      break
    case "mentorships":
      current = userStats.mentorshipsSessions
      break
    case "streak":
      current = userStats.currentStreak
      break
    case "special":
      current = badgeId === "legend" ? userStats.totalPoints : 1
      break
  }

  const required = badge.requirements.count
  const percentage = Math.min((current / required) * 100, 100)

  return { current, required, percentage }
}

export const awardPoints = (userId: string, points: number, reason: string): void => {
  const userStats = getUserStats(userId)
  if (userStats) {
    userStats.totalPoints += points
    userStats.lastActivity = new Date()
  }
}

export const updateStreak = (userId: string): void => {
  const userStats = getUserStats(userId)
  if (userStats) {
    const today = new Date()
    const lastActivity = userStats.lastActivity
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      // Consecutive day
      userStats.currentStreak += 1
      userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak)
    } else if (daysDiff > 1) {
      // Streak broken
      userStats.currentStreak = 1
    }
    // Same day, no change needed

    userStats.lastActivity = today
  }
}
