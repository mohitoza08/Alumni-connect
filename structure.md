# AlumniConnect - Project Structure

## Overview

AlumniConnect is a full-stack alumni management platform built with Next.js 14, featuring role-based dashboards, community forums, mentorship programs, event management, and fundraising capabilities.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Shadcn/ui + Radix UI | UI components |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Server-side logic |
| PostgreSQL | Primary database |
| pg (node-postgres) | PostgreSQL driver |

### Authentication & Security
| Technology | Purpose |
|------------|---------|
| bcryptjs | Password hashing |
| Custom sessions | HTTP-only cookie-based auth |
| Zod | Input validation |

### Additional Libraries
| Technology | Purpose |
|------------|---------|
| SWR | Real-time data fetching/sync |
| React Hook Form | Form handling |
| Recharts | Data visualization |   
| date-fns | Date manipulation |
| AI SDK | AI-powered features |

---

## Project Directory Structure

```
AlumniConnect/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── admin/                    # Admin dashboard pages
│   ├── alumni/                   # Alumni dashboard pages
│   ├── student/                 # Student dashboard pages
│   ├── portal/                   # User portal pages
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components (90+)
│   ├── auth/                     # Authentication components
│   ├── community/                # Community/forum components
│   ├── dashboard/                # Dashboard widgets
│   ├── events/                   # Event components
│   ├── forum/                    # Forum-specific components
│   ├── gamification/              # Gamification components
│   ├── layout/                   # Layout components (Sidebar, etc.)
│   ├── notifications/            # Notification components
│   ├── portal/                   # Portal components
│   ├── streaks/                  # Streak tracking components
│   ├── theme-provider.tsx         # Theme context provider
│   └── mode-toggle.tsx            # Theme toggle
│
├── lib/                          # Backend utilities
│   ├── db.ts                     # PostgreSQL connection pool
│   ├── db-helpers.ts             # Database query helpers
│   ├── auth-db.ts                # Auth database functions
│   ├── session.ts                # Session management
│   ├── session-helper.ts         # Session utilities
│   ├── auth.ts                   # Auth types and mock data
│   ├── events.ts                 # Event-related functions
│   ├── forum.ts                  # Forum/community functions
│   ├── mentorship.ts             # Mentorship functions
│   ├── gamification.ts           # Gamification logic
│   ├── swr-config.tsx            # SWR configuration
│   ├── mock-db.ts                # Mock database for testing
│   ├── mock-database.ts          # Additional mock data
│   └── utils.ts                  # General utilities
│
├── scripts/                      # Database setup scripts
│   ├── setup-database.ts         # Initial DB setup
│   ├── setup-college.ts          # Create sample college
│   ├── create-admin.ts           # Create admin user
│   ├── test-connection.ts        # Test DB connection
│   ├── update-schema.ts          # Update DB schema
│   ├── check-user-status.ts      # Check user approval status
│   ├── approve-user-manual.ts    # Manual user approval
│   ├── validate-setup.ts        # Validate setup
│   └── debug-user.ts             # Debug user issues
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts            # Mobile detection
│   └── use-toast.ts             # Toast notifications
│
├── public/                       # Static assets
│
├── styles/                       # Additional styles
│
├── database-schema.sql          # Complete PostgreSQL schema
├── middleware.ts                # Route protection middleware
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── tailwind.config.ts           # Tailwind config
```

---

## API Routes Structure

All API routes are located in `app/api/`:

### Authentication (`/api/auth/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/refresh` | POST | Refresh session |
| `/api/auth/sso` | POST | Single sign-on |

### Session (`/api/session/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/session` | GET | Get current session |

### Users (`/api/users/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List all users (admin) |
| `/api/users/me` | GET/PATCH | Get/update current user |
| `/api/users/[id]/activate` | POST | Activate user |
| `/api/users/[id]/suspend` | POST | Suspend user |
| `/api/users/[id]/delete` | DELETE | Delete user |

### Posts (`/api/posts/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET | List posts |
| `/api/posts` | POST | Create post |
| `/api/posts/[id]` | DELETE | Delete post |
| `/api/posts/[id]/like` | POST/DELETE | Like/unlike post |
| `/api/posts/[id]/pin` | POST | Pin post |
| `/api/posts/[id]/comments` | GET/POST | Get/add comments |

### Events (`/api/events/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | List events |
| `/api/events` | POST | Create event |
| `/api/events/[id]/register` | POST/DELETE | Register/unregister |

### Mentorship (`/api/mentorship/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mentorship/requests` | GET/POST | Mentorship requests |
| `/api/mentorship/requests/[id]` | PATCH | Update request status |

### Fundraising (`/api/fundraising/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fundraising/campaigns` | GET/POST | List/create campaigns |
| `/api/fundraising/donations` | POST | Make donation |

### Admin (`/api/admin/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Dashboard stats |
| `/api/admin/analytics` | GET | Platform analytics |

### Additional APIs
| Endpoint | Description |
|----------|-------------|
| `/api/applications/` | Alumni applications |
| `/api/achievements/` | User achievements |
| `/api/notifications/` | User notifications |
| `/api/streak/` | Streak tracking |
| `/api/ai/` | AI features |
| `/api/campaigns/` | Fundraising campaigns |
| `/api/donations/` | Donation records |
| `/api/workshops/` | Premium workshops |

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `colleges` | Participating colleges/universities |
| `users` | User accounts (admin, alumni, student) |
| `applications` | Student alumni applications |
| `user_sessions` | Session management |

### Community Tables

| Table | Description |
|-------|-------------|
| `community_posts` | Discussion posts |
| `post_likes` | Post likes |
| `post_comments` | Post comments |

### Feature Tables

| Table | Description |
|-------|-------------|
| `mentorships` | Mentor-mentee relationships |
| `mentorship_requests` | Mentorship requests |
| `mentorship_sessions` | Individual sessions |
| `events` | Events and workshops |
| `event_registrations` | Event registrations |
| `fundraising_campaigns` | Donation campaigns |
| `donations` | Donation records |
| `donation_requests` | External payment verification |
| `achievements` | User achievements |
| `notifications` | System notifications |
| `messages` | In-app messaging |
| `workshops` | Premium workshops |
| `workshop_registrations` | Workshop registrations |
| `subscriptions` | Premium memberships |
| `resume_enhancements` | AI resume tracking |

### Gamification Tables

| Table | Description |
|-------|-------------|
| `user_badges` | Earned badges |
| `user_streaks` | Daily activity tracking |

### System Tables

| Table | Description |
|-------|-------------|
| `analytics_metrics` | Aggregated analytics |
| `system_settings` | Configuration settings |

---

## User Roles & Dashboards

### 1. Admin Dashboard (`/admin`)
- User management (view, edit, suspend, delete)
- Alumni application review
- Content moderation
- Event management
- Fundraising campaign management
- Platform analytics
- System settings

### 2. Alumni Dashboard (`/alumni`)
- Mentor students
- Create posts
- Host events
- Donate to campaigns
- View mentorship stats
- Community participation

### 3. Student Dashboard (`/student`)
- View network connections
- Apply for alumni status
- Find mentors
- Join discussions
- Browse events
- Track achievements

---

## How It Works

### Authentication Flow
1. User registers at `/register`
2. Password hashed with bcrypt
3. User record created in `users` table
4. Session created with HTTP-only cookie
5. User redirected to role-specific dashboard

### Data Fetching (SWR)
1. Client requests data via SWR hook
2. SWR caches response
3. Background revalidation on interval
4. Optimistic UI updates
5. Automatic error recovery

### Role-Based Access
1. Middleware checks session cookie
2. Validates user role from database
3. Grants/denies access to routes
4. API routes verify permissions server-side

### Real-Time Updates
- SWR polls for updates every 30 seconds
- New posts/comments appear automatically
- Event registrations sync instantly
- Admin changes reflect immediately

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with theme provider |
| `middleware.ts` | Route protection |
| `lib/db.ts` | Database connection |
| `lib/auth-db.ts` | Auth database functions |
| `database-schema.sql` | Complete DB schema |
