import { query } from "../lib/db"
import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function approveUserManually() {
  try {
    console.log("=== Manual User Approval Tool ===\n")

    // Show all pending users
    const pendingUsers = await query(
      `SELECT id, email, first_name, last_name, role, status, created_at 
       FROM users 
       WHERE status = 'pending'
       ORDER BY created_at DESC`,
    )

    if (pendingUsers.length === 0) {
      console.log("No pending users found.")
      process.exit(0)
    }

    console.log(`Found ${pendingUsers.length} pending users:\n`)
    pendingUsers.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Registered: ${user.created_at}`)
      console.log("")
    })

    const userIdStr = await askQuestion("Enter the User ID to approve (or 'all' to approve all): ")

    if (userIdStr.toLowerCase() === "all") {
      console.log("\nApproving all pending users...")
      for (const user of pendingUsers) {
        await query(`UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [user.id])
        console.log(`✓ Approved: ${user.email}`)
      }
      console.log(`\n✓ Successfully approved ${pendingUsers.length} users!`)
    } else {
      const userId = Number.parseInt(userIdStr)
      if (isNaN(userId)) {
        console.error("Invalid user ID")
        process.exit(1)
      }

      const user = pendingUsers.find((u: any) => u.id === userId)
      if (!user) {
        console.error("User ID not found in pending users")
        process.exit(1)
      }

      console.log(`\nApproving user: ${user.email}...`)

      // Check current status
      const beforeResult = await query<{ status: string }>(`SELECT status FROM users WHERE id = $1`, [userId])
      console.log(`Status before: ${beforeResult[0]?.status}`)

      // Approve user
      await query(`UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [userId])

      // Verify status changed
      const afterResult = await query<{ status: string }>(`SELECT status FROM users WHERE id = $1`, [userId])
      console.log(`Status after: ${afterResult[0]?.status}`)

      if (afterResult[0]?.status === "active") {
        console.log(`\n✓ Successfully approved user: ${user.email}`)
        console.log(`\nThe user can now login with their email and password.`)
      } else {
        console.error("\n✗ Failed to approve user. Status did not change to active.")
      }
    }

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error("Error approving user:", error)
    rl.close()
    process.exit(1)
  }
}

approveUserManually()
