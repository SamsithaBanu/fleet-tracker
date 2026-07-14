// Minimal read-only mirror of order-service's Driver model.
// Same MongoDB database — used only to resolve auth userId -> Driver._id
// so driver-scoped notification queries can match Notification.driverId.
import mongoose from 'mongoose'

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true },
}, { collection: 'drivers', strict: false })

const Driver = mongoose.model('Driver', driverSchema)
export default Driver
