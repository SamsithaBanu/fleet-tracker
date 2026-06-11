import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
})

redis.on('connect',()=> console.log('redis connected'));
redis.on('error',(err)=> console.error('redis error', err));

export default redis;