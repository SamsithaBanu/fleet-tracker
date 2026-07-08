"use client";

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const isFirebaseConfigValid = Object.values(firebaseConfig).every((value) => Boolean(value));
const app = isFirebaseConfigValid ? initializeApp(firebaseConfig) : null;
const messaging = app ? getMessaging(app) : null;

const registerFirebaseServiceWorker = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (error) {
    console.error("Firebase service worker registration failed:", error);
    return null;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  if (!isFirebaseConfigValid) {
    console.warn("Firebase web config is missing. Skipping FCM token registration.");
    return null;
  }

  if (!messaging) return null;

  const registration = await registerFirebaseServiceWorker();
  if (!registration) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (error) {
    console.error("Unable to get FCM token:", error);
    return null;
  }
};
