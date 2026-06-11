let io = null

// Store io instance so other files can use it
const initSocket = (socketIo) => {
  io = socketIo

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // ── Join a room for a specific order ──────────
    // Customer tracking page joins this room
    // When driver moves, we emit only to this room
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`)
      console.log(`📦 Socket ${socket.id} joined order:${orderId}`)
    })

    // ── Join the fleet dashboard room ─────────────
    // Admin live map page joins this
    // Receives ALL driver location updates
    socket.on('join:fleet', () => {
      socket.join('fleet:dashboard')
      console.log(`🗺️  Socket ${socket.id} joined fleet dashboard`)
    })

    // ── Leave rooms on disconnect ─────────────────
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
    })
  })
}

// Called by MQTT subscriber when new GPS arrives
// Pushes location to ALL connected map clients
const emitLocationUpdate = (driverId, locationData) => {
  if (!io) return

  // Emit to fleet dashboard (admin live map)
  io.to('fleet:dashboard').emit('location:update', {
    driverId,
    ...locationData,
  })

  // If driver is on an order, emit to that order's room too
  // Customer tracking page receives this
  if (locationData.orderId) {
    io.to(`order:${locationData.orderId}`).emit('location:update', {
      driverId,
      ...locationData,
    })
  }
}

// Called when order status changes
// Updates kanban board and customer tracking page
const emitOrderStatus = (orderId, status, data = {}) => {
  if (!io) return

  // Emit to everyone in this order's room
  io.to(`order:${orderId}`).emit('order:status', {
    orderId,
    status,
    ...data,
    timestamp: new Date().toISOString(),
  })

  // Also emit to fleet dashboard
  io.to('fleet:dashboard').emit('order:status', {
    orderId,
    status,
    ...data,
  })

  console.log(`📡 Emitted order:status → ${orderId} → ${status}`)
}

// Emit driver online/offline to fleet dashboard
const emitDriverStatus = (driverId, isOnline, driverData = {}) => {
  if (!io) return

  io.to('fleet:dashboard').emit('driver:status', {
    driverId,
    isOnline,
    ...driverData,
    timestamp: new Date().toISOString(),
  })
}

export { initSocket, emitLocationUpdate, emitOrderStatus, emitDriverStatus }