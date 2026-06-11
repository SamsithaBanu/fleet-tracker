import {Kafka} from 'kafkajs';

const kafka = new Kafka({
  clientId: 'tracking-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
})

const producer = kafka.producer()

const connectProducer = async () => {
  try {
    await producer.connect()
    console.log('✅ Kafka producer connected')
  } catch (err) {
    console.error('❌ Kafka producer error:', err.message)
  }
}

// Publish location event to Kafka
// Other services (analytics, geofence in V2) can consume this
const publishLocationEvent = async (data) => {
  try {
    await producer.send({
      topic: 'location-events',
      messages: [{
        key: data.driverId,
        value: JSON.stringify({
          event: 'driver.location.updated',
          data,
          timestamp: new Date().toISOString(),
        }),
      }],
    })
  } catch (err) {
    // Don't crash if Kafka publish fails
    console.error('❌ Kafka publish error:', err.message)
  }
}

export { connectProducer, publishLocationEvent }