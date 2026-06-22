// services/notification-service/src/routes/notificationRoutes.js
import express from 'express'
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js'
import { handleEvent } from '../consumers/kafkaConsumer.js'

const router = express.Router()

router.get('/', getAllNotifications)
router.put('/:id/read', markAsRead)
router.put('/read-all', markAllAsRead)

router.post('/trigger', async (req, res) => {
  try {
    const { event, data } = req.body
    if (!event || !data) {
      return res.status(400).json({ success: false, message: 'event and data required' })
    }
    await handleEvent(event, data)
    res.json({ success: true, message: `Event ${event} handled` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router