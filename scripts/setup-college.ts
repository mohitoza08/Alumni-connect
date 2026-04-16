import { query } from "../lib/db"

async function setupCollege() {
  try {
    console.log("🏫 Setting up college...\n")

    // Check if college already exists
    const existing = await query("SELECT id, name, code FROM colleges WHERE code = $1", ["SAFFRONY"])

    if (existing.length > 0) {
      console.log("✅ College already exists!\n")
      console.log("📋 College Details:")
      console.log("   ID:", existing[0].id)
      console.log("   Name:", existing[0].name)
      console.log("   Code:", existing[0].code)
      console.log("\n✨ You can use this college to register users in the app.")
      return
    }

    // Create new college
    console.log("📝 Creating new college...")
    const result = await query(
      `INSERT INTO colleges (
        name, code, city, state, country, website, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, code`,
      [
        "Saffrony University",
        "SAFFRONY",
        "Mehsana",
        "Gujarat",
        "India",
        "https://saffrony.ac.in",
        "Welcome to Saffrony Alumni Network - Connecting alumni, students, and the community.",
      ],
    )

    console.log("\n✅ College created successfully!\n")
    console.log("📋 College Details:")
    console.log("   ID:", result[0].id)
    console.log("   Name:", result[0].name)
    console.log("   Code:", result[0].code)
    console.log("\n✨ You can now register users in the app.")
  } catch (error) {
    console.error("\n❌ Error setting up college:", error)
    console.log("\n📖 Note: In development mode, the app uses a mock database.")
    console.log("The college 'Northbridge University' is already seeded by default.")
    throw error
  }
}

setupCollege()
  .then(() => {
    console.log("\n✅ Setup complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Setup failed:", error)
    process.exit(1)
  })
