import { query } from "../lib/db"

async function run() {
  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;`);
    console.log('ban_reason column added');
  } catch (e: any) {
    if (e.code === '42701') console.log('ban_reason column already exists');
    else throw e;
  }

  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP;`);
    console.log('suspended_until column added');
  } catch (e: any) {
    if (e.code === '42701') console.log('suspended_until column already exists');
    else throw e;
  }

  console.log('Done!');
}

run().catch(console.error);
