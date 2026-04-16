import { query } from "../lib/db"

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...\n")

    // Test 1: Basic connection
    const result = await query<{ current_database: string; current_user: string; version: string }>(
      "SELECT current_database(), current_user, version()",
    )

    console.log("✅ Database connected successfully!\n")
    console.log("📊 Connection Details:")
    console.log("  Database:", result[0].current_database)
    console.log("  User:", result[0].current_user)
    console.log("  Version:", result[0].version.split(" ")[0], result[0].version.split(" ")[1])
    console.log("")

    // Test 2: Check tables exist
    const tables = await query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    )

    console.log("📋 Tables found:", tables.length)
    if (tables.length > 0) {
      console.log("  Tables:", tables.map((t) => t.tablename).join(", "))
    } else {
      console.log("⚠️  No tables found. Run the database-schema.sql file first!")
    }
    console.log("")

    // Test 3: Count records
    if (tables.length > 0) {
      const colleges = await query<{ count: string }>("SELECT COUNT(*) as count FROM colleges")
      const users = await query<{ count: string }>("SELECT COUNT(*) as count FROM users")

      console.log("📈 Record Counts:")
      console.log("  Colleges:", colleges[0].count)
      console.log("  Users:", users[0].count)
      console.log("")
    }

    console.log("✅ All tests passed!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Database connection failed!\n")
    console.error("Error details:", error)
    console.log("\n📖 Troubleshooting:")
    console.log("  1. Check DATABASE_URL in .env.local")
    console.log("  2. Ensure PostgreSQL is running: pg_ctl status")
    console.log("  3. Verify database exists: psql -U postgres -l")
    console.log("  4. Test connection manually: psql -U postgres -d alumni_connect")
    process.exit(1)
  }
}

testConnection()
