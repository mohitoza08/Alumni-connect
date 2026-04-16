import { query } from "../lib/db"

async function checkUserStatus() {
  try {
    console.log("=== Checking all users in database ===")

    const users = await query(
      `SELECT id, email, first_name, last_name, role, status, college_id, created_at 
       FROM users 
       ORDER BY created_at DESC`,
    )

    console.log(`\nTotal users: ${users.length}\n`)

    users.forEach((user: any) => {
      console.log(`User ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.first_name} ${user.last_name}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Status: ${user.status}`)
      console.log(`  College ID: ${user.college_id}`)
      console.log(`  Created: ${user.created_at}`)
      console.log("---")
    })

    // Check specifically for pending users
    const pendingUsers = await query("SELECT email, status FROM users WHERE status = 'pending'")
    console.log(`\nPending users: ${pendingUsers.length}`)

    // Check for active users
    const activeUsers = await query("SELECT email, status FROM users WHERE status = 'active'")
    console.log(`Active users: ${activeUsers.length}`)

    process.exit(0)
  } catch (error) {
    console.error("Error checking user status:", error)
    process.exit(1)
  }
}

checkUserStatus()
