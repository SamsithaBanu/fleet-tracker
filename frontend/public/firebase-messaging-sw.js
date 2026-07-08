importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAnYjK2dmQcaJaSK3v_wOE0J9RKruLsr6o",
  authDomain: "fleet-tracking-app-c342c.firebaseapp.com",
  projectId: "fleet-tracking-app-c342c",
  storageBucket: "fleet-tracking-app-c342c.firebasestorage.app",
  messagingSenderId: "1020571777386",
  appId: "1:1020571777386:web:35a159be2a982bc4874d13",
  measurementId: "G-Z9ZGS8NFXH"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});