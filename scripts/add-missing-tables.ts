import { query } from "../lib/db"

async function addMissingTables() {
  try {
    console.log("Adding missing tables...")

    // Create skills table
    await query(`
      CREATE TABLE IF NOT EXISTS skills (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        skill_name VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        date_obtained DATE,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✓ skills table created")

    // Create projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        project_name VARCHAR(255) NOT NULL,
        description TEXT,
        technologies TEXT,
        project_link VARCHAR(500),
        date_completed DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✓ projects table created")

    // Create achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        achievement_type VARCHAR(50) CHECK (achievement_type IN ('academic', 'career', 'award', 'publication', 'patent', 'leadership', 'community_service', 'entrepreneurship')),
        achievement_date DATE,
        organization VARCHAR(255),
        verification_url VARCHAR(500),
        is_verified BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✓ achievements table created")

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_skills_college ON skills(college_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_college ON projects(college_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_achievements_college ON achievements(college_id)`)
    console.log("✓ indexes created")

    console.log("\n✅ All missing tables added successfully!")
  } catch (error) {
    console.error("Error adding tables:", error)
    process.exit(1)
  }

  process.exit(0)
}

addMissingTables()
