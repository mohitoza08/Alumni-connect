# Alumni Connect - Donation Flow Setup

## Overview
Implemented a complete donation flow where alumni send payment requests first, then admin verifies before the donation is added to the campaign. Uses UPI/QR-based manual payment (no payment gateway integration).

## Database Schema
All tables already exist in `database-schema.sql`:
- `fundraising_campaigns` - Campaign details with goal_amount, current_amount, donor_count
- `donation_requests` - Pending payment requests from alumni
- `donations` - Verified/completed donations
- `notifications` - User notifications for approve/reject events

---

## Files Modified

### 1. API Routes

#### `app/api/campaigns/[id]/donation-requests/route.ts`
- **GET**: Fetch donation requests for a campaign (filtered by user role)
- **POST**: Create new donation request with fields:
  - campaign_id, donor_id, donor_name, donor_email
  - amount, currency, is_anonymous, payment_method
  - transaction_reference, receipt_url, message
  - status = 'pending'

#### `app/api/campaigns/[id]/donation-requests/[requestId]/verify/route.ts`
- **POST**: Admin verifies donation request
  - Updates donation_requests: status = 'verified', verified_by, verified_at
  - Inserts into donations table with full details
  - Updates fundraising_campaigns: current_amount += amount, donor_count += 1
  - Creates notification for donor: "Donation Approved"

#### `app/api/campaigns/[id]/donation-requests/[requestId]/reject/route.ts`
- **POST**: Admin rejects donation request
  - Updates donation_requests: status = 'rejected', admin_notes
  - Creates notification for donor: "Donation Rejected" with reason

#### `app/api/donations/top-donors/route.ts` (NEW)
- **GET**: Returns top 20 donors sorted by total amount
  - Fields: donor_id, donor_name, is_anonymous, total_amount, donation_count

#### `app/api/admin/donation-requests/route.ts` (NEW)
- **GET**: Returns all donation requests for admin dashboard

---

### 2. React Components

#### `components/portal/alumni-campaign-donate.tsx` (UPDATED)
- Added Top Donors section showing top 6 donors
- Enhanced donation form with:
  - Campaign selector (disables ended campaigns)
  - Amount input with validation
  - Payment method dropdown (UPI/GPay/PhonePe/BankTransfer)
  - Transaction reference (auto-generated if empty)
  - Message textarea
  - Anonymous donation checkbox
  - Receipt/payment proof file upload
- Payment modal with QR code placeholder and instructions
- Pending requests list showing status (pending/verified/rejected)
- Real-time updates with SWR

#### `components/portal/admin-campaign-verify.tsx` (UPDATED)
- Campaign filter dropdown
- Donation requests list with:
  - Amount, donor name/email, payment method, date
  - Message display
  - Transaction reference
  - Receipt link (if uploaded)
  - Status badge (pending/verified/rejected)
- Approve button - instantly verifies donation
- Reject button - opens modal to enter rejection reason
- Shows admin notes on rejected requests

---

### 3. Pages

#### `app/alumni/fundraising/page.tsx`
- Uses updated `AlumniCampaignDonate` component

#### `app/admin/fundraising/page.tsx`
- Uses updated `AdminCampaignVerify` component

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ALUMNI SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│  1. View active campaigns with progress bars                   │
│  2. Click "Contribute" → Fill form:                            │
│     - Amount, Payment Method, Message                          │
│     - Anonymous checkbox                                        │
│     - Upload receipt (optional)                                │
│  3. Submit → Creates donation_request (status='pending')       │
│  4. Modal shows:                                                │
│     - QR Code placeholder                                       │
│     - Instructions to pay via UPI                              │
│     - Transaction reference                                     │
│  5. Click "I Have Paid" → Request submitted                    │
│  6. Wait for admin notification                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│  1. View pending donation requests                             │
│  2. See: amount, donor, payment method, message, ref         │
│  3. Options:                                                   │
│     ✓ APPROVE:                                                 │
│       - status → 'verified'                                    │
│       - Insert into donations table                            │
│       - Update campaign: current_amount += amount              │
│       - Update campaign: donor_count += 1                      │
│       - Notify donor: "Donation Approved"                      │
│                                                                 │
│     ✕ REJECT:                                                  │
│       - status → 'rejected'                                    │
│       - Add admin_notes (reason)                               │
│       - Notify donor: "Donation Rejected: {reason}"            │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Summary

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/campaigns/[id]/donation-requests` | GET | Alumni/Admin | Get requests for campaign |
| `/api/campaigns/[id]/donation-requests` | POST | Alumni | Create donation request |
| `/api/campaigns/[id]/donation-requests/[id]/verify` | POST | Admin | Approve donation |
| `/api/campaigns/[id]/donation-requests/[id]/reject` | POST | Admin | Reject donation |
| `/api/donations/top-donors` | GET | Public | Get top donors list |
| `/api/admin/donation-requests` | GET | Admin | Get all requests |

---

## Security Features

- **Role-based access**: Only alumni/students can create requests, only admins can verify/reject
- **Session validation**: All routes check `getServerSession()`
- **Parameterized queries**: Prevents SQL injection
- **Campaign validation**: Checks campaign is active before allowing donation
- **Input validation**: Validates amount > 0, required fields present

---

## SQL Queries Used

### Create donation request:
```sql
INSERT INTO donation_requests (
  campaign_id, donor_id, donor_name, donor_email, amount, currency, 
  is_anonymous, payment_method, transaction_reference, receipt_url, message, status
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
```

### Verify donation (transaction):
```sql
BEGIN;
-- 1. Update request status
UPDATE donation_requests SET status = 'verified', verified_by = $admin_id, verified_at = NOW() WHERE id = $request_id;

-- 2. Insert into donations
INSERT INTO donations (campaign_id, donor_id, donor_name, donor_email, amount, currency, is_anonymous, payment_method, transaction_id, message, status)
VALUES ($campaign_id, $donor_id, $donor_name, $donor_email, $amount, 'USD', $is_anonymous, $payment_method, $transaction_ref, $message, 'completed');

-- 3. Update campaign
UPDATE fundraising_campaigns SET current_amount = current_amount + $amount, donor_count = donor_count + 1 WHERE id = $campaign_id;

-- 4. Create notification
INSERT INTO notifications (user_id, type, title, message) VALUES ($donor_id, 'donation', 'Donation Approved', $message);
COMMIT;
```

### Reject donation:
```sql
UPDATE donation_requests SET status = 'rejected', admin_notes = $reason, verified_at = NOW() WHERE id = $request_id;
INSERT INTO notifications (user_id, type, title, message) VALUES ($donor_id, 'donation', 'Donation Rejected', $message);
```

### Top donors:
```sql
SELECT donor_id, donor_name, is_anonymous, SUM(amount) as total_amount, COUNT(*) as donation_count
FROM donations WHERE status = 'completed' GROUP BY donor_id, donor_name, is_anonymous
ORDER BY total_amount DESC LIMIT 20;
```

---

## Bug Fixes Applied

### Session Authentication Fix (Important!)
The original implementation had a mismatch between how the frontend sends authentication and how the API validates it:

- **Frontend**: Sends session token via `x-session-token` header (localStorage)
- **API**: Was reading session only from HTTP-only cookies

**Fix #1 - Login API**: The login API wasn't returning the token to the frontend!
- Fixed: Now returns `token: session.token` in the response
- The login page now properly saves token to localStorage

**Fix #2 - Session API**: Updated `/api/session` to also check header token:
```typescript
export async function GET(req: NextRequest) {
  let user = await getServerSession()
  if (!user) {
    const token = req.headers.get("x-session-token")
    if (token) {
      user = await getUserBySession(token)
    }
  }
  // ...
}
```

**Fix #3 - All API routes**: Updated to support both cookie and header authentication:
```typescript
async function getSessionUser() {
  let user = await getServerSession()
  if (!user) {
    const headers = await import("next/headers")
    const headersList = await headers.headers()
    const token = headersList.get("x-session-token")
    if (token) {
      user = await getUserBySession(token)
    }
  }
  return user
}
```

**Files updated:**
- `app/api/auth/login/route.ts` - Returns token in response
- `app/api/session/route.ts` - Supports header-based auth
- `app/api/campaigns/route.ts` - GET and POST methods
- `app/api/campaigns/[id]/donation-requests/route.ts` - GET and POST methods
- `app/api/campaigns/[id]/donation-requests/[requestId]/verify/route.ts`
- `app/api/campaigns/[id]/donation-requests/[requestId]/reject/route.ts`
- `app/api/admin/donation-requests/route.ts`

### Other Fixes:
- Added more detailed logging for debugging
- Improved error messages to be more user-friendly
- Added LEFT JOIN in GET donation_requests to handle cases where donor info might be null
- Added console logs to trace donation request creation
- **Fixed NOT NULL constraint issue**: For anonymous donations, the API now sends placeholder values ("Anonymous" / "anonymous@alumni.edu") instead of NULL to satisfy the database NOT NULL constraint. The `is_anonymous` flag is used to display the correct information on the UI.

### File Upload Fix
- **Issue**: File uploads (screenshots/receipts) were causing failures because base64 data URLs are too large for JSON requests
- **Fix**: Changed from JSON to FormData for file uploads
- Frontend: Uses `FormData` with file object
- API: Detects `multipart/form-data` content type and handles both JSON and FormData requests
- Added file size validation (max 5MB)

---

## Additional Features Added

### 1. Delete Campaign
- Added DELETE endpoint: `/api/campaigns/[id]`
- Admin can delete any campaign (cascades to donations and requests)
- Confirmation modal before deletion

### 2. Delete Donation Request
- Added DELETE endpoint: `/api/campaigns/[id]/donation-requests/[requestId]`
- Admin can delete any donation request
- Works for pending, verified, or rejected requests

### 3. UI Improvements
- Tabbed interface: Campaigns | Donation Requests
- Campaign list with progress bars and delete buttons
- Donation requests with better card layout
- Icons for better visual appeal
- Confirmation modals for delete actions
- Stats cards at the top

---

## Testing the Flow

1. Create a campaign (as admin)
2. Login as alumni
3. Go to `/alumni/fundraising`
4. Select campaign → Fill form → Submit
5. Login as admin
6. Go to `/admin/fundraising`
7. Approve or Reject the request
8. Check notification on alumni side

---

## Notes

- No payment gateway integrated (Stripe/Razorpay)
- Manual verification via UPI QR code
- Transaction reference required from alumni
- Optional receipt upload for proof
- Anonymous donations supported
- Notifications created for all actions
