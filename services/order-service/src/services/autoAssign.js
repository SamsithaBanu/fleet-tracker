import redis from "../utils/redisClient.js"

// Haversine formula — calculates distance between 2 GPS points in km
// lat1, lng1 → point A (warehouse or pickup)
// lat2, lng2 → point B (driver location)
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth radius in km

    // Convert degrees to radians
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // distance in km
}

// Main auto-assign function
// warehouse → the warehouse this order is coming from
// Returns the nearest available driver object, or null if none found
const autoAssignDriver = async (warehouse) => {
    try {
        // Step 1 — Get all online driver IDs from Redis
        // When a driver goes online, we store their ID in a Redis set
        const onlineDriverIds = await redis.smembers('drivers:online')

        if (onlineDriverIds.length === 0) {
            console.log('⚠️  No drivers online right now')
            return null
        }

        console.log(`🔍 Checking ${onlineDriverIds.length} online drivers...`)

        // Step 2 — Get each driver's current GPS location from Redis
        const driversWithDistance = []

        for (const driverId of onlineDriverIds) {
            // Get this driver's location from Redis
            const locationData = await redis.get(`driver:${driverId}:location`)

            if (!locationData) continue // skip if no location found

            const location = JSON.parse(locationData)

            // Step 3 — Check driver is not already on a delivery
            const isBusy = await redis.get(`driver:${driverId}:busy`)
            if (isBusy) continue // skip busy drivers

            // Step 4 — Calculate distance from warehouse to this driver
            const distance = haversineDistance(
                warehouse.location.lat,  // warehouse latitude
                warehouse.location.lng,  // warehouse longitude
                location.lat,            // driver latitude
                location.lng             // driver longitude
            )

            driversWithDistance.push({
                driverId,
                distance,     // in km
                location,
            })
        }

        if (driversWithDistance.length === 0) {
            console.log('⚠️  All online drivers are busy')
            return null
        }

        // Step 5 — Sort by distance — nearest first
        driversWithDistance.sort((a, b) => a.distance - b.distance)

        const nearest = driversWithDistance[0]
        console.log(
            `✅ Nearest driver: ${nearest.driverId} — ${nearest.distance.toFixed(2)} km away`
        )

        return nearest

    } catch (error) {
        console.error('❌ Auto-assign error:', error.message)
        return null
    }
}

export { autoAssignDriver, haversineDistance }