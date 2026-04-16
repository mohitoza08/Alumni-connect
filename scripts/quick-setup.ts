import { config } from "dotenv"
import { Pool } from "pg"
import bcrypt from "bcrypt"
import { existsSync, copyFileSync } from "fs"

// Load environment
config({ path: ".env.local" })

async function quickSetup() {
  console.log("╔════════════════════════════════════════╗")
  console.log("║  Alumni Connect - Quick Setup Wizard  ║")
  console.log("╚════════════════════════════════════════╝\n")

  // Step 1: Check .env.local
  console.log("Step 1: Checking environment file...")
  if (!existsSync(".env.local")) {
    console.log("   Creating .env.local from example...")
    copyFileSync(".env.local.example", ".env.local")
    console.log("   ✅ Created .env.local")
    console.log("\n   ⚠️  IMPORTANT: Edit .env.local and add your PostgreSQL password!")
    console.log('   Change: DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/alumni_connect"')
    console.log("   Then run: npm run setup again\n")
    process.exit(0)
  }

  // Reload env after potential creation
  config({ path: ".env.local" })

  // Step 2: Validate DATABASE_URL
  console.log("\nStep 2: Validating DATABASE_URL...")
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("YOUR_PASSWORD_HERE")) {
    console.error("   ❌ DATABASE_URL not properly configured!")
    console.log("\n   Edit .env.local and set your PostgreSQL password:")
    console.log('   DATABASE_URL="postgresql://postgres:YourActualPassword@localhost:5432/alumni_connect"\n')
    process.exit(1)
  }
  console.log("   ✅ DATABASE_URL configured")

  // Step 3: Test connection
  console.log("\nStep 3: Testing database connection...")
  let pool: Pool
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const client = await pool.connect()
    console.log("   ✅ Connected to PostgreSQL")
    client.release()
  } catch (error: any) {
    console.error("   ❌ Connection failed:", error.message)
    console.log("\n   📖 Troubleshooting:")
    console.log("   1. Is PostgreSQL running? Check services or run: pg_ctl status")
    console.log("   2. Is the password correct? Special characters must be URL-encoded")
    console.log("   3. Does the database exist? Run: psql -U postgres -c 'CREATE DATABASE alumni_connect;'\n")
    process.exit(1)
  }

  // Step 4: Check schema
  console.log("\nStep 4: Checking database schema...")
  try {
    const client = await pool.connect()
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    if (tables.rows.length === 0) {
      console.log("   ⚠️  No tables found. Importing schema...")
      console.log("   Run this command:")
      console.log("   psql -U postgres -d alumni_connect -f database-schema.sql\n")
      client.release()
      await pool.end()
      process.exit(1)
    }

    console.log(`   ✅ Found ${tables.rows.length} tables`)
    client.release()
  } catch (error: any) {
    console.error("   ❌ Schema check failed:", error.message)
    await pool.end()
    process.exit(1)
  }

  // Step 5: Setup college
  console.log("\nStep 5: Setting up initial college...")
  try {
    const client = await pool.connect()

    const existing = await client.query("SELECT id, name FROM colleges WHERE code = $1", ["MIT"])

    if (existing.rows.length > 0) {
      console.log(`   ℹ️  College already exists: ${existing.rows[0].name}`)
    } else {
      const result = await client.query(
        `INSERT INTO colleges (name, code, city, state, country, website, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, code`,
        [
          "Massachusetts Institute of Technology",
          "MIT",
          "Cambridge",
          "Massachusetts",
          "USA",
          "https://mit.edu",
          "Welcome to MIT Alumni Network",
        ],
      )
      console.log(`   ✅ Created college: ${result.rows[0].name}`)
    }

    client.release()
  } catch (error: any) {
    console.error("   ❌ College setup failed:", error.message)
    await pool.end()
    process.exit(1)
  }

  // Step 6: Setup admin
  console.log("\nStep 6: Creating admin user...")
  try {
    const client = await pool.connect()

    const email = "admin@mit.edu"
    const password = "Admin@123"

    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email])

    if (existing.rows.length > 0) {
      console.log(`   ℹ️  Admin already exists: ${email}`)
    } else {
      const passwordHash = await bcrypt.hash(password, 10)
      const college = await client.query("SELECT id FROM colleges WHERE code = $1", ["MIT"])

      await client.query(
        `INSERT INTO users (college_id, role, email, password_hash, first_name, last_name, status, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [college.rows[0].id, "admin", email, passwordHash, "Admin", "User", "active", true],
      )

      console.log("   ✅ Admin user created")
      console.log("\n   ╔════════════════════════════════╗")
      console.log("   ║     LOGIN CREDENTIALS          ║")
      console.log("   ╠════════════════════════════════╣")
      console.log(`   ║ Email: ${email.padEnd(19)} ║`)
      console.log(`   ║ Password: ${password.padEnd(16)} ║`)
      console.log("   ╚════════════════════════════════╝")
    }

    client.release()
  } catch (error: any) {
    console.error("   ❌ Admin creation failed:", error.message)
    await pool.end()
    process.exit(1)
  }

  await pool.end()

  // Success!
  console.log("\n╔════════════════════════════════════════╗")
  console.log("║   ✅ Setup Complete!                   ║")
  console.log("╚════════════════════════════════════════╝\n")
  console.log("🚀 Start the development server:")
  console.log("   npm run dev\n")
  console.log("📱 Then open: http://localhost:3000\n")
}

quickSetup().catch(console.error)
