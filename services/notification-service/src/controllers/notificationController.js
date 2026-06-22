import Notification from "../model /Notification.js"

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
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