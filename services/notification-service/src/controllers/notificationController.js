import Notification from "../model /Notification.js"
import Driver from "../model /Driver.js"

export const getAllNotifications = async (req, res) => {
  try {
    // `driverId` query param is actually the auth-service user id (user.id
    // from the frontend) — resolve it to the order-service Driver._id that
    // Notification.driverId is actually stored as.
    const { driverId: userId, role } = req.query
    const filter = {}

    if (role === 'driver' && userId) {
      const driver = await Driver.findOne({ userId })
      if (!driver) {
        return res.json({ success: true, data: { notifications: [] } })
      }
      filter.driverId = driver._id.toString()
    }

    // Admin and superadmin receive all notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ success: true, data: { notifications } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    )
    res.json({ success: true, data: { notification } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { status: 'unread' },
      { status: 'read' }
    )
    res.json({ success: true, message: 'All marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}