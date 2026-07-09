// frontend/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAnYjK2dmQcaJaSK3v_wOE0J9RKruLsr6o',
  authDomain: 'fleet-tracking-app-c342c.firebaseapp.com',
  projectId: 'fleet-tracking-app-c342c',
  storageBucket: 'fleet-tracking-app-c342c.firebasestorage.app',
  messagingSenderId: '1020571777386',  // ← must match your MESSAGING_SENDER_ID
  appId: '1:1020571777386:web:35a159be2a982bc4874d13',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message:', payload)

  const title = payload.notification?.title || 'New Notification'
  const body  = payload.notification?.body  || ''

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {},
  })
})