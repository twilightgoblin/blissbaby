# Setup Guide: Admin & Notifications

## Issues Fixed

### 1. Admin Login vs Regular Login
- **Before**: Admin routes were publicly accessible
- **After**: Admin routes now require authentication + role verification
- **Implementation**: 
  - Middleware protects `/admin/*` routes
  - `AdminAuthGuard` component checks user role
  - Admin emails configured via `ADMIN_EMAILS` environment variable

### 2. Notifications Sending to 0 Users
- **Before**: No users in database, no FCM tokens collected
- **After**: Automatic user sync + token collection
- **Implementation**:
  - Clerk webhook syncs users to PostgreSQL automatically
  - Auto-notification setup requests permission on app load
  - Better error messages show why notifications fail

### 3. Order Updates in Admin Panel
- **Before**: Manual refresh required
- **After**: Auto-refresh + real-time notifications
- **Implementation**:
  - Orders page refreshes every 30 seconds
  - Webhook notifies admins of new orders
  - Status updates reflect immediately

## Setup Instructions

### 1. Configure Environment Variables

Add to your `.env` file:

```bash
# Admin Configuration
ADMIN_EMAILS="your-admin@email.com,another-admin@email.com"
FIRST_USER_AUTO_ADMIN="true"  # First user becomes admin automatically
ALLOW_SELF_SERVICE_ADMIN="false"

# Clerk Webhook (get from Clerk Dashboard)
CLERK_WEBHOOK_SECRET="whsec_..."

# Firebase Configuration (for notifications)
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your_vapid_key"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your_project.iam.gserviceaccount.com"
```

### 2. Setup Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create new webhook with URL: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

### 3. Setup Firebase for Notifications

1. Create Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Generate VAPID key in Project Settings → Cloud Messaging
4. Create service account in Project Settings → Service Accounts
5. Download service account JSON and extract private key + client email

### 4. Database Migration

Run Prisma migration to ensure user table is up to date:

```bash
npx prisma db push
```

### 5. Test the Setup

1. **Admin Access**:
   - Sign up with email listed in `ADMIN_EMAILS`
   - Visit `/admin` - should have access
   - Try with non-admin email - should be blocked

2. **Notifications**:
   - Sign up as regular user
   - Should auto-request notification permission
   - Go to `/admin/notifications` and send test notification
   - Should see user count > 0

3. **Orders**:
   - Create test order
   - Check `/admin/orders` - should appear automatically
   - Update order status - should reflect immediately

## How It Works

### User Sync Flow
1. User signs up in Clerk
2. Clerk webhook triggers → `POST /api/webhooks/clerk`
3. User created in PostgreSQL with role based on email
4. Auto-notification setup requests FCM token
5. User can receive notifications

### Admin Notification Flow
1. Admin visits `/admin/notifications`
2. Sends notification to "All Users"
3. System queries all users with `notificationEnabled=true`
4. Filters users with FCM tokens
5. Sends push notifications via Firebase

### Order Management Flow
1. New order created → calls `POST /api/orders/webhook`
2. Webhook notifies all admin users
3. Admin visits `/admin/orders`
4. Page auto-refreshes every 30 seconds
5. Status updates trigger immediate refresh

## Troubleshooting

### "Notifications sent to 0 users"
- Check if Clerk webhook is configured and working
- Verify users exist in database: `SELECT * FROM users;`
- Check if users have FCM tokens: `SELECT email, fcmToken FROM users WHERE fcmToken IS NOT NULL;`

### Admin access denied
- Verify email is in `ADMIN_EMAILS` environment variable
- Check user role in database: `SELECT email, role FROM users WHERE email = 'your@email.com';`
- Ensure middleware is protecting admin routes

### Orders not updating
- Check if auto-refresh is working (console logs)
- Verify order webhook is being called
- Check admin user has FCM token for notifications

## Files Modified/Created

### New Files:
- `app/api/webhooks/clerk/route.ts` - Syncs Clerk users to PostgreSQL
- `app/api/orders/webhook/route.ts` - Notifies admins of new orders
- `components/auto-notification-setup.tsx` - Auto-requests notification permission
- `SETUP_GUIDE.md` - This guide

### Modified Files:
- `middleware.ts` - Added admin route protection
- `app/api/notifications/send/route.ts` - Better error messages
- `app/admin/orders/page.tsx` - Added auto-refresh
- `app/layout.tsx` - Added auto-notification setup
- `.env.example` - Added required environment variables