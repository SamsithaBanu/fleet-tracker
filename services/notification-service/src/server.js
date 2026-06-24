import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'                    // ← add this import
import cron from 'node-cron'
import logger from './utils/logger.js'

import { startConsumer } from './consumers/kafkaConsumer.js'
import { initTwilio } from './services/smsService.js'
import { initFirebase } from './services/pushService.js'
import { initEmail, sendDailySummaryEmail } from './services/emailService.js'
import connectDB from './utils/database.js'
import notificationRoutes from './routes/notificationRoutes.js'

connectDB()

const app = express()
const PORT = process.env.PORT || 3004

// ── CORS — add this BEFORE other middleware ───
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use('/notifications', notificationRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    port: PORT,
    time: new Date().toISOString()
  })
})

// ── Daily summary cron job ────────────────────
cron.schedule('0 21 * * *', async () => {
  logger.info('Running daily summary cron job')

  await sendDailySummaryEmail({
    totalOrders: 143,
    delivered: 128,
    failed: 15,
    successRate: '89.5',
    activeDrivers: 12,
  })
})

const start = async () => {
  initTwilio()
  initFirebase()
  initEmail()
  await startConsumer()

  app.listen(PORT, () => {
    logger.success(`Notification service running on http://localhost:${PORT}`)
  })
}

start()