import { query } from "./lib/db";
import bcrypt from "bcryptjs";

async function testLogin() {
  console.log("Testing login...");
  try {
    const email = "admin@saffrony.ac.in";
    const password = "Saffrony@19";
    const college_id = 1;

    // Get user
    const users = await query(
      "SELECT * FROM users WHERE email = $1 AND college_id = $2 AND status = 'active'",
      [email, college_id]
    );

    if (users.length === 0) {
      console.log("❌ User not found or not active");
      return;
    }

    const user = users[0];
    console.log("✓ User found:", user.email, "| Status:", user.status);

    // Test password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("✓ Password valid:", isValid);

    if (isValid) {
      console.log("\n✅ LOGIN SUCCESS! Ready for Vercel deployment.");
    } else {
      console.log("\n❌ Password mismatch!");
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}

testLogin();
