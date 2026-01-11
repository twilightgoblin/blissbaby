import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

let app: any = null
let messaging: any = null

// Initialize Firebase Admin SDK lazily
const initializeFirebaseAdmin = () => {
  if (app) return { app, messaging }

  try {
    const requiredEnvVars = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }

    // Check if all required environment variables are present
    const missing = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missing.length > 0) {
      console.error('Missing Firebase Admin environment variables:', missing)
      return { app: null, messaging: null }
    }

    const firebaseAdminConfig = {
      credential: cert({
        projectId: requiredEnvVars.projectId!,
        clientEmail: requiredEnvVars.clientEmail!,
        privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
      }),
    }

    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
    messaging = getMessaging(app)
    
    console.log('Firebase Admin initialized successfully')
    return { app, messaging }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    return { app: null, messaging: null }
  }
}

// Export messaging with lazy initialization
export const getFirebaseMessaging = () => {
  const { messaging: msg } = initializeFirebaseAdmin()
  return msg
}

// Function to send notification to a single user
export const sendNotificationToUser = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const messaging = getFirebaseMessaging()
  
  if (!messaging) {
    console.error('Firebase messaging not initialized')
    return { success: false, error: 'Firebase messaging not initialized' }
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return { success: true, messageId: response }
  } catch (error: any) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }
}

// Function to send notification to multiple users
export const sendNotificationToMultipleUsers = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const messaging = getFirebaseMessaging()
  
  if (!messaging) {
    console.error('Firebase messaging not initialized')
    return { success: false, error: 'Firebase messaging not initialized' }
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    }

    const response = await messaging.sendEachForMulticast(message)
    console.log('Successfully sent messages:', response)
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
        }
      })
      console.log('Failed tokens:', failedTokens)
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    }
  } catch (error: any) {
    console.error('Error sending messages:', error)
    return { success: false, error: error.message }
  }
}

// Function to send notification to a topic
export const sendNotificationToTopic = async (
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const messaging = getFirebaseMessaging()
  
  if (!messaging) {
    console.error('Firebase messaging not initialized')
    return { success: false, error: 'Firebase messaging not initialized' }
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      topic,
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message to topic:', response)
    return { success: true, messageId: response }
  } catch (error: any) {
    console.error('Error sending message to topic:', error)
    return { success: false, error: error.message }
  }
}