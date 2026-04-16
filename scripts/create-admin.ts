import { query } from "../lib/db"
import bcrypt from "bcrypt"

async function createAdmin() {
  try {
    console.log("👤 Creating admin user...\n")

    // Configuration - CHANGE THESE VALUES
    const config = {
      email: "admin@saffrony.ac.in",
      password: "Saffrony@19",
      firstName: "Admin",
      lastName: "Saffrony",
      collegeId: 1,
    }

    // Validate inputs
    if (!config.email || !config.password) {
      console.error("❌ Email and password are required!")
      process.exit(1)
    }

    // Check if admin already exists
    console.log("🔍 Checking if user exists...")
    const existing = await query("SELECT id, email, role FROM users WHERE email = $1", [config.email])

    if (existing.length > 0) {
      console.log("\n⚠️  User with this email already exists!\n")
      console.log("📋 Existing User:")
      console.log("   Email:", existing[0].email)
      console.log("   Role:", existing[0].role)
      console.log("   User ID:", existing[0].id)
      console.log("\nUse a different email or update the existing user.")
      process.exit(1)
      return
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const passwordHash = await bcrypt.hash(config.password, 10)

    // Verify college exists
    console.log("🏫 Verifying college...")
    const college = await query("SELECT id, name FROM colleges WHERE id = $1", [config.collegeId])

    if (college.length === 0) {
      console.error("\n❌ College not found!")
      console.log("Run: npm run tsx scripts/setup-college.ts first")
      process.exit(1)
    }

    // Create admin user
    console.log("✏️  Creating admin user...")
    const result = await query(
      `INSERT INTO users (
        college_id,
        role,
        email,
        password_hash,
        first_name,
        last_name,
        status,
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role, first_name, last_name, college_id`,
      [config.collegeId, "admin", config.email, passwordHash, config.firstName, config.lastName, "active", true],
    )

    console.log("\n✅ Admin user created successfully!\n")
    console.log("═══════════════════════════════════════")
    console.log("📧 LOGIN CREDENTIALS")
    console.log("═══════════════════════════════════════")
    console.log("  Email:", result[0].email)
    console.log("  Password:", config.password)
    console.log("  Role:", result[0].role)
    console.log("  User ID:", result[0].id)
    console.log("  College:", college[0].name)
    console.log("═══════════════════════════════════════\n")
    console.log("⚠️  IMPORTANT: Change the password after first login!\n")
    console.log("You can now log in to the application with these credentials.")

    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error creating admin:", error)
    console.log("\n📖 Troubleshooting:")
    console.log("  1. Run college setup first: npm run tsx scripts/setup-college.ts")
    console.log("  2. Check DATABASE_URL in .env.local")
    console.log("  3. Verify database connection: npm run db:test")
    process.exit(1)
  }
}

createAdmin()
