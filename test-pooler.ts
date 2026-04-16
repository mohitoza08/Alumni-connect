import { Pool } from "pg";

async function testPooler() {
  console.log("Testing pooler with port 5432...\n");

  const url = "postgresql://postgres.tdpzkqtbsxwltazixcwf:Alumni4420@We@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

  console.log("URL:", url);
  console.log("Host: aws-1-ap-southeast-1.pooler.supabase.com:5432\n");

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await pool.query("SELECT 1 as test, current_database() as db, current_user as user");
    console.log("✅ SUCCESS!");
    console.log("Database:", result.rows[0].db);
    console.log("User:", result.rows[0].user);
  } catch (e: any) {
    console.log("❌ Error:", e.message);
  }

  await pool.end();
  process.exit(0);
}

testPooler();
