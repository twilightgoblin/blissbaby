// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase configuration will be injected at build time
// This file will be generated during the build process
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig)
    
    // Initialize Firebase Cloud Messaging
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
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  const data = event.notification.data
  let url = '/'
  
  // Determine URL based on notification type
  if (data?.type === 'order') {
    url = `/orders/${data.orderId}`
  } else if (data?.type === 'flash_sale') {
    url = `/products?sale=true`
  } else if (data?.type === 'new_products') {
    url = `/products?new=true`
  } else if (data?.type === 'discount') {
    url = `/products`
  } else if (data?.type === 'weekend_offer') {
    url = `/products?weekend=true`
  } else if (data?.type === 'admin_order' || data?.type === 'new_order') {
    url = `/admin/orders`
  } else if (data?.url) {
    url = data.url
  }
  
  // Open the app and navigate to the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus()
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
