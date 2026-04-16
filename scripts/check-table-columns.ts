import { query } from "../lib/db"

async function checkTables() {
  try {
    console.log("Checking community_posts columns...")
    const posts = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'community_posts'`)
    console.log("community_posts columns:", posts.map((r: any) => r.column_name))
    
    console.log("\nChecking post_comments columns...")
    const comments = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'post_comments'`)
    console.log("post_comments columns:", comments.map((r: any) => r.column_name))
    
    console.log("\nChecking events columns...")
    const events = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'events'`)
    console.log("events columns:", events.map((r: any) => r.column_name))
    
    console.log("\nChecking users columns...")
    const users = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`)
    console.log("users columns:", users.map((r: any) => r.column_name))
    
  } catch (e) {
    console.error("Error:", e)
  }
}

checkTables()
