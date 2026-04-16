# Quick Start Guide - Alumni Connect

Get up and running in 5 minutes!

## 1. Download & Install

```bash
# Extract the downloaded ZIP or clone from GitHub
cd alumni-connect

# Install dependencies
npm install
```

## 2. Setup PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE alumni_connect;"

# Run schema
psql -U postgres -d alumni_connect -f database-schema.sql
```

## 3. Configure Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect
```

**Important:** URL-encode your password! Example:
- `Mohit@2024` becomes `Mohit%402024`

## 4. Initialize Data

```bash
# Create initial college and admin user
npm run db:setup

# Follow prompts to set:
# - College name
# - Admin email
# - Admin password
```

## 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## 6. Test It Out

1. Go to the homepage
2. Click "Register" tab
3. Create a test student account
4. Explore the dashboard!

## Common Commands

```bash
# Start development server
npm run dev

# Test database connection
npm run db:test

# Create another admin
npm run db:create-admin

# Build for production
npm run build
```

## Deploy to Vercel (Optional)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variable: `DATABASE_URL` (use Neon or Vercel Postgres)
5. Deploy!

## Need Help?

- Check README.md for detailed setup
- Check DATABASE_SETUP_GUIDE.md for database issues
- Review error messages in terminal

That's it! You're ready to go!
