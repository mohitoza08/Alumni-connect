# Troubleshooting Guide - Alumni Connect

Common issues and their solutions.

## Database Connection Issues

### Error: "DATABASE_URL is undefined"

**Cause:** Missing .env.local file or DATABASE_URL not set

**Solution:**
```bash
# Copy example file
copy .env.local.example .env.local   # Windows
cp .env.local.example .env.local     # Mac/Linux

# Edit .env.local and set your password
DATABASE_URL="postgresql://postgres:YourPassword@localhost:5432/alumni_connect"
```

### Error: "client password must be a string"

**Cause:** Special characters in password need URL encoding

**Solution:**
URL-encode special characters in your password:
- `@` becomes `%40`
- `:` becomes `%3A`
- `/` becomes `%2F`
- `#` becomes `%23`
- `?` becomes `%3F`
- `&` becomes `%26`

Example:
- Password: `P@ss:word#123`
- Encoded: `P%40ss%3Aword%23123`
- Full URL: `postgresql://postgres:P%40ss%3Aword%23123@localhost:5432/alumni_connect`

### Error: "database does not exist"

**Cause:** Database 'alumni_connect' hasn't been created

**Solution:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE alumni_connect;"

# Verify it exists
psql -U postgres -l
```

### Error: "relation 'colleges' does not exist"

**Cause:** Database schema hasn't been imported

**Solution:**
```bash
# Import the schema
psql -U postgres -d alumni_connect -f database-schema.sql

# Verify tables exist
psql -U postgres -d alumni_connect -c "\dt"
```

### Error: "connection refused" or "could not connect to server"

**Cause:** PostgreSQL is not running

**Solution:**

**Windows:**
1. Open Services (Win + R, type `services.msc`)
2. Find "postgresql-x64-XX"
3. Right-click → Start

**Mac:**
```bash
brew services start postgresql@16
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Error: "password authentication failed"

**Cause:** Wrong password or user doesn't exist

**Solution:**
```bash
# Reset postgres password
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';

# Then update .env.local with the new password
```

## Setup Script Issues

### Error: "College already exists"

**Not an error!** This means the college is already set up. Skip to creating users.

### Error: "User with this email already exists"

**Solution:** Use a different email or login with existing credentials.

### Can't run scripts with `npm run`

**Cause:** Missing tsx or script files

**Solution:**
```bash
# Reinstall dependencies
npm install

# Verify tsx is installed
npx tsx --version
```

## Application Issues

### Pages show "No data" or empty lists

**Cause:** Database is empty or not connected

**Solution:**
1. Check connection: `npm run db:test`
2. Check if tables have data:
```bash
psql -U postgres -d alumni_connect
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM colleges;
```

### Login fails with correct credentials

**Cause:** Password hash mismatch or user not verified

**Solution:**
```bash
# Check user status
psql -U postgres -d alumni_connect
SELECT email, status, email_verified FROM users WHERE email = 'your@email.com';

# Update if needed
UPDATE users SET status = 'active', email_verified = true WHERE email = 'your@email.com';
```

### "Session expired" after login

**Cause:** JWT secret issue or cookie settings

**Solution:**
1. Clear browser cookies
2. Try in incognito/private mode
3. Check .env.local has valid DATABASE_URL

## Development Server Issues

### Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Changes not reflecting

**Solution:**
1. Stop server (Ctrl + C)
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

## Deployment Issues (Vercel)

### Build fails with database error

**Cause:** DATABASE_URL not set in Vercel

**Solution:**
1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add `DATABASE_URL` with your production database URL
4. Redeploy

### Database connection timeout

**Cause:** Using localhost URL in production

**Solution:**
Use a cloud PostgreSQL provider:
- **Neon** (Recommended): https://neon.tech
- **Vercel Postgres**: From Vercel dashboard
- **Supabase**: https://supabase.com

## Still Having Issues?

### Run Full Validation
```bash
npm run validate
```

This will check:
- .env.local exists
- DATABASE_URL is set
- PostgreSQL is accessible
- Database schema is loaded
- Initial data exists

### Check Logs
```bash
# Development logs
npm run dev

# Database query logs (add to lib/db.ts temporarily)
console.log('[v0] Query:', text, params)
```

### Quick Reset (Nuclear Option)
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS alumni_connect;"
psql -U postgres -c "CREATE DATABASE alumni_connect;"
psql -U postgres -d alumni_connect -f database-schema.sql
npm run db:setup
```

### Get Help
- Check README.md for setup guide
- Review DATABASE_SETUP_GUIDE.md for detailed database info
- Check error messages carefully - they often contain the solution!
