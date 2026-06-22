import Driver from "../models/Driver.js";
import Order from "../models/Order.js";
import redis from "../utils/redisClient.js";
import mongoose from "mongoose";

export const getAllDrivers = async (req, res) => {
    try {
        const { warehouseId, status } = req.query
        const filter = { isActive: true }
        if (warehouseId) filter.warehouseId = warehouseId
        if (status === 'online') filter.isOnline = true
        if (status === 'offline') filter.isOnline = false

        const drivers = await Driver.find(filter)
            .populate('warehouseId', 'name')
            .sort({ createdAt: -1 })

        res.json({ success: true, data: { drivers } })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const addDriver = async (req, res) => {
    try {
        const { userId, name, phone, email, licenseNumber, warehouseId } = req.body

        const driver = await Driver.create({
            userId, name, phone, email, licenseNumber, warehouseId
        })

        res.status(201).json({
            success: true,
            message: 'Driver added successfully',
            data: { driver }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
};

// services/order-service/src/controllers/driverController.js

export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('warehouseId', 'name address')

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' })
    }

    // ── FIXED: Proper today boundary calculation ──
    const now = new Date()

    // Start of today (local midnight)
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    )

    // End of today (just before midnight tomorrow)
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 999
    )

    console.log('🔍 Today range:', startOfToday, 'to', endOfToday)

    const todayOrders = await Order.find({
      driverId: driver._id,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    })

    console.log(`📦 Found ${todayOrders.length} orders today for driver ${driver.name}`)

    res.json({
      success: true,
      data: {
        driver,
        todayDeliveries: todayOrders.filter(o => o.status === 'delivered').length,
        todayOrders,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const toggleStatus = async (req, res) => {
    try {
        const { driverId, isOnline, lat, lng, fcmToken } = req.body

        // Update in MongoDB
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            { isOnline, ...(fcmToken && { fcmToken }) },
            { new: true }
        )

        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' })
        }

        if (isOnline) {
            // Add to online drivers set in Redis
            await redis.sadd('drivers:online', driverId)

            // Save their starting location
            if (lat && lng) {
                await redis.setex(
                    `driver:${driverId}:location`,
                    300, // 5 min TTL
                    JSON.stringify({ lat, lng, timestamp: Date.now() })
                )
            }

            console.log(`🟢 Driver ${driver.name} is now ONLINE`)
        } else {
            // Remove from online set in Redis
            await redis.srem('drivers:online', driverId)
            await redis.del(`driver:${driverId}:location`)
            await redis.del(`driver:${driverId}:busy`)

            console.log(`🔴 Driver ${driver.name} is now OFFLINE`)
        }

        res.json({
            success: true,
            message: `Driver is now ${isOnline ? 'online' : 'offline'}`,
            data: { driver }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message
        })
    }
}

export const getEarnings = async (req, res) => {
  try {
    const { id } = req.params
    const driverObjectId = new mongoose.Types.ObjectId(id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0);

    console.log('driverobje', driverObjectId)

    const [todayOrders, weekOrders] = await Promise.all([
      Order.find({
        driverId: driverObjectId,
        status: 'delivered',
        createdAt: { $gte: today }
      }),
      Order.find({
        driverId: driverObjectId,
        status: 'delivered',
        createdAt: { $gte: weekAgo }
      }),
    ])

    const ratePerDelivery = 60

    res.json({
      success: true,
      data: {
        todayDeliveries: todayOrders?.length,
        todayEarnings: todayOrders?.length * ratePerDelivery,
        weekDeliveries: weekOrders?.length,
        weekEarnings: weekOrders?.length * ratePerDelivery,
        recentOrders: todayOrders,
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}