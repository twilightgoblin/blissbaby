# FCM Push Notifications System

This document explains the Firebase Cloud Messaging (FCM) push notification system implemented in BabyBliss.

## Features

### 1. Admin to Users Notifications
- **New Offers/Banners**: When admin posts new banners and offers, all users with notifications enabled receive push notifications
- **Manual Notifications**: Admins can send custom notifications to all users or specific users
- **Automatic Triggers**: Notifications are sent automatically when new offers are created

### 2. Order Completion Notifications
- **Admin Notifications**: When a user completes an order, admin users receive push notifications with order details
- **Order Details**: Notifications include order number, customer info, and total amount
- **Real-time Updates**: Notifications are sent immediately after successful order creation

## Technical Implementation

### Firebase Configuration
- **Client SDK**: Firebase v10.7.1 for web client
- **Admin SDK**: Firebase Admin SDK for server-side operations
- **Service Worker**: Background message handling with `firebase-messaging-sw.js`

### Database Schema
```sql
model users {
  id                    String    @id @default(cuid())
  clerkUserId           String    @unique
  email                 String    @unique
  firstName             String?
  lastName              String?
  fcmToken              String?   -- FCM token for push notifications
  notificationEnabled   Boolean   @default(true)
  role                  UserRole  @default(CUSTOMER)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### API Endpoints

#### User Token Management
- `POST /api/notifications/token` - Save FCM token for user
- `DELETE /api/notifications/token` - Remove FCM token
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences

#### Admin Notification Sending
- `POST /api/notifications/send` - Send notifications to users (admin only)
- `POST /api/notifications/test` - Send test notification to current user

### Components

#### User Components
- `NotificationSetup` - User notification management UI
- `NotificationProvider` - FCM initialization and token management
- `useNotifications` - React hook for notification functionality

#### Admin Components
- `NotificationDashboard` - Admin interface for sending notifications
- Admin notification page at `/admin/notifications`

### Service Worker
The `firebase-messaging-sw.js` handles:
- Background message reception
- Notification display
- Click handling and navigation
- Custom notification actions

## Setup Instructions

### 1. Firebase Project Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Generate a web app configuration
4. Generate a VAPID key for web push
5. Generate a service account key for admin SDK

### 2. Environment Variables
Add to your `.env` file:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"

# Firebase Admin Configuration
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

### 3. Database Migration
Run the Prisma migration to add the users table:
```bash
npx prisma db push
```

### 4. Service Worker Registration
The service worker is automatically registered when the app loads. Ensure `firebase-messaging-sw.js` is in the `public` directory.

## Usage

### For Users
1. Visit `/profile/notifications` to enable notifications
2. Grant browser permission when prompted
3. FCM token is automatically saved to the database
4. Users can disable notifications anytime

### For Admins
1. Visit `/admin/notifications` to send notifications
2. Create new offers - notifications are sent automatically
3. View notification statistics and recent activity
4. Send custom notifications to all users or specific users

## Notification Types

### Offer Notifications
- **Title**: "🎉 New Offer Available!" or "💰 New Discount Code!"
- **Body**: Offer title and description
- **Data**: `{ type: 'offer', offerId, offerType, url: '/products' }`

### Order Notifications (to Admin)
- **Title**: "🛒 New Order Received!"
- **Body**: Order number, customer name, and total amount
- **Data**: `{ type: 'admin_order', orderId, orderNumber, amount, url: '/admin/orders/{id}' }`

### Test Notifications
- **Title**: "🧪 Test Notification"
- **Body**: "This is a test notification from BabyBliss!"
- **Data**: `{ type: 'test', timestamp, url: '/profile/notifications' }`

## Testing

### Manual Testing
1. Enable notifications in user profile
2. Use the "Test Notification" button
3. Create a new offer as admin
4. Complete an order as user

### Script Testing
Run the test script:
```bash
npx tsx scripts/test-notifications.ts
```

## Security Considerations

- FCM tokens are stored securely in the database
- Admin-only endpoints are protected with role-based access control
- Notification preferences are user-controlled
- Service worker validates notification data
- Private keys are properly formatted and secured

## Troubleshooting

### Common Issues
1. **No notifications received**: Check browser permissions and FCM token
2. **Service worker errors**: Ensure `firebase-messaging-sw.js` is accessible
3. **Admin notifications not working**: Verify admin role in database
4. **Token not saved**: Check network requests and error logs

### Debug Steps
1. Check browser console for FCM errors
2. Verify environment variables are set correctly
3. Test with `/api/notifications/test` endpoint
4. Check database for FCM tokens and user roles
5. Verify Firebase project configuration

## Performance Considerations

- FCM tokens are cached in the database
- Notifications are sent asynchronously
- Failed tokens are logged but don't block operations
- Service worker handles background processing efficiently

## Future Enhancements

- Notification scheduling
- User segmentation for targeted notifications
- Rich notifications with images
- Notification analytics and tracking
- A/B testing for notification content
- Integration with email notifications