import { query } from "../lib/db"

async function updateSchema() {
  try {
    console.log("Checking and updating schema...")

    // Add is_reported column if it doesn't exist
    await query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'community_posts' 
              AND column_name = 'is_reported'
          ) THEN
              ALTER TABLE community_posts 
              ADD COLUMN is_reported BOOLEAN DEFAULT FALSE;
              
              RAISE NOTICE 'Added is_reported column to community_posts table';
          ELSE
              RAISE NOTICE 'is_reported column already exists in community_posts table';
          END IF;
      END $$;
    `)

    console.log("Schema update completed successfully!")
  } catch (error) {
    console.error("Error updating schema:", error)
    process.exit(1)
  }

  process.exit(0)
}

updateSchema()
