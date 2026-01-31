import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher(['/account', '/orders', '/profile'])

// Define protected API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  '/api/user/(.*)',
])

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// Define admin API routes that require admin role
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Handle Firebase service worker with environment variables
  if (req.nextUrl.pathname === '/firebase-messaging-sw.js') {
    const serviceWorkerContent = `
// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'BabyBliss Notification'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const data = event.notification.data
  let url = '/'

  // Determine URL based on notification type
  if (data?.type === 'order') {
    url = \`/orders/\${data.orderId}\`
  } else if (data?.type === 'flash_sale') {
    url = \`/products?sale=true\`
  } else if (data?.type === 'new_products') {
    url = \`/products?new=true\`
  } else if (data?.type === 'discount') {
    url = \`/products\`
  } else if (data?.type === 'weekend_offer') {
    url = \`/products?weekend=true\`
  } else if (data?.type === 'admin_order' || data?.type === 'new_order') {
    url = \`/admin/orders\`
  } else if (data?.url) {
    url = data.url
  }

  // Open the app and navigate to the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus()
        }
      }

      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
`

    return new NextResponse(serviceWorkerContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  // Protect page routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Protect API routes that require authentication
  if (isProtectedApiRoute(req)) {
    await auth.protect()
  }
  
  // Protect admin routes - require authentication first
  if (isAdminRoute(req) || isAdminApiRoute(req)) {
    const { userId } = await auth()
    
    if (!userId) {
      // For admin pages, redirect to home page where they can sign in via modal
      if (isAdminRoute(req)) {
        const homeUrl = new URL('/', req.url)
        homeUrl.searchParams.set('admin_redirect', req.nextUrl.pathname)
        return NextResponse.redirect(homeUrl)
      }
      // Return 401 for admin API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For authenticated users, let the AdminAuthGuard component and API endpoints
    // handle the admin role verification to avoid Edge Runtime issues
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}