# Notification System Troubleshooting Guide

## Issues Fixed

### 1. Service Worker Not Properly Initialized
**Problem**: The service worker was waiting for a message with Firebase config that was never sent.

**Solution**: Updated `public/firebase-messaging-sw.js` to initialize Firebase directly with the config instead of waiting for a message.

### 2. Service Worker Not Registered
**Problem**: The service worker was never being registered by the client application.

**Solution**: Updated `lib/firebase.ts` to register the service worker during Firebase initialization.

### 3. Async Initialization Issues
**Problem**: Firebase initialization was not properly handling async operations.

**Solution**: Made `initializeFirebase()` and related functions async to properly handle service worker registration and messaging initialization.

## How Notifications Work

### User Receives Notifications (Admin → User)

1. **Admin sends notification** from `/admin/notifications`
2. **Backend** (`/api/notifications/send`) finds all users with:
   - `fcmToken` not null
   - `notificationEnabled: true`
3. **Firebase Admin SDK** sends push notifications to all FCM tokens
4. **User's device** receives notification via:
   - **Foreground**: `onMessage` listener in the app
   - **Background**: Service worker handles it

### Admin Receives Notifications (User → Admin)

1. **User completes order** via `/api/orders`
2. **Backend** finds all admin users with:
   - `role: ADMIN` or `SUPER_ADMIN`
   - `fcmToken` not null
   - `notificationEnabled: true`
3. **Firebase Admin SDK** sends push notifications to admin FCM tokens
4. **Admin's device** receives notification

## Setup Checklist

### For Users to Receive Notifications:

1. ✅ User must sign up/login
2. ✅ User must visit notification settings (or be prompted)
3. ✅ User must click "Enable Notifications"
4. ✅ User must grant browser permission
5. ✅ FCM token must be saved to database
6. ✅ `notificationEnabled` must be `true` in database

### For Admins to Receive Notifications:

1. ✅ Admin user must exist in database
2. ✅ Admin must have `role: ADMIN` or `SUPER_ADMIN`
3. ✅ Admin must enable notifications (same as users)
4. ✅ Admin must have FCM token saved
5. ✅ `notificationEnabled` must be `true`

## Testing the System

### 1. Check Notification Setup

Visit: `http://localhost:3000/api/admin/check-notifications`

This will show:
- Total users
- Users with FCM tokens
- Admin users with FCM tokens
- Environment variable status
- Individual user notification status

### 2. Test User Notification Flow

1. Login as a regular user
2. Visit `/profile/notifications` or `/account`
3. Click "Enable Notifications"
4. Grant browser permission
5. Check that token is saved (check console logs)
6. As admin, go to `/admin/notifications`
7. Send a test notification
8. User should receive it

### 3. Test Admin Notification Flow

1. Login as admin
2. Enable notifications (same as user)
3. Open another browser/incognito as regular user
4. Complete a test order
5. Admin should receive notification about new order

## Common Issues

### Issue: "No users have FCM tokens"

**Cause**: Users haven't enabled notifications yet.

**Solution**:
1. Users need to visit notification settings
2. Click "Enable Notifications"
3. Grant browser permission
4. Token will be automatically saved

### Issue: "Notifications not received"

**Possible causes**:
1. Browser doesn't support notifications (check console)
2. Notification permission denied (check browser settings)
3. Service worker not registered (check DevTools → Application → Service Workers)
4. FCM token not saved to database (check `/api/admin/check-notifications`)
5. Firebase credentials incorrect (check `.env` file)

**Debug steps**:
1. Open browser DevTools → Console
2. Look for Firebase initialization logs
3. Check for service worker registration
4. Verify FCM token is obtained
5. Check Network tab for API calls to `/api/notifications/token`

### Issue: "Service worker not found"

**Cause**: Service worker file not accessible.

**Solution**:
1. Ensure `public/firebase-messaging-sw.js` exists
2. Restart development server
3. Clear browser cache
4. Check browser console for 404 errors

### Issue: "Admin not receiving order notifications"

**Possible causes**:
1. Admin doesn't have FCM token
2. Admin's `notificationEnabled` is false
3. Admin role not set correctly

**Solution**:
1. Admin must enable notifications like regular users
2. Check `/api/admin/check-notifications` to verify admin has token
3. Verify admin role in database

## Environment Variables Required

```env
# Client-side (public)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."

# Server-side (private)
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

## Browser Compatibility

Notifications work in:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop & iOS 16.4+)
- ❌ iOS Safari (older versions)
- ❌ Private/Incognito mode (limited)

## Key Files

- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `lib/firebase.ts` - Client-side Firebase initialization
- `lib/firebase-admin.ts` - Server-side Firebase Admin SDK
- `hooks/use-notifications.ts` - React hook for notification management
- `components/notification-setup.tsx` - UI for enabling notifications
- `app/api/notifications/send/route.ts` - API for sending notifications
- `app/api/notifications/token/route.ts` - API for saving FCM tokens
- `app/api/orders/route.ts` - Sends admin notifications on order creation

## Next Steps

1. **Test the system**: Use the checklist above
2. **Enable notifications**: Both as user and admin
3. **Send test notifications**: From admin panel
4. **Create test order**: Verify admin receives notification
5. **Check logs**: Monitor console for any errors

## Support

If issues persist:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure service worker is registered
4. Check `/api/admin/check-notifications` for user token status
5. Test in different browsers
