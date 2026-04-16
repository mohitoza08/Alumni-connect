import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

async function debugUser(email: string) {
  console.log("\n=== User Debug Script ===")
  console.log("Checking user:", email)

  // Check if user exists
  const users = await query(
    "SELECT id, email, role, status, password_hash, college_id, first_name, last_name FROM users WHERE email = $1",
    [email],
  )

  if (users.length === 0) {
    console.log("❌ User not found in database")
    return
  }

  const user = users[0]
  console.log("\n✅ User found:")
  console.log("  ID:", user.id)
  console.log("  Email:", user.email)
  console.log("  Role:", user.role)
  console.log("  Status:", user.status)
  console.log("  College ID:", user.college_id)
  console.log("  Name:", user.first_name, user.last_name)
  console.log("  Password Hash (first 20 chars):", user.password_hash.substring(0, 20) + "...")

  // Test password
  if (process.argv[3]) {
    const testPassword = process.argv[3]
    console.log("\n🔑 Testing password...")
    const isValid = await bcrypt.compare(testPassword, user.password_hash)
    console.log("  Password valid:", isValid ? "✅ YES" : "❌ NO")
  }

  // Check sessions
  const sessions = await query("SELECT token, expires_at FROM user_sessions WHERE user_id = $1", [user.id])
  console.log("\n📝 Active sessions:", sessions.length)
  sessions.forEach((s: any, i: number) => {
    console.log(`  Session ${i + 1}:`, s.token.substring(0, 20) + "...", "Expires:", s.expires_at)
  })

  // Check college
  const colleges = await query("SELECT id, name FROM colleges WHERE id = $1", [user.college_id])
  if (colleges.length > 0) {
    console.log("\n🏫 College:", colleges[0].name, "(ID:", colleges[0].id, ")")
  }

  console.log("\n=== End Debug ===\n")
}

const email = process.argv[2]
if (!email) {
  console.log("Usage: npm run debug-user <email> [password]")
  process.exit(1)
}

debugUser(email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
