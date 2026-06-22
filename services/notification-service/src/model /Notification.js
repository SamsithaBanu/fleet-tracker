// services/notification-service/src/models/Notification.js
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // e.g. "Order Delivered", "Order Pending", "Order Assigned"
  },
  description: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    default: null,
  },
  driverId: {
    type: String,
    default: null,
  },
  warehouse: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread',
  },
  type: {
    type: String,
    enum: ['order_assigned', 'order_picked_up', 'order_delivered', 'order_failed'],
    required: true,
  },
}, { timestamps: true })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification