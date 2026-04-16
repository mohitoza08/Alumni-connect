import { config } from "dotenv"
import { Pool } from "pg"
import { existsSync } from "fs"

// Load .env.local
config({ path: ".env.local" })

async function validateSetup() {
  console.log("🔍 Validating Alumni Connect Setup...\n")
  let hasErrors = false

  // Step 1: Check .env.local exists
  console.log("1️⃣  Checking environment file...")
  if (!existsSync(".env.local")) {
    console.error("   ❌ .env.local file not found!")
    console.log("   📝 Create it by copying .env.local.example:")
    console.log("      Windows: copy .env.local.example .env.local")
    console.log("      Mac/Linux: cp .env.local.example .env.local\n")
    hasErrors = true
  } else {
    console.log("   ✅ .env.local exists\n")
  }

  // Step 2: Check DATABASE_URL
  console.log("2️⃣  Checking DATABASE_URL...")
  if (!process.env.DATABASE_URL) {
    console.error("   ❌ DATABASE_URL not set in .env.local")
    console.log('   📝 Add this line: DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/alumni_connect"\n')
    hasErrors = true
  } else {
    console.log(`   ✅ DATABASE_URL is set`)
    console.log(`   📍 ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}\n`)
  }

  // Step 3: Test PostgreSQL connection
  if (process.env.DATABASE_URL) {
    console.log("3️⃣  Testing PostgreSQL connection...")
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      const client = await pool.connect()
      console.log("   ✅ Successfully connected to PostgreSQL\n")

      // Step 4: Check if database exists
      console.log("4️⃣  Checking database structure...")
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)

      if (result.rows.length === 0) {
        console.error("   ❌ No tables found in database!")
        console.log("   📝 Run: psql -U postgres -d alumni_connect -f database-schema.sql\n")
        hasErrors = true
      } else {
        console.log(`   ✅ Found ${result.rows.length} tables:`)
        result.rows.forEach((row) => {
          console.log(`      - ${row.table_name}`)
        })
        console.log()
      }

      // Step 5: Check for colleges
      console.log("5️⃣  Checking initial data...")
      const colleges = await client.query("SELECT COUNT(*) as count FROM colleges")
      if (Number.parseInt(colleges.rows[0].count) === 0) {
        console.warn("   ⚠️  No colleges found in database")
        console.log("   📝 Run: npm run db:setup\n")
      } else {
        console.log(`   ✅ Found ${colleges.rows[0].count} college(s)\n`)
      }

      // Step 6: Check for users
      const users = await client.query("SELECT COUNT(*) as count FROM users")
      if (Number.parseInt(users.rows[0].count) === 0) {
        console.warn("   ⚠️  No users found in database")
        console.log("   📝 Run: npm run db:setup\n")
      } else {
        console.log(`   ✅ Found ${users.rows[0].count} user(s)\n`)
      }

      client.release()
      await pool.end()
    } catch (error: any) {
      console.error("   ❌ Database connection failed!")
      console.error("   Error:", error.message)
      console.log("\n   📖 Common fixes:")
      console.log("   1. Make sure PostgreSQL is running")
      console.log("   2. Check your password is correct (and URL-encoded)")
      console.log("   3. Verify database exists: psql -U postgres -l")
      console.log("   4. Create database if missing: psql -U postgres -c 'CREATE DATABASE alumni_connect;'\n")
      hasErrors = true
    }
  }

  // Final result
  console.log("═══════════════════════════════════════")
  if (hasErrors) {
    console.log("❌ Setup validation FAILED")
    console.log("═══════════════════════════════════════\n")
    console.log("📚 Next steps:")
    console.log("   1. Fix the errors listed above")
    console.log("   2. Run: npm run validate")
    console.log("   3. Then run: npm run db:setup\n")
    process.exit(1)
  } else {
    console.log("✅ Setup validation PASSED")
    console.log("═══════════════════════════════════════\n")
    console.log("🚀 Ready to start development!")
    console.log("   Run: npm run dev\n")
    process.exit(0)
  }
}

validateSetup()
