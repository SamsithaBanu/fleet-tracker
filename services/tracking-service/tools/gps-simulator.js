// GPS Simulator — simulates a driver sending location every 5 seconds
// Run with: node tools/gps-simulator.js
import dotenv from 'dotenv'
import mqtt from 'mqtt'

dotenv.config({ path: './services/tracking-service/.env' })

const DRIVER_ID  = process.argv[2] || 'driver-test-001'
const ORDER_ID   = process.argv[3] || null

// Starting position — Koramangala warehouse
let lat = 12.9352
let lng = 77.6245

const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: `simulator-${DRIVER_ID}`,
})

client.on('connect', () => {
  console.log(`\n🛵 GPS Simulator started`)
  console.log(`   Driver ID : ${DRIVER_ID}`)
  console.log(`   Order ID  : ${ORDER_ID || 'none'}`)
  console.log(`   Start pos : ${lat}, ${lng}`)
  console.log(`   Publishing every 5 seconds...\n`)

  // Send location every 5 seconds
  setInterval(() => {
    // Simulate movement — small random change each tick
    lat += (Math.random() - 0.5) * 0.002  // ~200m movement
    lng += (Math.random() - 0.5) * 0.002

    const speed = Math.floor(Math.random() * 50) + 10  // 10-60 km/h

    const payload = JSON.stringify({
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      speed,
      orderId: ORDER_ID,
      timestamp: Date.now(),
    })

    const topic = `grocery/driver/${DRIVER_ID}/location`

    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Publish error:', err)
      } else {
        console.log(`📍 Published → ${topic}`)
        console.log(`   lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}, speed: ${speed} km/h`)
      }
    })
  }, 5000)
})

client.on('error', (err) => {
  console.error('❌ MQTT error:', err.message)
  process.exit(1)
})

// Clean exit on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Simulator stopped')
  client.end()
  process.exit(0)
})