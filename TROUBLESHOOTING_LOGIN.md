# Login Troubleshooting Guide

## Problem: User cannot login after approval

### Step 1: Check User Status in Database

Run this command to see all users and their statuses:

```bash
npm run db:check-users
```

This will show you:
- All registered users
- Their current status (pending, active, inactive, suspended, banned)
- Number of pending vs active users

### Step 2: Manually Approve User

If a user is still showing as 'pending' after admin approval, run:

```bash
npm run db:approve-user
```

This interactive script will:
1. Show all pending users
2. Let you select which user to approve
3. Update their status to 'active'
4. Verify the status change

### Step 3: Test Login with Debug Logs

After approving a user, try logging in and check your terminal where `npm run dev` is running. You should see detailed logs like:

```
[v0] ========== AUTHENTICATION ATTEMPT ==========
[v0] Email: student@example.com
[v0] College ID: 1
[v0] User exists: true
[v0] User details:
  - ID: 5
  - Email: student@example.com
  - Status: active
  - Role: student
  - Has password_hash: true
  - Password hash length: 60
[v0] Active user query result count: 1
[v0] User found, verifying password...
[v0] Password provided length: 8
[v0] Stored hash starts with: $2a$10$abc
[v0] Password valid: true
[v0] ========== AUTHENTICATION SUCCESSFUL ==========
```

### Common Issues:

1. **Status still 'pending'**
   - The approval button click might not be working
   - Use the manual approval script: `npm run db:approve-user`

2. **Password invalid**
   - Make sure you're using the exact password from registration
   - Passwords are case-sensitive

3. **User not found**
   - Check you're selecting the correct college during login
   - Verify the user exists: `npm run db:check-users`

4. **Status is 'active' but still can't login**
   - Check the authentication logs in your terminal
   - The password hash might be corrupted
   - Try re-registering with a new email

### Direct Database Query

You can also check directly in PostgreSQL:

```sql
-- See all users
SELECT id, email, first_name, last_name, role, status FROM users;

-- Manually approve a user
UPDATE users SET status = 'active' WHERE email = 'user@example.com';

-- Check if password hash exists
SELECT id, email, LENGTH(password_hash) as hash_length FROM users;
```

### Need More Help?

If none of these steps work:
1. Check the console logs during both registration and login
2. Verify PostgreSQL is running: `npm run db:test`
3. Ensure the database schema is up to date: `npm run db:update-schema`
4. Check if the user_sessions table exists and has proper permissions
