# Alumni Management System - Database Setup Guide

This guide will help you set up and connect the PostgreSQL database for the Alumni Connect application.

## 📋 Overview

The database schema supports a comprehensive alumni management system with:
- Multi-college support
- Role-based access control (Admin, Alumni, Student)
- Community features (posts, comments, likes)
- Mentorship program management
- Event management and registration
- Fundraising campaigns and donations
- Achievement tracking
- Analytics and reporting

## 🗄️ Database Structure

### Core Tables (23)
1. **colleges** - College/university information
2. **users** - All user accounts with roles
3. **applications** - Student applications for alumni status
4. **community_posts** - Community discussion posts
5. **post_likes** - Post engagement tracking
6. **post_comments** - Comments on posts
7. **mentorships** - Mentor-mentee relationships
8. **mentorship_requests** - Mentorship requests from students
9. **mentorship_sessions** - Individual meeting records
10. **events** - Event listings
11. **event_registrations** - Event attendance tracking
12. **fundraising_campaigns** - Fundraising initiatives
13. **donations** - Individual donation records
14. **donation_requests** - Unverified donations pending approval
15. **achievements** - User achievements and accomplishments
16. **skills** - User skills and certifications
17. **projects** - User project portfolio
18. **notifications** - System notifications
19. **analytics_metrics** - Aggregated analytics data
20. **system_settings** - Configuration management
21. **user_sessions** - Authentication sessions
22. **user_badges** - User earned badges (gamification)
23. **user_streaks** - Daily activity streaks (gamification)

### Premium Features Tables (5)
24. **workshops** - Premium paid workshops
25. **workshop_registrations** - Workshop registrations
26. **subscriptions** - Premium membership tracking
27. **resume_enhancements** - AI resume enhancement tracking
28. **messages** - In-app messaging

### Database Views (4)
- **v_dashboard_stats** - Aggregated dashboard statistics
- **v_recent_activity** - Recent posts and events
- **v_leaderboard** - User rankings by points
- **v_pending_verifications** - Pending donation/workshop verifications

## 🚀 Quick Setup (Local PostgreSQL)

### Prerequisites

**Install PostgreSQL:**
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql@16` or download from [postgresql.org](https://www.postgresql.org/download/macosx/)
- **Linux**: `sudo apt install postgresql postgresql-contrib`

**Verify Installation:**
```bash
psql --version
# Should show: psql (PostgreSQL) 16.x
```

### Step 1: Start PostgreSQL Service

**Windows:**
```bash
# PostgreSQL should start automatically
# To check status, open Services and look for "postgresql-x64-16"
```

**Mac:**
```bash
brew services start postgresql@16
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# You'll be prompted for password (the one you set during installation)
# Once connected, create the database:
CREATE DATABASE alumni_connect;

# Verify it was created:
\l

# Exit psql:
\q
```

### Step 3: Import Schema

```bash
# Navigate to your project directory
cd D:\Games\AlumniConnect1

# Import the schema file
psql -U postgres -d alumni_connect -f database-schema.sql

# Enter your password when prompted
```

**Expected Output:**
```bash
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
(You should see CREATE statements for all 23+ tables)
```

### Step 4: Verify Installation

```bash
# Connect to your database
psql -U postgres -d alumni_connect

# List all tables
\dt

# You should see 23+ tables:
# - colleges, users, applications
# - community_posts, post_likes, post_comments
# - mentorships, mentorship_requests, mentorship_sessions
# - events, event_registrations
# - fundraising_campaigns, donations, donation_requests
# - achievements, skills, projects
# - notifications, analytics_metrics, system_settings
# - user_sessions, user_badges, user_streaks
# - workshops, workshop_registrations, subscriptions
# - resume_enhancements, messages

# Check a specific table structure
\d users

# Exit when done
\q
```

## 🔌 Connect Your Next.js Application

### Step 1: Install Required Packages

```bash
# Navigate to your project
cd D:\Games\AlumniConnect1

# Install PostgreSQL client for Node.js
npm install pg
npm install --save-dev @types/pg

# Install bcrypt for password hashing
npm install bcrypt
npm install --save-dev @types/bcrypt

# Install tsx for running TypeScript scripts
npm install --save-dev tsx
```

### Step 2: Create Environment File

**Create `.env.local` in your project root:**

```env
# Copy from .env.local.example and fill in your password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect"
```

**Important Password Rules:**
- Replace `YOUR_PASSWORD` with your actual PostgreSQL password
- If password contains special characters, URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `#` → `%23`
  - `?` → `%3F`
  - `&` → `%26`

**Examples:**
- Password: `Admin@123` → `Admin%40123`
- Password: `Pass:word/123` → `Pass%3Aword%2F123`
- Full URL: `postgresql://postgres:Admin%40123@localhost:5432/alumni_connect`

### Step 3: Test Your Connection

```bash
# Run the test script
npm run tsx scripts/test-connection.ts

# Or use npx directly
npx tsx scripts/test-connection.ts
```

**Expected Success Output:**
```bash
🔍 Testing database connection...

✅ Database connected successfully!

📊 Connection Details:
  Database: alumni_connect
  User: postgres
  Version: PostgreSQL 16.x

📋 Tables found: 23
  Tables: colleges, users, applications, community_posts, post_likes, post_comments, mentorships, mentorship_requests, mentorship_sessions, events, event_registrations, fundraising_campaigns, donations, donation_requests, achievements, skills, projects, notifications, analytics_metrics, system_settings, user_sessions, user_badges, user_streaks, workshops, workshop_registrations, subscriptions, resume_enhancements, messages

📈 Record Counts:
  Colleges: 0
  Users: 0

✅ All tests passed!
```

**If you get errors, see Troubleshooting section below.**

## 🎯 Create Your First Admin User

### Step 1: Create Your College

Create `scripts/setup-college.ts`:

```typescript
import { query } from '../lib/db';

async function setupCollege() {
  try {
    // Check if college already exists
    const existing = await query(
      'SELECT id FROM colleges WHERE code = $1',
      ['MIT']
    );

    if (existing.length > 0) {
      console.log('✅ College already exists with ID:', existing[0].id);
      return existing[0].id;
    }

    // Create new college
    const result = await query(
      `INSERT INTO colleges (
        name, code, city, state, country, website, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, code`,
      [
        'Massachusetts Institute of Technology',
        'MIT',
        'Cambridge',
        'Massachusetts',
        'USA',
        'https://mit.edu',
        'Welcome to MIT Alumni Network'
      ]
    );

    console.log('✅ College created successfully!');
    console.log('   ID:', result[0].id);
    console.log('   Name:', result[0].name);
    console.log('   Code:', result[0].code);
    
    return result[0].id;
  } catch (error) {
    console.error('❌ Error creating college:', error);
    process.exit(1);
  }
}

setupCollege();
```

Run it:
```bash
npx tsx scripts/setup-college.ts
```

### Step 2: Create Admin User

Create `scripts/create-admin.ts`:

```typescript
import { query } from '../lib/db';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    // Configuration
    const email = 'admin@mit.edu';
    const password = 'Admin@123';  // CHANGE THIS!
    const firstName = 'Admin';
    const lastName = 'User';
    const collegeId = 1;  // Use the ID from previous step

    // Check if admin already exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      console.log('⚠️  User with this email already exists!');
      console.log('   Email:', email);
      console.log('   User ID:', existing[0].id);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const result = await query(
      `INSERT INTO users (
        college_id,
        role,
        email,
        password_hash,
        first_name,
        last_name,
        status,
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role, first_name, last_name`,
      [
        collegeId,
        'admin',
        email,
        passwordHash,
        firstName,
        lastName,
        'active',
        true
      ]
    );

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Login Credentials:');
    console.log('   Email:', result[0].email);
    console.log('   Password:', password);
    console.log('   Role:', result[0].role);
    console.log('   User ID:', result[0].id);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
npx tsx scripts/create-admin.ts
```

## 🔧 Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:test": "tsx scripts/test-connection.ts",
    "db:setup": "tsx scripts/setup-college.ts && tsx scripts/create-admin.ts",
    "db:admin": "tsx scripts/create-admin.ts"
  }
}
```

Now you can run:
```bash
npm run db:test      # Test database connection
npm run db:setup     # Create college and admin user
npm run db:admin     # Create additional admin users
```

## 🔜 Connecting to Your Application

### Step 1: Install PostgreSQL Client

```bash
npm install pg
# or
npm install @neondatabase/serverless
```

### Step 2: Create Environment File

Create a `.env.local` file in your project root:

```env
# PostgreSQL Connection (Local)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect"

# Or for Neon/Supabase (Cloud)
# DATABASE_URL="postgresql://user:password@host.region.provider.com:5432/alumni_connect"

# Optional: Separate connection for SSL
# DATABASE_URL="postgresql://user:password@host:5432/alumni_connect?sslmode=require"
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password.**

### Step 3: Create Database Utility

Create `lib/db.ts` in your project:

```typescript
import { Pool } from 'pg';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Adjust as needed
});

export const query = async (text: string, params?: any[]): Promise<any[]> => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
```

### Step 4: Test Connection

Create `scripts/test-connection.ts`:

```typescript
import { query } from '../lib/db';

async function testConnection() {
  try {
    const result = await query('SELECT current_database(), current_user, version()');
    console.log('✅ Database connected successfully!');
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

testConnection();
```

## 🔑 Initial Setup

### Create Your First College

```sql
INSERT INTO colleges (name, code, city, state, country, website, description) 
VALUES (
  'Your University Name',
  'YUN',
  'Your City',
  'Your State',
  'USA',
  'https://youruniversity.edu',
  'Welcome to our alumni network!'
);
```

### Create Admin User

**Important:** Never store plain text passwords! Use bcrypt to hash passwords.

#### Option 1: Using Node.js Script

Create `scripts/create-admin.ts`:

```typescript
import { query } from '../lib/db';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const password = 'Admin@123'; // Change this!
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await query(`
      INSERT INTO users (
        college_id, 
        role, 
        email, 
        password_hash, 
        first_name, 
        last_name,
        status,
        email_verified
      ) VALUES (
        1,
        'admin',
        'admin@youruniversity.edu',
        $1,
        'Admin',
        'User',
        'active',
        true
      )
      RETURNING id, email, role
    `, [hashedPassword]);
    
    console.log('✅ Admin user created:', result[0]);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();
```

Run it:
```bash
npx tsx scripts/create-admin.ts
```

#### Option 2: Direct SQL (For Testing Only)

```sql
-- Use a password hasher first! This is just an example
INSERT INTO users (
  college_id, 
  role, 
  email, 
  password_hash, 
  first_name, 
  last_name,
  status,
  email_verified
) VALUES (
  1,
  'admin',
  'admin@youruniversity.edu',
  '$2b$10$YourBcryptHashedPasswordHere',
  'Admin',
  'User',
  'active',
  true
);
```

## 🔐 Implementing Authentication

### Create Auth API Routes

Create `app/api/auth/login/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Fetch user from database
    const users = await query(`
      SELECT id, email, password_hash, role, first_name, last_name, college_id
      FROM users 
      WHERE email = $1 AND status = 'active'
      LIMIT 1
    `, [email]);
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    // TODO: Create session/JWT token here
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Create Registration API

Create `app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, role, collegeId } = await request.json();
    
    // Check if user exists
    const existing = await query(`
      SELECT id FROM users WHERE email = $1 LIMIT 1
    `, [email]);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await query(`
      INSERT INTO users (
        college_id,
        role,
        email,
        password_hash,
        first_name,
        last_name,
        status,
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role, first_name, last_name
    `, [collegeId, role, email, passwordHash, firstName, lastName, 'pending', false]);
    
    return NextResponse.json({
      user: result[0],
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 📊 Example API Routes for Data

### Get Community Posts

Create `app/api/posts/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    
    const posts = await query(`
      SELECT 
        cp.*,
        u.first_name,
        u.last_name,
        u.profile_picture,
        u.role
      FROM community_posts cp
      JOIN users u ON cp.author_id = u.id
      WHERE cp.college_id = $1
        AND cp.is_archived = false
      ORDER BY cp.created_at DESC
      LIMIT 50
    `, [collegeId]);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { collegeId, authorId, title, content, category, tags } = await request.json();
    
    const result = await query(`
      INSERT INTO community_posts (
        college_id,
        author_id,
        title,
        content,
        category,
        tags
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [collegeId, authorId, title, content, category, tags]);
    
    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

### Get Events

Create `app/api/events/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    
    const events = await query(`
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name as organizer_name,
        COUNT(er.id) as registered_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.college_id = $1
        AND e.status IN ('upcoming', 'ongoing')
      GROUP BY e.id, u.first_name, u.last_name
      ORDER BY e.start_date ASC
    `, [collegeId]);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
```

## 🔒 Security Best Practices

### 1. Password Security
- ✅ Always use bcrypt with minimum 10 salt rounds
- ✅ Never store plain text passwords
- ✅ Implement password strength requirements
- ✅ Add rate limiting to login endpoints

### 2. SQL Injection Prevention
- ✅ Always use parameterized queries (template literals with sql tag)
- ❌ NEVER concatenate user input into SQL strings

```typescript
// ✅ GOOD - Parameterized query
const users = await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ BAD - SQL injection risk
const users = await query('SELECT * FROM users WHERE email = \'' + email + '\''); // DON'T DO THIS!
```

### 3. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different credentials for development and production
- ✅ Rotate database passwords regularly

### 4. Access Control
- ✅ Implement role-based access control (RBAC)
- ✅ Verify user permissions before database operations
- ✅ Use database transactions for critical operations

## 🧪 Testing Your Setup

### 1. Test Database Connection

```bash
npx tsx scripts/test-connection.ts
```

### 2. Test Authentication

```bash
# Try logging in with your admin account
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@youruniversity.edu","password":"Admin@123"}'
```

### 3. Test Data Fetching

```bash
# Get posts for college ID 1
curl http://localhost:3000/api/posts?collegeId=1
```

## 🚀 Deploying to Production

### Using Vercel + Neon

1. **Create Neon Database**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Import Schema**
   ```bash
   psql "your-neon-connection-string" -f database-schema.sql
   ```

3. **Add to Vercel**
   - Go to your Vercel project settings
   - Add environment variable: `DATABASE_URL`
   - Paste your Neon connection string
   - Deploy your app

### Using Vercel + Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to SQL Editor

2. **Run Schema**
   - Copy contents of `database-schema.sql`
   - Paste into SQL Editor
   - Execute

3. **Connect to Vercel**
   - Get connection string from Supabase settings
   - Add to Vercel environment variables
   - Deploy

## 📈 Database Views

### Available Views

The schema includes 4 pre-built views for common queries:

```sql
-- Dashboard statistics view
SELECT * FROM v_dashboard_stats WHERE college_id = 1;

-- Recent activity view
SELECT * FROM v_recent_activity WHERE college_id = 1 LIMIT 20;

-- Leaderboard view
SELECT * FROM v_leaderboard WHERE college_id = 1 ORDER BY rank LIMIT 10;

-- Pending verifications for admins
SELECT * FROM v_pending_verifications ORDER BY created_at DESC;
```

## 📈 Common Queries

### Recent Applications
```sql
SELECT 
  a.*,
  u.first_name,
  u.last_name,
  u.email
FROM applications a
JOIN users u ON a.student_id = u.id
WHERE a.college_id = 1
  AND a.status = 'pending'
ORDER BY a.created_at DESC;
```

### Active Mentorships
```sql
SELECT 
  m.*,
  mentor.first_name || ' ' || mentor.last_name as mentor_name,
  mentee.first_name || ' ' || mentee.last_name as mentee_name
FROM mentorships m
JOIN users mentor ON m.mentor_id = mentor.id
JOIN users mentee ON m.mentee_id = mentee.id
WHERE m.college_id = 1
  AND m.status = 'active';
```

## 🛠️ Troubleshooting

### Error: "relation does not exist"
**Solution:** Make sure you imported the schema correctly. Run:
```bash
psql -U postgres -d alumni_connect -f database-schema.sql
```

### Error: "password authentication failed"
**Solution:** Check your DATABASE_URL has the correct password.

### Error: "too many clients"
**Solution:** Implement connection pooling or use a service like Neon that handles this automatically.

### Error: "syntax error at or near AUTO_INCREMENT"
**Solution:** This error is fixed in the new schema. Make sure you're using the updated `database-schema.sql` file with `GENERATED ALWAYS AS IDENTITY` instead of `AUTO_INCREMENT`.

### Error: "Database connection string provided to neon() is not a valid URL"

**Problem:** You're using the wrong package or incorrect connection string format.

**Solutions:**

1. **Make sure you installed `pg`, not `@neondatabase/serverless`:**
   ```bash
   npm uninstall @neondatabase/serverless
   npm install pg @types/pg
   ```

2. **Check your `.env.local` file exists and has correct format:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/alumni_connect"
   ```
   - No spaces in the connection string
   - Must start with `postgresql://` or `postgres://`
   - Must have all parts: user:password@host:port/database

3. **URL-encode special characters in password:**
   ```env
   # Wrong (password has @)
   DATABASE_URL="postgresql://postgres:p@ssword@localhost:5432/alumni_connect"
   
   # Correct
   DATABASE_URL="postgresql://postgres:p%40ssword@localhost:5432/alumni_connect"
   ```

4. **Test your connection string manually:**
   ```bash
   psql "postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect"
   ```

### Error: "password authentication failed for user postgres"

**Solutions:**

1. **Wrong password in .env.local** - Update with correct password

2. **Reset PostgreSQL password:**
   ```bash
   # Windows: Run as administrator
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   \q
   
   # Update .env.local with new password
   ```

3. **Check pg_hba.conf authentication method:**
   ```bash
   # Find config file location
   psql -U postgres -c "SHOW hba_file"
   
   # Edit the file and ensure local connections use 'md5' or 'scram-sha-256'
   # Look for lines like:
   # local   all   postgres   md5
   # host    all   all   127.0.0.1/32   md5
   ```

### Error: "database alumni_connect does not exist"

**Solution:**
```bash
# Create the database
psql -U postgres
CREATE DATABASE alumni_connect;
\q

# Import schema
psql -U postgres -d alumni_connect -f database-schema.sql
```

### Error: "psql: command not found"

**Solution:** PostgreSQL bin directory is not in your PATH.

**Windows:**
```bash
# Add to PATH environment variable:
C:\Program Files\PostgreSQL\16\bin
```

**Mac/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc:
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
```

### Error: "relation users does not exist"

**Solution:** Schema wasn't imported. Run:
```bash
psql -U postgres -d alumni_connect -f database-schema.sql
```

### Error: "Connection terminated unexpectedly"

**Solutions:**

1. **PostgreSQL service not running:**
   ```bash
   # Windows: Check Services app
   # Mac: brew services start postgresql@16
   # Linux: sudo systemctl start postgresql
   ```

2. **Wrong host/port:**
   ```env
   # Check PostgreSQL is listening on correct port
   # Default is 5432
   DATABASE_URL="postgresql://postgres:password@localhost:5432/alumni_connect"
   ```

3. **Firewall blocking connection** - Allow PostgreSQL port 5432

### Error: "too many clients"

**Solution:** Connection pooling misconfigured or too many open connections.

```typescript
// In lib/db.ts, reduce max connections:
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,  // Reduce from 20
});
```

### Error: Module not found - Cannot find module 'pg'

**Solution:**
```bash
npm install pg @types/pg
```

### Error: Module not found - Cannot find module 'bcrypt'

**Solution:**
```bash
npm install bcrypt @types/bcrypt
```

### Debugging Tips

1. **Enable query logging** in lib/db.ts:
```typescript
export const query = async (text: string, params?: any[]): Promise<any[]> => {
  console.log('[v0] Executing query:', text);
  console.log('[v0] With params:', params);
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
```

2. **Test connection directly with psql:**
```bash
psql -U postgres -d alumni_connect
\dt  # List tables
SELECT * FROM users LIMIT 5;  # Test query
\q
```

3. **Check environment variables are loaded:**
```typescript
// Add to any file temporarily
console.log('[v0] DATABASE_URL:', process.env.DATABASE_URL);
```

4. **Verify PostgreSQL is listening:**
```bash
# Windows
netstat -an | findstr 5432

# Mac/Linux
lsof -i :5432
```

## 📚 Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database `alumni_connect` created
3. ✅ Schema imported (23+ tables + 4 views)
4. ✅ Environment variables configured
5. ✅ Connection tested successfully
6. ✅ College and admin user created
7. ⬜ Implement authentication API routes
8. ⬜ Replace mock data with real database queries
9. ⬜ Add data validation and error handling
10. ⬜ Set up automated backups

**You're now ready to start building with a real database!**

---

**Generated for Alumni Connect Application**  
Compatible with PostgreSQL (Neon, Supabase, local PostgreSQL)  
Last updated: December 2024
