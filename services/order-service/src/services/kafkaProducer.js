import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();


// Connect producer when app starts
const connectProducer = async () => {
    try {
        await producer.connect()
        console.log('✅ Kafka producer connected')
    } catch (error) {
        console.error('❌ Kafka producer error:', error.message)
    }
}

// This function publishes any event to any topic
// topic  → which Kafka topic (e.g. 'order-events')
// event  → what happened (e.g. 'order.assigned')
// data   → the full details of what happened
const publishEvent = async (topic, event, data) => {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: data.orderId || data.id || 'event',
                    value: JSON.stringify({
                        event,       // e.g. 'order.assigned'
                        data,        // e.g. { orderId, driverId, customerId }
                        timestamp: new Date().toISOString(),
                    }),
                },
            ],
        })
        console.log(`📤 Kafka event published: ${event}`)
    } catch (error) {
        console.error(`❌ Kafka publish error: ${error.message}`)
    }
}

export { connectProducer, publishEvent };