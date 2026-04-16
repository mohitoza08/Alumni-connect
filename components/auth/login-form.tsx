"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [college, setCollege] = useState<string>("")
  const [role, setRole] = useState<"student" | "alumni" | "admin" | "">("")
  const router = useRouter()

  useEffect(() => {
    try {
      const savedCollege = localStorage.getItem("alumni-connect:college") || ""
      const savedRole = (localStorage.getItem("alumni-connect:role") || "") as "student" | "alumni" | "admin" | ""
      if (savedCollege) setCollege(savedCollege)
      if (savedRole) setRole(savedRole)
    } catch {
      // ignore
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      localStorage.setItem("alumni-connect:college", college)
      localStorage.setItem("alumni-connect:role", role)
    } catch {
      // ignore persistence errors
    }

    const user = login(email, password)
    if (user) {
      const chosen = role || (user.role as "student" | "alumni" | "admin")
      switch (chosen) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "alumni":
          router.push("/alumni/dashboard")
          break
        case "student":
          router.push("/student/dashboard")
          break
      }
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Alumni Connect</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <select
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              aria-describedby="college-help"
            >
              <option value="" disabled>
                Select your college
              </option>
              <option value="northbridge-university">Northbridge University</option>
              <option value="eastwood-institute">Eastwood Institute</option>
              <option value="westmont-college">Westmont College</option>
            </select>
            <p id="college-help" className="text-xs text-muted-foreground">
              College-wise login helps keep your data scoped to your institution.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "alumni" | "admin" | "")}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo accounts:</p>
          <p>Admin: admin@university.edu</p>
          <p>Student: john.doe@university.edu</p>
          <p>Alumni: jane.smith@gmail.com</p>
          <p>Password: any</p>
        </div>
      </CardContent>
    </Card>
  )
}
