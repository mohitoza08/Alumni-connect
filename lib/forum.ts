export interface Post {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "alumni" | "admin"
  authorAvatar?: string
  title: string
  content: string
  category: string
  tags: string[]
  likes: number
  likedBy: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  isReported: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorRole: "student" | "alumni" | "admin"
  authorAvatar?: string
  content: string
  likes: number
  likedBy: string[]
  createdAt: Date
  parentId?: string // For nested replies
  replies: Comment[]
}

export const mockPosts: Post[] = [
  {
    id: "1",
    authorId: "3",
    authorName: "Jane Smith",
    authorRole: "alumni",
    title: "Tips for Landing Your First Tech Job",
    content:
      "After working in tech for 4 years, here are my top tips for new graduates looking to break into the industry...",
    category: "Career Advice",
    tags: ["career", "tech", "advice"],
    likes: 24,
    likedBy: ["1", "2"],
    comments: [
      {
        id: "c1",
        postId: "1",
        authorId: "2",
        authorName: "John Doe",
        authorRole: "student",
        content: "This is incredibly helpful! Thank you for sharing your experience.",
        likes: 5,
        likedBy: ["3"],
        createdAt: new Date("2024-12-14"),
        replies: [
          {
            id: "c1-r1",
            postId: "1",
            authorId: "3",
            authorName: "Jane Smith",
            authorRole: "alumni",
            content: "You're welcome! Feel free to reach out if you have specific questions.",
            likes: 2,
            likedBy: ["2"],
            createdAt: new Date("2024-12-14"),
            replies: [],
          },
        ],
      },
    ],
    createdAt: new Date("2024-12-13"),
    updatedAt: new Date("2024-12-13"),
    isPinned: true,
    isReported: false,
  },
  {
    id: "2",
    authorId: "2",
    authorName: "John Doe",
    authorRole: "student",
    title: "Looking for Study Group Partners",
    content: "Starting a study group for Data Structures and Algorithms. Anyone interested in joining?",
    category: "Study Groups",
    tags: ["study", "algorithms", "collaboration"],
    likes: 8,
    likedBy: ["3"],
    comments: [],
    createdAt: new Date("2024-12-12"),
    updatedAt: new Date("2024-12-12"),
    isPinned: false,
    isReported: false,
  },
  {
    id: "3",
    authorId: "1",
    authorName: "Admin User",
    authorRole: "admin",
    title: "Welcome to Alumni Connect Community!",
    content:
      "We're excited to launch our new community platform. Share your experiences, ask questions, and connect with fellow alumni and students.",
    category: "Announcements",
    tags: ["welcome", "community", "announcement"],
    likes: 45,
    likedBy: ["2", "3"],
    comments: [
      {
        id: "c2",
        postId: "3",
        authorId: "3",
        authorName: "Jane Smith",
        authorRole: "alumni",
        content: "Great initiative! Looking forward to connecting with everyone.",
        likes: 3,
        likedBy: ["1", "2"],
        createdAt: new Date("2024-12-11"),
        replies: [],
      },
    ],
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-10"),
    isPinned: true,
    isReported: false,
  },
]

export const categories = [
  "All",
  "Career Advice",
  "Study Groups",
  "Announcements",
  "Networking",
  "Job Opportunities",
  "Events",
  "General Discussion",
]

// Forum actions
export const likePost = (postId: string, userId: string): void => {
  const post = mockPosts.find((p) => p.id === postId)
  if (post) {
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id !== userId)
      post.likes -= 1
    } else {
      post.likedBy.push(userId)
      post.likes += 1
    }
  }
}

export const likeComment = (commentId: string, userId: string): void => {
  for (const post of mockPosts) {
    const comment = findCommentById(post.comments, commentId)
    if (comment) {
      if (comment.likedBy.includes(userId)) {
        comment.likedBy = comment.likedBy.filter((id) => id !== userId)
        comment.likes -= 1
      } else {
        comment.likedBy.push(userId)
        comment.likes += 1
      }
      break
    }
  }
}

const findCommentById = (comments: Comment[], commentId: string): Comment | null => {
  for (const comment of comments) {
    if (comment.id === commentId) return comment
    const found = findCommentById(comment.replies, commentId)
    if (found) return found
  }
  return null
}

export const addComment = (postId: string, comment: Omit<Comment, "id" | "createdAt" | "replies">): void => {
  const post = mockPosts.find((p) => p.id === postId)
  if (post) {
    const newComment: Comment = {
      ...comment,
      id: `c${Date.now()}`,
      createdAt: new Date(),
      replies: [],
    }
    post.comments.push(newComment)
  }
}

export const addReply = (commentId: string, reply: Omit<Comment, "id" | "createdAt" | "replies">): void => {
  for (const post of mockPosts) {
    const comment = findCommentById(post.comments, commentId)
    if (comment) {
      const newReply: Comment = {
        ...reply,
        id: `r${Date.now()}`,
        createdAt: new Date(),
        replies: [],
      }
      comment.replies.push(newReply)
      break
    }
  }
}

export const createPost = (
  post: Omit<Post, "id" | "createdAt" | "updatedAt" | "likes" | "likedBy" | "comments" | "isPinned" | "isReported">,
): void => {
  const newPost: Post = {
    ...post,
    id: `p${Date.now()}`,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPinned: false,
    isReported: false,
  }
  mockPosts.unshift(newPost)
}
