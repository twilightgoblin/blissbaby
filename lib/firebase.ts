import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

// Firebase configuration - hardcoded for reliability
const firebaseConfig = {
  apiKey: "AIzaSyA5z1knFO6vGeRu6is7gpN7FkOfJMAWY4U",
  authDomain: "babybliss-e0200.firebaseapp.com",
  projectId: "babybliss-e0200",
  storageBucket: "babybliss-e0200.firebasestorage.app",
  messagingSenderId: "601666612120",
  appId: "1:601666612120:web:a835e273f471f47a5159ed",
}

const vapidKey = "BNSpyXjDbBX2PRo8J64hTcqOmZhiAxYCAxwKpaGY7QJSyGC3eRBELua5gmNc1bcWVSzQxmbg05giZl13v_NpTMA"

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  
  if (missing.length > 0) {
    console.warn('Missing Firebase configuration:', missing)
    return false
  }
  
  if (!vapidKey) {
    console.warn('Missing VAPID key')
    return false
  }
  
  return true
}

let app: any = null
let messaging: any = null
let initializationAttempted = false

// Initialize Firebase lazily
const initializeFirebase = () => {
  if (initializationAttempted) return { app, messaging }
  
  initializationAttempted = true
  
  if (typeof window === 'undefined' || !validateFirebaseConfig()) {
    console.log('Firebase initialization skipped - not in browser or config invalid')
    return { app: null, messaging: null }
  }

  try {
    // Initialize Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    console.log('Firebase app initialized successfully')

    // Initialize Firebase Cloud Messaging
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app)
        console.log('Firebase FCM initialized successfully')
      } else {
        console.log('FCM is not supported in this browser')
      }
    }).catch((error) => {
      console.error('Error checking FCM support:', error)
    })
  } catch (error) {
    console.error('Error initializing Firebase:', error)
  }

  return { app, messaging }
}

// Export messaging with lazy initialization
export const getFirebaseMessaging = () => {
  const { messaging: msg } = initializeFirebase()
  return msg
}

// Legacy export for backward compatibility
export { messaging }

// Function to get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!validateFirebaseConfig()) {
      console.error('Firebase configuration is incomplete')
      return null
    }

    // Initialize Firebase if not already done
    const { app: firebaseApp, messaging: firebaseMessaging } = initializeFirebase()
    
    if (!firebaseApp) {
      console.error('Firebase app not initialized')
      return null
    }

    let currentMessaging = firebaseMessaging
    
    if (!currentMessaging) {
      const supported = await isSupported()
      if (!supported) {
        console.log('FCM is not supported in this browser')
        return null
      }
      
      currentMessaging = getMessaging(firebaseApp)
    }

    if (!vapidKey) {
      console.error('VAPID key not configured')
      return null
    }

    console.log('Requesting FCM token with correct VAPID key...')
    const token = await getToken(currentMessaging, { vapidKey })

    if (token) {
      console.log('FCM Token obtained successfully:', token.substring(0, 20) + '...')
      return token
    } else {
      console.log('No registration token available. Request permission to generate one.')
      return null
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error)
    return null
  }
}

// Function to listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    const { messaging: currentMessaging } = initializeFirebase()
    
    if (!currentMessaging) {
      console.warn('Firebase messaging not available for foreground messages')
      return
    }

    onMessage(currentMessaging, (payload) => {
      console.log('Message received in foreground:', payload)
      resolve(payload)
    })
  })