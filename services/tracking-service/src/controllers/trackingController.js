import redis from "../utils/redisClient.js";
import { emitLocationUpdate } from "../socket/socketHandler.js";
import { publishLocationEvent } from "../services/kafkaProducer.js";

// ── POST /tracking/location ───────────────────
// REST fallback — driver app can also send location via HTTP
// Used when MQTT is not available (weak signal)
export const updateLocation = async (req, res) => {
  try {
    const { driverId, lat, lng, speed = 0, orderId = null } = req.body

    if (!driverId || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'driverId, lat and lng are required'
      })
    }

    const locationData = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed),
      orderId,
      driverId,
      timestamp: Date.now(),
    }

    // Save to Redis (30s TTL)
    await redis.setex(
      `driver:${driverId}:location`,
      30,
      JSON.stringify(locationData)
    )

    // Push via Socket.io
    emitLocationUpdate(driverId, locationData)

    // Publish to Kafka
    await publishLocationEvent(locationData)

    res.json({
      success: true,
      message: 'Location updated',
      data: locationData,
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /tracking/location/:driverId ─────────
// Get current location of one driver from Redis
export const getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params

    const cached = await redis.get(`driver:${driverId}:location`)

    if (!cached) {
      return res.status(404).json({
        success: false,
        message: 'Driver location not found or expired'
      })
    }

    res.json({
      success: true,
      data: { location: JSON.parse(cached) }
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /tracking/all ─────────────────────────
// Get ALL online drivers' locations for the fleet map
export const getAllLocations = async (req, res) => {
  try {
    // Get all online driver IDs from Redis set
    const onlineDriverIds = await redis.smembers('drivers:online')

    if (onlineDriverIds.length === 0) {
      return res.json({
        success: true,
        data: { drivers: [] }
      })
    }

    // Get location for each online driver
    const locations = []

    for (const driverId of onlineDriverIds) {
      const cached = await redis.get(`driver:${driverId}:location`)
      if (cached) {
        locations.push({
          driverId,
          ...JSON.parse(cached),
        })
      }
    }

    res.json({
      success: true,
      data: { drivers: locations, count: locations.length }
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /tracking/history/:driverId ──────────
// GPS history — returns last known points from Redis trail
export const getHistory = async (req, res) => {
  try {
    const { driverId } = req.params
    const { limit = 50 } = req.query

    // Get trail from Redis list (we'll add trail tracking below)
    const trail = await redis.lrange(
      `driver:${driverId}:trail`,
      0,
      parseInt(limit) - 1
    )

    const points = trail.map(p => JSON.parse(p))

    res.json({
      success: true,
      data: { driverId, points, count: points.length }
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}