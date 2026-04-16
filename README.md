# Alumni Connect - Complete Alumni Management Platform

A full-stack Next.js application for managing alumni networks with PostgreSQL database, real-time data synchronization, authentication, community features, events, mentorship, and fundraising.

## Features

- **Authentication System** - Secure login/register with session management and bcrypt password hashing
- **Role-Based Access** - Student, Alumni, and Admin roles with different dashboards
- **Real-Time Data Sync** - SWR-powered automatic updates across all users
- **Community Forum** - Posts, comments, likes, categories, and admin moderation
- **Events Management** - Create, browse, and register for events with capacity tracking
- **Mentorship Program** - Connect students with alumni mentors
- **Fundraising Campaigns** - Create and manage donation campaigns with external payment verification
- **Admin Dashboard** - User management, content moderation, and platform analytics
- **Light/Dark Mode** - Full theme support with custom color palette
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, PostgreSQL with pg driver
- **Real-Time**: SWR for automatic data revalidation and sync
- **Authentication**: Custom session-based auth with HTTP-only cookies
- **Database**: PostgreSQL 14+ with comprehensive schema
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme system

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed and running
- Git for version control

## Local Setup Guide

### Step 1: Download the Project

Download the project from v0.app:

1. Click the three dots in the top right of your block view
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location

**OR** if the project is on GitHub:

```bash
git clone <repository-url>
cd alumni-connect
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- PostgreSQL driver (pg)
- Tailwind CSS v4
- bcryptjs for password hashing
- Shadcn/ui components

### Step 3: Setup PostgreSQL Database

#### 3.1 Create the Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE alumni_connect;

# Connect to the database
\c alumni_connect

# Exit psql
\q
```

#### 3.2 Run the Schema Script

```bash
# Make sure you're in the project directory
npm run db:init
```

This will:
- Create all necessary tables (users, posts, events, etc.)
- Set up foreign keys and constraints
- Create indexes for performance
- Add initial college data

**OR manually run the SQL:**

```bash
psql -U postgres -d alumni_connect -f database-schema.sql
```

#### 3.3 Create Initial Data

```bash
# Create a college
npm run db:setup

# Create an admin user
npm run db:create-admin
```

Follow the prompts to set up your first college and admin account.

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Connection
# IMPORTANT: URL-encode your password if it contains special characters
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Password Encoding Example:**
- If your password is `Mohit@2024`, encode it as `Mohit%402024`
- Use an online URL encoder or:
  - `@` = `%40`
  - `#` = `%23`
  - `$` = `%24`
  - `%` = `%25`
  - `&` = `%26`

### Step 5: Test Database Connection

```bash
npm run db:test
```

You should see:
```
Database connection successful!
Database: alumni_connect
```

### Step 6: Update Schema (if upgrading)

If you're upgrading from an older version or encountering missing column errors:

```bash
npm run db:update-schema
```

This adds any missing fields like `is_reported` for community post moderation.

### Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 8: Create Your First User

1. Go to http://localhost:3000
2. Click "Register" tab
3. Fill in the registration form:
   - First & Last Name
   - Email
   - Password (minimum 6 characters)
   - Select your college (Northbridge University)
   - Select your role (Student or Alumni)
   - Fill in graduation year, degree, and major (if applicable)
4. Click "Create Account"
5. If you're a student/alumni, wait for admin approval
6. If you're an admin, you'll be logged in automatically

## Real-Time Features

The platform implements real-time data synchronization using SWR:

### What Updates Automatically?

- **Community Posts**: New posts, likes, and comments appear within 15 seconds
- **Events**: Event creation and updates visible to all users within 30 seconds
- **User Management**: Admin changes to users reflect immediately
- **Registrations**: Event and workshop registrations update in real-time

### How It Works

- No manual page refresh needed
- Background revalidation on intervals
- Optimistic UI updates for instant feedback
- Automatic error recovery and retry logic

**Example:** When an alumni creates an event, all students see it in their events list automatically within 30 seconds without refreshing the page.

## User Roles & Features

### Student Dashboard
- View network connections and stats
- Apply for alumni status
- Find mentors
- Join community discussions
- Browse and register for events
- Track achievements

### Alumni Dashboard
- Mentor students
- Create and share posts
- Host events
- Donate to fundraising campaigns
- View mentorship stats
- Contribute to community

### Admin Dashboard
- Manage all users (view, edit, suspend, delete)
- Review alumni applications
- Moderate community content
- Create and manage events
- Manage fundraising campaigns
- View platform analytics
- System-wide settings

## Database Management

### Backup Database

```bash
# Backup entire database
pg_dump -U postgres alumni_connect > backup.sql

# Restore from backup
psql -U postgres alumni_connect < backup.sql
```

### Update Schema

```bash
# Add missing columns or tables
npm run db:update-schema
```

### Reset Database

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS alumni_connect;"
psql -U postgres -c "CREATE DATABASE alumni_connect;"

# Run schema again
npm run setup
```

### View Database Tables

```bash
psql -U postgres -d alumni_connect

# List all tables
\dt

# Describe a table
\d users

# View data
SELECT * FROM users;
```

## Deployment to Vercel

### Prerequisites
- Vercel account (free tier available)
- PostgreSQL database (use Neon, Supabase, or Vercel Postgres)

### Step 1: Setup Production Database

Option A: **Neon Database** (Recommended - Free Tier)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

Option B: **Vercel Postgres**
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

Option C: **Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Get the connection string from Project Settings > Database

### Step 2: Deploy to Vercel

#### Via v0.app (Easiest)
1. Click "Publish" button in the top right of v0
2. Connect your Vercel account
3. Add environment variable: `DATABASE_URL`
4. Click "Deploy"

#### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
```

#### Via GitHub Integration
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variable: `DATABASE_URL`
5. Deploy

### Step 3: Setup Production Database Schema

```bash
# Install production database schema
psql <YOUR_PRODUCTION_DATABASE_URL> -f database-schema.sql

# OR use the setup scripts
DATABASE_URL=<YOUR_PRODUCTION_DATABASE_URL> npm run db:init
DATABASE_URL=<YOUR_PRODUCTION_DATABASE_URL> npm run db:setup
```

### Step 4: Verify Deployment

1. Visit your production URL
2. Register a new admin user
3. Test key features:
   - Login/logout
   - Create posts
   - Create events
   - User management

## Troubleshooting

### Database Connection Errors

**Error: Database connection string is not a valid URL**

Solution: Make sure your password is URL-encoded in `.env.local`

```env
# Wrong
DATABASE_URL=postgresql://postgres:Mohit@2024@localhost:5432/alumni_connect

# Correct
DATABASE_URL=postgresql://postgres:Mohit%402024@localhost:5432/alumni_connect
```

**Error: Cannot connect to database**

Solutions:
1. Make sure PostgreSQL is running: `pg_ctl status`
2. Check if the database exists: `psql -U postgres -l`
3. Verify your credentials
4. Check if PostgreSQL is listening on port 5432

### Schema Errors

**Error: column "is_reported" does not exist**

Solution: Run the schema update script

```bash
npm run db:update-schema
```

**Error: relation "community_posts" does not exist**

Solution: Run the full setup

```bash
npm run setup
```

### Authentication Errors

**Error: Session not found / Unauthorized**

Solutions:
- Clear browser cookies
- Logout and login again
- Verify you selected the correct role during login

**Error: Access Denied in admin pages**

Solutions:
- Make sure you're logged in as admin
- Check database: `SELECT role FROM users WHERE email = 'your@email.com';`
- Logout and login again with Admin role selected

### Build Errors

**Error: Module not found**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Error: TypeScript compilation errors**

```bash
# Check TypeScript
npm run build
```

### Runtime Errors

**Error: 500 Internal Server Error on API routes**

- Check server logs in terminal for detailed error messages
- Verify database schema is up to date: `npm run db:update-schema`
- Check environment variables are set correctly
- Test database connection: `npm run db:test`

## Project Structure

```
alumni-connect/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes group
│   ├── admin/                    # Admin dashboard pages
│   ├── alumni/                   # Alumni dashboard pages
│   ├── student/                  # Student dashboard pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── posts/                # Community posts endpoints
│   │   ├── events/               # Events endpoints
│   │   ├── mentorship/           # Mentorship endpoints
│   │   └── fundraising/          # Fundraising endpoints
│   ├── layout.tsx                # Root layout with theme provider
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles with theme variables
├── components/                   # React components
│   ├── auth/                     # Auth forms and components
│   ├── community/                # Community/forum components
│   ├── dashboard/                # Dashboard widgets
│   ├── events/                   # Event components
│   ├── layout/                   # Layout components (Sidebar, etc.)
│   └── ui/                       # Shadcn UI components
├── lib/                          # Utility libraries
│   ├── db.ts                     # PostgreSQL connection
│   ├── db-helpers.ts             # Database query helpers
│   ├── auth-db.ts                # Authentication database functions
│   ├── session-helper.ts         # Session management
│   └── utils.ts                  # Utility functions
├── scripts/                      # Database setup scripts
│   ├── test-connection.ts        # Test database connection
│   ├── setup-college.ts          # Create initial college
│   └── create-admin.ts           # Create admin user
├── database-schema.sql           # Complete database schema
├── DATABASE_SETUP_GUIDE.md       # Detailed database guide
├── middleware.ts                 # Route protection middleware
├── .env.local.example            # Environment variables template
└── package.json                  # Dependencies and scripts
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # Check TypeScript types

# Database
npm run db:test          # Test database connection
npm run setup            # Full database setup (schema + data)
npm run db:update-schema # Add missing columns/tables to existing database
npm run db:create-admin  # Create additional admin user
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/session` - Get current user session
- `PATCH /api/users/me` - Update user profile

### Community
- `GET /api/posts` - Get all posts (with SWR auto-refresh)
- `POST /api/posts` - Create new post
- `POST /api/posts/[id]/like` - Like a post
- `DELETE /api/posts/[id]/like` - Unlike a post
- `POST /api/posts/[id]/pin` - Pin post (admin only)
- `POST /api/posts/[id]/resolve` - Resolve report (admin only)
- `DELETE /api/posts/[id]` - Delete/archive post (admin only)
- `GET /api/posts/[id]/comments` - Get post comments
- `POST /api/posts/[id]/comments` - Add comment

### Events
- `GET /api/events` - Get all events (with SWR auto-refresh)
- `POST /api/events` - Create new event (alumni/admin only)
- `POST /api/events/[id]/register` - Register for event
- `DELETE /api/events/[id]/register` - Unregister from event

### Admin
- `GET /api/users` - Get all users (admin only, with SWR)
- `POST /api/users/[id]/activate` - Activate user (admin only)
- `POST /api/users/[id]/suspend` - Suspend user (admin only)
- `DELETE /api/users/[id]/delete` - Delete user (admin only)

### Mentorship
- `GET /api/mentorship/requests` - Get mentorship requests
- `POST /api/mentorship/requests` - Create mentorship request
- `PATCH /api/mentorship/requests/[id]/status` - Accept/reject request

### Fundraising
- `GET /api/fundraising/campaigns` - Get campaigns
- `POST /api/fundraising/campaigns` - Create campaign (admin only)
- `POST /api/fundraising/donations` - Make donation

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to Git
2. **Database Credentials**: Use strong passwords and URL-encode special characters
3. **Session Management**: Sessions expire after 7 days, HTTP-only cookies
4. **Password Hashing**: Uses bcrypt with salt rounds for secure password storage
5. **Input Validation**: All API endpoints validate and sanitize input
6. **SQL Injection Prevention**: Uses parameterized queries exclusively
7. **Role-Based Access Control**: Server-side verification on all protected routes
8. **CORS**: Configured for same-origin requests

## Support

For issues or questions:
1. Check this README first
2. Review SETUP_INSTRUCTIONS.md for quick setup
3. Check DATABASE_SETUP_GUIDE.md for database-specific issues
4. Review the troubleshooting section above
5. Check error logs in the terminal

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- Next.js - React framework
- PostgreSQL - Database
- SWR - Real-time data fetching
- Tailwind CSS v4 - Styling
- Shadcn/ui - UI components
- Radix UI - Accessible primitives
- Lucide - Icons
