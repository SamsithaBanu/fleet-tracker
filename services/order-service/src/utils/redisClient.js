// services/auth-service/src/utils/redisClient.js
import Redis from 'ioredis'

let redis

if (process.env.UPSTASH_REDIS_URL) {
  // Production — Upstash Redis (needs TLS)
  redis = new Redis(process.env.UPSTASH_REDIS_URL, {
    tls: { rejectUnauthorized: false },
    maxRetriesPerRequest: 3,
  })
} else {
  // Local development
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  })
}

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err) => console.error('❌ Redis error:', err.message))

export default redis