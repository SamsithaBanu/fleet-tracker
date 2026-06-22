// services/notification-service/src/routes/notificationRoutes.js
import express from 'express'
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js'

const router = express.Router()

router.get('/', getAllNotifications)
router.put('/:id/read', markAsRead)
router.put('/read-all', markAllAsRead)

export default router