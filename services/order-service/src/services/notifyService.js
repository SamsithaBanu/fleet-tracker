// services/order-service/src/services/notifyService.js
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL

export const notifyOrderEvent = async (event, data) => {
  // Skip if notification service URL not configured
  if (!NOTIFICATION_URL) {
    console.log(`📤 Notification skipped (no URL): ${event}`)
    return
  }

  try {
    await fetch(`${NOTIFICATION_URL}/notifications/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    })
    console.log(`📤 Notification sent: ${event}`)
  } catch (err) {
    // Never crash order flow because notification failed
    console.error('❌ Notify error:', err.message)
  }
}