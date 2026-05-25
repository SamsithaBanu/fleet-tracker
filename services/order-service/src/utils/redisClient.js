import Redis from 'ioredis';

// Create Redis connection
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
})

// Log when connected
redis.on('connect', () => {
    console.log('✅ Redis connected')
})

// Log if error
redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message)
})

export default redis;