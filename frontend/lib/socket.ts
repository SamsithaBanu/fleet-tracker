// frontend/lib/socket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3003', {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('🔌 Socket.io connected:', socket?.id)
      // Join fleet dashboard room to receive all driver updates
      socket?.emit('join:fleet')
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected')
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}