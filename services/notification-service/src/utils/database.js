import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected (notification-service)')
  } catch (err) {
    console.error('❌ MongoDB error:', err.message)
  }
}

export default connectDB