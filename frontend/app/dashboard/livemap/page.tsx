// frontend/app/dashboard/map/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { getSocket } from '@/lib/socket'
import { orderApi } from '@/lib/orderApi';
import { ORDER_BASE } from '@/lib/config';

// Dynamic import — Leaflet cannot run on server
const LiveMap = dynamic(
  () => import('@/components/map/LiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] bg-gray-100 rounded-xl flex items-center
        justify-center text-gray-400 text-sm">
        Loading map...
      </div>
    ),
  }
)

interface DriverLocation {
  id: string
  name: string
  lat: number
  lng: number
  speed: number
  orderId?: string | null
}

export default function MapPage() {
  const [warehouses, setWarehouses]= useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers]         = useState<any[]>([])
  const [connected, setConnected]     = useState(false)
  const [lastUpdate, setLastUpdate]   = useState<string>('')
  const socketRef = useRef<any>(null)

  // ── Load warehouses from API ────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    fetch(`${ORDER_BASE}/warehouses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setWarehouses(data.data.warehouses)
      })
      .catch(err => console.error('Warehouse fetch error:', err))
  }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const ordersRes = await orderApi.getAll('?limit=12')

          if (ordersRes.success) setOrders(ordersRes.data.orders)
        } catch (err) {
          console.error('Dashboard error:', err)
        } 
      }
      fetchData()
    }, []);

  // ── Connect Socket.io ───────────────────────
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    // Join fleet dashboard room
    // This tells server: "send me ALL driver updates"
    socket.emit('join:fleet')

    // Set connected status
    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join:fleet')  // rejoin after reconnect
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    // ── This is the key event ────────────────
    // Fires every time a driver sends GPS update
    socket.on('location:update', (data: any) => {
      console.log('📍 Location update received:', data)

      setDrivers(prev => ({
        ...prev,
        [data.driverId]: {
          id:      data.driverId,
          name:    data.name || `Driver ${data.driverId.slice(-6)}`,
          lat:     data.lat,
          lng:     data.lng,
          speed:   data.speed || 0,
          orderId: data.orderId || null,
        }
      }))

      // Show last update time
      setLastUpdate(new Date().toLocaleTimeString('en-IN'))
    })

    // Driver came online
    socket.on('driver:status', (data: any) => {
      if (!data.isOnline) {
        // Remove driver from map when offline
        setDrivers(prev => {
          const updated = { ...prev }
          delete updated[data.driverId]
          return updated
        })
      }
    })

    // Cleanup on unmount
    return () => {
      socket.off('location:update')
      socket.off('driver:status')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const driversArray = Object.values(drivers)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Live map · Bangalore
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected ? (
              <span className="text-green-600">
                🟢 Connected — receiving live GPS
              </span>
            ) : (
              <span className="text-red-500">
                🔴 Connecting to tracking service...
              </span>
            )}
            {lastUpdate && (
              <span className="ml-2 text-gray-400">
                Last update: {lastUpdate}
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-xs">
          <div className="bg-blue-50 border border-blue-100 rounded-lg
            px-3 py-1.5 text-blue-700">
            🏪 {warehouses.length} warehouses
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg
            px-3 py-1.5 text-green-700">
            🛵 {driversArray.length} drivers live
          </div>
          <div className="bg-yellow-50 border border-green-100 rounded-lg
            px-3 py-1.5 text-green-700">
            🛵 {orders.length} orders live
          </div>
        </div>
      </div>

      {/* Map */}
      <LiveMap
        warehouses={warehouses}
        drivers={driversArray}
        orders={orders}
        height="560px"
      />

      {/* Live driver list */}
      {driversArray.length > 0 ? (
        <div className="mt-4 bg-white border border-gray-200
          rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              Active drivers
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {driversArray.map(driver => (
              <div
                key={driver.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-green-500
                  animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {driver.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {driver.speed} km/h
                  </span>
                  {driver.orderId && (
                    <span className="text-xs bg-amber-100 text-amber-700
                      px-2 py-0.5 rounded-full font-medium">
                      On delivery
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl
          p-8 text-center">
          <p className="text-2xl mb-2">🛵</p>
          <p className="text-sm font-medium text-gray-700">
            No drivers online yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Start the GPS simulator to see drivers appear on the map
          </p>
          <code className="block mt-3 text-xs bg-gray-50 border
            border-gray-200 rounded-lg px-4 py-2 text-gray-600">
            node tools/gps-simulator.js driver-001
          </code>
        </div>
      )}
    </div>
  )
}