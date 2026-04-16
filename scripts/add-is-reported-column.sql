-- Add is_reported column to community_posts table if it doesn't exist
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
