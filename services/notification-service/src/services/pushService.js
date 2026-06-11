import logger from "../utils/logger.js";
import admin from "firebase-admin";

let firebaseAdmin = null;

const initFirebase =()=>{
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if(!projectId || !clientEmail || !privateKey){
        logger.warn("Firebase credentials are not set. Push notifications will be disabled.");
        return null;
    }

    try{
       if(admin.apps.length === 0){
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        })
       }
       firebaseAdmin = admin;
       logger.success('Firebase Admin initialized')
    }catch(error){
        logger.error("Error initializing Firebase Admin", error.message);
        return null;
    }
}

// Send push notification to a single device
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!firebaseAdmin) {
    logger.warn(`Push (dev mode) → ${title}: ${body}`)
    return { success: true, dev: true }
  }

  if (!fcmToken) {
    logger.warn('No FCM token — skipping push notification')
    return { success: false, error: 'No FCM token' }
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: {
        ...data,
        // All data values must be strings for FCM
        timestamp: String(Date.now()),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
    }

    const result = await firebaseAdmin.messaging().send(message)
    logger.success(`Push sent → ${title} [${result}]`)
    return { success: true, messageId: result }

  } catch (err) {
    logger.error(`Push failed → ${title}:`, err.message)
    return { success: false, error: err.message }
  }
}

// ── Specific push templates for drivers ───────

// New order assigned to driver
const sendNewOrderPush = async (fcmToken, data) => {
  return sendPushNotification(
    fcmToken,
    '🛵 New order assigned!',
    `Pick up from ${data.warehouseName} → deliver to ${data.customerName}`,
    {
      type:    'new_order',
      orderId: data.orderId,
      orderNumber: data.orderNumber,
    }
  )
}

// Order cancelled or failed
const sendOrderCancelledPush = async (fcmToken, data) => {
  return sendPushNotification(
    fcmToken,
    '❌ Order cancelled',
    `Order ${data.orderNumber} has been cancelled`,
    {
      type:    'order_cancelled',
      orderId: data.orderId,
    }
  )
}

export {initFirebase, sendPushNotification, sendNewOrderPush, sendOrderCancelledPush };