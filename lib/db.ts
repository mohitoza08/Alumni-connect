import { config } from "dotenv"
import { Pool } from "pg"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  console.error("\n❌ DATABASE_URL is not defined!")
  console.error("\n📖 Quick Fix:")
  console.error("  1. Create a .env.local file in the project root")
  console.error("  2. Add your local PostgreSQL connection string:")
  console.error('     DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/alumni_connect"')
  console.error("\n")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Export pool for advanced usage
export { pool }

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await pool.end()
  process.exit(0)
})
