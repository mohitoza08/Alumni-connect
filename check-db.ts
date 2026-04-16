import { query } from "./lib/db";

async function checkUser() {
  console.log("Connecting to database...");
  try {
    const users = await query(
      "SELECT id, email, status, college_id, role FROM users WHERE email = $1",
      ["admin@saffrony.ac.in"]
    );
    console.log("Users found:", users.length);
    console.log(JSON.stringify(users, null, 2));
    
    // Check colleges
    const colleges = await query("SELECT id, name, code FROM colleges LIMIT 5");
    console.log("\nColleges:", JSON.stringify(colleges, null, 2));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}

checkUser();
