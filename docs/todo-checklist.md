# Alumni Connect Portal – TODO Checklist

Legend:
- [x] Done (present in codebase or clearly implemented)
- [ ] Pending (not found or not fully implemented)

Note: This workspace runs with no external integrations per user request. Current server features should be treated as in-memory/mock where applicable.

## Auth & College Login
- [x] Basic login page and flow (server route: /api/auth/login)
- [ ] Register endpoint (/api/auth/register)
- [ ] Refresh endpoint (/api/auth/refresh)
- [ ] College SSO endpoint (/api/auth/college-sso)
- [x] College + Role selection on login (UI present in portal login)
- [ ] Persist session across reload with secure tokens (non-mock)

## Roles & Dashboards
- [x] Student dashboard page
  - [ ] Profile view/edit + resume upload
  - [ ] AI resume/profile enhancer integration on Student dashboard
  - [ ] Fundraising: view campaigns, submit donation request
  - [x] Events/workshops: view pages (student/events)
  - [ ] Premium subscription purchase flow
  - [ ] Notifications panel (wired to backend)
  - [ ] Streaks widget (daily login)
- [x] Alumni dashboard page
  - [ ] Alumni directory (search/filter)
  - [ ] Login streak check-in + leaderboard
  - [x] Events/workshops page (alumni/events)
  - [ ] Support or create fundraising campaigns
  - [ ] Mentor requests + in-app messaging
  - [ ] Notifications & achievements wired
- [x] Admin dashboard page
  - [x] Users page shell (admin/users)
  - [x] Analytics page shell (admin/analytics)
  - [ ] Manage users (CRUD + roles)
  - [ ] Approve/edit campaigns & events
  - [ ] Verify donation requests (approve/reject + notes)
  - [ ] Manage premium workshops/subscriptions
  - [ ] Send targeted/global notifications

## Fundraising (External Payment + Admin Verification)
- [x] Campaigns model and endpoints (/api/campaigns)
- [x] Donor-facing: “Make payment externally, then submit transaction reference” form
- [x] Verification route present (api/fundraising/donations/[id]/verify)
- [x] Donations route present (api/fundraising/donations)
- [x] Separate donation_requests vs verified donations data model
- [x] Update campaign.collected_amount only on admin verification
- [x] Donor notifications after admin action (in-app)
- [x] Admin list of pending donation requests with verify/reject + notes

## AI Resume Enhancer
- [x] API endpoint: /api/ai/enhance-resume (mock AI without external key)
- [x] UI: before/after diff and skills suggestion
- [x] Connect UI to endpoint with loading/error states

## Events / Premium Subscriptions
- [x] Workshops/events endpoint present (api/workshops)
- [x] Student/Alumni events pages exist
- [ ] Registration flow (external payment → proof submit)
- [ ] Admin verification of registrations
- [ ] Capacity tracking and purchased status
- [ ] Premium subscription “upgrade” UX (mock)

## Notifications
- [x] Notifications endpoint present (api/notifications)
- [ ] In-app notifications UI (panel, unread badge)
- [ ] Mark-as-read endpoint wired in UI
- [ ] Email notifications (mock queue + template)

## Streaks
- [ ] Streak check-in endpoint (/api/streak/checkin)
- [ ] Streak tracking per user (students, alumni)
- [ ] Achievements + badges UI
- [ ] Leaderboard for alumni

## Admin Analytics
- [x] Analytics page shell present (admin/analytics)
- [ ] Metrics: donations verified, registrations, streaks, users
- [ ] Charts wired to backend data

## API Endpoints (Spec Parity)
- [ ] /api/auth/register
- [x] /api/auth/login
- [ ] /api/auth/refresh
- [ ] /api/auth/college-sso
- [x] POST /api/campaigns/:id/donation-requests
- [x] GET/PUT verify donations (present under /api/fundraising/donations and /verify)
- [x] GET /api/campaigns/:id/donations (verified-only)
- [x] /api/workshops
- [ ] POST /api/events/:id/register
- [x] /api/ai/enhance-resume
- [x] /api/notifications (list/create)
- [ ] /api/notifications/:id/read
- [x] /api/users/me
- [ ] /api/streak/checkin

## Data Layer (Current: In-Memory/Mock)
- [ ] PostgreSQL schema migration files (users, campaigns, donation_requests, donations, events, purchases, notifications)
- [ ] Persistence layer (SQL or integration) – intentionally deferred
- [ ] Seed scripts for demo data

## UI/UX & Styling
- [x] Mobile-first pages and layouts exist
- [ ] Color theme strictly matches spec:
  - Primary: #1A56DB
  - Accent: #10B981
  - Background: #F9FAFB
  - Cards: #FFFFFF
  - Headings: #111827
  - Body: #374151
  - Alerts: #EF4444
- [x] Dashboard layout scaffold (sidebar + top bar)
- [x] Clear donor instruction copy on donation form:
  “Complete payment externally, then submit transaction reference here for admin verification.”

---

## Next Suggested Milestones
1) Fundraising MVP
   - [x] Campaign list + details pages
   - [x] Donation request form (external ref + receipt upload)
   - [x] Admin verification UI + flow; update totals
   - [x] Donor notifications on verify/reject
2) AI Resume Enhancer (Mock)
   - [x] /api/ai/enhance-resume (no external key)
   - [x] UI with before/after + skills
3) Streaks
   - [ ] /api/streak/checkin + daily tracking
   - [ ] Achievements + leaderboard (alumni)
4) Events/Premium
   - [ ] Registration (external payment) + proof submit
   - [ ] Admin verification + capacity; premium upgrade UX
5) Notifications
   - [ ] In-app panel + read/unread; email mock
