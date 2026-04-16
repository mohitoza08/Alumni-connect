import { Pool } from "pg";

async function test() {
  const urls = [
    "postgresql://postgres.tdpzkqtbsxwltazixcwf:Alumni4420%40We@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  ];

  for (const url of urls) {
    console.log(`\nTesting: ${url.split("@")[1]}`);
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      const result = await pool.query("SELECT 1 as test");
      console.log("✓ Success!");
      await pool.end();
      break;
    } catch (e: any) {
      console.log(`✗ Error: ${e.message}`);
      await pool.end();
    }
  }
  process.exit(0);
}

test();
