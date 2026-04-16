import { query } from "../lib/db"

async function run() {
  try {
    await query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;`);
    console.log('Old constraint dropped');
  } catch (e: any) {
    if (e.code === '42704') console.log('Constraint did not exist, skipping drop');
    else throw e;
  }

  await query(`
    ALTER TABLE users ADD CONSTRAINT users_status_check 
    CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'banned'))
  `);
  console.log('New constraint added with banned status');
  
  console.log('Done!');
}

run().catch(console.error);
