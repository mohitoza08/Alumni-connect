"use client"

import { useState } from "react"
import { PostCard } from "@/components/forum/post-card"
import { CreatePostDialog } from "@/components/forum/create-post-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import useSWR from "swr"

const categories = ["All", "general", "jobs", "events", "networking", "achievements", "questions", "announcements"]

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json())

interface CommunityClientProps {
  initialPosts: any[]
  userId: number
}

export function CommunityClient({ initialPosts, userId }: CommunityClientProps) {
  const { data, mutate } = useSWR("/api/posts", fetcher, {
    fallbackData: { posts: initialPosts },
    refreshInterval: 8000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  })

  const posts = data?.posts || initialPosts
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")

  const filteredPosts = posts
    .filter((post: any) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          const aDate = new Date(a.created_at || a.createdAt).getTime()
          const bDate = new Date(b.created_at || b.createdAt).getTime()
          return bDate - aDate
        case "oldest":
          const aDateOld = new Date(a.created_at || a.createdAt).getTime()
          const bDateOld = new Date(b.created_at || b.createdAt).getTime()
          return aDateOld - bDateOld
        case "popular":
          return (Number(b.likes_count) || 0) - (Number(a.likes_count) || 0)
        case "discussed":
          return (Number(b.comments_count) || 0) - (Number(a.comments_count) || 0)
        default:
          return 0
      }
    })

  const handlePostUpdate = async () => {
    console.log("[v0] Post updated, revalidating data")
    await mutate()
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
        <p className="text-muted-foreground">Share your expertise and connect with students and fellow alumni</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="discussed">Most Discussed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Post Button */}
      <CreatePostDialog onPostCreated={handlePostUpdate} />

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found matching your criteria.</p>
          </div>
        ) : (
          filteredPosts.map((post: any) => <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />)
        )}
      </div>
    </div>
  )
}
