# Alumni Connect - Quick Setup Guide

Follow these steps to get your Alumni Connect platform running locally with PostgreSQL.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- A terminal/command prompt

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

#### Create the Database

```bash
# Login to PostgreSQL (Windows/Mac/Linux)
psql -U postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE alumni_connect;

# Exit PostgreSQL
\q
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and add your PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_connect"
```

**Important:** If your password contains special characters (@, #, $, etc.), you must URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`

Example: If your password is `Admin@123`, use `Admin%40123`

### 4. Initialize Database Schema and Data

```bash
# This will create all tables and add initial data
npm run setup
```

This script will:
- Create all database tables (users, posts, events, etc.)
- Add a default college (Northbridge University)
- Create a default admin user

**Default Admin Credentials:**
- Email: `admin@northbridge.edu`
- Password: `admin123`
- College: Northbridge University (select first option)

### 5. Update Schema (if upgrading from older version)

```bash
# This adds any missing columns or tables
npm run db:update-schema

# If you're getting mentorship_requests errors, also run:
npm run db:add-mentorship
```

This ensures your database has all the latest features like community post moderation and mentorship requests table.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Register Your First User

1. Go to the homepage
2. Click the "Register" tab
3. Fill in your details:
   - First & Last Name
   - Email address
   - Password (minimum 6 characters)
   - Select "Northbridge University" as your college
   - Choose your role (Student or Alumni)
   - Add graduation year, degree, and major if applicable
4. Click "Create Account"

**Note:** New student and alumni registrations require admin approval. You can:
- Use the default admin account to approve your registration
- OR register as an admin (admins are auto-approved)

### 8. Login as Admin (Optional)

To manage users and approve registrations:

1. Login with admin credentials:
   - Email: `admin@northbridge.edu`
   - Password: `admin123`
   - College: Northbridge University
   - Role: Admin
2. Go to Admin Dashboard → User Management
3. Approve pending registrations

## Real-Time Data Sync

The platform uses SWR (Stale-While-Revalidate) for real-time data synchronization:

- **Community Posts**: Updates automatically every 15 seconds
- **Events**: Changes reflect across all users within 30 seconds
- **User Lists**: Admin changes visible to all users in real-time
- **No page refresh needed**: Data updates happen in the background

When one user creates an event, post, or makes changes, all other logged-in users will see the updates automatically.

## Troubleshooting

### Can't connect to database

**Error:** `connection refused` or `cannot connect to server`

**Solution:**
1. Make sure PostgreSQL is running:
   ```bash
   # Windows (in Services)
   # Search for "Services" and start "postgresql-x64-14"
   
   # Mac
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. Verify PostgreSQL is listening:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

### Database doesn't exist

**Error:** `database "alumni_connect" does not exist`

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE alumni_connect;"
```

### Wrong password in .env.local

**Error:** `password authentication failed`

**Solution:**
1. Make sure you're using the correct PostgreSQL password
2. URL-encode special characters in your password
3. Test your credentials:
   ```bash
   psql -U postgres -d alumni_connect
   ```

### Tables not created

**Error:** `relation "users" does not exist`

**Solution:**
```bash
# Run the setup script again
npm run setup
```

### Missing columns in tables

**Error:** `column "is_reported" does not exist`

**Solution:**
```bash
# Run the schema update script
npm run db:update-schema
```

### Missing mentorship_requests table

**Error:** `relation "mentorship_requests" does not exist`

**Solution:**
```bash
# Add the mentorship_requests table
npm run db:add-mentorship

# Or run the complete database setup which includes all tables
npm run setup
```

### Port 3000 already in use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Use a different port
PORT=3001 npm run dev
```

### Registration fails

**Error:** `Registration failed` or timeout

**Solution:**
1. Check database connection: `npm run db:test`
2. Verify all required fields are filled
3. Check browser console and terminal for detailed error messages
4. Make sure the college ID exists in the database

### Access Denied in Admin Pages

**Issue:** Admin pages show "Access Denied"

**Solution:**
1. Clear browser cookies
2. Logout and login again as admin
3. Make sure you selected "Admin" role during login
4. Verify your user has `role = 'admin'` in the database

## Next Steps

After setup, you can:

1. **Explore Features:**
   - Create posts in the community forum
   - Set up events
   - Create fundraising campaigns
   - Manage mentorship programs

2. **Customize Your Instance:**
   - Add your own colleges (see Admin Dashboard → Colleges)
   - Customize the theme colors in `app/globals.css`
   - Update branding and text

3. **Add More Data:**
   - Register multiple users
   - Create sample events and posts
   - Test the mentorship workflow

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run setup            # Full database setup (schema + data)
npm run db:test          # Test database connection
npm run db:update-schema # Add missing columns/tables to existing database
npm run db:add-mentorship # Add mentorship_requests table

# Verify installation
node --version          # Should be 18+
psql --version          # Should be 14+
npm --version           # Check npm is installed
```

## Getting Help

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review the full README.md for detailed information
3. Check the DATABASE_SETUP_GUIDE.md for database-specific help
4. Ensure all prerequisites are installed and running

## Security Notes

- Never commit `.env.local` to version control
- Change the default admin password after first login
- Use strong passwords for new accounts
- Keep your PostgreSQL password secure

---

Congratulations! Your Alumni Connect platform is now ready to use. 🎉
