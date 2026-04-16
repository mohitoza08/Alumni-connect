"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { GraduationCap, Mail, Lock, User, Building2, Calendar } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [college, setCollege] = useState<string>("")
  const [role, setRole] = useState<"student" | "alumni" | "admin" | "">("")
  const [graduationYear, setGraduationYear] = useState("")
  const [degree, setDegree] = useState("")
  const [major, setMajor] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        if (!college || !role) {
          setError("Please fill all fields.")
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            college,
            role,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Invalid credentials")
          setLoading(false)
          return
        }

        // Redirect based on role
        const userRole = data.user.role
        switch (userRole) {
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
        router.refresh()
      } else {
        // Register
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            college,
            role: role || "student",
            phone,
            graduation_year: graduationYear ? Number.parseInt(graduationYear) : undefined,
            degree,
            major,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Registration failed")
          setLoading(false)
          return
        }

        if (data.needsApproval) {
          alert(data.message || "Registration successful! Please wait for admin approval before logging in.")
          setIsLogin(true)
          setLoading(false)
          return
        }

        // Auto login after registration for admins
        const userRole = data.user.role
        switch (userRole) {
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
        router.refresh()
      }
    } catch (err) {
      console.error("[v0] Auth error:", err)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Alumni Connect
          </CardTitle>
          <CardDescription className="text-base">
            Connect with alumni, find mentors, and grow your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-college" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    College
                  </Label>
                  <select
                    id="login-college"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      Select your college
                    </option>
                    <option value="1">Saffrony</option>
                    <option value="2">Itr</option>
                    <option value="3">SK</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-role" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Role
                  </Label>
                  <select
                    id="login-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    required
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstname">First Name</Label>
                    <Input
                      id="register-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastname">Last Name</Label>
                    <Input
                      id="register-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 characters)"
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone (Optional)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-college" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    College
                  </Label>
                  <select
                    id="register-college"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      Select your college
                    </option>
                    <option value="1">Saffrony</option>
                    <option value="2">Itr</option>
                    <option value="3">SK</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Role
                  </Label>
                  <select
                    id="register-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    required
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                {(role === "student" || role === "alumni") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="register-year" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Graduation Year
                      </Label>
                      <Input
                        id="register-year"
                        type="number"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="2024"
                        min="1950"
                        max="2030"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-degree">Degree</Label>
                      <Input
                        id="register-degree"
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="B.S. Computer Science"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-major">Major</Label>
                      <Input
                        id="register-major"
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Computer Science"
                        className="h-11"
                      />
                    </div>
                  </>
                )}
                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
