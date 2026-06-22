// services/tracking-service/src/services/mqttSubscriber.js
import mqtt from 'mqtt'
import redis from '../utils/redisClient.js'
import { emitLocationUpdate } from '../socket/socketHandler.js'
import { publishLocationEvent } from './kafkaProducer.js'

const connectMQTT = () => {
  let mqttClient

  if (process.env.HIVEMQ_HOST) {
    // Production — HiveMQ Cloud (secure TLS connection)
    mqttClient = mqtt.connect(`mqtts://${process.env.HIVEMQ_HOST}:8883`, {
      clientId: `tracking-service-${Date.now()}`,
      username: process.env.HIVEMQ_USERNAME,
      password: process.env.HIVEMQ_PASSWORD,
      reconnectPeriod: 3000,
    })
  } else {
    // Local — Mosquitto
    mqttClient = mqtt.connect('mqtt://localhost:1883', {
      clientId: `tracking-service-${Date.now()}`,
      reconnectPeriod: 3000,
    })
  }

  mqttClient.on('connect', () => {
    console.log('✅ MQTT broker connected')
    mqttClient.subscribe('grocery/driver/+/location', { qos: 1 })
    console.log('📡 Subscribed to grocery/driver/+/location')
  })

  mqttClient.on('message', async (topic, message) => {
    try {
      const parts = topic.split('/')
      const driverId = parts[2]
      const payload = JSON.parse(message.toString())
      const { lat, lng, speed = 0, orderId = null } = payload

      if (!lat || !lng) return

      const locationData = {
        lat, lng, speed, orderId, driverId,
        timestamp: Date.now(),
      }

      await redis.setex(
        `driver:${driverId}:location`,
        30,
        JSON.stringify(locationData)
      )

      emitLocationUpdate(driverId, locationData)

      // Only publish to Kafka if available (local only)
      if (process.env.KAFKA_BROKER) {
        await publishLocationEvent(locationData)
      }

    } catch (err) {
      console.error('❌ MQTT message error:', err.message)
    }
  })

  mqttClient.on('error', (err) => {
    console.error('❌ MQTT error:', err.message)
  })
}

export { connectMQTT }