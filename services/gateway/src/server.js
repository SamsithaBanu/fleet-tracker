import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import logger from './middleware/logger.js'
import authMiddleware from './middleware/authMiddleware.js'
import rateLimiter from './middleware/rateLimiter.js'
import registerRoutes from './routes/proxy.js'

const app = express()
const PORT = process.env.PORT || 8050

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-user-role',
  ],
}

// CORS FIRST

app.use(cors(corsOptions))
app.use((req, res, next) => {
  console.log('MIDDLEWARE HIT:', req.method, req.path)

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS REQUEST DETECTED')
    return res.sendStatus(204)
  }

  next()
})

app.use((req, res, next) => {
  console.log("AUTH SERVICE:", req.method, req.originalUrl);
  next();
});

// No app.options('*', ...)
app.use(express.json())

app.use(logger)
app.use(rateLimiter)
app.use(authMiddleware)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    port: PORT,
    timestamp: new Date().toISOString(),
  })
})

registerRoutes(app)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  })
})

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on http://localhost:${PORT}`)
})