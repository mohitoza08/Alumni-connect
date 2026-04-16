import { config } from "dotenv"
import { Pool } from "pg"
import { readFileSync } from "fs"
import { join } from "path"

config({ path: ".env.local" })

async function setupDatabase() {
  console.log("🚀 Starting database setup...\n")

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in .env.local")
    console.error('Add: DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/alumni_connect"')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    // Test connection
    console.log("📡 Testing database connection...")
    await pool.query("SELECT NOW()")
    console.log("✅ Database connection successful\n")

    console.log("🔍 Checking existing tables...")
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'colleges'
    `)

    const tablesExist = Number.parseInt(tablesResult.rows[0].count) > 0

    if (tablesExist) {
      console.log("⚠️  Tables already exist, skipping schema creation")
      console.log("💡 If you want to recreate tables, drop the database first:\n")
      console.log("   psql -U postgres -c 'DROP DATABASE alumni_connect;'")
      console.log("   psql -U postgres -c 'CREATE DATABASE alumni_connect;'\n")
    } else {
      // Read and execute schema only if tables don't exist
      console.log("📄 Reading database schema...")
      const schemaPath = join(process.cwd(), "database-schema.sql")
      const schema = readFileSync(schemaPath, "utf-8")

      console.log("🔨 Creating tables...")
      await pool.query(schema)
      console.log("✅ Database schema created successfully\n")
    }

    // Create default college (with ON CONFLICT to avoid duplicates)
    console.log("🏫 Setting up default college...")
    const collegeResult = await pool.query(
      `INSERT INTO colleges (name, code, city, state, country, website, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO UPDATE SET 
         name = EXCLUDED.name,
         website = EXCLUDED.website,
         description = EXCLUDED.description
       RETURNING id, name, code`,
      [
        "Northbridge University",
        "NORTHBRIDGE",
        "Springfield",
        "California",
        "USA",
        "https://northbridge.edu",
        "Premier institution for higher education",
      ],
    )
    console.log(`✅ College ready: ${collegeResult.rows[0].name} (ID: ${collegeResult.rows[0].id})\n`)

    const collegeId = collegeResult.rows[0].id

    console.log("👤 Setting up default admin user...")
    const bcrypt = require("bcryptjs")
    const adminPassword = await bcrypt.hash("admin123", 10)

    const userResult = await pool.query(
      `INSERT INTO users (college_id, role, email, password_hash, first_name, last_name, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (college_id, email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         status = 'active'
       RETURNING id, email`,
      [collegeId, "admin", "admin@northbridge.edu", adminPassword, "Admin", "User", "active", true],
    )

    if (userResult.rows.length > 0) {
      console.log("✅ Admin user ready: admin@northbridge.edu / admin123\n")
    }

    console.log("🎉 Database setup completed successfully!\n")
    console.log("📝 You can now:")
    console.log("   1. Run 'npm run dev' to start the application")
    console.log("   2. Login with: admin@northbridge.edu / admin123")
    console.log("   3. Register new users through the application")
    console.log("\n💡 To reset the database:")
    console.log("   DROP DATABASE alumni_connect;")
    console.log("   CREATE DATABASE alumni_connect;")
    console.log("   npm run setup\n")
  } catch (error: any) {
    console.error("❌ Setup failed:", error.message)
    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Make sure PostgreSQL is running on your machine")
      console.error("   Mac: brew services start postgresql")
      console.error("   Windows: Start PostgreSQL service")
      console.error("   Linux: sudo systemctl start postgresql")
    } else if (error.code === "3D000") {
      console.error("\n💡 Database 'alumni_connect' does not exist. Create it first:")
      console.error("   psql -U postgres -c 'CREATE DATABASE alumni_connect;'")
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
