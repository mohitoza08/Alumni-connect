import { cookies, headers } from "next/headers"
import { getUserBySession } from "./auth-db"
import type { User } from "./auth-db"

export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    let sessionToken: string | undefined = cookieStore.get("session")?.value

    if (!sessionToken) {
      const headersList = await headers()
      const headerToken = headersList.get("x-session-token")
      if (headerToken) sessionToken = headerToken
    }

    if (!sessionToken) {
      return null
    }

    return getUserBySession(sessionToken)
  } catch (error) {
    console.log("[v0] Session error:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getServerSession()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  return user
}
