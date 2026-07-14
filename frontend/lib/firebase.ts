// frontend/lib/firebase.ts
'use client'

// ── CRITICAL: Only import Firebase types, not actual modules ──
// Firebase Messaging only works in the browser
// Never call getMessaging() during SSR

let messagingInstance: any = null

const getFirebaseMessaging = async () => {
  // Guard 1 — must be in browser
  if (typeof window === 'undefined') return null

  // Guard 2 — must support service workers
  if (!('serviceWorker' in navigator)) return null

  // Guard 3 — check all config values exist
  const config = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  const isValid = Object.values(config).every(Boolean)
  if (!isValid) {
    console.warn('Firebase config missing — push notifications disabled')
    return null
  }

  // Return cached instance
  if (messagingInstance) return messagingInstance

  try {
    // Dynamic imports — only loads in browser, never on server
    const { initializeApp, getApps } = await import('firebase/app')
    const { getMessaging } = await import('firebase/messaging')

    // Only initialize once
    const app = getApps().length === 0
      ? initializeApp(config)
      : getApps()[0]

    messagingInstance = getMessaging(app)
    return messagingInstance

  } catch (err) {
    console.error('Firebase init error:', err)
    return null
  }
}

// ── Get FCM Token ─────────────────────────────
export const getFcmToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) return null

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    )

    const { getToken } = await import('firebase/messaging')

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
      serviceWorkerRegistration: registration,
    })

    console.log('FCM Token:', token)
    return token || null

  } catch (err) {
    console.error('FCM token error:', err)
    return null
  }
}

// ── Foreground notification handler ──────────
export const setupForegroundNotifications = async () => {
  if (typeof window === 'undefined') return

  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) return

    const { onMessage } = await import('firebase/messaging')

    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground message:', payload)

      const title = payload.notification?.title || 'New Notification'
      const body  = payload.notification?.body  || ''

      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `fleet-notification-${Date.now()}`,
        })
      }
    })

  } catch (err) {
    console.error('Foreground notification setup error:', err)
  }
}