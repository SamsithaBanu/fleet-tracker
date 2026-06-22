import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.log("Redis error", err));

//max requests per minute
const MAX_REQUESTS = 100;
const WINDOW_SEC = 60;

const rateLimiter = async (req, res, next) => {
  try {
    // Use IP address as key
    // If user is logged in, use their userId instead

    const key = `rate-limit:${req.ip}`; // or `rate-limit:${req.user.id}` if user is logged in

    // Increment the count for this key
    const requests = await redis.incr(key);

    if (requests === 1) {
      // Set expiration for the key if it's the first request
      await redis.expire(key, WINDOW_SEC);
    }

    // Add rate limit headers so frontend can see limits
    res.set("X-RateLimit-Limit", MAX_REQUESTS);
    res.set("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - requests));

    if (requests > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: ttl,
      });
    }
    next();
  } catch (err) {
    console.warn("Rate limiter error", err);
    next();
  }
};

export default rateLimiter;
